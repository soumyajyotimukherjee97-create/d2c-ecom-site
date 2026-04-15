'use client'

export type AlertVariant = 'error' | 'info'

export interface AlertProps {
  variant?: AlertVariant
  message: string
  onRetry?: () => void
  className?: string
}

const variantClasses: Record<AlertVariant, string> = {
  error: 'border-l-error text-error',
  info:  'border-l-gray-900 text-gray-600',
}

export function Alert({ variant = 'error', message, onRetry, className = '' }: AlertProps) {
  return (
    <div
      role="alert"
      data-testid="alert"
      className={[
        'flex items-center justify-between',
        'border border-gray-100 border-l-2 bg-white',
        'px-4 py-3',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <p className="font-body text-sm">{message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          data-testid="alert-retry"
          className={[
            'font-body text-sm font-medium shrink-0 ml-4',
            'underline underline-offset-2',
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
