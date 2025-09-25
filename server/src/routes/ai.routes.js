import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.js';
import { chat, taskAssistance, projectOnboarding, skillDevelopment, aiHealth } from '../controllers/ai.controller.js';

const router = Router();

const maxReq = Number(process.env.AI_RATE_LIMIT_PER_HOUR || 100);
const aiLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: maxReq, message: 'Too many AI requests, please try again later' });

router.use(requireAuth);

router.get('/health', aiHealth);

router.post('/chat', aiLimiter, chat);
router.post('/task-assistance', aiLimiter, taskAssistance);
router.post('/project-onboarding', aiLimiter, projectOnboarding);
router.post('/skill-development', aiLimiter, skillDevelopment);

export default router;
