import { api } from './api'

export const aiService = {
  async getChatResponse(payload: { message: string, context?: any }) {
    const { data } = await api.post('/ai/chat', payload)
    return data as { success: boolean, response: string, suggestions?: string[], resources?: any[] }
  },
  async getTaskAssistance(taskId: string, question?: string) {
    const { data } = await api.post('/ai/task-assistance', { taskId, question })
    return data as { success: boolean, response: string, taskContext?: any }
  },
  async getProjectOnboarding(projectId: string) {
    const { data } = await api.post('/ai/project-onboarding', { projectId })
    return data as { success: boolean, response: string, projectInfo?: any }
  },
  async getSkillDevelopment(skillArea: string, currentLevel: string) {
    const { data } = await api.post('/ai/skill-development', { skillArea, currentLevel })
    return data as { success: boolean, response: string }
  },
}
