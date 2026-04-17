import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { Footer } from '@/components/layout/Footer'
import { ProductCard } from '@/components/shop/ProductCard'
import { formatInr } from '@/lib/money'
import type { ProductSummary, Variant } from '@/types'

type VariantData = Pick<Variant, 'id' | 'size_ml' | 'price' | 'sku' | 'stock' | 'is_active'>

type RelatedItem = {
  product: ProductSummary
  defaultVariant: VariantData | null
}

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderRow = {
  id: string
  order_number: string
  contact_email: string
  subtotal: number
  shipping_total: number
  total: number
  shipping_address: {
    line1: string
    line2: string | null
    city: string
    state: string
    pin: string
    country: string
  }
  created_at: string
  order_items: {
    id: string
    variant_id: string
    product_name: string
    variant_sku: string
    quantity: number
    unit_price: number
    line_total: number
  }[]
}

type RouteContext = { params: Promise<{ id: string }> }

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Order confirmed — Form.',
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getOrder(id: string): Promise<OrderRow | null> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('orders')
    .select(`
      id, order_number, contact_email,
      subtotal, shipping_total, total,
      shipping_address,
      created_at,
      order_items(id, variant_id, product_name, variant_sku, quantity, unit_price, line_total)
    `)
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as unknown as OrderRow
}

async function getRelatedProducts(_excludeSkus: string[]): Promise<RelatedItem[]> {
  const admin = createAdminClient()

  const { data } = await admin
    .from('products')
    .select('id, name, slug, category, skin_types, concerns, is_active, image_url')
    .eq('is_active', true)
    .limit(6)

  if (!data) return []

  const items: RelatedItem[] = []

  for (const p of data) {
    const { data: variants } = await admin
      .from('product_variants')
      .select('id, size_ml, price, sku, stock, is_active')
      .eq('product_id', p.id)
      .eq('is_active', true)
      .order('price', { ascending: true })

    if (!variants || variants.length === 0) continue

    const inStock = variants.filter((v) => v.stock > 0)
    const defaultVariant: VariantData | null = inStock.length > 0 ? inStock[0] : null

    items.push({
      product: {
        id:             p.id,
        name:           p.name,
        slug:           p.slug,
        category:       p.category as ProductSummary['category'],
        skin_types:     (p.skin_types ?? []) as ProductSummary['skin_types'],
        concerns:       (p.concerns ?? []) as ProductSummary['concerns'],
        starting_price: variants[0].price,
        image_url:      p.image_url ?? null,
        is_active:      p.is_active,
      },
      defaultVariant,
    })

    if (items.length === 3) break
  }

  return items
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function OrderConfirmationPage({ params }: RouteContext) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) notFound()

  const orderSkus    = order.order_items.map((i) => i.variant_sku)
  const relatedItems = await getRelatedProducts(orderSkus)

  const emailUser = order.contact_email.split('@')[0]
  const firstName = emailUser.charAt(0).toUpperCase() + emailUser.slice(1)

  return (
    <div className="min-h-screen bg-white">
      {/* ── Minimal navbar ─────────────────────────────────────────────────── */}
      <header
        data-testid="confirmation-navbar"
        className="border-b border-gray-100 px-6 py-4 flex items-center justify-between"
      >
        <Link
          href="/"
          data-testid="confirmation-brand"
          className="font-heading text-base tracking-tight text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2 rounded-sm"
        >
          Form.
        </Link>
        {/* Cart shows 0 — it was cleared after order placed */}
        <Link
          href="/products"
          aria-label="Continue shopping"
          className="font-mono text-xs text-gray-400 hover:text-gray-600 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2 rounded-sm"
        >
          Continue shopping
        </Link>
      </header>

      <main>
        {/* ── Confirmation hero ─────────────────────────────────────────────── */}
        <section
          data-testid="confirmation-hero"
          className="text-center px-6 py-12"
          aria-labelledby="confirmation-heading"
        >
          {/* Checkmark */}
          <div
            aria-hidden="true"
            className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center mx-auto mb-4 text-white"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M3 9l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1
            id="confirmation-heading"
            data-testid="confirmation-title"
            className="font-heading text-2xl font-normal text-gray-900 mb-2"
          >
            Order confirmed.
          </h1>

          <p className="font-body text-sm text-gray-600 mb-1" data-testid="confirmation-thank-you">
            Thank you, {firstName}. We&rsquo;re preparing your order now.
          </p>

          <p
            className="font-mono text-xs text-gray-400 mb-8"
            data-testid="confirmation-order-meta"
          >
            Order #{order.order_number} · Confirmation sent to {order.contact_email}
          </p>

          {/* Info strip */}
          <div
            data-testid="confirmation-info-strip"
            className="inline-flex border border-gray-100 rounded-sm overflow-hidden mb-8 max-w-sm w-full"
          >
            <div className="flex-1 px-3 py-3 border-r border-gray-100 text-center">
              <p className="font-mono text-2xs uppercase tracking-widest text-gray-400 mb-1">
                Estimated delivery
              </p>
              <p className="font-body text-sm font-medium text-gray-900">3–5 business days</p>
            </div>
            <div className="flex-1 px-3 py-3 border-r border-gray-100 text-center">
              <p className="font-mono text-2xs uppercase tracking-widest text-gray-400 mb-1">
                Shipping to
              </p>
              <p className="font-body text-sm font-medium text-gray-900">
                {order.shipping_address.city}, {order.shipping_address.pin}
              </p>
            </div>
            <div className="flex-1 px-3 py-3 text-center">
              <p className="font-mono text-2xs uppercase tracking-widest text-gray-400 mb-1">
                Total paid
              </p>
              <p className="font-body text-sm font-medium text-gray-900">{formatInr(order.total)}</p>
            </div>
          </div>

          {/* Account creation incentive */}
          <div className="max-w-sm mx-auto">
            <div
              data-testid="account-incentive"
              className="bg-offwhite border-l-2 border-gray-900 text-left px-4 py-3 mb-4"
            >
              <p className="font-mono text-2xs uppercase tracking-widest text-gray-400 mb-1">
                Save 10% on your next order
              </p>
              <p className="font-body text-xs text-gray-600 mb-3">
                Create an account to track this order, reorder with one click, and get early
                access to new formulas.
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Set a password"
                  aria-label="Password for new account"
                  data-testid="account-password-input"
                  className="flex-1 border border-gray-200 rounded-sm px-3 py-2 font-body text-sm text-gray-900 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-1"
                />
                <button
                  type="button"
                  data-testid="account-create-btn"
                  className="bg-gray-900 text-white rounded-sm px-3 py-2 font-mono text-2xs uppercase tracking-widest hover:bg-gray-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2 whitespace-nowrap"
                >
                  Create account
                </button>
              </div>
              <p className="font-mono text-2xs text-gray-400 mt-2">
                Auth is Phase 2 — this will be wired up in Task 4.1.
              </p>
            </div>

            <Link
              href="/products"
              data-testid="continue-shopping-link"
              className="block border border-gray-200 rounded-sm py-2 font-body text-sm text-gray-900 text-center hover:bg-gray-50 transition-colors mb-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
            >
              Continue shopping
            </Link>

            <p className="font-mono text-xs text-gray-400">
              Questions?{' '}
              <Link href="/support/new" className="underline hover:text-gray-600 transition-colors">
                Contact us
              </Link>
            </p>
          </div>
        </section>

        {/* ── Order items ────────────────────────────────────────────────────── */}
        <section
          data-testid="confirmation-order-items"
          className="bg-offwhite border-t border-gray-100 px-6 py-8"
          aria-labelledby="order-items-heading"
        >
          <div className="max-w-sm mx-auto">
            <p
              id="order-items-heading"
              className="font-mono text-2xs uppercase tracking-widest text-gray-400 mb-4"
            >
              Your order
            </p>

            <ul>
              {order.order_items.map((item) => (
                <li
                  key={item.id}
                  data-testid="confirmation-order-item"
                  className="flex gap-3 items-start py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="w-12 h-12 flex-shrink-0 bg-gray-50 border border-gray-100 rounded-sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-medium text-gray-900">
                      {item.product_name}
                    </p>
                    <p className="font-mono text-2xs uppercase text-gray-400">
                      {item.variant_sku} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="font-body text-sm font-medium text-gray-900 flex-shrink-0">
                    {formatInr(item.line_total)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Related products ───────────────────────────────────────────────── */}
        {relatedItems.length > 0 && (
          <section
            data-testid="confirmation-related"
            className="px-6 py-8 border-t border-gray-100"
            aria-labelledby="related-heading"
          >
            <div className="max-w-5xl mx-auto">
              <div className="flex items-baseline justify-between mb-6">
                <h2
                  id="related-heading"
                  className="font-heading text-xl font-normal text-gray-900"
                >
                  You might also like
                </h2>
                <Link
                  href="/products"
                  className="font-mono text-xs text-gray-400 hover:text-gray-600 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2 rounded-sm"
                >
                  View all →
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {relatedItems.map(({ product, defaultVariant }) => (
                  <ProductCard key={product.id} product={product} defaultVariant={defaultVariant} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
