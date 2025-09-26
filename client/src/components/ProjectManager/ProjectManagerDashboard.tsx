import React, { useEffect, useState } from 'react'
import { projectManagerService } from '../../services/projectManagerService'
import { Calendar, Users, ListChecks as Tasks, TrendingUp, AlertTriangle } from 'lucide-react'
import AddMemberModal from './modals/AddMemberModal'
import CreateMainTaskModal from './modals/CreateMainTaskModal'

interface PMDashboardProps { projectId: string }

const ProjectManagerDashboard: React.FC<PMDashboardProps> = ({ projectId }) => {
  const [project, setProject] = useState<any>(null)
  const [workloadAnalysis, setWorkloadAnalysis] = useState<any[]>([])
  const [taskStats, setTaskStats] = useState<any[]>([])
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false)

  useEffect(() => {
    fetchProjectData()
  }, [projectId])

  const fetchProjectData = async () => {
    try {
      const [overview, workload] = await Promise.all([
        projectManagerService.getProjectOverview(projectId),
        projectManagerService.getWorkloadAnalysis(projectId),
      ])
      setProject(overview.project)
      setTaskStats(overview.taskStats)
      setWorkloadAnalysis(workload.workloadAnalysis)
    } catch (e) {
      console.error('Failed to fetch project data:', e)
    }
  }

  const getWorkloadColor = (status: string) => {
    const colors: Record<string, string> = {
      Low: 'text-green-600 bg-green-100',
      Moderate: 'text-blue-600 bg-blue-100',
      High: 'text-yellow-600 bg-yellow-100',
      Overloaded: 'text-red-600 bg-red-100',
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
  }

  if (!project) return <div>Loading...</div>

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Project Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.projectName}</h1>
            <p className="text-gray-600 mt-1">{project.description}</p>
            <div className="flex items-center mt-4 space-x-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  project.status === 'In Progress'
                    ? 'bg-blue-100 text-blue-800'
                    : project.status === 'Completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {project.status}
              </span>
              <span className="text-sm text-gray-500">Priority: {project.priority}</span>
              <span className="text-sm text-gray-500">Weightage: {project.projectWeightage}/10</span>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Users className="w-4 h-4 inline mr-2" />
              Add Member
            </button>
            <button
              onClick={() => setShowCreateTaskModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Tasks className="w-4 h-4 inline mr-2" />
              Create Main Task
            </button>
          </div>
        </div>
      </div>

      {/* Project Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-2xl font-bold text-blue-600">{project.teamMembers?.length || 0}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-green-600">{project.totalTasks || 0}</p>
            </div>
            <Tasks className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion</p>
              <p className="text-2xl font-bold text-purple-600">{project.completionPercentage || 0}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
              <p className="text-2xl font-bold text-red-600">{project.overdueTasks || 0}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Team Members Management */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Team Members</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Workload Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active Tasks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workloadAnalysis.map((analysis: any) => (
                <tr key={analysis.member._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {analysis.member.firstName?.[0]}
                            {analysis.member.lastName?.[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {analysis.member.firstName} {analysis.member.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{analysis.member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{analysis.role}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getWorkloadColor(
                      analysis.status,
                    )}`}>
                      {analysis.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{analysis.activeTasks}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.round(analysis.utilizationRate)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">View Tasks</button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={async () => {
                        if (confirm('Remove this member?')) {
                          await projectManagerService.removeTeamMember(projectId, analysis.member._id)
                          fetchProjectData()
                        }
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Tasks Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Main Tasks</h2>
        <div className="space-y-4">
          {(project.mainTasks || []).map((task: any) => (
            <div key={task._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{task.taskName}</h3>
                  <p className="text-sm text-gray-600 mt-1">{task.taskDescription}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="text-sm text-gray-500">
                      Assigned to: {task.assigneeId?.firstName} {task.assigneeId?.lastName}
                    </span>
                    {task.dueDate && (
                      <span className="text-sm text-gray-500">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        task.priority === 'High'
                          ? 'bg-red-100 text-red-800'
                          : task.priority === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">Subtasks: {task.subTasks?.length || 0}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showAddMemberModal && (
        <AddMemberModal projectId={projectId} onClose={() => setShowAddMemberModal(false)} onSuccess={fetchProjectData} />
      )}

      {showCreateTaskModal && (
        <CreateMainTaskModal
          projectId={projectId}
          teamLeaders={project.teamLeaders}
          onClose={() => setShowCreateTaskModal(false)}
          onSuccess={fetchProjectData}
        />
      )}
    </div>
  )
}

export default ProjectManagerDashboard
