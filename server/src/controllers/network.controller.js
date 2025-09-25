import { Vendor } from '../models/Vendor.js';
import { User } from '../models/User.js';
import { CollaborationRequest } from '../models/CollaborationRequest.js';
import { requireAuth } from '../middleware/auth.js'; // just to hint types

// Helpers
function mapAvailabilityFromStatus(status) {
  if (status === 'active') return 'Available';
  if (status === 'inactive') return 'Partially Available';
  return 'Busy'; // suspended or others
}

export async function getCompaniesNetwork(req, res) {
  const vendors = await Vendor.find({}).lean();
  const companyIds = vendors.map(v => v._id);
  const users = await User.aggregate([
    { $match: { companyId: { $in: companyIds } } },
    { $group: { _id: '$companyId', total: { $sum: 1 }, available: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } }, busy: { $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] } } } }
  ]);
  const byCompany = new Map(users.map(u => [String(u._id), u]));
  const enriched = vendors.map(v => {
    const g = byCompany.get(String(v._id)) || { total: 0, available: 0, busy: 0 };
    return {
      _id: v._id,
      companyName: v.name,
      companyEmail: v.contacts?.[0]?.email || '',
      pmId: v.pmId || null,
      totalEmployees: g.total,
      availableEmployees: g.available,
      busyEmployees: g.busy,
      activeProjects: v.activeProjects || [],
      collaborationStatus: v.collaborationStatus || (v.availabilityStatus === 'available' ? 'Active' : 'Inactive'),
      lastActivity: v.updatedAt || v.createdAt,
      specializations: v.specializations || [],
      trustScore: typeof v.trustScore === 'number' ? v.trustScore : 4,
      logoUrl: v.logoUrl || null,
      industryType: v.industryType || null,
    };
  });
  res.json({ companies: enriched });
}

export async function createCompany(req, res) {
  const { name, domain, contacts, availabilityStatus, specializations, industryType, size, logoUrl, trustScore } = req.body || {};
  if (!name || !String(name).trim()) return res.status(400).json({ message: 'Company name is required' });
  const vendor = await Vendor.create({ name: String(name).trim(), domain, contacts, availabilityStatus, specializations, industryType, size, logoUrl, trustScore });
  res.status(201).json({ company: vendor });
}

export async function updateCompany(req, res) {
  const { id } = req.params;
  const update = { ...req.body };
  const v = await Vendor.findByIdAndUpdate(id, update, { new: true });
  if (!v) return res.status(404).json({ message: 'Not found' });
  res.json({ company: v });
}

export async function deleteCompany(req, res) {
  const { id } = req.params;
  await Vendor.findByIdAndDelete(id);
  res.json({ ok: true });
}

export async function listCollaborationRequests(req, res) {
  // If user has a company, show requests related to it; admins can see all
  const user = await User.findById(req.user.id).lean();
  const filter = {};
  if (user?.companyId && req.query.scope !== 'all') {
    filter.$or = [
      { requestingCompanyId: user.companyId },
      { targetCompanyId: user.companyId },
    ];
  }
  const status = req.query.status;
  if (status) filter.status = status;
  const items = await CollaborationRequest.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ requests: items });
}

export async function createCollaborationRequest(req, res) {
  const user = await User.findById(req.user.id).lean();
  let { requestingCompanyId, targetCompanyId, projectId, requestedEmployees, skillsRequired, priority, message, proposedDuration, proposedBudget, deadline } = req.body || {};
  if (!targetCompanyId) return res.status(400).json({ message: 'targetCompanyId is required' });
  if (!requestingCompanyId) requestingCompanyId = user?.companyId;
  if (!requestingCompanyId) return res.status(400).json({ message: 'No requesting company associated with user' });
  const doc = await CollaborationRequest.create({ requestingCompanyId, targetCompanyId, projectId, requestedEmployees, skillsRequired, priority, message, proposedDuration, proposedBudget, deadline });
  res.status(201).json({ request: doc });
}

export async function updateCollaborationRequest(req, res) {
  const { id } = req.params;
  const update = { ...req.body };
  const doc = await CollaborationRequest.findByIdAndUpdate(id, update, { new: true });
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json({ request: doc });
}

export async function deleteCollaborationRequest(req, res) {
  const { id } = req.params;
  await CollaborationRequest.findByIdAndDelete(id);
  res.json({ ok: true });
}

export async function getEmployeesAvailability(req, res) {
  // Aggregate users by company with simplified availability mapping
  const users = await User.find({ companyId: { $ne: null } }).select('firstName lastName role status companyId').lean();
  const map = new Map();
  for (const u of users) {
    const cid = String(u.companyId);
    if (!map.has(cid)) map.set(cid, []);
    map.get(cid).push({
      employeeName: `${u.firstName} ${u.lastName}`,
      role: u.role,
      skills: [],
      availability: mapAvailabilityFromStatus(u.status),
      currentProject: null,
      availableFrom: null,
      hourlyRate: null,
      rating: null,
    });
  }
  const vendors = await Vendor.find({ _id: { $in: [...map.keys()].map(id => id) } }).select('name').lean();
  const vendorById = new Map(vendors.map(v => [String(v._id), v]));
  const result = [];
  for (const [cid, employees] of map) {
    result.push({ companyId: cid, companyName: vendorById.get(cid)?.name || 'Unknown', departments: [{ departmentName: 'General', employees }] });
  }
  res.json({ availability: result });
}

export async function updateEmployeeAvailability(req, res) {
  const { id } = req.params; // user id
  const { availability } = req.body || {};
  // Map availability back to status for now
  const map = { 'Available': 'active', 'Busy': 'suspended', 'Partially Available': 'inactive' };
  const status = map[availability] || 'active';
  const updated = await User.findByIdAndUpdate(id, { status }, { new: true });
  if (!updated) return res.status(404).json({ message: 'Not found' });
  res.json({ user: updated });
}

export async function getNetworkAnalytics(req, res) {
  const [vendorsCount, pendingCount, activeUsers, requests] = await Promise.all([
    Vendor.countDocuments({}),
    CollaborationRequest.countDocuments({ status: 'Pending' }),
    User.countDocuments({ status: 'active' }),
    CollaborationRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
  ]);

  const statusCounts = Object.fromEntries(requests.map(r => [r._id, r.count]));
  res.json({
    totalPartners: vendorsCount,
    pendingRequests: pendingCount,
    availableResources: activeUsers,
    activeCollaborations: (statusCounts['In Progress'] || 0) + (statusCounts['Approved'] || 0),
    requestStatus: statusCounts,
    trends: {
      // placeholder time series
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      collaborationCounts: [2, 3, 4, 6, 5, 7],
    },
  });
}
