import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export type AuthUser = {
  id: string
  name?: string
  email: string
  role?: string
  jobRole?: string
}

type AuthContextType = {
  user: AuthUser | null
  token: string | null
  loading: boolean
  login: (token: string, user?: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'pj_access_token'
const USER_KEY = 'pj_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  })
  const [loading, setLoading] = useState(false)

  const login = (newToken: string, newUser?: AuthUser) => {
    setToken(newToken)
    localStorage.setItem(TOKEN_KEY, newToken)
    if (newUser) {
      setUser(newUser)
      localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    navigate('/login', { replace: true })
  }

  // Optionally, we could verify token on mount by pinging /api/users/profile
  useEffect(() => {
    // noop for minimal implementation
  }, [])

  const value = useMemo(() => ({ user, token, loading, login, logout }), [user, token, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
