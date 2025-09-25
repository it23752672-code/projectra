import { Router } from 'express';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { addMembers, createTeam, listTeams, removeMember, teamMembers } from '../controllers/teams.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', listTeams);
router.post('/', requireRoles('Admin', 'ProjectManager'), createTeam);
router.post('/:teamId/members', requireRoles('Admin', 'ProjectManager'), addMembers);
router.delete('/:teamId/members/:userId', requireRoles('Admin', 'ProjectManager'), removeMember);
router.get('/:teamId/members', teamMembers);

export default router;
