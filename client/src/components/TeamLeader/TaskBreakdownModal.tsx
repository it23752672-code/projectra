import React, { useState } from 'react'
import { teamLeaderService } from '../../services/teamLeaderService'
import { X, Plus, Trash2 } from 'lucide-react'

interface Props {
  task: any
  contributors: any[]
  onClose: () => void
  onSuccess: () => void
}

const TaskBreakdownModal: React.FC<Props> = ({ task, contributors, onClose, onSuccess }) => {
  const [subTasks, setSubTasks] = useState<any[]>([
    { taskName: '', taskDescription: '', assigneeId: '', dueDate: '', priority: 'Medium', estimatedHours: '', taskWeightage: 5, requiredSkills: [] },
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addSubTask = () => {
    setSubTasks([
      ...subTasks,
      { taskName: '', taskDescription: '', assigneeId: '', dueDate: '', priority: 'Medium', estimatedHours: '', taskWeightage: 5, requiredSkills: [] },
    ])
  }

  const removeSubTask = (index: number) => {
    setSubTasks(subTasks.filter((_, i) => i !== index))
  }

  const updateSubTask = (index: number, field: string, value: any) => {
    const updated = [...subTasks]
    updated[index] = { ...updated[index], [field]: value }
    setSubTasks(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validSubTasks = subTasks.filter((st) => st.taskName.trim() && st.assigneeId && st.dueDate)
    if (validSubTasks.length === 0) {
      alert('Please add at least one valid subtask')
      return
    }
    setIsSubmitting(true)
    try {
      await teamLeaderService.createSubTasks(task._id, { subTasks: validSubTasks })
      alert('Subtasks created successfully')
      onSuccess()
    } catch (e) {
      alert('Failed to create subtasks')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Break Down Task</h3>
            <p className="text-sm text-gray-500 mt-1">{task.taskName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {subTasks.map((subTask, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Subtask #{index + 1}</h4>
                  {subTasks.length > 1 && (
                    <button type="button" onClick={() => removeSubTask(index)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Task Name *</label>
                    <input
                      type="text"
                      value={subTask.taskName}
                      onChange={(e) => updateSubTask(index, 'taskName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter subtask name..."
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={subTask.taskDescription}
                      onChange={(e) => updateSubTask(index, 'taskDescription', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Enter task description..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign To *</label>
                    <select
                      value={subTask.assigneeId}
                      onChange={(e) => updateSubTask(index, 'assigneeId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select contributor...</option>
                      {contributors.map((contributor) => (
                        <option key={contributor.userId._id} value={contributor.userId._id}>
                          {contributor.userId.firstName} {contributor.userId.lastName} ({contributor.role}) - {contributor.availability}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                    <input
                      type="date"
                      value={subTask.dueDate}
                      onChange={(e) => updateSubTask(index, 'dueDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={subTask.priority}
                      onChange={(e) => updateSubTask(index, 'priority', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                    <input
                      type="number"
                      value={subTask.estimatedHours}
                      onChange={(e) => updateSubTask(index, 'estimatedHours', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      min={0}
                      step={0.5}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Task Weightage (1-10)</label>
                    <input
                      type="number"
                      value={subTask.taskWeightage}
                      onChange={(e) => updateSubTask(index, 'taskWeightage', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min={1}
                      max={10}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
                    <input
                      type="text"
                      value={Array.isArray(subTask.requiredSkills) ? subTask.requiredSkills.join(', ') : ''}
                      onChange={(e) => updateSubTask(index, 'requiredSkills', e.target.value.split(',').map((s) => s.trim()))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="JavaScript, React, Node.js (comma separated)"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addSubTask}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Another Subtask</span>
            </button>
          </div>

          <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
            <button type="button" onClick={onClose} className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {isSubmitting ? 'Creating Subtasks...' : 'Create Subtasks'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskBreakdownModal
