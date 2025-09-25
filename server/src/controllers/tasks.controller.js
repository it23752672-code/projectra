import { Task } from '../models/Task.js';
import { audit } from '../utils/audit.js';
import { getTaskGuidance } from '../utils/ai.js';

export async function createTask(req, res) {
  try {
    const { title, description, status, projectId, priority, dueDate, assignees } = req.body || {};

    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const statusMap = { 'To Do': 'Not Started', 'Done': 'Completed' };
    const normalizedStatus = statusMap[status] || status || 'Not Started';
    const allowedStatuses = ['Not Started', 'In Progress', 'Completed', 'Blocked'];
    if (normalizedStatus && !allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({ message: `Invalid status: ${normalizedStatus}` });
    }

    const payload = {
      title: String(title).trim(),
      description,
      status: normalizedStatus,
      projectId,
      priority,
      dueDate,
      assignees,
    };

    const task = await Task.create(payload);

    const io = req.app.get('io');
    if (io && typeof io.emit === 'function') {
      io.emit('task:created', { id: task._id, projectId: task.projectId });
    }
    await audit(req, 'task.create', 'Task', task._id.toString());
    return res.status(201).json({ task });
  } catch (err) {
    const msg = err?.message || 'Failed to create task';
    return res.status(400).json({ message: msg });
  }
}

export async function listTasks(req, res) {
  const { projectId, status, q } = req.query;
  const filter = {};
  if (projectId) filter.projectId = projectId;
  if (status) filter.status = status;
  if (q) filter.$text = { $search: q };
  const tasks = await Task.find(filter).lean();
  res.json({ tasks });
}

export async function getTask(req, res) {
  const { id } = req.params;
  const task = await Task.findById(id).lean();
  if (!task) return res.status(404).json({ message: 'Not found' });
  res.json({ task });
}

export async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const update = { ...req.body };
    if (typeof update.status === 'string') {
      const map = { 'To Do': 'Not Started', 'Done': 'Completed' };
      update.status = map[update.status] || update.status;
      const allowed = ['Not Started', 'In Progress', 'Completed', 'Blocked'];
      if (update.status && !allowed.includes(update.status)) {
        return res.status(400).json({ message: `Invalid status: ${update.status}` });
      }
    }
    const task = await Task.findByIdAndUpdate(id, update, { new: true });
    if (!task) return res.status(404).json({ message: 'Not found' });
    const io = req.app.get('io');
    if (io && typeof io.emit === 'function') {
      io.emit('task:updated', { id, projectId: task.projectId, status: task.status, progress: task.progress });
    }
    await audit(req, 'task.update', 'Task', id);
    return res.json({ task });
  } catch (err) {
    return res.status(400).json({ message: err?.message || 'Failed to update task' });
  }
}

export async function deleteTask(req, res) {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);
    if (!task) return res.status(404).json({ message: 'Not found' });
    const io = req.app.get('io');
    if (io && typeof io.emit === 'function') {
      io.emit('task:deleted', { id, projectId: task?.projectId });
    }
    await audit(req, 'task.delete', 'Task', id);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(400).json({ message: err?.message || 'Failed to delete task' });
  }
}

export async function addComment(req, res) {
  try {
    const { id } = req.params;
    const { message } = req.body;
    if (!message || !String(message).trim()) {
      return res.status(400).json({ message: 'Comment message is required' });
    }
    const comment = { message: String(message).trim(), authorId: req.user.id, createdAt: new Date() };
    const task = await Task.findByIdAndUpdate(id, { $push: { comments: comment } }, { new: true });
    if (!task) return res.status(404).json({ message: 'Not found' });
    const io = req.app.get('io');
    if (io && typeof io.emit === 'function') {
      io.emit('task:comment', { id, projectId: task.projectId });
    }
    await audit(req, 'task.add_comment', 'Task', id);
    return res.json({ task });
  } catch (err) {
    return res.status(400).json({ message: err?.message || 'Failed to add comment' });
  }
}

export async function changeStatus(req, res) {
  try {
    const { id } = req.params;
    let { status } = req.body;
    const map = { 'To Do': 'Not Started', 'Done': 'Completed' };
    status = map[status] || status;
    const allowed = ['Not Started', 'In Progress', 'Completed', 'Blocked'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ message: `Invalid status: ${status}` });
    }
    const task = await Task.findByIdAndUpdate(id, { status }, { new: true });
    if (!task) return res.status(404).json({ message: 'Not found' });
    const io = req.app.get('io');
    if (io && typeof io.emit === 'function') {
      io.emit('task:status', { id, projectId: task.projectId, status });
    }
    await audit(req, 'task.change_status', 'Task', id, { status });
    return res.json({ task });
  } catch (err) {
    return res.status(400).json({ message: err?.message || 'Failed to change status' });
  }
}

export async function changeProgress(req, res) {
  try {
    const { id } = req.params;
    const { progress } = req.body;
    const p = Math.max(0, Math.min(100, Number(progress)));
    if (Number.isNaN(p)) {
      return res.status(400).json({ message: 'Invalid progress value' });
    }
    const task = await Task.findByIdAndUpdate(id, { progress: p }, { new: true });
    if (!task) return res.status(404).json({ message: 'Not found' });
    const io = req.app.get('io');
    if (io && typeof io.emit === 'function') {
      io.emit('task:progress', { id, projectId: task.projectId, progress: p });
    }
    await audit(req, 'task.change_progress', 'Task', id, { progress: p });
    return res.json({ task });
  } catch (err) {
    return res.status(400).json({ message: err?.message || 'Failed to change progress' });
  }
}

export async function guidance(req, res) {
  const { id } = req.params;
  const { skillLevel } = req.body;
  const task = await Task.findById(id);
  if (!task) return res.status(404).json({ message: 'Not found' });
  const result = await getTaskGuidance({ title: task.title, description: task.description, priority: task.priority, skillLevel: skillLevel || 'beginner' });
  res.json(result);
}
