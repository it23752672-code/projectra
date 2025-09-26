import { api } from './api'

export const projectManagerService = {
  async getProjectOverview(projectId: string) {
    const { data } = await api.get(`/pm/projects/${projectId}/overview`)
    return data
  },
  async getWorkloadAnalysis(projectId: string) {
    const { data } = await api.get(`/pm/projects/${projectId}/workload`)
    return data
  },
  async addTeamMember(projectId: string, payload: { userId: string; role: string; hourlyRate?: number; maxHoursPerWeek?: number }) {
    const { data } = await api.post(`/pm/projects/${projectId}/members`, payload)
    return data
  },
  async removeTeamMember(projectId: string, memberId: string) {
    const { data } = await api.delete(`/pm/projects/${projectId}/members/${memberId}`)
    return data
  },
  async createMainTask(projectId: string, payload: any) {
    const { data } = await api.post(`/pm/projects/${projectId}/main-tasks`, payload)
    return data
  },
  async updateProjectTimeline(projectId: string, payload: { startDate?: string; endDate?: string; milestones?: any[] }) {
    const { data } = await api.put(`/pm/projects/${projectId}/timeline`, payload)
    return data
  },
}
