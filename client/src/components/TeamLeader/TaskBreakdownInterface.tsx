import React, { useEffect, useState } from 'react'
import { teamLeaderService } from '../../services/teamLeaderService'
import { Plus, Users, Clock, AlertCircle } from 'lucide-react'
import TaskBreakdownModal from './TaskBreakdownModal'

const TaskBreakdownInterface: React.FC = () => {
  const [mainTasks, setMainTasks] = useState<any[]>([])
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [contributors, setContributors] = useState<any[]>([])
  const [showBreakdownModal, setShowBreakdownModal] = useState(false)

  useEffect(() => {
    fetchMainTasks()
  }, [])

  const fetchMainTasks = async () => {
    try {
      const response = await teamLeaderService.getAssignedMainTasks()
      setMainTasks(response.mainTasks)
    } catch (error) {
      console.error('Failed to fetch main tasks:', error)
    }
  }

  const handleBreakdownTask = async (task: any) => {
    setSelectedTask(task)
    try {
      const response = await teamLeaderService.getAvailableContributors(task.projectId._id)
      setContributors(response.contributors)
      setShowBreakdownModal(true)
    } catch (error) {
      console.error('Failed to fetch contributors:', error)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Not Started': 'bg-gray-100 text-gray-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      Review: 'bg-yellow-100 text-yellow-800',
      Completed: 'bg-green-100 text-green-800',
      'On Hold': 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      Critical: 'text-red-600',
      High: 'text-orange-600',
      Medium: 'text-yellow-600',
      Low: 'text-green-600',
    }
    return colors[priority] || 'text-gray-600'
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Main Tasks</h1>
          <p className="text-gray-600 mt-1">Break down main tasks into subtasks for your team</p>
        </div>
      </div>

      {/* Main Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mainTasks.map((task) => (
          <div key={task._id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{task.taskName}</h3>
                <p className="text-sm text-gray-600 mt-1">{task.taskDescription}</p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
                <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>{task.priority} Priority</span>
              </div>
            </div>

            {/* Task Details */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Weightage: {task.taskWeightage}/10</span>
              </div>
            </div>

            {/* Project Info */}
            <div className="mb-4">
              <span className="text-sm text-gray-500">Project: {task.projectId?.projectName || task.projectId?.name}</span>
            </div>

            {/* Subtasks Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{task.subTasks?.length || 0} Subtask(s) Created</span>
              </div>
              {task.estimatedHours && <span className="text-sm text-gray-500">Est: {task.estimatedHours}h</span>}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => handleBreakdownTask(task)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Break Down Task</span>
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">View Details</button>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">Progress</span>
                <span className="text-xs text-gray-500">{task.progressPercentage || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${task.progressPercentage || 0}%` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showBreakdownModal && selectedTask && (
        <TaskBreakdownModal
          task={selectedTask}
          contributors={contributors}
          onClose={() => {
            setShowBreakdownModal(false)
            setSelectedTask(null)
          }}
          onSuccess={() => {
            fetchMainTasks()
            setShowBreakdownModal(false)
            setSelectedTask(null)
          }}
        />
      )}
    </div>
  )
}

export default TaskBreakdownInterface
