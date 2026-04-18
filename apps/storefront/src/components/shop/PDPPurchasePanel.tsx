'use client'

import { useState } from 'react'
import { useCartStore } from '@/lib/store/cart'
import { IngredientTag } from '@/components/ui/IngredientTag'
import { QuantitySelector } from '@/components/ui/QuantitySelector'
import { formatInr } from '@/lib/money'
import type { Product, Variant } from '@/types'

interface PDPPurchasePanelProps {
  product: Product
}

function firstInStock(variants: Variant[]): Variant | undefined {
  return variants.find((v) => v.is_active && v.stock > 0) ?? variants.find((v) => v.is_active)
}

function capFirst(s: string): string {
  return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

export function PDPPurchasePanel({ product }: PDPPurchasePanelProps) {
  const [selectedId, setSelectedId] = useState<string>(
    firstInStock(product.variants)?.id ?? product.variants[0]?.id ?? '',
  )
  const [qty, setQty] = useState(1)

  const activeVariants  = product.variants.filter((v) => v.is_active)
  const selectedVariant = activeVariants.find((v) => v.id === selectedId) ?? activeVariants[0]
  const outOfStock      = !selectedVariant || selectedVariant.stock === 0

  // First 3 ingredients (sorted by display_order — already sorted by server)
  const keyIngredients = product.ingredients.slice(0, 3)
  const scienceNote    = product.ingredients.find((i) => i.science_note)

  const addItem  = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)

  function handleAddToCart() {
    if (!selectedVariant) return
    addItem(selectedVariant, product, qty)
    openCart()
  }

  return (
    <div data-testid="pdp-purchase-panel" className="md:border-l md:border-hairline md:pl-12">

      {/* Category eyebrow */}
      <p className="font-mono text-xs tracking-[0.18em] uppercase text-graphite">
        {product.category.toUpperCase()}
      </p>

      {/* Product name — display h1 */}
      <h1
        data-testid="pdp-name"
        className="font-display font-normal text-[clamp(40px,5vw,52px)] leading-[1.02] tracking-tightest mt-4"
      >
        {product.name}
      </h1>

      {/* Price */}
      <div className="flex items-baseline gap-2.5 mt-5">
        <span
          data-testid="pdp-price"
          className="font-display text-[clamp(28px,3vw,34px)] text-ink tabular-nums"
        >
          {selectedVariant ? formatInr(selectedVariant.price) : '—'}
        </span>
        {selectedVariant && (
          <span className="font-mono text-xs text-graphite">
            / {selectedVariant.size_ml}ML
          </span>
        )}
      </div>

      {/* SIZE selector */}
      {activeVariants.length > 0 && (
        <div className="mt-8">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-graphite mb-2.5">
            Size
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Select size">
            {activeVariants.map((v) => {
              const isSelected = v.id === selectedId
              const isOos      = v.stock === 0
              const label      = `${v.size_ml}ml${isOos ? ' — Out of lot' : ''}`
              return (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={label}
                  data-testid={`variant-pill-${v.id}`}
                  data-selected={isSelected}
                  data-oos={isOos}
                  disabled={isOos}
                  onClick={() => { setSelectedId(v.id); setQty(1) }}
                  className={[
                    'font-mono text-[11px] tracking-wider uppercase px-3.5 py-2.5 border transition-colors',
                    'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2',
                    isOos
                      ? 'border-hairline text-graphite cursor-not-allowed line-through'
                      : isSelected
                        ? 'bg-ink text-paper border-ink'
                        : 'bg-transparent text-ink border-hairline hover:border-ink',
                  ].join(' ')}
                >
                  {v.size_ml}ML
                  {!isSelected && !isOos && (
                    <span className="text-graphite ml-1.5 normal-case tracking-normal">
                      — {formatInr(v.price)}
                    </span>
                  )}
                  {isOos && (
                    <span className="text-graphite ml-1.5">— Out of lot</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* IDEAL FOR */}
      {(product.skin_types.length > 0 || product.concerns.length > 0) && (
        <div className="mt-7">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-graphite mb-2.5">
            Ideal for
          </p>
          <div className="flex flex-wrap gap-2">
            {product.skin_types.map((st) => (
              <span
                key={`st-${st}`}
                data-testid={`pdp-chip-skin-${st}`}
                className="font-mono text-[10px] tracking-widest uppercase text-graphite border border-hairline px-3 py-1.5"
              >
                {st === 'all' ? 'All skin' : capFirst(st)}
              </span>
            ))}
            {product.concerns.map((c) => (
              <span
                key={`c-${c}`}
                data-testid={`pdp-chip-concern-${c}`}
                className="font-mono text-[10px] tracking-widest uppercase text-graphite border border-hairline px-3 py-1.5"
              >
                {capFirst(c)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Qty + ATC — 130 / 1fr grid */}
      <div className="grid grid-cols-[130px_1fr] gap-2.5 mt-8">
        <QuantitySelector
          value={qty}
          onChange={setQty}
          min={1}
          max={Math.max(1, selectedVariant?.stock ?? 99)}
          size="md"
        />
        <button
          type="button"
          data-testid="add-to-cart"
          onClick={handleAddToCart}
          disabled={outOfStock}
          className={[
            'inline-flex items-center justify-center h-[46px] px-6',
            'font-mono text-[11px] tracking-ultra uppercase transition-colors',
            'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2',
            outOfStock
              ? 'bg-paper-3 text-graphite cursor-not-allowed border border-hairline'
              : 'bg-ink text-paper hover:bg-ink-2',
          ].join(' ')}
        >
          {outOfStock ? 'Out of lot' : 'Add to cart'}
        </button>
      </div>

      {/* KEY INGREDIENTS */}
      {keyIngredients.length > 0 && (
        <div className="mt-10">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-graphite mb-3">
            Key ingredients
          </p>
          <div className="flex flex-col gap-1.5">
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

      {/* CLINICAL INSIGHT */}
      {scienceNote?.science_note && (
        <div
          data-testid="pdp-clinical-insight"
          className="mt-5 border border-hairline bg-paper-2 px-5 py-4"
        >
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-graphite">
            Clinical insight
          </p>
          <p className="font-body text-[13px] leading-[1.55] text-ink-2 mt-2">
            {scienceNote.science_note}
          </p>
        </div>
      )}
    </div>
  )
}
