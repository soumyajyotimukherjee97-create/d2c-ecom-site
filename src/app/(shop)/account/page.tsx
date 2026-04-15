import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { SignOutButton } from '@/components/account/SignOutButton'
import { ReorderButton } from '@/components/account/ReorderButton'
import { SkinProfileForm } from '@/components/account/SkinProfileForm'
import type { CartItem } from '@/lib/store/cart'
import type { Concern, OrderStatus, SkinType } from '@/types'

export const dynamic = 'force-dynamic'

const RESTOCK_MIN_DAYS = 40
const RESTOCK_MAX_DAYS = 180

// ─── Types ───────────────────────────────────────────────────────────────────

type OrderRow = {
  id: string
  order_number: string
  status: OrderStatus
  total: number
  created_at: string
  order_items: Array<{
    variant_id: string | null
    product_name: string
    variant_sku: string
    quantity: number
    unit_price: number
  }>
}

type VariantDetail = {
  id: string
  size_ml: number
  price: number
  sku: string
  is_active: boolean
  products: {
    id: string
    name: string
    slug: string
    image_url: string | null
  } | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(paise: number) {
  return `₹${Math.round(paise / 100).toLocaleString()}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function daysSince(iso: string) {
  const ms = Date.now() - new Date(iso).getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

function getInitialsFromEmail(email: string | null | undefined): string {
  if (!email) return '—'
  const local = email.split('@')[0] ?? ''
  const parts = local.split(/[._-]+/).filter(Boolean)
  if (parts.length === 0) return local.slice(0, 2).toUpperCase() || '—'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase()
}

function summariseOrder(items: OrderRow['order_items']): string {
  if (items.length === 0) return '—'
  if (items.length === 1) return items[0]!.product_name
  if (items.length === 2) return `${items[0]!.product_name} + ${items[1]!.product_name}`
  return `${items[0]!.product_name} + ${items.length - 1} more`
}

function buildCartItemsForOrder(
  order: OrderRow,
  variantMap: Map<string, VariantDetail>,
): CartItem[] {
  const out: CartItem[] = []
  for (const item of order.order_items) {
    if (!item.variant_id) continue
    const v = variantMap.get(item.variant_id)
    if (!v || !v.is_active || !v.products) continue
    out.push({
      variantId:   v.id,
      productId:   v.products.id,
      sku:         v.sku,
      productName: v.products.name,
      slug:        v.products.slug,
      size_ml:     v.size_ml,
      price:       v.price,
      quantity:    item.quantity,
      imageUrl:    v.products.image_url,
    })
  }
  return out
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Defence-in-depth: middleware should have redirected already.
    redirect('/login?next=%2Faccount')
  }

  // ── Fetch profile + orders in parallel ───────────────────────────────────
  const [profileRes, ordersRes] = await Promise.all([
    supabase
      .from('users')
      .select('email, skin_type, concerns')
      .eq('id', user.id)
      .single(),
    supabase
      .from('orders')
      .select(
        'id, order_number, status, total, created_at, order_items(variant_id, product_name, variant_sku, quantity, unit_price)',
      )
      .order('created_at', { ascending: false }),
  ])

  const profile = profileRes.data as
    | { email: string | null; skin_type: SkinType | null; concerns: string[] }
    | null
  const ordersRaw = (ordersRes.data ?? []) as OrderRow[]

  // ── Fetch live variants for reorder (only active ones are visible via RLS) ─
  const variantIds = Array.from(
    new Set(
      ordersRaw
        .flatMap((o) => o.order_items.map((i) => i.variant_id))
        .filter((id): id is string => id !== null),
    ),
  )

  let variantMap = new Map<string, VariantDetail>()
  if (variantIds.length > 0) {
    const { data: variants } = await supabase
      .from('product_variants')
      .select('id, size_ml, price, sku, is_active, products(id, name, slug, image_url)')
      .in('id', variantIds)

    variantMap = new Map(
      ((variants ?? []) as unknown as VariantDetail[]).map((v) => [v.id, v]),
    )
  }

  // ── Restock reminder: most recent order in the 40–180 day window ─────────
  const restockOrder = ordersRaw.find((o) => {
    const age = daysSince(o.created_at)
    return age >= RESTOCK_MIN_DAYS && age <= RESTOCK_MAX_DAYS
  })
  const restockItems = restockOrder
    ? buildCartItemsForOrder(restockOrder, variantMap)
    : []
  const restockPrimary = restockItems[0]

  const displayName =
    (user.user_metadata?.full_name as string | undefined) ||
    profile?.email ||
    user.email ||
    'Your account'
  const displayEmail = profile?.email ?? user.email ?? ''
  const initials = getInitialsFromEmail(displayEmail)

  const skinType = (profile?.skin_type ?? null) as Exclude<SkinType, 'all'> | null
  const concerns = (profile?.concerns ?? []) as Concern[]

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex min-h-[500px] border border-gray-100 rounded-sm bg-white">
        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <aside
          aria-label="Account navigation"
          data-testid="account-sidebar"
          className="w-[200px] flex-shrink-0 border-r border-gray-100 bg-offwhite p-4"
        >
          <div className="mb-6">
            <div
              aria-hidden="true"
              className="w-9 h-9 rounded-full bg-gray-900 text-white font-mono text-xs flex items-center justify-center mb-2"
            >
              {initials}
            </div>
            <p className="font-body text-sm font-medium text-gray-900 truncate" data-testid="account-name">
              {displayName}
            </p>
            <p className="font-mono text-2xs text-gray-400 truncate" data-testid="account-email">
              {displayEmail}
            </p>
          </div>

          <nav className="flex flex-col gap-1" aria-label="Account sections">
            <span
              aria-current="page"
              className="font-body text-sm font-medium text-gray-900 bg-white border border-gray-100 rounded-sm px-3 py-2"
            >
              Orders
            </span>
            <Link
              href="/support/new"
              className="font-body text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
            >
              Support
            </Link>
            <hr className="border-gray-100 my-2" />
            <SignOutButton />
          </nav>
        </aside>

        {/* ── Content ─────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 p-6">
          {/* Order history */}
          <section aria-labelledby="order-history-heading" data-testid="order-history" className="mb-10">
            <div className="flex items-baseline justify-between mb-4">
              <h1 id="order-history-heading" className="font-heading text-lg text-gray-900">
                Order history
              </h1>
              <span className="font-mono text-2xs uppercase tracking-widest text-gray-400">
                {ordersRaw.length} {ordersRaw.length === 1 ? 'order' : 'orders'}
              </span>
            </div>

            {ordersRaw.length === 0 ? (
              <div
                data-testid="orders-empty"
                className="border border-dashed border-gray-200 rounded-sm p-6 text-center"
              >
                <p className="font-body text-sm text-gray-600 mb-3">
                  No orders yet. When you place one, it&apos;ll appear here.
                </p>
                <Link
                  href="/products"
                  className="font-mono text-2xs uppercase tracking-wider text-gray-900 underline hover:text-gray-600"
                >
                  Shop now →
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {ordersRaw.map((order) => {
                  const cartItems = buildCartItemsForOrder(order, variantMap)
                  return (
                    <li
                      key={order.id}
                      data-testid="order-row"
                      className="flex flex-wrap items-center gap-4 py-4"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-2xs uppercase tracking-widest text-gray-400">
                          {order.order_number}
                        </p>
                        <p className="font-body text-sm font-medium text-gray-900 truncate">
                          {summariseOrder(order.order_items)}
                        </p>
                        <p className="font-mono text-2xs text-gray-400">
                          {formatDate(order.created_at)} · {fmt(order.total)}
                        </p>
                      </div>

                      <StatusBadge status={order.status} />

                      <ReorderButton
                        items={cartItems}
                        data-testid="order-reorder"
                      />

                      <Link
                        href={`/order/${order.id}`}
                        data-testid="order-view"
                        className="font-mono text-2xs uppercase tracking-wider text-gray-400 hover:text-gray-900 transition-colors"
                      >
                        View →
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {/* Restock reminder */}
          {restockOrder && restockPrimary && (
            <section
              data-testid="restock-reminder"
              className="bg-offwhite border-l-2 border-gray-900 p-4 mb-10"
            >
              <p className="font-mono text-2xs uppercase tracking-widest text-gray-400 mb-2">
                Running low?
              </p>
              <p className="font-body text-sm text-gray-600 mb-3">
                Your {restockPrimary.productName} ({restockPrimary.size_ml}ml) typically lasts
                about 45 days. You ordered {daysSince(restockOrder.created_at)} days ago.
              </p>
              <ReorderButton
                items={[{ ...restockPrimary, quantity: 1 }]}
                variant="primary"
                label={`Reorder now — ${fmt(restockPrimary.price)}`}
                data-testid="restock-reorder"
              />
            </section>
          )}

          {/* Skin profile */}
          <SkinProfileForm skinType={skinType} concerns={concerns} />
        </div>
      </div>
    </div>
  )
}
