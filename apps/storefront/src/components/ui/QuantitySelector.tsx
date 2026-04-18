'use client'

import { memo } from 'react'

export type QuantitySelectorSize = 'sm' | 'md'

export interface QuantitySelectorProps {
  value:    number
  onChange: (next: number) => void
  min?:     number
  max?:     number
  /** sm (32px tall, compact — cart drawer) or md (46px, PDP). Default md. */
  size?:    QuantitySelectorSize
}

const sizeClasses: Record<QuantitySelectorSize, { cell: string; value: string }> = {
  sm: { cell: 'h-8  w-8',  value: 'w-10 text-xs' },
  md: { cell: 'h-[46px] w-9', value: 'w-[52px] text-sm' },
}

export const QuantitySelector = memo(function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
}: QuantitySelectorProps) {
  const s = sizeClasses[size]
  return (
    <div
      data-testid="quantity-selector"
      data-size={size}
      className="inline-flex border border-hairline"
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        data-testid="qty-decrease"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={[
          s.cell,
          'inline-flex items-center justify-center',
          'font-mono text-sm text-graphite',
          'disabled:opacity-40 hover:enabled:text-ink',
          'transition-colors',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2',
        ].join(' ')}
      >
        –
      </button>
      <span
        aria-live="polite"
        aria-label={`Quantity: ${value}`}
        data-testid="qty-value"
        className={[
          s.value,
          'inline-flex items-center justify-center',
          'font-mono text-ink tabular-nums select-none',
        ].join(' ')}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        data-testid="qty-increase"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={[
          s.cell,
          'inline-flex items-center justify-center',
          'font-mono text-sm text-graphite',
          'disabled:opacity-40 hover:enabled:text-ink',
          'transition-colors',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2',
        ].join(' ')}
      >
        +
      </button>
    </div>
  )
})
