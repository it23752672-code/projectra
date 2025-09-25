import { api, getErrorMessage } from './api'

export type PartnerCompany = {
  _id: string
  companyName: string
  companyEmail?: string
  pmId?: string
  totalEmployees: number
  availableEmployees: number
  busyEmployees: number
  activeProjects: any[]
  collaborationStatus: string
  lastActivity?: string
  specializations?: string[]
  trustScore?: number
  logoUrl?: string | null
  industryType?: string | null
}

export const networkService = {
  async listCompanies() {
    const { data } = await api.get('/companies/network')
    return data.companies as PartnerCompany[]
  },
  async addCompany(input: any) {
    try {
      const { data } = await api.post('/companies/network', input)
      return data.company as any
    } catch (e: any) {
      throw new Error(getErrorMessage(e))
    }
  },
  async updateCompany(id: string, input: any) {
    const { data } = await api.put(`/companies/network/${id}`, input)
    return data.company
  },
  async deleteCompany(id: string) {
    await api.delete(`/companies/network/${id}`)
  },
}
