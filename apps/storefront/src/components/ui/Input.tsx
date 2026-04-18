'use client'

import { forwardRef, InputHTMLAttributes } from 'react'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id: string
  label: string
  error?: string
  hint?: string
}

/**
 * Matter m-input. Mono-caps uppercase label above, 1px hairline input
 * below, mono-caps uppercase placeholder inside. Focus border darkens
 * to ink. Error: oxblood border + oxblood mono caption.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, label, error, hint, className = '', ...props },
  ref,
) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="font-mono text-2xs uppercase tracking-widest text-graphite"
      >
        {label}
      </label>

      <input
        ref={ref}
        id={id}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        data-testid="input"
        className={[
          'w-full bg-transparent',
          'px-3.5 py-3 font-mono text-sm text-ink',
          'placeholder:uppercase placeholder:tracking-widest placeholder:text-graphite placeholder:text-2xs',
          'transition-colors duration-150 border',
          'focus:outline-none focus-visible:outline-none',
          error
            ? 'border-oxblood focus:border-oxblood'
            : 'border-hairline hover:border-ink focus:border-ink',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />

      {hint && !error && (
        <p id={hintId} className="font-mono text-2xs tracking-wide text-graphite">
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          data-testid="input-error"
          className="font-mono text-2xs uppercase tracking-wide text-oxblood"
        >
          — {error}
        </p>
      )}
    </div>
  )
})
