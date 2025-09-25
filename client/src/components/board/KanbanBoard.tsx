import React, { useMemo, useState } from 'react'
import { DndContext, DragEndEvent, DragStartEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import KanbanColumn from './KanbanColumn'
import { TaskCard } from './KanbanCard'
import { cardService } from '@/services/cardService'

export const STATUS_COLUMNS = [
  { id: 'Not Started', title: 'To Do', color: '#64748b', wip: undefined },
  { id: 'In Progress', title: 'In Progress', color: '#3b82f6', wip: 8 },
  { id: 'Completed', title: 'Done', color: '#22c55e', wip: undefined },
  { id: 'Blocked', title: 'Blocked', color: '#ef4444', wip: 4 },
]

export type BoardData = Record<string, TaskCard[]>

export default function KanbanBoard({
  tasks,
  projectId,
  onMove,
  onCardClick,
  onCreated,
}: {
  tasks: TaskCard[]
  projectId: string
  onMove: (taskId: string, toStatus: string) => Promise<void> | void
  onCardClick?: (t: TaskCard) => void
  onCreated?: (task: TaskCard) => void
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const [activeId, setActiveId] = useState<string | null>(null)
  const [local, setLocal] = useState<TaskCard[]>(tasks)

  React.useEffect(() => setLocal(tasks), [tasks])

  const grouped = useMemo(() => {
    const g: BoardData = { 'Not Started': [], 'In Progress': [], 'Completed': [], 'Blocked': [] }
    for (const t of local) {
      const st = (t as any).status || 'Not Started'
      if (!g[st]) g[st] = []
      g[st].push(t)
    }
    return g
  }, [local])

  function flatten(g: BoardData): TaskCard[] {
    return [...(g['Not Started'] || []), ...(g['In Progress'] || []), ...(g['Completed'] || []), ...(g['Blocked'] || [])]
  }

  async function handleAddCard(columnId: string, values: { title: string }) {
    // optimistic add
    const temp: TaskCard = { _id: `temp-${Date.now()}`, title: values.title, description: '', priority: 'Medium' as any, progress: 0, comments: [], attachments: [], assignees: [], companyName: undefined } as any
    ;(temp as any).status = columnId
    setLocal(prev => [...prev, temp])
    try {
      const created = await cardService.createCard({ title: values.title, description: '', status: columnId, projectId })
      setLocal(prev => prev.map(t => (t._id === temp._id ? created : t)))
      onCreated?.(created)
    } catch (e) {
      // revert temp
      setLocal(prev => prev.filter(t => t._id !== temp._id))
      throw e
    }
  }

  function handleDragStart(ev: DragStartEvent) {
    setActiveId(String(ev.active.id))
  }

  async function handleDragEnd(ev: DragEndEvent) {
    const id = String(ev.active.id)
    const overId = ev.over?.id ? String(ev.over.id) : null
    setActiveId(null)
    if (!overId) return

    const columnIds = new Set(STATUS_COLUMNS.map(c => c.id))

    // locate source column
    const sourceColumn = (['Not Started','In Progress','Completed','Blocked'] as const).find(col => (grouped[col] || []).some(t => t._id === id)) || 'Not Started'

    // determine destination column
    let destColumn: string | null = null
    if (columnIds.has(overId)) {
      destColumn = overId
    } else {
      destColumn = (['Not Started','In Progress','Completed','Blocked'] as const).find(col => (grouped[col] || []).some(t => t._id === overId)) || null
    }
    if (!destColumn) return

    // same-column reorder
    if (destColumn === sourceColumn) {
      const list = grouped[sourceColumn] || []
      // if dropped over column header (overId is column id), no change
      if (columnIds.has(overId)) return
      const fromIndex = list.findIndex(t => t._id === id)
      const toIndex = list.findIndex(t => t._id === overId)
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return
      const newList = arrayMove(list, fromIndex, toIndex)
      const newGrouped: BoardData = { ...grouped, [sourceColumn]: newList }
      setLocal(flatten(newGrouped))
      // Try to persist position if supported
      try { await cardService.updateCardPosition(id, toIndex, sourceColumn) } catch {}
      return
    }

    // cross-column move
    const src = grouped[sourceColumn] || []
    const dst = grouped[destColumn] || []
    const moving = src.find(t => t._id === id)
    if (!moving) return

    const newSrc = src.filter(t => t._id !== id)
    let insertIndex = dst.length
    if (!columnIds.has(overId)) {
      const overIndex = dst.findIndex(t => t._id === overId)
      if (overIndex >= 0) insertIndex = overIndex
    }
    const newDst = [...dst.slice(0, insertIndex), { ...(moving as any), status: destColumn } as TaskCard, ...dst.slice(insertIndex)]
    const newGrouped: BoardData = { ...grouped, [sourceColumn]: newSrc, [destColumn]: newDst }
    setLocal(flatten(newGrouped))

    try {
      await onMove(id, destColumn)
      try { await cardService.updateCardPosition(id, insertIndex, destColumn) } catch {}
    } catch (e) {
      // revert on error (naive)
      setLocal(tasks)
    }
  }

  return (
    <div className="pj-board" role="region" aria-label="Kanban Board">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="pj-board-row">
          {STATUS_COLUMNS.map(col => (
            <div key={col.id} className="pj-drop-col" id={col.id}>
              <KanbanColumn id={col.id} title={col.title} color={col.color} tasks={grouped[col.id] || []} wipLimit={col.wip} onCardClick={onCardClick} onAddCard={handleAddCard} />
            </div>
          ))}
          <button className="pj-add-col" title="Add column">+ Add column</button>
        </div>
      </DndContext>
    </div>
  )
}
