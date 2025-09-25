import React, { useState } from 'react'

export type PartnerInput = {
  name: string
  domain?: string
  contacts?: { name: string, email: string }[]
  specializations?: string[]
  industryType?: string
  size?: string
  logoUrl?: string
}

export default function PartnerCompanyModal({ open, onClose, onSubmit }: { open: boolean, onClose: () => void, onSubmit: (input: PartnerInput) => Promise<void> | void }) {
  const [form, setForm] = useState<PartnerInput>({ name: '' })
  const [error, setError] = useState<string | null>(null)
  if (!open) return null

  function set<K extends keyof PartnerInput>(key: K, value: PartnerInput[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.name.trim()) { setError('Company name is required'); return }
    try {
      await onSubmit(form)
      onClose()
      setForm({ name: '' })
    } catch (e: any) {
      setError(e?.message || 'Failed to add partner')
    }
  }

  return (
    <div className="pj-modal" role="dialog" aria-modal="true">
      <div className="pj-modal-content">
        <div className="pj-modal-header">
          <h3>Add Partner Company</h3>
          <button className="pj-icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="pj-modal-body">
          {error && <div className="error" style={{ marginBottom: 8 }}>{error}</div>}
          <label className="pj-field">
            <span>Company Name</span>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Acme Inc" required />
          </label>
          <label className="pj-field">
            <span>Primary Contact Email</span>
            <input value={form.domain || ''} onChange={e => set('domain', e.target.value)} placeholder="acme.com" />
          </label>
          <label className="pj-field">
            <span>Industry</span>
            <input value={form.industryType || ''} onChange={e => set('industryType', e.target.value)} placeholder="Technology" />
          </label>
          <label className="pj-field">
            <span>Specializations (comma separated)</span>
            <input value={(form.specializations || []).join(', ')} onChange={e => set('specializations', e.target.value.split(',').map(v => v.trim()).filter(Boolean))} placeholder="React, Node.js, UI/UX" />
          </label>
          <div className="pj-modal-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Company</button>
          </div>
        </form>
      </div>
    </div>
  )
}
