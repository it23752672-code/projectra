import React, { useEffect, useState } from 'react'
import { PartnerCompany } from '@/services/networkService'

export type CollaborationInput = {
  targetCompanyId: string
  projectId?: string
  requestedSkills?: string[]
  numberOfResources?: number
  duration?: string
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent'
  description?: string
  proposedBudget?: number
  deadline?: string
}

export default function CollaborationRequestModal({ open, target, projects, onClose, onSubmit }: { open: boolean, target: PartnerCompany | null, projects: { _id: string, name: string }[], onClose: () => void, onSubmit: (input: CollaborationInput) => Promise<void> | void }) {
  const [form, setForm] = useState<CollaborationInput>({ targetCompanyId: '' })
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (open && target) setForm({ targetCompanyId: target._id, priority: 'Medium' })
  }, [open, target])
  if (!open || !target) return null

  function set<K extends keyof CollaborationInput>(key: K, value: any) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await onSubmit(form)
      onClose()
    } catch (e: any) {
      setError(e?.message || 'Failed to send request')
    }
  }

  return (
    <div className="pj-modal" role="dialog" aria-modal="true">
      <div className="pj-modal-content">
        <div className="pj-modal-header">
          <h3>Request Collaboration — {target.companyName}</h3>
          <button className="pj-icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="pj-modal-body">
          {error && <div className="error" style={{ marginBottom: 8 }}>{error}</div>}
          <label className="pj-field">
            <span>Project</span>
            <select value={form.projectId || ''} onChange={e => set('projectId', e.target.value)}>
              <option value="">Select project</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </label>
          <label className="pj-field">
            <span>Requested skills (comma separated)</span>
            <input value={(form.requestedSkills || []).join(', ')} onChange={e => set('requestedSkills', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))} placeholder="React, Node.js" />
          </label>
          <div className="pj-grid-2">
            <label className="pj-field">
              <span>Number of resources</span>
              <input type="number" min={1} value={form.numberOfResources || 1} onChange={e => set('numberOfResources', Number(e.target.value))} />
            </label>
            <label className="pj-field">
              <span>Priority</span>
              <select value={form.priority || 'Medium'} onChange={e => set('priority', e.target.value)}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </label>
          </div>
          <label className="pj-field">
            <span>Duration</span>
            <input value={form.duration || ''} onChange={e => set('duration', e.target.value)} placeholder="3 months" />
          </label>
          <label className="pj-field">
            <span>Proposed budget (optional)</span>
            <input type="number" min={0} value={form.proposedBudget ?? ''} onChange={e => set('proposedBudget', Number(e.target.value))} />
          </label>
          <label className="pj-field">
            <span>Deadline</span>
            <input type="date" value={form.deadline || ''} onChange={e => set('deadline', e.target.value)} />
          </label>
          <label className="pj-field">
            <span>Description</span>
            <textarea rows={4} value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="Describe the need" />
          </label>
          <div className="pj-modal-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Send Request</button>
          </div>
        </form>
      </div>
    </div>
  )
}
