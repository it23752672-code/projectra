import React, { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import KanbanCard, { TaskCard } from './KanbanCard'
import AddCardForm from './AddCardForm'
import { useAuth } from '@/state/AuthContext'

export default function KanbanColumn({
  id,
  title,
  color,
  tasks,
  onCardClick,
  wipLimit,
  onAddCard,
}: {
  id: string
  title: string
  color?: string
  tasks: TaskCard[]
  onCardClick?: (t: TaskCard) => void
  wipLimit?: number
  onAddCard?: (columnId: string, values: { title: string }) => Promise<void> | void
}) {
  const count = tasks.length
  const over = wipLimit ? count > wipLimit : false
  const { setNodeRef, isOver } = useDroppable({ id })
  const [showAddForm, setShowAddForm] = useState(false)
  const { user } = useAuth()
  const canCreate = user?.role === 'Admin' || user?.role === 'ProjectManager'
  return (
    <div className="pj-col">
      <div className="pj-col-header" style={{ borderColor: color || '#1f2937' }}>
        <div className="pj-col-title">
          <span className="pj-col-dot" style={{ background: color || '#64748b' }} />
          {title}
        </div>
        <div className={"pj-col-count" + (over ? " over" : '')} title={wipLimit ? `WIP: ${count}/${wipLimit}` : `${count} cards`}>
          {count}{wipLimit ? `/${wipLimit}` : ''}
        </div>
      </div>
      <div ref={setNodeRef} className="pj-col-body" style={{ outline: isOver ? '2px dashed #3b82f6' : 'none' }}>
        <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map(t => (
            <KanbanCard key={t._id} task={t} onClick={onCardClick} />
          ))}
        </SortableContext>
      </div>
      {canCreate && (showAddForm ? (
        <div style={{ padding: 8 }}>
          <AddCardForm
            onSave={async (values) => {
              await onAddCard?.(id, values)
            }}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      ) : (
        <button className="pj-add-card" title="Add a card" onClick={() => setShowAddForm(true)}>+ Add a card</button>
      ))}
    </div>
  )
}
