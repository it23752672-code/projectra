import API from './api'

export type LoginDto = {
  email: string
  password: string
}

export type RegisterDto = {
  name?: string
  email: string
  password: string
}

export async function login(dto: LoginDto) {
  const { data } = await API.post('/auth/login', dto)
  // Expecting { accessToken, user }
  return data as { accessToken: string; user?: any }
}

export async function register(dto: RegisterDto) {
  const { data } = await API.post('/auth/register', dto)
  return data
}

export async function getProjects() {
  const { data } = await API.get('/projects')
  return data
}

export async function getHealth() {
  const { data } = await API.get('/health')
  return data
}
