import { api } from './api'

export const feedbackService = {
  submitFeedback: async (data: { title: string; feedbackText: string; feedbackType: string; priority: string }) => {
    const response = await api.post('/feedback-mgmt/submit', {
      ...data,
      browserInfo: {
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        platform: navigator.platform,
      },
    })
    return response.data
  },

  getUserFeedback: async (page = 1, status?: string) => {
    const response = await api.get('/feedback-mgmt/my-feedback', { params: { page, status } })
    return response.data
  },

  getAllFeedback: async (filters: any = {}) => {
    const response = await api.get('/feedback-mgmt/all', { params: filters })
    return response.data
  },

  updateFeedback: async (feedbackId: string, data: any) => {
    const response = await api.put(`/feedback-mgmt/${feedbackId}`, data)
    return response.data
  },

  getFeedbackStats: async () => {
    const response = await api.get('/feedback-mgmt/stats')
    return response.data
  },
}
