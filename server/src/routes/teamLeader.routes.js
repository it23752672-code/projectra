import express from 'express';
import TeamLeaderController from '../controllers/teamLeader.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/main-tasks', requireAuth, (req, res) => TeamLeaderController.getAssignedMainTasks(req, res));
router.post('/tasks/:mainTaskId/subtasks', requireAuth, (req, res) => TeamLeaderController.createSubTasks(req, res));
router.get('/projects/:projectId/contributors', requireAuth, (req, res) => TeamLeaderController.getAvailableContributors(req, res));

export default router;
