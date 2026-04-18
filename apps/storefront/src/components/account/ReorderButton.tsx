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
    'inline-flex items-center justify-center font-mono text-[11px] tracking-widest uppercase px-5 py-3 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  const palette =
    variant === 'primary'
      ? 'bg-ink text-paper hover:bg-ink-2'
      : 'border border-hairline text-ink hover:border-ink'

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      data-testid={testId}
      data-variant={variant}
      className={[base, palette, className].filter(Boolean).join(' ')}
    >
      {label}
    </button>
  )
}
