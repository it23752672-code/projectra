import { Router } from 'express';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { addComment, changeProgress, changeStatus, createTask, deleteTask, getTask, guidance, listTasks, updateTask } from '../controllers/tasks.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', listTasks);
router.post('/', requireRoles('Admin', 'ProjectManager'), createTask);
router.get('/:id', getTask);
router.put('/:id', requireRoles('Admin', 'ProjectManager'), updateTask);
router.patch('/:id', requireRoles('Admin', 'ProjectManager'), updateTask);
router.delete('/:id', requireRoles('Admin', 'ProjectManager'), deleteTask);
router.post('/:id/comments', addComment);
router.patch('/:id/status', changeStatus);
router.patch('/:id/progress', changeProgress);
router.post('/:id/ai/guidance', guidance);

export default router;
