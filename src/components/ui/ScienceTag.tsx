import { ReactNode } from 'react'

export interface ScienceTagProps {
  children: ReactNode
  className?: string
}

/** Monospace uppercase tag used for ingredient and science contexts. */
export function ScienceTag({ children, className = '' }: ScienceTagProps) {
  return (
    <span
      data-testid="science-tag"
      className={['science-tag', className].filter(Boolean).join(' ')}
    >
      {children}
    </span>
  )
}
