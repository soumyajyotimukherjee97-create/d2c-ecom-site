'use client'

import { memo } from 'react'

export interface QuantitySelectorProps {
  value:    number
  onChange: (next: number) => void
  min?:     number
  max?:     number
}

export const QuantitySelector = memo(function QuantitySelector({ value, onChange, min = 1, max = 99 }: QuantitySelectorProps) {
  return (
    <div
      data-testid="quantity-selector"
      className="inline-flex border border-gray-100 rounded-sm"
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        data-testid="qty-decrease"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="px-3 py-2 font-mono text-sm text-gray-900 border-r border-gray-100 disabled:text-gray-400 hover:enabled:bg-gray-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
      >
        −
      </button>
      <span
        aria-live="polite"
        aria-label={`Quantity: ${value}`}
        data-testid="qty-value"
        className="px-4 py-2 font-mono text-sm text-gray-900 min-w-[3rem] text-center select-none"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        data-testid="qty-increase"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="px-3 py-2 font-mono text-sm text-gray-900 border-l border-gray-100 disabled:text-gray-400 hover:enabled:bg-gray-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
      >
        +
      </button>
    </div>
  )
})
