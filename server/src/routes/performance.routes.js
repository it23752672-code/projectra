import { Router } from 'express';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { createGoal, generateReport, getAIInsights, getCompanyPerformance, getIndustryBenchmarks, getRankings, getTeamPerformance, getTrends, getUserMetrics, updateGoal } from '../controllers/performance.controller.js';

const router = Router();

router.use(requireAuth);

// Metrics and analytics
router.get('/metrics/:userId', getUserMetrics);
router.get('/rankings', getRankings);
router.get('/team/:teamId', getTeamPerformance);
router.get('/company/:companyId', getCompanyPerformance);
router.get('/trends/:period', getTrends);

// Goals
router.post('/goals', createGoal);
router.put('/goals/:goalId', updateGoal);

// Reports and insights
router.get('/reports/generate', requireRoles('Admin', 'ProjectManager'), generateReport);
router.get('/insights/ai', getAIInsights);
router.get('/benchmarks/industry', getIndustryBenchmarks);

export default router;
