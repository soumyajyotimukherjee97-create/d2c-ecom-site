import { notFound } from 'next/navigation'
import Link from 'next/link'
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
  id:              string
  order_number:    string
  contact_email:   string
  user_id:         string | null
  subtotal:        number
  shipping_total:  number
  total:           number
  status:          string
  shipping_address: {
    line1:   string
    line2:   string | null
    city:    string
    state:   string
    pin:     string
    country: string
  }
  created_at:      string
  order_items: {
    id:            string
    variant_id:    string
    product_name:  string
    variant_sku:   string
    quantity:      number
    unit_price:    number
    line_total:    number
  }[]
}

type RouteContext = { params: Promise<{ id: string }> }

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Order confirmed · matter',
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getOrder(id: string): Promise<OrderRow | null> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('orders')
    .select(`
      id, order_number, contact_email, user_id,
      subtotal, shipping_total, total,
      status,
      shipping_address,
      created_at,
      order_items(id, variant_id, product_name, variant_sku, quantity, unit_price, line_total)
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    // Surface the Supabase error in server logs so a misnamed column /
    // missing row doesn't silently collapse into a blank 404.
    if (error) console.error('[order/[id]] getOrder failed:', error)
    return null
  }
  return data as unknown as OrderRow
}

const RELATED_TONES = ['mineral', 'default', 'ink', 'default'] as const

async function getRelatedProducts(excludeSkus: string[]): Promise<RelatedItem[]> {
  const admin = createAdminClient()

  const { data } = await admin
    .from('products')
    .select('id, name, slug, category, skin_types, concerns, is_active, image_url')
    .eq('is_active', true)
    .limit(8)

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
    // Skip products whose variants were all in this order (no point in
    // "also like" suggesting the exact same formula twice).
    if (variants.every((v) => excludeSkus.includes(v.sku))) continue

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

    if (items.length === 4) break
  }

  return items
}

// ─── Formatters ───────────────────────────────────────────────────────────────

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December']
const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatFullDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

function formatShortDate(d: Date): string {
  return `${String(d.getUTCDate()).padStart(2, '0')} ${MONTH_ABBR[d.getUTCMonth()].toUpperCase()}`
}

function estimatedDispatch(createdAtIso: string): string {
  const start = new Date(createdAtIso)
  start.setUTCDate(start.getUTCDate() + 2)
  const end = new Date(createdAtIso)
  end.setUTCDate(end.getUTCDate() + 4)
  return `${formatShortDate(start)} — ${formatShortDate(end)}`
}

// MVP: COD is the only payment method (TDD §7 — Razorpay is Phase 2).
// When the DB gains a `payment_method` column, plumb it through here.
const PAYMENT_LABEL = 'COD'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function OrderConfirmationPage({ params }: RouteContext) {
  const { id } = await params
  const order = await getOrder(id)
  if (!order) notFound()

  const orderSkus    = order.order_items.map((i) => i.variant_sku)
  const relatedItems = await getRelatedProducts(orderSkus)

  const isGuest        = order.user_id === null
  const totalItemCount = order.order_items.reduce((s, i) => s + i.quantity, 0)
  const formulaCount   = order.order_items.length

  return (
    <div className="min-h-screen bg-paper">
      {/* ── Broadsheet masthead ────────────────────────────────────────────── */}
      <header
        data-testid="confirmation-masthead"
        className="bg-paper border-b-[3px] border-double border-ink"
      >
        <div className="max-w-container mx-auto px-8 md:px-12 pt-7 pb-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 font-mono text-2xs tracking-ultra uppercase">
            <Link
              href="/"
              data-testid="confirmation-brand"
              aria-label="matter — home"
              className="text-graphite hover:text-ink transition-colors justify-self-start font-mono tracking-ultra"
            >
              Vol. I · No. 01
            </Link>
            <span className="text-ink text-xs tracking-[0.3em] whitespace-nowrap">
              Order brief · Dispatch
            </span>
            <span className="text-graphite text-right">
              {formatFullDate(order.created_at)}
            </span>
          </div>
        </div>
      </header>

      {/* ── Confirmation hero ──────────────────────────────────────────────── */}
      <section
        aria-labelledby="confirmation-heading"
        data-testid="confirmation-hero"
        className="bg-paper border-b border-hairline"
      >
        <div className="max-w-container mx-auto px-8 py-20 text-center">
          <p
            data-testid="confirmation-ack"
            className="font-mono text-2xs tracking-ultra uppercase text-graphite"
          >
            § Acknowledged — {order.order_number}
          </p>
          <h1
            id="confirmation-heading"
            data-testid="confirmation-title"
            className="font-display font-normal text-[clamp(48px,7vw,104px)] leading-[0.96] tracking-tightest mt-5 max-w-[14ch] mx-auto"
          >
            Your consignment is <em className="italic">underway</em>.
          </h1>
          <p
            data-testid="confirmation-email"
            className="font-body text-base text-ink-2 max-w-[560px] mx-auto mt-7 leading-[1.6]"
          >
            A confirmation has been dispatched to{' '}
            <span className="font-mono text-[13px] text-ink">{order.contact_email}</span>.
            Tracking will follow within 48 hours.
          </p>
        </div>
      </section>

      {/* ── Info strip (4-cell) ────────────────────────────────────────────── */}
      <section
        aria-label="Order summary"
        data-testid="confirmation-info-strip"
        className="bg-paper border-b border-hairline"
      >
        <div className="max-w-container mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 border-t border-b border-hairline">
            <div className="px-6 py-5 border-r border-hairline/60 border-b md:border-b-0">
              <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-graphite">
                Status
              </p>
              <p className="font-mono text-sm text-assay mt-1.5 uppercase tracking-widest">
                ● {order.status === 'confirmed' ? 'Confirmed' : order.status}
              </p>
            </div>
            <div className="px-6 py-5 md:border-r border-hairline/60 border-b md:border-b-0">
              <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-graphite">
                Estimated dispatch
              </p>
              <p className="font-mono text-sm text-ink mt-1.5 tabular-nums">
                {estimatedDispatch(order.created_at)}
              </p>
            </div>
            <div className="px-6 py-5 border-r border-hairline/60">
              <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-graphite">
                Payment
              </p>
              <p className="font-mono text-sm text-ink mt-1.5 tabular-nums">
                {PAYMENT_LABEL} · {formatInr(order.total)}
              </p>
            </div>
            <div className="px-6 py-5">
              <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-graphite">
                Order ID
              </p>
              <p
                data-testid="confirmation-order-id"
                className="font-mono text-sm text-ink mt-1.5 tabular-nums"
              >
                {order.order_number}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Manifest table ─────────────────────────────────────────────────── */}
      <section
        aria-label="Order items"
        data-testid="confirmation-manifest"
        className="bg-paper border-b border-hairline"
      >
        <div className="max-w-container mx-auto px-8 py-16">
          <div className="flex items-baseline justify-between flex-wrap gap-4 mb-6">
            <h2 className="font-display text-[clamp(24px,3vw,32px)] text-ink">
              Manifest
            </h2>
            <p className="font-mono text-[10px] tracking-widest uppercase text-graphite tabular-nums">
              {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} · {formulaCount}{' '}
              {formulaCount === 1 ? 'formula' : 'formulas'}
            </p>
          </div>

          <ul
            data-testid="confirmation-order-items"
            className="border-t border-hairline"
          >
            {order.order_items.map((item, idx) => (
              <li
                key={item.id}
                data-testid="confirmation-order-item"
                className="grid grid-cols-[36px_1fr_auto_auto_auto] gap-4 md:gap-6 py-5 border-b border-hairline/60 items-baseline"
              >
                <span className="font-mono text-[9px] tracking-widest uppercase text-graphite tabular-nums">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="font-body text-[15px] text-ink">{item.product_name}</p>
                  <p className="font-mono text-[10px] tracking-widest uppercase text-graphite mt-1">
                    SKU {item.variant_sku}
                  </p>
                </div>
                <span className="font-mono text-xs text-graphite whitespace-nowrap tabular-nums">
                  Qty {item.quantity}
                </span>
                <span className="font-mono text-xs text-graphite whitespace-nowrap tabular-nums">
                  {formatInr(item.unit_price)}
                </span>
                <span className="font-mono text-sm text-ink whitespace-nowrap tabular-nums">
                  {formatInr(item.line_total)}
                </span>
              </li>
            ))}
          </ul>

          {/* Totals strip */}
          <div className="flex flex-col md:items-end gap-1 mt-8">
            <div className="flex justify-between md:justify-end md:gap-8 font-mono text-[11px] tracking-widest uppercase">
              <span className="text-graphite">Subtotal</span>
              <span className="text-ink tabular-nums">{formatInr(order.subtotal)}</span>
            </div>
            <div className="flex justify-between md:justify-end md:gap-8 font-mono text-[11px] tracking-widest uppercase">
              <span className="text-graphite">Shipping</span>
              <span className={`tabular-nums ${order.shipping_total === 0 ? 'text-assay' : 'text-ink'}`}>
                {order.shipping_total === 0 ? 'Free' : formatInr(order.shipping_total)}
              </span>
            </div>
            <div className="flex justify-between md:justify-end md:gap-8 pt-3 mt-2 border-t border-hairline min-w-[220px]">
              <span className="font-display text-lg text-ink">Total</span>
              <span
                data-testid="confirmation-total"
                className="font-display text-2xl text-ink tabular-nums"
              >
                {formatInr(order.total)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Account incentive (guest only) ─────────────────────────────────── */}
      {isGuest && (
        <section
          aria-label="Create account"
          data-testid="account-incentive"
          className="bg-paper-2 border-b border-hairline"
        >
          <div className="max-w-container mx-auto px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <p className="font-mono text-[10px] tracking-ultra uppercase text-graphite">
                  § Optional — Create your dossier
                </p>
                <h2 className="font-display font-normal text-[clamp(28px,3.5vw,36px)] leading-[1.1] tracking-tight mt-3.5">
                  Track consignments and reorder in one step.
                </h2>
                <p className="font-body text-sm leading-[1.6] text-ink-2 mt-4 max-w-[420px]">
                  Link this order to an account and we&rsquo;ll keep a complete
                  dossier — dispatch tracking, reorder shortcuts, and a skin
                  profile you can edit.
                </p>
              </div>
              <div className="md:justify-self-end w-full max-w-[280px]">
                <Link
                  href={`/signup?prefill=${encodeURIComponent(order.contact_email)}&order=${order.id}`}
                  data-testid="account-create-link"
                  className="block bg-ink text-paper px-6 py-4 font-mono text-xs tracking-ultra uppercase text-center hover:bg-ink-2 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
                >
                  Create account →
                </Link>
                <p className="font-mono text-2xs tracking-widest uppercase text-graphite text-center mt-3">
                  30 seconds · Email + password
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Related products ───────────────────────────────────────────────── */}
      {relatedItems.length > 0 && (
        <section
          aria-label="Complete the regimen"
          data-testid="confirmation-related"
          className="bg-paper border-b border-hairline"
        >
          <div className="max-w-container mx-auto px-8 pt-18 pb-24">
            <div className="flex items-baseline justify-between flex-wrap gap-4 mb-10">
              <div>
                <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-graphite">
                  § Complete the regimen
                </p>
                <h2 className="font-display font-normal text-[clamp(28px,3vw,40px)] leading-[1.05] tracking-tighter mt-3.5">
                  You might <em className="italic">also</em> like.
                </h2>
              </div>
              <Link
                href="/products"
                data-testid="confirmation-view-all"
                className="font-mono text-xs tracking-widest uppercase text-ink border-b border-ink pb-0.5 hover:text-graphite hover:border-graphite transition-colors"
              >
                Browse all →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedItems.map(({ product, defaultVariant }, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  defaultVariant={defaultVariant}
                  showAddButton={false}
                  placeholderTone={RELATED_TONES[idx % RELATED_TONES.length]}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
