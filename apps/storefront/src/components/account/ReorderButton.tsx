'use client'

import { useCartStore, type CartItem } from '@/lib/store/cart'

interface ReorderButtonProps {
  items: CartItem[]
  /** When no items are reorderable (all variants discontinued), render disabled. */
  label?: string
  variant?: 'outline' | 'primary'
  className?: string
  'data-testid'?: string
}

export function ReorderButton({
  items,
  label = 'Reorder',
  variant = 'outline',
  className = '',
  'data-testid': testId = 'reorder-button',
}: ReorderButtonProps) {
  const addItems = useCartStore((s) => s.addItems)
  const openCart = useCartStore((s) => s.openCart)
  const disabled = items.length === 0

  function handleClick() {
    if (disabled) return
    addItems(items)
    openCart()
  }

  const base =
    'font-mono text-2xs uppercase tracking-wider px-3 py-2 rounded-sm transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  const palette =
    variant === 'primary'
      ? 'bg-gray-900 text-white hover:bg-gray-700'
      : 'border border-gray-200 text-gray-900 hover:border-gray-900'

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      data-testid={testId}
      className={[base, palette, className].filter(Boolean).join(' ')}
    >
      {label}
    </button>
  )
}
