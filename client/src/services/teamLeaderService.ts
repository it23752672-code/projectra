import { api } from './api'

export const teamLeaderService = {
  async getAssignedMainTasks() {
    const { data } = await api.get('/leader/main-tasks')
    return data
  },
  async createSubTasks(mainTaskId: string, payload: { subTasks: any[] }) {
    const { data } = await api.post(`/leader/tasks/${mainTaskId}/subtasks`, payload)
    return data
  },
  async getAvailableContributors(projectId: string) {
    const { data } = await api.get(`/leader/projects/${projectId}/contributors`)
    return data
  },
}
