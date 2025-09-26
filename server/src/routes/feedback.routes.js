import { Router } from 'express';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { submitFeedback, getUserFeedback, getAllFeedback, updateFeedback, getFeedbackStats } from '../controllers/feedback.controller.js';

const router = Router();

router.use(requireAuth);

// User routes
router.post('/submit', submitFeedback);
router.get('/my-feedback', getUserFeedback);

// Admin routes
router.get('/all', requireRoles('Admin'), getAllFeedback);
router.put('/:feedbackId', requireRoles('Admin'), updateFeedback);
router.get('/stats', requireRoles('Admin'), getFeedbackStats);

export default router;
