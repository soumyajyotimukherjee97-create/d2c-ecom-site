'use client'

import { useState } from 'react'
import { useCartStore } from '@/lib/store/cart'
import { Badge } from '@/components/ui/Badge'
import { IngredientTag } from '@/components/ui/IngredientTag'
import { ScienceCallout } from '@/components/ui/ScienceCallout'
import { QuantitySelector } from '@/components/ui/QuantitySelector'
import { ReviewBar } from '@/components/shop/ReviewBar'
import type { Product, Variant } from '@/types'

interface PDPPurchasePanelProps {
  product: Product
}

function firstInStock(variants: Variant[]): Variant | undefined {
  return variants.find((v) => v.is_active && v.stock > 0) ?? variants.find((v) => v.is_active)
}

export function PDPPurchasePanel({ product }: PDPPurchasePanelProps) {
  const [selectedId, setSelectedId] = useState<string>(
    firstInStock(product.variants)?.id ?? product.variants[0]?.id ?? '',
  )
  const [qty, setQty] = useState(1)

  const activeVariants  = product.variants.filter((v) => v.is_active)
  const selectedVariant = activeVariants.find((v) => v.id === selectedId) ?? activeVariants[0]
  const outOfStock      = !selectedVariant || selectedVariant.stock === 0
  const price           = selectedVariant
    ? `₹${Math.round(selectedVariant.price / 100).toLocaleString()}`
    : '—'

  // First 3 ingredients (sorted by display_order — already sorted by server)
  const keyIngredients  = product.ingredients.slice(0, 3)
  const scienceNote     = product.ingredients.find((i) => i.science_note)

  const addItem  = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)

  function handleAddToCart() {
    if (!selectedVariant) return
    addItem(selectedVariant, product, qty)
    openCart()
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Category overline */}
      <p className="font-mono text-2xs uppercase tracking-widest text-gray-400">
        {product.category}
      </p>

      {/* Product name */}
      <h1 className="font-heading text-3xl font-normal tracking-tight">
        {product.name}
      </h1>

      {/* Rating summary */}
      <ReviewBar summary={product.reviews_summary} scrollTargetId="reviews" />

      {/* Price */}
      <p className="font-heading text-2xl font-normal">
        {price}
        {selectedVariant && (
          <span className="font-body text-xs text-gray-400 ml-2 font-normal">
            / {selectedVariant.size_ml}ml
          </span>
        )}
      </p>

      {/* Variant selector — size pills */}
      {activeVariants.length > 0 && (
        <div>
          <p className="font-mono text-2xs uppercase tracking-widest text-gray-400 mb-2">
            SIZE
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Select size">
            {activeVariants.map((v) => {
              const isSelected  = v.id === selectedId
              const isOos       = v.stock === 0
              const label       = `${v.size_ml}ml${isOos ? ' — Out of stock' : ''}`
              return (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={label}
                  data-testid={`variant-pill-${v.id}`}
                  onClick={() => { setSelectedId(v.id); setQty(1) }}
                  className={[
                    'font-mono text-2xs px-4 py-2 rounded-sm border transition-colors',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2',
                    isOos
                      ? 'border-gray-100 text-gray-400 cursor-not-allowed line-through'
                      : isSelected
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-900 border-gray-200 hover:border-gray-400',
                  ].join(' ')}
                >
                  {v.size_ml}ml
                  {!isSelected && !isOos && (
                    <span className="text-gray-400 ml-1">
                      — ₹{Math.round(v.price / 100).toLocaleString()}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Ideal for — skin types + concerns */}
      {(product.skin_types.length > 0 || product.concerns.length > 0) && (
        <div>
          <p className="font-mono text-2xs uppercase tracking-widest text-gray-400 mb-2">
            IDEAL FOR
          </p>
          <div className="flex flex-wrap gap-2">
            {product.skin_types.map((st) => (
              <Badge key={st} variant="default">
                {st === 'all' ? 'All skin types' : st.charAt(0).toUpperCase() + st.slice(1)}
              </Badge>
            ))}
            {product.concerns.map((c) => (
              <Badge key={c} variant="mist">
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Quantity + Add to cart */}
      <div className="flex gap-2 items-center sticky bottom-0 md:static bg-white py-2 md:py-0">
        {!outOfStock && (
          <QuantitySelector
            value={qty}
            onChange={setQty}
            min={1}
            max={selectedVariant?.stock ?? 99}
          />
        )}
        <button
          type="button"
          data-testid="add-to-cart"
          onClick={handleAddToCart}
          disabled={outOfStock}
          className={[
            'flex-1 font-mono text-2xs uppercase tracking-wider py-3 rounded-sm transition-colors',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2',
            outOfStock
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-900 text-white hover:bg-gray-700',
          ].join(' ')}
        >
          {outOfStock ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>

      {/* Divider */}
      <hr className="border-gray-100" />

      {/* Key ingredients */}
      {keyIngredients.length > 0 && (
        <div>
          <p className="font-mono text-2xs uppercase tracking-widest text-gray-400 mb-2">
            KEY INGREDIENTS
          </p>
          <div className="flex flex-col gap-2">
            {keyIngredients.map((ing) => (
              <IngredientTag
                key={ing.id}
                name={ing.name}
                concentration={ing.concentration ?? undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Science callout */}
      {scienceNote && (
        <ScienceCallout>
          <p className="font-mono text-2xs uppercase tracking-widest text-gray-400 mb-1">
            Clinical insight
          </p>
          <p className="font-body text-sm text-gray-600">{scienceNote.science_note}</p>
        </ScienceCallout>
      )}

    </div>
  )
}
