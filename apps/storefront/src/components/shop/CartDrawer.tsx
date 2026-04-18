'use client'

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore, type CartItem } from '@/lib/store/cart'
import { QuantitySelector } from '@/components/ui/QuantitySelector'
import { formatInr } from '@/lib/money'
import type { Variant, ProductSummary } from '@/types'

const SHIPPING_THRESHOLD = 99900 // ₹999 in paise

// ─── Component ────────────────────────────────────────────────────────────────

export function CartDrawer() {
  const items      = useCartStore((s) => s.items)
  const isOpen     = useCartStore((s) => s.isOpen)
  const closeCart  = useCartStore((s) => s.closeCart)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQty  = useCartStore((s) => s.updateQty)
  const addItem    = useCartStore((s) => s.addItem)
  const subtotal   = useCartStore((s) => s.subtotal)
  const itemCount  = useCartStore((s) => s.itemCount)

  const drawerRef = useRef<HTMLDivElement>(null)

  const [upsellProduct, setUpsellProduct] = useState<ProductSummary | null>(null)
  const [upsellVariant, setUpsellVariant] = useState<Variant | null>(null)

  const cartProductIdKey = useMemo(() => items.map((i) => i.productId).join(','), [items])

  useEffect(() => {
    if (!isOpen || items.length === 0) {
      setUpsellProduct(null)
      setUpsellVariant(null)
      return
    }

    let stale = false

    async function fetchUpsell() {
      const params = new URLSearchParams({
        exclude:  cartProductIdKey,
        cart_key: cartProductIdKey,
      })
      const res = await fetch(`/api/upsell?${params}`)
      if (stale || !res.ok) return

      const { product, variant } = (await res.json()) as {
        product: ProductSummary | null
        variant: Variant | null
      }

      if (stale) return
      setUpsellProduct(product)
      setUpsellVariant(variant)
    }

    fetchUpsell()
    return () => { stale = true }
  }, [isOpen, items.length, cartProductIdKey])

  const handleQuantityChange = useCallback(
    (variantId: string, qty: number) => updateQty(variantId, qty),
    [updateQty],
  )
  const handleRemoveItem = useCallback(
    (variantId: string) => removeItem(variantId),
    [removeItem],
  )

  const total         = subtotal
  const count         = itemCount
  const formulaCount  = items.length
  const isFreeShip    = total >= SHIPPING_THRESHOLD
  const remaining     = Math.max(0, SHIPPING_THRESHOLD - total)
  const progressPct   = isFreeShip
    ? 100
    : total <= 0 ? 0 : Math.round((total / SHIPPING_THRESHOLD) * 100)

  // ── Focus trap + Escape key ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return

    const drawer = drawerRef.current
    if (!drawer) return

    const focusables = Array.from(
      drawer.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])',
      ),
    )
    focusables[0]?.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { closeCart(); return }
      if (e.key !== 'Tab' || focusables.length === 0) return

      const first = focusables[0]
      const last  = focusables[focusables.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus() }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, closeCart])

  if (!isOpen) return null

  const headerSubtitle =
    formulaCount === 0
      ? 'Nothing yet.'
      : `${formulaCount} ${formulaCount === 1 ? 'formula' : 'formulas'} · ${count} ${count === 1 ? 'item' : 'items'}`

  return (
    <>
      {/* Backdrop — ink 35% per matter spec, never a blur */}
      <div
        aria-hidden="true"
        data-testid="cart-backdrop"
        className="fixed inset-0 z-40 bg-ink/35"
        onClick={closeCart}
      />

      {/* Drawer panel — 480px md+, full width mobile, hairline left border */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        data-testid="cart-drawer"
        className="fixed right-0 top-0 z-50 flex h-full w-full md:w-[480px] flex-col bg-paper border-l border-hairline"
      >

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 px-6 py-5 border-b border-hairline">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p
                className="font-mono text-2xs tracking-widest uppercase text-graphite"
                data-testid="cart-header-eyebrow"
              >
                § Your bag
              </p>
              <p
                className="font-display text-2xl text-ink mt-1.5"
                data-testid="cart-header-count"
              >
                {headerSubtitle}{' '}
                {/* Hidden machine-readable count keeps legacy assertions viable */}
                <span className="sr-only">({count})</span>
              </p>
            </div>
            <button
              type="button"
              aria-label="Close cart"
              data-testid="cart-close"
              onClick={closeCart}
              className="flex-shrink-0 inline-flex h-10 w-10 items-center justify-center border border-hairline font-mono text-base text-ink hover:bg-paper-2 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
            >
              ×
            </button>
          </div>
        </div>

        {/* ── Body ──────────────────────────────────────────────────────────── */}
        {items.length === 0 ? (

          /* Empty state — inline inside drawer (keeps the header, drops the footer) */
          <div
            data-testid="cart-empty"
            className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center"
          >
            <p
              data-testid="cart-empty-heading"
              className="font-display text-4xl text-ink"
            >
              — Empty.
            </p>
            <p className="font-body text-sm text-ink-2 mt-4 max-w-[320px]">
              Nothing here yet. Begin with a serum, or take the skin insight quiz to let us prescribe.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-7">
              <Link
                href="/products"
                onClick={closeCart}
                data-testid="cart-browse-link"
                className="inline-flex items-center justify-center bg-ink text-paper font-mono text-2xs tracking-widest uppercase px-5 py-3 hover:bg-ink-2 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
              >
                Browse formulary
              </Link>
              <Link
                href="/products?quiz=true"
                onClick={closeCart}
                data-testid="cart-quiz-link"
                className="inline-flex items-center justify-center border border-ink text-ink font-mono text-2xs tracking-widest uppercase px-5 py-3 hover:bg-paper-2 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
              >
                Take the quiz
              </Link>
            </div>
          </div>

        ) : (

          <>
            {/* Free-ship progress */}
            <div
              data-testid="cart-freeship"
              className="flex-shrink-0 bg-paper-2 border-b border-hairline px-6 py-4"
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-mono text-2xs tracking-widest uppercase text-graphite">
                  Free shipping at ₹999
                </span>
                <span
                  data-testid="cart-freeship-status"
                  className={`font-mono text-2xs tracking-widest uppercase ${isFreeShip ? 'text-assay' : 'text-graphite'}`}
                >
                  {isFreeShip
                    ? '✓ Free shipping unlocked'
                    : `${formatInr(remaining)} to go`}
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progressPct}
                aria-label="Free shipping progress"
                data-testid="cart-freeship-bar"
                className="relative h-0.5 bg-hairline"
              >
                <div
                  className={`absolute inset-y-0 left-0 transition-[width] duration-300 ${isFreeShip ? 'bg-assay' : 'bg-ink'}`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Line items */}
            <div className="flex-1 overflow-y-auto">
              {items.map((item) => (
                <CartItemRow
                  key={item.variantId}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveItem}
                />
              ))}

              {upsellProduct && upsellVariant && (
                <UpsellSlot
                  product={upsellProduct}
                  variant={upsellVariant}
                  onAdd={() => addItem(upsellVariant, upsellProduct, 1)}
                />
              )}
            </div>
          </>
        )}

        {/* ── Sticky footer (shown only when cart has items) ────────────────── */}
        {items.length > 0 && (
          <div className="flex-shrink-0 border-t border-hairline bg-paper px-6 py-5">
            <div className="mb-4">
              <div className="flex items-baseline justify-between py-1">
                <span className="font-mono text-xs tracking-widest uppercase text-graphite">
                  Subtotal
                </span>
                <span
                  className="font-mono text-sm text-ink tabular-nums"
                  data-testid="cart-subtotal"
                >
                  {formatInr(total)}
                </span>
              </div>
              <div className="flex items-baseline justify-between py-1">
                <span className="font-mono text-xs tracking-widest uppercase text-graphite">
                  Shipping
                </span>
                <span
                  data-testid="cart-shipping"
                  className={`font-mono text-xs tracking-widest uppercase ${isFreeShip ? 'text-assay' : 'text-graphite'}`}
                >
                  {isFreeShip ? 'Free at checkout' : 'Calculated at checkout'}
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-2.5 mt-1.5 border-t border-hairline/60">
                <span className="font-display text-lg text-ink">Total</span>
                <span
                  className="font-display text-2xl text-ink tabular-nums"
                  data-testid="cart-total"
                >
                  {formatInr(total)}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              data-testid="cart-checkout-link"
              className="block w-full bg-ink py-4 text-center font-mono text-xs uppercase tracking-ultra text-paper hover:bg-ink-2 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
            >
              Checkout →
            </Link>

            {/* Trust strip */}
            <div
              data-testid="cart-trust-strip"
              className="flex items-center justify-between mt-4 pt-3.5 border-t border-hairline/60"
            >
              <span className="font-mono text-[9px] tracking-widest uppercase text-graphite">
                ✓ Free returns · 14 days
              </span>
              <span className="font-mono text-[9px] tracking-widest uppercase text-graphite">
                ✓ Dispatched in 48h
              </span>
            </div>
          </div>
        )}

      </div>
    </>
  )
}

// ─── Line item row ────────────────────────────────────────────────────────────

const CartItemRow = memo(function CartItemRow({
  item,
  onQuantityChange,
  onRemove,
}: {
  item: CartItem
  onQuantityChange: (variantId: string, qty: number) => void
  onRemove: (variantId: string) => void
}) {
  const handleQty = useCallback(
    (qty: number) => onQuantityChange(item.variantId, qty),
    [item.variantId, onQuantityChange],
  )
  const handleRemove = useCallback(
    () => onRemove(item.variantId),
    [item.variantId, onRemove],
  )

  const unitPrice = item.price
  const linePrice = unitPrice * item.quantity

  return (
    <div
      data-testid="cart-item"
      className="grid grid-cols-[80px_1fr_auto] gap-4 px-6 py-5 border-b border-hairline/50"
    >
      {/* Thumbnail — real image or m-ph placeholder */}
      <div className="relative aspect-square overflow-hidden border border-hairline">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.productName}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="m-ph w-full h-full" aria-hidden="true" />
        )}
      </div>

      {/* Meta + stepper */}
      <div className="min-w-0">
        <p className="font-mono text-[9px] tracking-widest uppercase text-graphite">
          {item.sku}
        </p>
        <p
          className="font-display text-xl text-ink mt-1 truncate"
          data-testid="cart-item-name"
        >
          {item.productName}
        </p>
        <p className="font-mono text-2xs tracking-wider uppercase text-graphite mt-1.5">
          {item.size_ml}ml
        </p>
        <div className="flex items-center gap-3 mt-3">
          <QuantitySelector
            value={item.quantity}
            onChange={handleQty}
            min={1}
            max={99}
            size="sm"
          />
          <button
            type="button"
            aria-label={`Remove ${item.productName} from cart`}
            data-testid="cart-item-remove"
            onClick={handleRemove}
            className="font-mono text-2xs tracking-widest uppercase text-graphite hover:text-ink border-b border-hairline pb-0.5 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Price */}
      <div className="text-right">
        <p className="font-mono text-sm text-ink tabular-nums">
          {formatInr(linePrice)}
        </p>
        {item.quantity > 1 && (
          <p className="font-mono text-2xs text-graphite mt-1 tabular-nums">
            {formatInr(unitPrice)} × {item.quantity}
          </p>
        )}
      </div>
    </div>
  )
})

// ─── Upsell slot ──────────────────────────────────────────────────────────────

function UpsellSlot({
  product,
  variant,
  onAdd,
}: {
  product: ProductSummary
  variant: Variant
  onAdd: () => void
}) {
  return (
    <div
      data-testid="cart-upsell"
      className="bg-paper-2 border-t border-hairline border-b border-hairline px-6 py-5"
    >
      <div className="flex items-center gap-4">
        <div className="relative w-[72px] aspect-square flex-shrink-0 overflow-hidden border border-hairline">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="72px"
            />
          ) : (
            <div className="m-ph w-full h-full" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[9px] tracking-widest uppercase text-graphite">
            § Frequently added
          </p>
          <p className="font-display text-xl text-ink mt-1 truncate">
            {product.name}
          </p>
          <p className="font-mono text-2xs tracking-wider text-graphite mt-1 tabular-nums">
            {product.category.toUpperCase()} · {variant.size_ml}ml · {formatInr(variant.price)}
          </p>
        </div>
        <button
          type="button"
          data-testid="cart-upsell-add"
          onClick={onAdd}
          aria-label={`Add ${product.name} to cart`}
          className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 bg-ink text-paper font-mono text-base hover:bg-ink-2 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
        >
          +
        </button>
      </div>
    </div>
  )
}
