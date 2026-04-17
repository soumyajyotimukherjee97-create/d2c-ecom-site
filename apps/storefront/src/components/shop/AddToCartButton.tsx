'use client'

import { useState } from 'react'
import { useCartStore } from '@/lib/store/cart'
import type { ProductSummary, Variant } from '@/types'

type VariantData = Pick<Variant, 'id' | 'size_ml' | 'price' | 'sku' | 'stock' | 'is_active'>

interface AddToCartButtonProps {
  product: ProductSummary
  defaultVariant?: VariantData | null
}

export function AddToCartButton({ product, defaultVariant }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false)

  const addItem  = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)

  async function handleClick() {
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
      className="w-6 h-6 flex items-center justify-center bg-gray-900 text-white hover:bg-gray-700 disabled:bg-gray-400 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
    >
      <span aria-hidden="true" className="text-sm leading-none select-none">+</span>
    </button>
  )
}
