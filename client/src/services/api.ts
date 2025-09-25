import axios from 'axios'

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api'

export const api = axios.create({
  baseURL: API_BASE,
})

// Attach token from localStorage for each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pj_access_token')
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// Optionally unify errors
export function getErrorMessage(err: any): string {
  return (
    err?.response?.data?.message || err?.message || 'Something went wrong'
  )
}
