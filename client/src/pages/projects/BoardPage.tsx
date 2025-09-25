import React, { useEffect, useMemo, useState } from 'react'
import KanbanBoard from '@/components/board/KanbanBoard'
import { api, getErrorMessage } from '@/services/api'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'

export default function BoardPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [selected, setSelected] = useState<string>('')
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/projects')
        setProjects(data.projects || [])
        const first = data?.projects?.[0]?._id
        if (first) setSelected(first)
      } catch (e) { /* ignore */ }
    })()
  }, [])

  useEffect(() => {
    if (!selected) return
    loadTasks()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  async function loadTasks() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/tasks', { params: { projectId: selected } })
      // enrich minimal fields
      const enriched = (data.tasks || []).map((t: any) => ({ ...t, companyName: undefined }))
      setTasks(enriched)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function onMove(taskId: string, toStatus: string) {
    await api.patch(`/tasks/${taskId}/status`, { status: toStatus })
  }

  const visibleTasks = useMemo(() => {
    const f = filter.trim().toLowerCase()
    if (!f) return tasks
    return tasks.filter(t => String(t.title).toLowerCase().includes(f) || String(t.description || '').toLowerCase().includes(f))
  }, [tasks, filter])

  return (
    <div className="pj-board-page">
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="pj-board-top">
          <div className="pj-tabs" role="tablist" aria-label="Projects">
            {projects.map(p => (
              <button key={p._id} role="tab" aria-selected={selected === p._id} className={"pj-tab" + (selected === p._id ? ' active' : '')} onClick={() => setSelected(p._id)}>
                {p.name}
              </button>
            ))}
          </div>
          <div className="pj-board-controls">
            <Input placeholder="Filter cards..." value={filter} onChange={(e) => setFilter(e.target.value)} />
            <Button variant="secondary" onClick={loadTasks}>Refresh</Button>
          </div>
        </div>
      </div>

      {loading && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="loader" /> Loading board...</div>}
      {error && <div className="error">{error}</div>}
      {!loading && !error && (
        <KanbanBoard
          tasks={visibleTasks}
          projectId={selected}
          onMove={onMove}
          onCardClick={(t) => { /* future: open modal */ }}
          onCreated={(task) => setTasks(prev => [...prev, task])}
        />
      )}
    </div>
  )
}
