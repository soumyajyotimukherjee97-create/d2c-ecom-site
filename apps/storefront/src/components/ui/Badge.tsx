import { ReactNode } from 'react'

export type BadgeVariant = 'default' | 'ink' | 'assay' | 'filled' | 'error'

export interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

// Matter m-chip family — mono-caps 10px, tracking 0.12em, 1px border,
// square corners. Never rounded except for <StatusChip> pill variants.
const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-transparent text-graphite border border-hairline',
  ink:     'bg-ink text-paper border border-ink',
  assay:   'bg-transparent text-assay-ink border border-assay',
  filled:  'bg-paper-2 text-graphite border border-hairline',
  error:   'bg-transparent text-oxblood border border-oxblood',
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      data-testid="badge"
      data-variant={variant}
      className={[
        'inline-flex items-center gap-2',
        'font-mono text-2xs uppercase tracking-widest',
        'px-2.5 py-1.5',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}
