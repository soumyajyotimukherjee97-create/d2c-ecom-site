'use client'

import { useState } from 'react'
import { useCartStore } from '@/lib/store/cart'
import type { ProductSummary, Variant } from '@/types'

type VariantData = Pick<Variant, 'id' | 'size_ml' | 'price' | 'sku' | 'stock' | 'is_active'>

interface AddToCartButtonProps {
  product:         ProductSummary
  defaultVariant?: VariantData | null
}

export function AddToCartButton({ product, defaultVariant }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false)

  const addItem  = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)

  async function handleClick(e: React.MouseEvent) {
    // Keep the click from bubbling to an ancestor <Link> (e.g. a full-card
    // ProductCard link on PLP / Home).
    e.preventDefault()
    e.stopPropagation()

    if (loading) return

    if (defaultVariant) {
      addItem(defaultVariant as Variant, product, 1)
      openCart()
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/products/${product.slug}`)
      if (!res.ok) return

      const data = await res.json() as { variants: VariantData[] }
      const variant = data.variants.find((v) => v.is_active && v.stock > 0)
      if (!variant) return

      addItem(variant as Variant, product, 1)
      openCart()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      aria-label={`Add ${product.name} to cart`}
      data-testid="add-to-cart-button"
      onClick={handleClick}
      disabled={loading}
      className="w-8 h-8 inline-flex items-center justify-center bg-ink text-paper font-mono text-base hover:bg-ink-2 disabled:opacity-50 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
    >
      <span aria-hidden="true" className="leading-none select-none">+</span>
    </button>
  )
}
