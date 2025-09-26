import React, { useState } from 'react'
import { projectManagerService } from '../../../services/projectManagerService'

interface Props {
  projectId: string
  onClose: () => void
  onSuccess: () => void
}

const AddMemberModal: React.FC<Props> = ({ projectId, onClose, onSuccess }) => {
  const [userId, setUserId] = useState('')
  const [role, setRole] = useState('Contributor')
  const [hourlyRate, setHourlyRate] = useState<number | ''>('')
  const [maxHoursPerWeek, setMaxHoursPerWeek] = useState<number | ''>('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    setSaving(true)
    try {
      await projectManagerService.addTeamMember(projectId, {
        userId,
        role,
        hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
        maxHoursPerWeek: maxHoursPerWeek ? Number(maxHoursPerWeek) : undefined,
      })
      onSuccess()
    } catch (e) {
      alert('Failed to add member')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add Member</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">User ID</label>
            <input value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Enter user ID" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border rounded px-3 py-2">
              <option>Team Leader</option>
              <option>Senior Developer</option>
              <option>Developer</option>
              <option>Designer</option>
              <option>Tester</option>
              <option>Contributor</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Hourly Rate</label>
              <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value ? Number(e.target.value) : '')} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Hours / Week</label>
              <input type="number" value={maxHoursPerWeek} onChange={(e) => setMaxHoursPerWeek(e.target.value ? Number(e.target.value) : '')} className="w-full border rounded px-3 py-2" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">
              {saving ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddMemberModal
