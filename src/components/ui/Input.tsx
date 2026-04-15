'use client'

import { forwardRef, InputHTMLAttributes } from 'react'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id: string
  label: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, label, error, hint, className = '', ...props },
  ref,
) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-body text-sm font-medium text-gray-900">
        {label}
      </label>

      <input
        ref={ref}
        id={id}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        data-testid="input"
        className={[
          'w-full border rounded-sm',
          'px-3 py-2 font-body text-base text-gray-900 bg-white',
          'placeholder:text-gray-400',
          'transition-colors duration-150',
          'focus:outline-none focus-visible:outline focus-visible:outline-2',
          'focus-visible:outline-gray-900 focus-visible:outline-offset-1',
          error
            ? 'border-error'
            : 'border-gray-200 hover:border-gray-400',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />

      {hint && !error && (
        <p id={hintId} className="font-body text-sm text-gray-400">
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          data-testid="input-error"
          className="font-body text-sm text-error"
        >
          {error}
        </p>
      )}
    </div>
  )
})
