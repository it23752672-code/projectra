import { Plan } from '../models/Plan.js';
import { Vendor } from '../models/Vendor.js';
import { Settings } from '../models/Settings.js';
import { AuditLog } from '../models/AuditLog.js';
import { audit } from '../utils/audit.js';

// Plans
export async function listPlans(req, res) {
  const plans = await Plan.find({}).lean();
  res.json({ plans });
}
export async function createPlan(req, res) {
  const plan = await Plan.create(req.body);
  await audit(req, 'plan.create', 'Plan', plan._id.toString());
  res.status(201).json({ plan });
}
export async function updatePlan(req, res) {
  const { id } = req.params;
  const plan = await Plan.findByIdAndUpdate(id, req.body, { new: true });
  await audit(req, 'plan.update', 'Plan', id);
  res.json({ plan });
}
export async function deletePlan(req, res) {
  const { id } = req.params;
  await Plan.findByIdAndDelete(id);
  await audit(req, 'plan.delete', 'Plan', id);
  res.json({ ok: true });
}

// Vendors
export async function listVendors(req, res) {
  const vendors = await Vendor.find({}).lean();
  res.json({ vendors });
}
export async function createVendor(req, res) {
  const vendor = await Vendor.create(req.body);
  await audit(req, 'vendor.create', 'Vendor', vendor._id.toString());
  res.status(201).json({ vendor });
}
export async function updateVendor(req, res) {
  const { id } = req.params;
  const vendor = await Vendor.findByIdAndUpdate(id, req.body, { new: true });
  await audit(req, 'vendor.update', 'Vendor', id);
  res.json({ vendor });
}
export async function deleteVendor(req, res) {
  const { id } = req.params;
  await Vendor.findByIdAndDelete(id);
  await audit(req, 'vendor.delete', 'Vendor', id);
  res.json({ ok: true });
}

// Settings
export async function upsertSettings(req, res) {
  const { organizationId } = req.body;
  const settings = await Settings.findOneAndUpdate({ organizationId }, req.body, { new: true, upsert: true });
  await audit(req, 'settings.upsert', 'Settings', settings._id.toString());
  res.json({ settings });
}
export async function getSettings(req, res) {
  const { organizationId } = req.query;
  const settings = await Settings.findOne({ organizationId }).lean();
  res.json({ settings });
}

// Analytics (stubs for ApexCharts-ready data)
export async function analyticsOverview(req, res) {
  // Placeholder data
  res.json({
    usage: [
      { date: new Date(Date.now() - 86400000 * 2), activeUsers: 5 },
      { date: new Date(Date.now() - 86400000), activeUsers: 8 },
      { date: new Date(), activeUsers: 12 },
    ],
    features: [
      { feature: 'Tasks', count: 120 },
      { feature: 'Projects', count: 30 },
      { feature: 'Members', count: 50 }
    ]
  });
}

export async function listAuditLogs(req, res) {
  const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(200).lean();
  res.json({ logs });
}
