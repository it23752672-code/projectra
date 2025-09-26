import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { analyticsOverview, createPlan, createVendor, deletePlan, deleteVendor, getSettings, listAuditLogs, listPlans, listVendors, upsertSettings, updatePlan, updateVendor } from '../controllers/admin.controller.js';
import adminUserController from '../controllers/adminUser.controller.js';

const router = Router();

router.use(requireAuth, requireRoles('Admin'));

// Rate limiting for user creation
const createUserLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many user creation attempts, please try again later'
});

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

// Admin user management routes
router.get('/users', adminUserController.getAllUsers);
router.post('/users', createUserLimit, adminUserController.createUser);
router.get('/users/:userId', adminUserController.getUserById);
router.put('/users/:userId', adminUserController.updateUser);
router.delete('/users/:userId', adminUserController.deleteUser);
router.post('/users/bulk', adminUserController.bulkUpdateUsers);
router.get('/users/export/csv', adminUserController.exportUsers);

export default router;
