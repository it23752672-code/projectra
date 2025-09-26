import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminUserService } from '@/services/adminUserService'
import { toast } from '@/lib/toast'

export interface UserFilters {
  page?: number
  limit?: number
  search?: string
  role?: string
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export function useUsers(initialFilters: UserFilters = { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }) {
  const [filters, setFilters] = useState<UserFilters>(initialFilters)
  const [users, setUsers] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState<boolean>(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminUserService.getAllUsers(filters)
      setUsers(res.users || [])
      setStats(res.stats || {})
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { load() }, [load])

  // mutations
  const create = useCallback(async (payload: any) => {
    await adminUserService.createUser(payload)
    toast.success('User created')
    await load()
  }, [load])

  const update = useCallback(async (id: string, payload: any) => {
    await adminUserService.updateUser(id, payload)
    toast.success('User updated')
    await load()
  }, [load])

  const remove = useCallback(async (id: string) => {
    await adminUserService.deleteUser(id)
    toast.success('User deleted')
    await load()
  }, [load])

  const bulk = useCallback(async (ids: string[], action: string, data?: any) => {
    await adminUserService.bulkUpdateUsers(ids, action, data)
    toast.success(`Bulk ${action} complete`)
    await load()
  }, [load])

  return useMemo(() => ({ users, stats, loading, filters, setFilters, load, create, update, remove, bulk }), [users, stats, loading, filters, setFilters, load, create, update, remove, bulk])
}
