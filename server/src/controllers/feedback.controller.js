import { Feedback } from '../models/Feedback.js';

// Helper to get Socket.IO
function getIO(req) {
  try { return req.app.get('io'); } catch { return null; }
}

// Validate enums locally to give friendly errors
const ALLOWED_TYPES = ['bug', 'feature_request', 'improvement', 'general', 'ui_issue', 'performance'];
const ALLOWED_PRIORITY = ['low', 'medium', 'high', 'critical'];
const ALLOWED_STATUS = ['pending', 'in_progress', 'resolved', 'closed', 'rejected'];

export async function submitFeedback(req, res) {
  try {
    const { title, feedbackText, feedbackType, priority, browserInfo } = req.body;
    if (!title || !feedbackText || !feedbackType) return res.status(400).json({ success: false, message: 'Missing required fields' });
    if (!ALLOWED_TYPES.includes(feedbackType)) return res.status(400).json({ success: false, message: 'Invalid feedback type' });
    if (priority && !ALLOWED_PRIORITY.includes(priority)) return res.status(400).json({ success: false, message: 'Invalid priority' });

    const feedback = await Feedback.create({
      userId: req.user.id,
      title,
      feedbackText,
      feedbackType,
      priority: priority || 'medium',
      browserInfo: { userAgent: req.headers['user-agent'], ...(browserInfo || {}) },
    });

    await feedback.populate('userId', 'firstName lastName email');

    // Emit socket event for realtime updates (optional listener on client)
    const io = getIO(req);
    io?.emit('feedback:new', { id: feedback._id.toString(), status: feedback.status });

    res.status(201).json({ success: true, message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getUserFeedback(req, res) {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const status = req.query.status;

    const query = { userId };
    if (status && ALLOWED_STATUS.includes(status)) query.status = status;

    const feedback = await Feedback.find(query)
      .populate('userId', 'firstName lastName')
      .populate('resolvedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const total = await Feedback.countDocuments(query);

    res.json({
      success: true,
      feedback,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAllFeedback(req, res) {
  try {
    // Admin gating happens in routes via requireRoles('Admin'). This is a safety check in case it's missed.
    if (req.user?.role !== 'Admin') return res.status(403).json({ success: false, message: 'Access denied' });

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { status, feedbackType, priority, sortBy } = req.query;

    const query = {};
    if (status && ALLOWED_STATUS.includes(status)) query.status = status;
    if (feedbackType && ALLOWED_TYPES.includes(feedbackType)) query.feedbackType = feedbackType;
    if (priority && ALLOWED_PRIORITY.includes(priority)) query.priority = priority;

    const sortOptions = {};
    if (sortBy === 'priority') sortOptions.priority = 1; else sortOptions.createdAt = -1;

    const feedback = await Feedback.find(query)
      .populate('userId', 'firstName lastName email role')
      .populate('resolvedBy', 'firstName lastName')
      .sort(sortOptions)
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const total = await Feedback.countDocuments(query);

    // Simple stats by status
    const statsAgg = await Feedback.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const stats = statsAgg.reduce((acc, cur) => { acc[cur._id] = cur.count; return acc; }, {});
    stats.total = total;

    res.json({ success: true, feedback, stats, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateFeedback(req, res) {
  try {
    if (req.user?.role !== 'Admin') return res.status(403).json({ success: false, message: 'Access denied' });

    const { feedbackId } = req.params;
    const { status, reply, internalNote } = req.body;

    const updateData = { updatedAt: new Date() };
    if (status) {
      if (!ALLOWED_STATUS.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
      updateData.status = status;
    }
    if (reply !== undefined) updateData.reply = reply;

    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedBy = req.user.id;
      updateData.resolvedAt = new Date();
    }

    const feedback = await Feedback.findByIdAndUpdate(feedbackId, updateData, { new: true })
      .populate('userId', 'firstName lastName email')
      .populate('resolvedBy', 'firstName lastName');

    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });

    if (internalNote) {
      feedback.internalNotes.push({ note: internalNote, addedBy: req.user.id });
      await feedback.save();
    }

    const io = getIO(req);
    io?.emit('feedback:updated', { id: feedback._id.toString(), status: feedback.status });

    res.json({ success: true, message: 'Feedback updated successfully', feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getFeedbackStats(req, res) {
  try {
    if (req.user?.role !== 'Admin') return res.status(403).json({ success: false, message: 'Access denied' });

    const statsAgg = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          avgResolutionTime: { $avg: { $cond: [{ $and: [{ $ne: ['$resolvedAt', null] }, { $ne: ['$createdAt', null] }] }, { $subtract: ['$resolvedAt', '$createdAt'] }, null] } },
        },
      },
    ]);

    const typeStats = await Feedback.aggregate([{ $group: { _id: '$feedbackType', count: { $sum: 1 } } }]);

    res.json({ success: true, stats: statsAgg?.[0] || { total: 0 }, typeStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
