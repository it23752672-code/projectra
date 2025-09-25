import React, { useEffect, useRef, useState } from 'react'

export default function AddCardForm({
  onSave,
  onCancel,
  placeholder = 'Enter a title for this card...'
}: {
  onSave: (values: { title: string }) => Promise<void> | void
  onCancel: () => void
  placeholder?: string
}) {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const ref = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    ref.current?.focus()
  }, [])

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    setError(null)
    const v = title.trim()
    if (!v) {
      setError('Please enter a card title')
      return
    }
    setLoading(true)
    try {
      await onSave({ title: v })
      setTitle('')
      onCancel()
    } catch (err: any) {
      setError(err?.message || 'Failed to create card')
    } finally {
      setLoading(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    } else if ((e.key === 'Enter' && !e.shiftKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="pj-add-card-form">
      <textarea
        ref={ref}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={3}
        className="card-input"
        disabled={loading}
      />
      {error && <div className="error" style={{ marginTop: 4 }}>{error}</div>}
      <div className="form-actions" style={{ display: 'flex', gap: 8, marginTop: 6 }}>
        <button type="submit" className="btn btn-primary" disabled={!title.trim() || loading}>
          {loading ? 'Adding…' : 'Add card'}
        </button>
        <button type="button" className="btn" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
      </div>
    </form>
  )
}
