import { Issue } from '../models/Issue.js';
import { Feedback } from '../models/Feedback.js';
import { audit } from '../utils/audit.js';

// Issues
export async function listIssues(req, res) {
  const { projectId, status, severity } = req.query;
  const filter = {};
  if (projectId) filter.projectId = projectId;
  if (status) filter.status = status;
  if (severity) filter.severity = severity;
  const issues = await Issue.find(filter).lean();
  res.json({ issues });
}
export async function createIssue(req, res) {
  const issue = await Issue.create(req.body);
  await audit(req, 'issue.create', 'Issue', issue._id.toString());
  res.status(201).json({ issue });
}
export async function updateIssue(req, res) {
  const { id } = req.params;
  const issue = await Issue.findByIdAndUpdate(id, req.body, { new: true });
  await audit(req, 'issue.update', 'Issue', id);
  res.json({ issue });
}
export async function deleteIssue(req, res) {
  const { id } = req.params;
  await Issue.findByIdAndDelete(id);
  await audit(req, 'issue.delete', 'Issue', id);
  res.json({ ok: true });
}

// Feedback
export async function listFeedback(req, res) {
  const feedback = await Feedback.find({}).sort({ createdAt: -1 }).lean();
  res.json({ feedback });
}
export async function createFeedback(req, res) {
  const fb = await Feedback.create({ ...req.body, userId: req.user.id });
  await audit(req, 'feedback.create', 'Feedback', fb._id.toString());
  res.status(201).json({ feedback: fb });
}
export async function updateFeedback(req, res) {
  const { id } = req.params;
  const fb = await Feedback.findByIdAndUpdate(id, req.body, { new: true });
  await audit(req, 'feedback.update', 'Feedback', id);
  res.json({ feedback: fb });
}
export async function deleteFeedback(req, res) {
  const { id } = req.params;
  await Feedback.findByIdAndDelete(id);
  await audit(req, 'feedback.delete', 'Feedback', id);
  res.json({ ok: true });
}
