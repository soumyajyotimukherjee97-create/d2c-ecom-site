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

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gray-900 text-white border border-gray-900 hover:bg-gray-800 hover:border-gray-800 disabled:bg-gray-400 disabled:border-gray-400',
  secondary:
    'bg-transparent text-gray-900 border border-gray-900 hover:bg-gray-100 disabled:text-gray-400 disabled:border-gray-400',
  ghost:
    'bg-transparent text-gray-600 border border-transparent hover:border-gray-200 disabled:text-gray-400',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
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
      className={[
        'inline-flex items-center justify-center gap-2',
        'rounded-sm font-body font-medium',
        'transition-colors duration-150',
        'cursor-pointer disabled:cursor-not-allowed',
        'focus:outline-none focus-visible:outline focus-visible:outline-2',
        'focus-visible:outline-gray-900 focus-visible:outline-offset-2',
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
