'use client'

export type AlertVariant = 'error' | 'info' | 'success'

export interface AlertProps {
  variant?: AlertVariant
  message: string
  onRetry?: () => void
  className?: string
}

// 1px hairline frame + 2px left border keyed to variant colour.
const variantClasses: Record<AlertVariant, string> = {
  error:   'border-l-[2px] border-l-oxblood text-oxblood',
  info:    'border-l-[2px] border-l-ink text-ink-2',
  success: 'border-l-[2px] border-l-assay text-assay-ink',
}

export function Alert({ variant = 'error', message, onRetry, className = '' }: AlertProps) {
  return (
    <div
      role="alert"
      data-testid="alert"
      data-variant={variant}
      className={[
        'flex items-center justify-between',
        'border border-hairline bg-paper',
        'px-4 py-3',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <p className="font-mono text-xs tracking-wide">{message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          data-testid="alert-retry"
          className={[
            'font-mono text-2xs uppercase tracking-widest shrink-0 ml-4',
            'border-b border-current pb-0.5',
            'hover:opacity-70 transition-opacity',
            'focus:outline-none focus-visible:outline focus-visible:outline-2',
            'focus-visible:outline-current focus-visible:outline-offset-2',
          ].join(' ')}
        >
          Try again
        </button>
      )}
    </div>
  )
}
