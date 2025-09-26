import React, { useState } from 'react'
import { projectManagerService } from '../../../services/projectManagerService'

interface Props {
  projectId: string
  teamLeaders: any[]
  onClose: () => void
  onSuccess: () => void
}

const CreateMainTaskModal: React.FC<Props> = ({ projectId, teamLeaders, onClose, onSuccess }) => {
  const [taskName, setTaskName] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [estimatedHours, setEstimatedHours] = useState<number | ''>('')
  const [taskWeightage, setTaskWeightage] = useState<number>(5)
  const [requiredSkills, setRequiredSkills] = useState<string>('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskName || !assigneeId || !dueDate) return
    setSaving(true)
    try {
      await projectManagerService.createMainTask(projectId, {
        taskName,
        taskDescription,
        assigneeId,
        dueDate,
        priority,
        estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
        taskWeightage,
        requiredSkills: requiredSkills
          ? requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      })
      onSuccess()
    } catch (e) {
      alert('Failed to create main task')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Create Main Task</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Task Name *</label>
            <input value={taskName} onChange={(e) => setTaskName(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} className="w-full border rounded px-3 py-2" rows={3} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Assign To (Team Leader) *</label>
              <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="">Select Leader</option>
                {(teamLeaders || []).map((leader: any) => (
                  <option key={leader._id || leader} value={leader._id || leader}>
                    {leader.firstName ? `${leader.firstName} ${leader.lastName}` : leader}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date *</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full border rounded px-3 py-2">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estimated Hours</label>
              <input type="number" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value ? Number(e.target.value) : '')} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Task Weightage (1-10)</label>
              <input type="number" min={1} max={10} value={taskWeightage} onChange={(e) => setTaskWeightage(Number(e.target.value))} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Required Skills</label>
              <input value={requiredSkills} onChange={(e) => setRequiredSkills(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Comma separated" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50">
              {saving ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateMainTaskModal
