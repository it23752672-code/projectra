import React, { useEffect, useMemo, useState } from 'react'
import { adminUserService } from '../../../services/adminUserService'
import { toast } from 'react-hot-toast'
import { Plus, Pencil, Trash2, Users, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../../state/AuthContext'
import CreateUserModal from './CreateUserModal'
import EditUserModal from './EditUserModal'

const AdminUserDashboard: React.FC = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<any | null>(null)
  const [filters, setFilters] = useState<any>({
    page: 1,
    limit: 10,
    search: '',
    role: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  // Align with current backend enums
  const roles = useMemo(() => [
    { value: 'Admin', label: 'Admin' },
    { value: 'ProjectManager', label: 'Project Manager' },
    { value: 'Contributor', label: 'Contributor' },
  ], [])
  const statuses = useMemo(() => [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
  ], [])

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.limit, filters.search, filters.role, filters.status, filters.sortBy, filters.sortOrder])

  async function fetchUsers() {
    try {
      setLoading(true)
      const response = await adminUserService.getAllUsers(filters)
      setUsers(response.users || [])
      setStats(response.stats || {})
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateUser(userData: any) {
    try {
      await adminUserService.createUser(userData)
      toast.success('User created successfully')
      setShowCreateModal(false)
      fetchUsers()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create user')
    }
  }

  async function handleUpdateUser(userId: string, userData: any) {
    try {
      await adminUserService.updateUser(userId, userData)
      toast.success('User updated successfully')
      setShowEditModal(false)
      setEditingUser(null)
      fetchUsers()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update user')
    }
  }

  async function handleDeleteUser(userId: string) {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminUserService.deleteUser(userId)
        toast.success('User deleted successfully')
        fetchUsers()
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to delete user')
      }
    }
  }

  async function handleBulkAction(action: string) {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first')
      return
    }
    try {
      await adminUserService.bulkUpdateUsers(selectedUsers, action)
      toast.success(`Bulk ${action} completed successfully`)
      setSelectedUsers([])
      fetchUsers()
    } catch (error) {
      toast.error(`Failed to perform bulk ${action}`)
    }
  }

  async function handleExportUsers() {
    try {
      const response = await adminUserService.exportUsers()
      const csvContent = convertToCSV(response.data || [])
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = response.filename || `users_export.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Users exported successfully')
    } catch (error) {
      toast.error('Failed to export users')
    }
  }

  function convertToCSV(rows: any[]): string {
    if (!rows || rows.length === 0) return ''
    const headers = Object.keys(rows[0])
    const escape = (val: any) => {
      if (val == null) return ''
      const s = String(val)
      if (s.includes(',') || s.includes('\n') || s.includes('"')) {
        return '"' + s.replace(/"/g, '""') + '"'
      }
      return s
    }
    const dataRows = rows.map((r) => headers.map((h) => escape(r[h])).join(','))
    return headers.join(',') + '\n' + dataRows.join('\n')
  }

  function getStatusColor(status: string) {
    return status === 'active' ? 'bg-green-100 text-green-800' : status === 'inactive' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
  }

  function getRoleColor(role: string) {
    const colors: Record<string, string> = {
      Admin: 'bg-purple-100 text-purple-800',
      ProjectManager: 'bg-blue-100 text-blue-800',
      Contributor: 'bg-gray-100 text-gray-800',
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  if (user?.role !== 'Admin') {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-2xl font-semibold text-gray-900">Access denied</h1>
        <p className="text-gray-600 mt-2">You must be an administrator to view this page.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage all user accounts and permissions</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={handleExportUsers} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Export CSV
          </button>
          <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalUsers || 0}</p>
            </div>
            <Users className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-green-600">{stats.activeUsers || 0}</p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive Users</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.inactiveUsers || 0}</p>
            </div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Administrators</p>
              <p className="text-3xl font-bold text-purple-600">{stats.adminUsers || 0}</p>
            </div>
            <ShieldCheck className="w-12 h-12 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input type="text" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Search by name or email..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Roles</option>
              {roles.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Statuses</option>
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select value={`${filters.sortBy}-${filters.sortOrder}`} onChange={(e) => { const [sortBy, sortOrder] = e.target.value.split('-'); setFilters({ ...filters, sortBy, sortOrder, page: 1 }) }} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="firstName-asc">Name A-Z</option>
              <option value="firstName-desc">Name Z-A</option>
              <option value="email-asc">Email A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">{selectedUsers.length} user(s) selected</span>
            <div className="flex space-x-2">
              <button onClick={() => handleBulkAction('activate')} className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">Activate</button>
              <button onClick={() => handleBulkAction('deactivate')} className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700">Deactivate</button>
              <button onClick={() => handleBulkAction('suspend')} className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700">Suspend</button>
              <button onClick={() => handleBulkAction('delete')} className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input type="checkbox" onChange={(e) => { if (e.target.checked) { setSelectedUsers(users.map((u) => u._id)) } else { setSelectedUsers([]) } }} className="rounded border-gray-300" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" checked={selectedUsers.includes(u._id)} onChange={(e) => { if (e.target.checked) setSelectedUsers([...selectedUsers, u._id]); else setSelectedUsers(selectedUsers.filter((id) => id !== u._id)) }} className="rounded border-gray-300" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">{(u.firstName?.[0] || '') + (u.lastName?.[0] || '')}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{u.firstName} {u.lastName}</div>
                        <div className="text-sm text-gray-500">ID: {String(u._id).slice(-8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{u.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(u.role)}`}>{roles.find(r => r.value === u.role)?.label || u.role}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(u.status)}`}>{statuses.find(s => s.value === u.status)?.label || u.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.planId?.name || 'Free'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button onClick={() => { setEditingUser(u); setShowEditModal(true) }} className="text-blue-600 hover:text-blue-900" title="Edit User">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteUser(u._id)} className="text-red-600 hover:text-red-900" title="Delete User">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination (simple) */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between">
            <button onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })} disabled={filters.page === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Previous</button>
            <button onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal onClose={() => setShowCreateModal(false)} onSubmit={handleCreateUser} roles={roles} statuses={statuses} />
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <EditUserModal user={editingUser} onClose={() => { setShowEditModal(false); setEditingUser(null) }} onSubmit={(data: any) => handleUpdateUser(editingUser._id, data)} roles={roles} statuses={statuses} />
      )}
    </div>
  )
}

export default AdminUserDashboard
