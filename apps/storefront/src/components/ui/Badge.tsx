import { ReactNode } from 'react'

export type BadgeVariant = 'default' | 'mist' | 'blush' | 'error'

export interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-600 border border-gray-100',
  mist:    'bg-mist text-mist-text border border-mist-border',
  blush:   'bg-blush text-blush-text border border-blush-border',
  error:   'bg-white text-error border border-error',
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      data-testid="badge"
      className={[
        'inline-flex items-center',
        'rounded-sm font-mono text-2xs uppercase tracking-wide',
        'px-2 py-1',
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
