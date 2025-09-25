import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { 
  listIssues, createIssue, updateIssue, deleteIssue,
  listFeedback, createFeedback, updateFeedback, deleteFeedback
} from '../controllers/misc.controller.js';

const router = Router();

// Health
router.get('/health', async (req, res) => {
  const state = mongoose.connection.readyState;
  const stateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  let dbOk = false;
  let pingMs = null;
  if (state === 1) {
    const t0 = Date.now();
    try {
      await mongoose.connection.db.admin().command({ ping: 1 });
      dbOk = true;
      pingMs = Date.now() - t0;
    } catch (_) {
      dbOk = false;
    }
  }
  res.json({
    ok: true,
    time: new Date().toISOString(),
    db: { state: stateMap[state] || String(state), ok: dbOk, pingMs }
  });
});

// Issues
router.get('/issues', requireAuth, listIssues);
router.post('/issues', requireAuth, createIssue);
router.put('/issues/:id', requireAuth, updateIssue);
router.delete('/issues/:id', requireAuth, requireRoles('Admin', 'ProjectManager'), deleteIssue);

// Feedback
router.get('/feedback', requireAuth, requireRoles('Admin'), listFeedback);
router.post('/feedback', requireAuth, createFeedback);
router.put('/feedback/:id', requireAuth, requireRoles('Admin'), updateFeedback);
router.delete('/feedback/:id', requireAuth, requireRoles('Admin'), deleteFeedback);

export default router;
