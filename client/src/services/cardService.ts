import { api, getErrorMessage } from './api'

export type CreateCardInput = {
  title: string
  description?: string
  status: string
  projectId: string
  priority?: 'Low' | 'Medium' | 'High' | 'Critical'
  dueDate?: string | Date
}

export const cardService = {
  async createCard(input: CreateCardInput) {
    try {
      // Backend expects fields { title, description, status, projectId, ... }
      const { data } = await api.post('/tasks', input)
      return data.task
    } catch (err: any) {
      throw new Error(getErrorMessage(err))
    }
  },

  async updateCardStatus(cardId: string, newStatus: string) {
    const { data } = await api.patch(`/tasks/${cardId}/status`, { status: newStatus })
    return data.task
  },

  async updateCardPosition(cardId: string, position: number, status?: string) {
    // If backend supports a dedicated endpoint, adapt here. For now, fallback to updateTask with no-op
    try {
      const payload: any = { position }
      if (status) payload.status = status
      const { data } = await api.put(`/tasks/${cardId}`, payload)
      return data.task
    } catch (e) {
      // Silently ignore if not supported
      return null as any
    }
  },
}
