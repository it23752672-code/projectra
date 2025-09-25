import { api, getErrorMessage } from './api'

export type CollaborationRequest = {
  _id: string
  requestingCompanyId: string
  targetCompanyId: string
  projectId?: string
  skillsRequired?: string[]
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent'
  message?: string
  proposedDuration?: string
  proposedBudget?: number
  deadline?: string
  status: 'Pending' | 'Approved' | 'Rejected' | 'In Progress' | 'Completed' | 'Cancelled'
  createdAt: string
}

export const collaborationService = {
  async list(params?: { status?: string, scope?: 'all' | 'mine' }) {
    const { data } = await api.get('/collaboration-requests', { params })
    return data.requests as CollaborationRequest[]
  },
  async create(input: Partial<CollaborationRequest>) {
    try {
      const { data } = await api.post('/collaboration-requests', input)
      return data.request as CollaborationRequest
    } catch (e: any) {
      throw new Error(getErrorMessage(e))
    }
  },
  async update(id: string, input: Partial<CollaborationRequest>) {
    const { data } = await api.put(`/collaboration-requests/${id}`, input)
    return data.request as CollaborationRequest
  },
  async remove(id: string) {
    await api.delete(`/collaboration-requests/${id}`)
  },
}
