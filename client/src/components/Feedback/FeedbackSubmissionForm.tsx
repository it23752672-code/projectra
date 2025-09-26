import React, { useState } from 'react'
import { feedbackService } from '@/services/feedbackService'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'

export default function FeedbackSubmissionForm({ onClose }: { onClose?: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    feedbackText: '',
    feedbackType: 'general',
    priority: 'medium',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const types = [
    { value: 'bug', label: 'Bug Report' },
    { value: 'feature_request', label: 'Feature Request' },
    { value: 'improvement', label: 'Improvement' },
    { value: 'ui_issue', label: 'UI Issue' },
    { value: 'performance', label: 'Performance' },
    { value: 'general', label: 'General' },
  ] as const

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await feedbackService.submitFeedback(formData)
      alert('Feedback submitted successfully')
      setFormData({ title: '', feedbackText: '', feedbackType: 'general', priority: 'medium' })
      onClose?.()
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 800, margin: '0 auto' }}>
      <h2>Submit Feedback</h2>
      <p className="small" style={{ marginTop: -8 }}>Report bugs, request features, or suggest improvements.</p>
      <form onSubmit={onSubmit}>
        <Input label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required maxLength={100} />

        <label className="small" style={{ display: 'block', marginTop: 8, marginBottom: 6 }}>Feedback Type</label>
        <div className="grid">
          {types.map(t => (
            <div key={t.value} className="col-6 col-md-4">
              <label className="small" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="radio" name="feedbackType" checked={formData.feedbackType === t.value}
                       onChange={() => setFormData({ ...formData, feedbackType: t.value })} />
                {t.label}
              </label>
            </div>
          ))}
        </div>

        <label className="small" style={{ display: 'block', marginTop: 8, marginBottom: 6 }}>Priority</label>
        <select className="input" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        <label className="small" style={{ display: 'block', marginTop: 12, marginBottom: 6 }}>Description</label>
        <textarea className="input" rows={6} value={formData.feedbackText}
                  onChange={(e) => setFormData({ ...formData, feedbackText: e.target.value })}
                  required maxLength={2000} placeholder="Describe the issue or your suggestion in detail..." />
        <div className="small" style={{ color: '#666', marginTop: 4 }}>{formData.feedbackText.length}/2000</div>

        {error && <div className="error" style={{ marginTop: 8 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          {onClose && <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>}
          <Button type="submit" disabled={submitting || !formData.title.trim() || !formData.feedbackText.trim()}>
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </div>
      </form>
    </div>
  )
}
