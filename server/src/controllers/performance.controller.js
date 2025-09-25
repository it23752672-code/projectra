import { User } from '../models/User.js';
import { Task } from '../models/Task.js';

function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function computeScores({ completedTasks, assignedTasks, averageTaskRating, onTimeDeliveries, totalDeliveries, positiveCollaborationFeedback, crossCompanyProjects, totalProjects, processImprovements, creativeProblems, totalTasks, mentorshipActivities, knowledgeSharing, totalPeriod }) {
  const taskCompletionRate = assignedTasks > 0 ? (completedTasks / assignedTasks) * 100 : 0;
  const qualityScore = averageTaskRating || 0;
  const timelinessScore = totalDeliveries > 0 ? (onTimeDeliveries / totalDeliveries) * 100 : 0;
  const collaborationScore = totalProjects > 0 ? (positiveCollaborationFeedback + crossCompanyProjects) / totalProjects : 0;
  const innovationScore = totalTasks > 0 ? (processImprovements + creativeProblems) / totalTasks : 0;
  const leadershipScore = totalPeriod > 0 ? (mentorshipActivities + knowledgeSharing) / totalPeriod : 0;

  const overallScore = (
    (taskCompletionRate * 0.25) +
    (qualityScore * 20) / 5 + // scale 1-5 to 0-100 and apply 0.20 weight
    (timelinessScore * 0.20) +
    (collaborationScore * 20) * 0.15 + // assuming 0-5 scale
    (innovationScore * 100) * 0.10 + // assuming 0-1 scale
    (leadershipScore * 10) * 0.10 // assuming ~0-10 per period
  );

  return { taskCompletionRate, qualityScore, timelinessScore, collaborationScore, innovationScore, leadershipScore, overallScore: Math.max(0, Math.min(100, Number(overallScore.toFixed(2)))) };
}

function generateUserMetrics(user, seedBase = 1) {
  const seed = seedBase + parseInt(String(user._id).slice(-5), 16) % 1000;
  const r = (n = 1) => seededRandom(seed + n);
  const assignedTasks = Math.floor(20 + r(1) * 50);
  const completedTasks = Math.floor(assignedTasks * (0.6 + r(2) * 0.4));
  const averageTaskRating = 3 + r(3) * 2; // 3-5
  const totalDeliveries = Math.max(assignedTasks - Math.floor(r(4) * 5), 1);
  const onTimeDeliveries = Math.floor(totalDeliveries * (0.7 + r(5) * 0.3));
  const totalProjects = Math.max(1, Math.floor(1 + r(6) * 5));
  const positiveCollaborationFeedback = Math.floor(totalProjects * (0.5 + r(7) * 0.5));
  const crossCompanyProjects = Math.floor(r(8) * Math.max(1, totalProjects - 1));
  const totalTasks = assignedTasks;
  const processImprovements = Math.floor(r(9) * 5);
  const creativeProblems = Math.floor(r(10) * 4);
  const totalPeriod = 4; // weeks in a month
  const mentorshipActivities = Math.floor(r(11) * 4);
  const knowledgeSharing = Math.floor(r(12) * 4);

  const base = { completedTasks, assignedTasks, averageTaskRating, onTimeDeliveries, totalDeliveries, positiveCollaborationFeedback, crossCompanyProjects, totalProjects, processImprovements, creativeProblems, totalTasks, mentorshipActivities, knowledgeSharing, totalPeriod };
  const scores = computeScores(base);

  return { user: { id: user._id.toString(), name: `${user.firstName} ${user.lastName}`, companyId: user.companyId || null, role: user.role }, ...base, ...scores };
}

export async function getUserMetrics(req, res) {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const metrics = generateUserMetrics(user);

    // Simple percentile and rank mock
    const peers = await User.find({ role: { $in: ['Admin', 'ProjectManager', 'Contributor'] } }).limit(50).lean();
    const peerScores = peers.map(u => generateUserMetrics(u).overallScore).sort((a, b) => b - a);
    const rank = peerScores.findIndex(s => s <= metrics.overallScore) + 1;
    const percentile = Math.round((1 - (rank - 1) / peerScores.length) * 100);

    const result = {
      personalInfo: {
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        department: 'General',
        company: 'My Company',
        joinDate: user.createdAt,
        profilePicture: user.avatarUrl || ''
      },
      currentMetrics: {
        overallScore: metrics.overallScore,
        rankPosition: rank,
        percentileRank: percentile,
        trendDirection: metrics.overallScore > 75 ? 'improving' : metrics.overallScore > 60 ? 'stable' : 'declining',
        lastUpdated: new Date()
      },
      detailedBreakdown: {
        taskMetrics: {
          totalAssigned: metrics.assignedTasks,
          completed: metrics.completedTasks,
          overdue: Math.max(0, metrics.assignedTasks - metrics.completedTasks - Math.floor(metrics.assignedTasks * 0.1)),
          averageCompletionTime: 2 + seededRandom(3) * 3,
          complexityRating: 3 + seededRandom(4) * 2
        },
        qualityMetrics: {
          averageRating: Number(metrics.qualityScore.toFixed(2)),
          peerFeedbackScore: 3 + seededRandom(5) * 2,
          managerRating: 3 + seededRandom(6) * 2,
          clientSatisfaction: 70 + seededRandom(7) * 30,
          improvementSuggestions: ['Improve documentation', 'Enhance test coverage']
        },
        collaborationMetrics: {
          crossCompanyProjects: metrics.crossCompanyProjects,
          mentorshipActivities: metrics.mentorshipActivities,
          knowledgeSharing: metrics.knowledgeSharing,
          teamworkRating: 3 + seededRandom(8) * 2,
          communicationScore: 70 + seededRandom(9) * 30
        }
      },
      performanceHistory: {
        monthlyScores: Array.from({ length: 12 }).map((_, i) => 55 + seededRandom(i + 1) * 40),
        milestones: ['Led migration project', 'Mentored new joiners'],
        trainingCompleted: ['Advanced React', 'Time Management'],
        goalProgress: [
          { goal: 'Improve on-time delivery', progress: 0.8 },
          { goal: 'Increase cross-company collaboration', progress: 0.6 }
        ]
      },
      actionableInsights: {
        strengths: ['Reliable delivery', 'Strong collaboration'],
        improvementAreas: ['Increase innovation contributions', 'Enhance documentation quality'],
        recommendations: ['Pair with mentor for design reviews', 'Allocate time for process improvements'],
        nextReviewDate: new Date(Date.now() + 30 * 24 * 3600 * 1000)
      }
    };

    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e?.message || 'Failed to compute metrics' });
  }
}

export async function getRankings(req, res) {
  try {
    const users = await User.find({ status: 'active' }).limit(100).lean();
    const rows = users.map(u => generateUserMetrics(u));
    rows.sort((a, b) => b.overallScore - a.overallScore);
    const ranking = rows.map((r, i) => ({
      rank: i + 1,
      employeeName: r.user.name,
      userId: r.user.id,
      performanceScore: r.overallScore,
      completionRate: Math.round(r.taskCompletionRate),
      qualityRating: Number(r.qualityScore.toFixed(2)),
      timeliness: Math.round(r.timelinessScore),
      collaboration: Number((r.collaborationScore * 20).toFixed(2)),
      growthTrend: [r.overallScore - 5, r.overallScore - 2, r.overallScore],
      companyId: r.user.companyId,
      role: r.user.role
    }));

    const distribution = {
      star: ranking.filter(r => r.performanceScore >= 90).length,
      high: ranking.filter(r => r.performanceScore >= 80 && r.performanceScore < 90).length,
      solid: ranking.filter(r => r.performanceScore >= 70 && r.performanceScore < 80).length,
      developing: ranking.filter(r => r.performanceScore >= 60 && r.performanceScore < 70).length,
      needsImprovement: ranking.filter(r => r.performanceScore < 60).length,
    };

    res.json({ ranking, distribution });
  } catch (e) {
    res.status(500).json({ message: e?.message || 'Failed to compute rankings' });
  }
}

export async function getTeamPerformance(req, res) {
  try {
    // As teams model is not detailed here, provide aggregate from users
    const { teamId } = req.params;
    const users = await User.find({ status: 'active' }).limit(10).lean();
    const rows = users.map(u => generateUserMetrics(u));
    const avg = rows.reduce((a, b) => a + b.overallScore, 0) / Math.max(rows.length, 1);
    res.json({ teamId, teamOverview: { teamName: 'Team ' + teamId.slice(-4), teamLead: 'TBD', memberCount: rows.length, averagePerformance: Number(avg.toFixed(2)), performanceRank: 1, improvementRate: 5.2 }, teamMetrics: { collectiveTaskCompletion: Math.round(rows.reduce((a, b) => a + b.taskCompletionRate, 0) / rows.length), averageQualityScore: Number((rows.reduce((a, b) => a + b.qualityScore, 0) / rows.length).toFixed(2)), collaborationIndex: Number((rows.reduce((a, b) => a + b.collaborationScore, 0) / rows.length).toFixed(2)), crossFunctionalProjects: Math.round(rows.reduce((a, b) => a + b.crossCompanyProjects, 0) / rows.length), knowledgeSharingScore: Math.round(rows.reduce((a, b) => a + b.knowledgeSharing, 0) / rows.length) }, memberDistribution: { starPerformers: rows.filter(r => r.overallScore >= 90).length, highPerformers: rows.filter(r => r.overallScore >= 80).length, solidPerformers: rows.filter(r => r.overallScore >= 70).length, developingPerformers: rows.filter(r => r.overallScore >= 60).length, needsImprovement: rows.filter(r => r.overallScore < 60).length }, teamAnalytics: { productivityTrends: Array.from({ length: 6 }).map((_, i) => 60 + seededRandom(i + 20) * 35), skillGapAnalysis: ['Advanced testing', 'Cloud fundamentals'], trainingRecommendations: ['Workshop: Collaboration'], resourceOptimization: { suggestion: 'Balance workload across contributors' } } });
  } catch (e) {
    res.status(500).json({ message: e?.message || 'Failed to compute team performance' });
  }
}

export async function getCompanyPerformance(req, res) {
  try {
    const { companyId } = req.params;
    const users = await User.find({ status: 'active' }).limit(50).lean();
    const rows = users.map(u => generateUserMetrics(u));
    const avg = rows.reduce((a, b) => a + b.overallScore, 0) / Math.max(rows.length, 1);
    res.json({ companyId, averageCompanyScore: Number(avg.toFixed(2)), collaborationEffectiveness: 3.7, resourceSharingSuccess: 0.68, bestPerformingCompany: 'My Company' });
  } catch (e) {
    res.status(500).json({ message: e?.message || 'Failed to compute company performance' });
  }
}

export async function getTrends(req, res) {
  try {
    const { period } = req.params; // e.g., last6months
    const points = period === 'last6months' ? 6 : 12;
    const series = {
      overall: Array.from({ length: points }).map((_, i) => 60 + seededRandom(i + 1) * 35),
      completion: Array.from({ length: points }).map((_, i) => 70 + seededRandom(i + 2) * 25),
      quality: Array.from({ length: points }).map((_, i) => 3 + seededRandom(i + 3) * 2),
      collaboration: Array.from({ length: points }).map((_, i) => 2 + seededRandom(i + 4) * 3),
    };
    res.json({ period, series });
  } catch (e) {
    res.status(500).json({ message: e?.message || 'Failed to compute trends' });
  }
}

// Simple in-memory goals store (per process)
const goals = new Map();
let goalSeq = 1;

export async function createGoal(req, res) {
  try {
    const { userId, goalType, description, targetMetric, deadline } = req.body || {};
    if (!userId || !goalType || !description) return res.status(400).json({ message: 'Missing required fields' });
    const id = String(goalSeq++);
    const goal = { id, userId, goalType, description, targetMetric: Number(targetMetric) || 0, currentProgress: 0, deadline: deadline ? new Date(deadline) : null, status: 'active', milestones: [], createdBy: req.user.id, createdAt: new Date(), completedAt: null };
    goals.set(id, goal);
    res.status(201).json({ goal });
  } catch (e) {
    res.status(500).json({ message: e?.message || 'Failed to create goal' });
  }
}

export async function updateGoal(req, res) {
  try {
    const { goalId } = req.params;
    const update = req.body || {};
    const goal = goals.get(goalId);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    Object.assign(goal, update);
    if (update.status === 'completed') goal.completedAt = new Date();
    goals.set(goalId, goal);
    res.json({ goal });
  } catch (e) {
    res.status(500).json({ message: e?.message || 'Failed to update goal' });
  }
}

export async function generateReport(req, res) {
  try {
    const type = req.query.type || 'Quarterly Performance Review';
    const id = Math.random().toString(36).slice(2);
    res.json({ ok: true, reportId: id, download: `/api/performance/reports/${id}.pdf`, type });
  } catch (e) {
    res.status(500).json({ message: e?.message || 'Failed to generate report' });
  }
}

export async function getAIInsights(req, res) {
  try {
    res.json({
      performancePatterns: {
        identifyTrends: 'Slight dip in quality around release periods',
        predictOutcomes: 'Overall upward trajectory next quarter',
        anomalyDetection: 'Spike in overtime correlated with bug influx'
      },
      personalizationRecommendations: {
        individualCoaching: 'Focus on code review practices',
        skillDevelopment: 'Advanced testing training suggested',
        careerPathing: 'Potential for Tech Lead track',
        mentorshipMatching: 'Match with senior engineer in Company B'
      },
      organizationalInsights: {
        teamOptimization: 'Balance senior/junior ratio in Team Alpha',
        workloadBalancing: 'Shift 15% of tasks from overloaded contributors',
        processImprovements: 'Introduce pair programming on critical modules',
        retentionStrategies: 'Recognize top 10% performers with growth plans'
      }
    });
  } catch (e) {
    res.status(500).json({ message: e?.message || 'Failed to get AI insights' });
  }
}

export async function getIndustryBenchmarks(req, res) {
  try {
    res.json({
      industryStandards: {
        avgCompletionRate: 82,
        avgQualityRating: 4.1,
        avgOnTimeDelivery: 88
      },
      competitiveAdvantage: ['Strong cross-company collaboration', 'Rapid iteration cycles'],
      improvementOpportunities: ['Increase innovation time allocation', 'Standardize QA gates']
    });
  } catch (e) {
    res.status(500).json({ message: e?.message || 'Failed to get benchmarks' });
  }
}
