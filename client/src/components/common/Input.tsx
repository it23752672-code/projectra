import React from 'react'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export default function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id || props.name || `input-${Math.random().toString(36).slice(2)}`
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      {label && (
        <label htmlFor={inputId} className="small" style={{ display: 'block', marginBottom: 6 }}>
          {label}
        </label>
      )}
      <input id={inputId} className={["input", className].filter(Boolean).join(' ')} {...props} />
      {error && <div className="small error" style={{ marginTop: 4 }}>{error}</div>}
    </div>
  )
}
