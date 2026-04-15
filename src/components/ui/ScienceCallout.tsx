import { ReactNode } from 'react'

export interface ScienceCalloutProps {
  children: ReactNode
  className?: string
}

/** Left-bordered callout block for scientific claims and study citations. */
export function ScienceCallout({ children, className = '' }: ScienceCalloutProps) {
  return (
    <div
      data-testid="science-callout"
      className={['science-callout', className].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  )
}
