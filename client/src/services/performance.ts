import { api } from './api'

export type PerformancePeriod = 'week' | 'month' | 'quarter' | 'year'

export interface RankingRow {
  rank: number
  employeeName: string
  userId: string
  performanceScore: number
  completionRate: number
  qualityRating: number
  timeliness: number
  collaboration: number
  growthTrend: number[]
  companyId?: string
  role?: string
}

export interface Distribution {
  star: number
  high: number
  solid: number
  developing: number
  needsImprovement: number
}

export const performanceAPI = {
  async getMetrics(userId: string) {
    const { data } = await api.get(`/performance/metrics/${userId}`)
    return data
  },
  async getRankings() {
    const { data } = await api.get('/performance/rankings')
    return data as { ranking: RankingRow[]; distribution: Distribution }
  },
  async getTrends(period: 'last6months' | 'last12months') {
    const { data } = await api.get(`/performance/trends/${period}`)
    return data as { period: string; series: { overall: number[]; completion: number[]; quality: number[]; collaboration: number[] } }
  },
  async getAIInsights() {
    const { data } = await api.get('/performance/insights/ai')
    return data
  },
  async getBenchmarks() {
    const { data } = await api.get('/performance/benchmarks/industry')
    return data
  },
  async createGoal(payload: { userId: string; goalType: string; description: string; targetMetric: number; deadline?: string }) {
    const { data } = await api.post('/performance/goals', payload)
    return data.goal
  },
  async updateGoal(goalId: string, update: any) {
    const { data } = await api.put(`/performance/goals/${goalId}`, update)
    return data.goal
  },
  async generateReport(type?: string) {
    const { data } = await api.get('/performance/reports/generate', { params: { type } })
    return data
  },
}
