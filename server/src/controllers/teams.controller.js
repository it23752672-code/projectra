import { Team } from '../models/Team.js';
import { TeamMember } from '../models/TeamMember.js';
import { audit } from '../utils/audit.js';

export async function createTeam(req, res) {
  const { name, description, companyId, tags, parentTeamId } = req.body;
  const team = await Team.create({ name, description, companyId, tags, parentTeamId });
  await audit(req, 'team.create', 'Team', team._id.toString());
  res.status(201).json({ team });
}

export async function listTeams(req, res) {
  const { companyId, q } = req.query;
  const filter = {};
  if (companyId) filter.companyId = companyId;
  if (q) filter.name = new RegExp(q, 'i');
  const teams = await Team.find(filter).lean();
  res.json({ teams });
}

export async function addMembers(req, res) {
  const { teamId } = req.params;
  const { userIds, role } = req.body; // userIds: []
  const ops = (userIds || []).map(userId => ({ updateOne: { filter: { teamId, userId }, update: { teamId, userId, role: role || 'Member' }, upsert: true } }));
  if (ops.length) await TeamMember.bulkWrite(ops);
  await audit(req, 'team.add_members', 'Team', teamId, { count: (userIds || []).length });
  res.json({ added: (userIds || []).length });
}

export async function removeMember(req, res) {
  const { teamId, userId } = req.params;
  await TeamMember.deleteOne({ teamId, userId });
  await audit(req, 'team.remove_member', 'Team', teamId, { userId });
  res.json({ ok: true });
}

export async function teamMembers(req, res) {
  const { teamId } = req.params;
  const members = await TeamMember.find({ teamId }).populate('userId', 'firstName lastName email role status').lean();
  res.json({ members });
}
