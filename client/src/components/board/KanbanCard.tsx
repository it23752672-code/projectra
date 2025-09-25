import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export type TaskCard = {
  _id: string
  title: string
  description?: string
  dueDate?: string
  priority?: 'Low' | 'Medium' | 'High' | 'Critical'
  progress?: number
  comments?: { _id: string }[]
  attachments?: { name: string, url: string }[]
  assignees?: any[]
  companyName?: string
}

export default function KanbanCard({ task, onClick }: { task: TaskCard, onClick?: (t: TaskCard) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }

  const pr = task.priority || 'Medium'
  const prColor = pr === 'Critical' ? '#eb5a46' : pr === 'High' ? '#ffab4a' : pr === 'Low' ? '#61bd4f' : '#0079bf'
  const due = task.dueDate ? new Date(task.dueDate) : null
  const now = new Date()
  const dueBadge = due ? (due < now ? 'overdue' : (due.getTime() - now.getTime()) < 86400000 * 2 ? 'soon' : 'normal') : null

  return (
    <div ref={setNodeRef} style={style} className="pj-card" onClick={() => onClick?.(task)}>
      <div className="pj-card-priority" style={{ background: prColor }} />
      <div className="pj-card-title">{task.title}</div>
      <div className="pj-card-meta">
        {task.companyName && <span className="pj-badge hollow">{task.companyName}</span>}
        {task.assignees && task.assignees.length > 0 && <span className="pj-badge">{task.assignees.length}👤</span>}
        {Array.isArray(task.comments) && task.comments.length > 0 && <span className="pj-badge">💬 {task.comments.length}</span>}
        {Array.isArray(task.attachments) && task.attachments.length > 0 && <span className="pj-badge">📎 {task.attachments.length}</span>}
        {due && (
          <span className={"pj-badge due " + (dueBadge || '')} title={due.toLocaleString()}>
            {due.toLocaleDateString()}
          </span>
        )}
      </div>
      <div className="pj-card-progress">
        <div className="pj-card-progress-bar" style={{ width: `${Math.min(100, Math.max(0, task.progress || 0))}%` }} />
      </div>
      <button className="pj-drag-handle" {...listeners} {...attributes} aria-label="Drag card">⋮⋮</button>
    </div>
  )
}
