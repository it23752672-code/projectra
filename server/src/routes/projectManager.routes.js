import express from 'express';
import ProjectManagerController from '../controllers/projectManager.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/projects/:projectId/overview', requireAuth, (req, res) => ProjectManagerController.getProjectOverview(req, res));
router.post('/projects/:projectId/members', requireAuth, (req, res) => ProjectManagerController.addTeamMember(req, res));
router.delete('/projects/:projectId/members/:memberId', requireAuth, (req, res) => ProjectManagerController.removeTeamMember(req, res));
router.post('/projects/:projectId/main-tasks', requireAuth, (req, res) => ProjectManagerController.createMainTask(req, res));
router.get('/projects/:projectId/workload', requireAuth, (req, res) => ProjectManagerController.getWorkloadAnalysis(req, res));
router.put('/projects/:projectId/timeline', requireAuth, (req, res) => ProjectManagerController.updateProjectTimeline(req, res));

export default router;
