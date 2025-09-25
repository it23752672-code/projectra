import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { audit } from '../utils/audit.js';

export async function createProject(req, res) {
  const data = req.body;
  const project = await Project.create(data);
  await audit(req, 'project.create', 'Project', project._id.toString());
  res.status(201).json({ project });
}

export async function listProjects(req, res) {
  const { q, companyId } = req.query;
  const filter = {};
  if (companyId) filter.companyId = companyId;
  if (q) filter.name = new RegExp(q, 'i');
  const projects = await Project.find(filter).lean();
  // compute progress for each
  const withProgress = await Promise.all(projects.map(async p => ({ ...p, progress: await projectProgress(p._id) })));
  res.json({ projects: withProgress });
}

export async function getProject(req, res) {
  const { id } = req.params;
  const project = await Project.findById(id).lean();
  if (!project) return res.status(404).json({ message: 'Not found' });
  const progress = await projectProgress(id);
  const overdueMilestones = (project.milestones || []).filter(m => m.dueDate && !m.completed && new Date(m.dueDate) < new Date());
  res.json({ project, progress, overdueMilestones });
}

export async function updateProject(req, res) {
  const { id } = req.params;
  const project = await Project.findByIdAndUpdate(id, req.body, { new: true });
  await audit(req, 'project.update', 'Project', id);
  res.json({ project });
}

export async function deleteProject(req, res) {
  const { id } = req.params;
  await Project.findByIdAndDelete(id);
  await audit(req, 'project.delete', 'Project', id);
  res.json({ ok: true });
}

export async function reporting(req, res) {
  const { id } = req.params; // project id
  const tasks = await Task.find({ projectId: id }).lean();
  const budgetUtilization = 0; // placeholder
  const resourceAllocation = 0; // placeholder
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const taskCompletionRate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  res.json({ budgetUtilization, resourceAllocation, taskCompletionRate, totalTasks: tasks.length });
}

export async function projectProgress(projectId) {
  const tasks = await Task.find({ projectId }).lean();
  if (!tasks.length) return 0;
  const sum = tasks.reduce((acc, t) => acc + (t.progress || (t.status === 'Completed' ? 100 : 0)), 0);
  return Math.round(sum / tasks.length);
}
