import { api } from './api'

export const adminUserService = {
  // Get all users with filters
  async getAllUsers(filters: any = {}) {
    const { data } = await api.get('/admin/users', { params: filters })
    return data
  },

  // Create new user
  async createUser(userData: any) {
    const { data } = await api.post('/admin/users', userData)
    return data
  },

  // Get user by ID
  async getUserById(userId: string) {
    const { data } = await api.get(`/admin/users/${userId}`)
    return data
  },

  // Update user
  async updateUser(userId: string, userData: any) {
    const { data } = await api.put(`/admin/users/${userId}`, userData)
    return data
  },

  // Delete user
  async deleteUser(userId: string) {
    const { data } = await api.delete(`/admin/users/${userId}`)
    return data
  },

  // Bulk operations
  async bulkUpdateUsers(userIds: string[], action: string, data?: any) {
    const payload: any = { userIds, action }
    if (data) payload.data = data
    const { data: resp } = await api.post('/admin/users/bulk', payload)
    return resp
  },

  // Export users
  async exportUsers() {
    const { data } = await api.get('/admin/users/export/csv')
    return data
  }
}
