import { ReactNode } from 'react'

export interface ScienceTagProps {
  children: ReactNode
  className?: string
}

/** Matter assay chip — mono-caps uppercase, assay-green border and
 *  text on paper background. Used for inline ingredient/science
 *  callouts outside of purchase panels. */
export function ScienceTag({ children, className = '' }: ScienceTagProps) {
  return (
    <span
      data-testid="science-tag"
      className={[
        'inline-flex items-center gap-2',
        'font-mono text-2xs uppercase tracking-widest',
        'px-2.5 py-1',
        'border border-assay text-assay-ink bg-transparent',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}
