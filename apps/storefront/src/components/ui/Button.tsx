'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children: ReactNode
}

// Matter m-btn family. All variants are mono-caps, square corners.
// primary   = m-btn        (ink fill, paper text)
// secondary = m-btn--ghost (transparent, ink border, inverts on hover)
// ghost     = m-btn--hair  (transparent, hairline border, darkens to ink on hover)
const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-ink text-paper border border-ink hover:bg-ink-2 hover:border-ink-2 ' +
    'disabled:bg-graphite disabled:border-graphite',
  secondary:
    'bg-transparent text-ink border border-ink hover:bg-ink hover:text-paper ' +
    'disabled:text-graphite disabled:border-graphite',
  ghost:
    'bg-transparent text-ink border border-hairline hover:border-ink ' +
    'disabled:text-graphite disabled:border-hairline',
}

// Matter default padding: ~13px 20px. Mono 11px, tracking 0.14em.
const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2.5 text-2xs',
  md: 'px-5 py-[13px] text-xs',
  lg: 'px-6 py-3.5 text-sm',
}

function Spinner() {
  return (
    <svg
      className="w-3 h-3 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      disabled={isDisabled}
      aria-busy={loading}
      data-testid="button"
      data-variant={variant}
      data-size={size}
      className={[
        'inline-flex items-center justify-center gap-2.5',
        'font-mono uppercase tracking-widest',
        'transition-colors duration-150',
        'cursor-pointer disabled:cursor-not-allowed',
        'focus:outline-none focus-visible:outline focus-visible:outline-2',
        'focus-visible:outline-ink focus-visible:outline-offset-2',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}
