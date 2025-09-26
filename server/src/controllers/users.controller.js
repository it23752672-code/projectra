import { User } from '../models/User.js';
import { TeamMember } from '../models/TeamMember.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { hashPassword } from '../utils/auth.js';
import { audit } from '../utils/audit.js';
import { parse } from 'csv-parse/sync';

export async function list(req, res) {
  const { role, status, q, projectId, teamId } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (q) filter.$or = [
    { firstName: new RegExp(q, 'i') },
    { lastName: new RegExp(q, 'i') },
    { email: new RegExp(q, 'i') },
  ];
  // filter by project involvement
  if (projectId) {
    const proj = await Project.findById(projectId).lean();
    const ids = new Set();
    if (proj) {
      (proj.members || []).forEach((id) => ids.add(String(id)));
      (proj.managers || []).forEach((id) => ids.add(String(id)));
      (proj.teamLeaders || []).forEach((id) => ids.add(String(id)));
      if (proj.projectManager) ids.add(String(proj.projectManager));
      if (Array.isArray(proj.teamMembers)) {
        for (const tm of proj.teamMembers) {
          if (tm?.userId) ids.add(String(tm.userId));
        }
      }
    }
    // Heuristic: also include anyone already assigned to tasks in this project
    try {
      const taskAssignees = await Task.find({ projectId }, { assigneeId: 1, assignees: 1 }).lean();
      for (const t of taskAssignees) {
        if (t?.assigneeId) ids.add(String(t.assigneeId));
        if (Array.isArray(t?.assignees)) {
          for (const a of t.assignees) ids.add(String(a));
        }
      }
    } catch {}
    const idArray = Array.from(ids);
    if (idArray.length > 0) {
      filter._id = { $in: idArray };
    } else {
      // Fallback: if the project has no recorded members, do not force an empty result.
      // Allow listing of users without project restriction. Caller may still pass role/status filters.
    }
  }
  // filter by team membership
  if (teamId) {
    const memberships = await TeamMember.find({ teamId }).lean();
    filter._id = { $in: memberships.map(m => m.userId) };
  }
  const users = await User.find(filter).lean();
  res.json({ users });
}

export async function updateProfile(req, res) {
  const { firstName, lastName, avatarUrl, preferences } = req.body;
  const user = await User.findByIdAndUpdate(req.user.id, { firstName, lastName, avatarUrl, preferences }, { new: true });
  await audit(req, 'user.update_profile', 'User', user._id.toString());
  res.json({ user });
}

export async function setStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  const user = await User.findByIdAndUpdate(id, { status }, { new: true });
  await audit(req, 'user.set_status', 'User', id, { status });
  res.json({ user });
}

export async function setRole(req, res) {
  const { id } = req.params;
  const { role } = req.body;
  const user = await User.findByIdAndUpdate(id, { role }, { new: true });
  await audit(req, 'user.set_role', 'User', id, { role });
  res.json({ user });
}

export async function create(req, res) {
  const { firstName, lastName, email, role, status, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email exists' });
  const passwordHash = await hashPassword(password || Math.random().toString(36).slice(2, 10));
  const user = await User.create({ firstName, lastName, email, role, status, passwordHash });
  await audit(req, 'user.create', 'User', user._id.toString());
  res.status(201).json({ user });
}

export async function bulkImport(req, res) {
  // Accept CSV via raw text body { csv: "firstName,lastName,email,role" }
  const { csv } = req.body;
  if (!csv) return res.status(400).json({ message: 'csv field is required' });
  let records;
  try {
    records = parse(csv, { columns: true, skip_empty_lines: true, trim: true });
  } catch (e) {
    return res.status(400).json({ message: 'Invalid CSV' });
  }
  const results = { created: 0, skipped: 0, errors: [] };
  for (const r of records) {
    try {
      if (!r.email) { results.skipped++; continue; }
      const exists = await User.findOne({ email: r.email });
      if (exists) { results.skipped++; continue; }
      const passwordHash = await hashPassword(Math.random().toString(36).slice(2, 10));
      await User.create({
        firstName: r.firstName || 'First',
        lastName: r.lastName || 'Last',
        email: r.email,
        role: r.role || 'Contributor',
        status: r.status || 'active',
        passwordHash,
      });
      results.created++;
    } catch (e) {
      results.errors.push({ email: r.email, error: e.message });
    }
  }
  await audit(req, 'user.bulk_import', 'User');
  res.json(results);
}
