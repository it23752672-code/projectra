import { Router } from 'express';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { bulkImport, create, list, setRole, setStatus, updateProfile } from '../controllers/users.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', list); // filter via query
router.put('/me', updateProfile);

// Admin/PM management endpoints
router.post('/', requireRoles('Admin', 'ProjectManager'), create);
router.post('/import/csv', requireRoles('Admin', 'ProjectManager'), bulkImport);
router.patch('/:id/status', requireRoles('Admin', 'ProjectManager'), setStatus);
router.patch('/:id/role', requireRoles('Admin'), setRole);

export default router;
