import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
}

export default function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const cls = ['button', variant === 'secondary' ? 'secondary' : '', className].filter(Boolean).join(' ')
  return <button className={cls} {...props} />
}
