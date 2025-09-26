import React, { useEffect, useMemo, useState } from 'react'
import { api, getErrorMessage } from '@/services/api'
import { useAuth } from '@/state/AuthContext'

export type AssignTaskModalProps = {
  projectId: string
  task: any
  isOpen: boolean
  onClose: () => void
  onSaved?: () => void
}

export default function AssignTaskModal({ projectId, task, isOpen, onClose, onSaved }: AssignTaskModalProps) {
  const { user } = useAuth()
  const canEdit = user?.role === 'Admin' || user?.role === 'ProjectManager'
  const [members, setMembers] = useState<any[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // form state
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])
  const [dueDate, setDueDate] = useState<string>('')

  useEffect(() => {
    if (!isOpen) return
    // Load project members (contributors + managers) to pick from
    void loadMembers()
    // Seed form from task
    const ids: string[] = Array.isArray(task?.assignees) ? task.assignees.map((a: any) => String(a?._id || a)) : (task?.assigneeId ? [String(task.assigneeId)] : [])
    setSelectedAssignees(ids)
    if (task?.dueDate) {
      try {
        const d = new Date(task.dueDate)
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const dd = String(d.getDate()).padStart(2, '0')
        setDueDate(`${y}-${m}-${dd}`)
      } catch {}
    } else {
      setDueDate('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, task?._id])

  async function loadMembers() {
    try {
      setLoadingMembers(true)
      const { data } = await api.get('/users', { params: { projectId } })
      // Prefer active contributors for assignment
      const list = (data.users || []).filter((u: any) => u.status === 'active' && u.role !== 'Admin')
      setMembers(list)
    } catch (err) {
      setMembers([])
    } finally {
      setLoadingMembers(false)
    }
  }

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => String(a.firstName || '').localeCompare(String(b.firstName || '')))
  }, [members])

  const toggleAssignee = (id: string) => {
    setSelectedAssignees(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!canEdit) return
    setSaving(true)
    setError(null)
    try {
      const payload: any = {}
      if (selectedAssignees.length === 1) {
        payload.assigneeId = selectedAssignees[0]
        payload.assigneeIds = selectedAssignees // also send array to fill multi-assign if backend maps
      } else if (selectedAssignees.length > 1) {
        payload.assigneeIds = selectedAssignees
        payload.assigneeId = undefined
      } else {
        // clear assignment
        payload.assigneeId = null
        payload.assigneeIds = []
      }
      if (dueDate) {
        // Convert yyyy-mm-dd to ISO preserving local date
        const iso = new Date(dueDate + 'T00:00:00').toISOString()
        payload.dueDate = iso
      } else {
        payload.dueDate = null
      }
      await api.patch(`/tasks/${task._id}`, payload)
      onSaved?.()
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Assign Task</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">✕</button>
        </div>
        <form onSubmit={handleSave} className="p-4 space-y-4">
          {/* Assignees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assignees</label>
            {loadingMembers ? (
              <div className="text-sm text-gray-500">Loading members...</div>
            ) : (
              <div className="max-h-48 overflow-auto border rounded-md divide-y">
                {sortedMembers.length === 0 && <div className="p-3 text-sm text-gray-500">No members available</div>}
                {sortedMembers.map((m: any) => (
                  <label key={m._id} className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedAssignees.includes(String(m._id))}
                      onChange={() => toggleAssignee(String(m._id))}
                    />
                    <span className="text-sm text-gray-800">{m.firstName} {m.lastName} <span className="text-gray-500">({m.role})</span></span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Due date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
            {canEdit && (
              <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
