import { Router } from 'express';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { createProject, deleteProject, getProject, listProjects, reporting, updateProject } from '../controllers/projects.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', listProjects);
router.post('/', requireRoles('Admin', 'ProjectManager'), createProject);
router.get('/:id', getProject);
router.put('/:id', requireRoles('Admin', 'ProjectManager'), updateProject);
router.delete('/:id', requireRoles('Admin', 'ProjectManager'), deleteProject);
router.get('/:id/reporting', reporting);

export default router;
