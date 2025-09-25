import { Router } from 'express';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { analyticsOverview, createPlan, createVendor, deletePlan, deleteVendor, getSettings, listAuditLogs, listPlans, listVendors, upsertSettings, updatePlan, updateVendor } from '../controllers/admin.controller.js';

const router = Router();

router.use(requireAuth, requireRoles('Admin'));

// Plans
router.get('/plans', listPlans);
router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);
router.delete('/plans/:id', deletePlan);

// Vendors
router.get('/vendors', listVendors);
router.post('/vendors', createVendor);
router.put('/vendors/:id', updateVendor);
router.delete('/vendors/:id', deleteVendor);

// Settings
router.get('/settings', getSettings);
router.post('/settings', upsertSettings);

// Analytics and audit
router.get('/analytics/overview', analyticsOverview);
router.get('/audit-logs', listAuditLogs);

export default router;
