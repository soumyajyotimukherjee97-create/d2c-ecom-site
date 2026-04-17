'use client'

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X } from 'lucide-react'
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
  const isFreeShip    = total >= SHIPPING_THRESHOLD

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

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        data-testid="cart-backdrop"
        className="fixed inset-0 z-40 bg-black/20"
        onClick={closeCart}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        data-testid="cart-drawer"
        className="fixed right-0 top-0 z-50 flex h-full flex-col bg-white border-l border-gray-100"
        style={{ width: '340px' }}
      >

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-4 py-4">
          <span className="font-body text-sm font-medium text-gray-900">
            Cart{' '}
            <span className="font-mono text-2xs font-normal text-gray-400">({count})</span>
          </span>
          <button
            type="button"
            aria-label="Close cart"
            data-testid="cart-close"
            onClick={closeCart}
            className="flex h-6 w-6 items-center justify-center text-gray-400 transition-colors hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>

        {/* ── Body ──────────────────────────────────────────────────────────── */}
        {items.length === 0 ? (

          /* Empty state */
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
            <p className="font-body text-sm text-gray-900 mb-2" data-testid="cart-empty-heading">
              Your cart is empty.
            </p>
            <p className="font-body text-xs text-gray-500 mb-6">
              Add products from the shop to get started.
            </p>
            <Link
              href="/products"
              onClick={closeCart}
              data-testid="cart-browse-link"
              className="font-mono text-2xs uppercase tracking-wider bg-gray-900 text-white px-5 py-2 rounded-sm hover:bg-gray-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
            >
              Browse products
            </Link>
          </div>

        ) : (

          <div className="flex-1 overflow-y-auto px-4 py-3">

            {/* Cart items */}
            {items.map((item) => (
              <CartItemRow
                key={item.variantId}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
              />
            ))}

            {/* Upsell slot */}
            {upsellProduct && upsellVariant && (
              <UpsellSlot
                product={upsellProduct}
                variant={upsellVariant}
                onAdd={() => addItem(upsellVariant, upsellProduct, 1)}
              />
            )}
          </div>
        )}

        {/* ── Sticky footer ─────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-gray-100 bg-white p-4">
          <div className="mb-1 flex items-baseline justify-between">
            <span className="font-mono text-2xs uppercase text-gray-400">Subtotal</span>
            <span
              className="font-body text-sm font-medium text-gray-900"
              data-testid="cart-subtotal"
            >
              {formatInr(total)}
            </span>
          </div>
          <div className="mb-4 flex items-baseline justify-between">
            <span className="font-mono text-2xs uppercase text-gray-400">Shipping</span>
            <span
              className={`font-mono text-2xs uppercase ${isFreeShip ? 'text-gray-600' : 'text-gray-400'}`}
              data-testid="cart-shipping"
            >
              {isFreeShip ? 'Free' : '₹99'}
            </span>
          </div>

          <Link
            href="/checkout"
            onClick={closeCart}
            data-testid="cart-checkout-link"
            className="block w-full rounded-sm bg-gray-900 py-3 text-center font-mono text-2xs uppercase tracking-wider text-white transition-colors hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
          >
            Proceed to checkout
          </Link>

          <button
            type="button"
            data-testid="cart-continue-shopping"
            onClick={closeCart}
            className="mt-2 w-full text-center font-mono text-2xs text-gray-400 underline transition-colors hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900"
          >
            Continue shopping
          </button>
        </div>

      </div>
    </>
  )
}

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

  return (
    <div
      data-testid="cart-item"
      className="flex items-start gap-2.5 border-b border-gray-50 py-3"
    >
      <div
        className="relative flex-shrink-0 overflow-hidden rounded-sm border border-gray-100 bg-gray-50"
        style={{ width: '52px', height: '52px' }}
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.productName}
            fill
            className="object-contain"
            sizes="52px"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-body text-xs font-medium text-gray-900 mb-0.5">
          {item.productName}
        </p>
        <p className="font-mono text-2xs uppercase text-gray-400 mb-1.5">
          {item.sku} · {item.size_ml}ml
        </p>
        <QuantitySelector
          value={item.quantity}
          onChange={handleQty}
          min={1}
          max={99}
        />
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="font-body text-xs font-medium text-gray-900 mb-1.5">
          {formatInr(item.price * item.quantity)}
        </p>
        <button
          type="button"
          aria-label={`Remove ${item.productName} from cart`}
          data-testid="cart-item-remove"
          onClick={handleRemove}
          className="font-mono text-2xs text-gray-400 underline transition-colors hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900"
        >
          Remove
        </button>
      </div>
    </div>
  )
})

function UpsellSlot({ product, variant, onAdd }: { product: ProductSummary; variant: Variant; onAdd: () => void }) {
  return (
    <div
      data-testid="cart-upsell"
      className="mt-3 rounded-sm border border-gray-100 bg-gray-50 p-2.5"
    >
      <p className="font-mono text-2xs uppercase text-gray-400 mb-2">
        Complete your routine
      </p>
      <div className="flex items-center gap-2">
        <div
          className="relative flex-shrink-0 overflow-hidden rounded-sm bg-blush"
          style={{ width: '40px', height: '40px' }}
        >
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-contain"
              sizes="40px"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-body text-xs font-medium text-gray-900">
            {product.name}
          </p>
          <p className="font-mono text-2xs text-gray-400">
            {formatInr(variant.price)}
          </p>
        </div>
        <button
          type="button"
          data-testid="cart-upsell-add"
          onClick={onAdd}
          className="flex-shrink-0 whitespace-nowrap rounded-sm border border-gray-200 px-2.5 py-1 font-mono text-2xs transition-colors hover:border-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900"
        >
          Add
        </button>
      </div>
    </div>
  )
}
