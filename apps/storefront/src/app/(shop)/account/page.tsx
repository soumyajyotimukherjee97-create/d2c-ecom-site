import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatInr } from '@/lib/money'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { SignOutButton } from '@/components/account/SignOutButton'
import { ReorderButton } from '@/components/account/ReorderButton'
import { SkinProfileForm } from '@/components/account/SkinProfileForm'
import type { CartItem } from '@/lib/store/cart'
import type { Concern, OrderStatus, SkinType } from '@/types'

export const dynamic = 'force-dynamic'

const RESTOCK_MIN_DAYS = 40
const RESTOCK_MAX_DAYS = 180
// Heuristic: a 30ml serum typically lasts ~42 days (per wireframe copy).
const RESTOCK_TYPICAL_DAYS = 42

// ─── Types ───────────────────────────────────────────────────────────────────

type OrderRow = {
  id:            string
  order_number:  string
  status:        OrderStatus
  total:         number
  created_at:    string
  order_items: Array<{
    variant_id:   string | null
    product_name: string
    variant_sku:  string
    quantity:     number
    unit_price:   number
  }>
}

type VariantDetail = {
  id:        string
  size_ml:   number
  price:     number
  sku:       string
  is_active: boolean
  products: {
    id:        string
    name:      string
    slug:      string
    image_url: string | null
  } | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTH_ABBR = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

function formatShortDate(iso: string): string {
  const d = new Date(iso)
  const dd = String(d.getUTCDate()).padStart(2, '0')
  return `${dd} ${MONTH_ABBR[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

function formatMonthYear(iso: string): string {
  const d = new Date(iso)
  return `${MONTH_ABBR[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso)
  d.setUTCDate(d.getUTCDate() + days)
  return formatShortDate(d.toISOString())
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

function getDisplayName(fullName: string | null, email: string | null): string {
  if (fullName) return fullName.trim().split(/\s+/)[0] ?? fullName
  if (email) {
    const local = email.split('@')[0] ?? ''
    return local.charAt(0).toUpperCase() + local.slice(1)
  }
  return 'there'
}

function greetingNow(): string {
  const h = new Date().getUTCHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

/** Subject ID: initials + last 4 chars of user uuid (stable, unique per account). */
function subjectId(initials: string, userId: string): string {
  const tail = userId.replace(/[^a-z0-9]/gi, '').slice(-4).toUpperCase() || '0000'
  return `${initials}-${tail}`
}

function summariseOrder(items: OrderRow['order_items']): string {
  if (items.length === 0) return '—'
  if (items.length === 1) return items[0]!.product_name
  if (items.length === 2) return `${items[0]!.product_name}, ${items[1]!.product_name}`
  return `${items[0]!.product_name}, +${items.length - 1} more`
}

function buildCartItemsForOrder(
  order:       OrderRow,
  variantMap:  Map<string, VariantDetail>,
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

  // ── Subject metadata ─────────────────────────────────────────────────────
  const fullName     = (user.user_metadata?.full_name as string | undefined) ?? null
  const displayEmail = profile?.email ?? user.email ?? ''
  const initials     = getInitialsFromEmail(displayEmail)
  const subject      = subjectId(initials, user.id)
  const greeting     = greetingNow()
  const firstName    = getDisplayName(fullName, displayEmail)
  const memberSince  = formatMonthYear(user.created_at ?? new Date().toISOString())
  const lifetimeTotal = ordersRaw.reduce((sum, o) => sum + o.total, 0)

  const skinType = (profile?.skin_type ?? null) as Exclude<SkinType, 'all'> | null
  const concerns = (profile?.concerns ?? []) as Concern[]

  return (
    <>
      {/* ── Page header ────────────────────────────────────────────────── */}
      <section
        aria-label="Account overview"
        data-testid="account-header"
        className="bg-paper-2 border-b border-hairline"
      >
        <div className="max-w-container mx-auto px-8 pt-12 pb-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p
                data-testid="account-subject-id"
                className="font-mono text-[10px] tracking-ultra uppercase text-graphite"
              >
                § Your dossier · Subject {subject}
              </p>
              <h1
                data-testid="account-greeting"
                className="font-display font-normal text-[clamp(40px,5vw,80px)] leading-[1.02] tracking-tightest mt-3.5"
              >
                {greeting}, <em className="italic">{firstName}</em>.
              </h1>
            </div>
            <p
              data-testid="account-member-since"
              className="font-mono text-[10px] tracking-widest uppercase text-graphite whitespace-nowrap"
            >
              Member since · {memberSince}
            </p>
          </div>
        </div>
      </section>

      {/* ── Two-col layout ─────────────────────────────────────────────── */}
      <div className="bg-paper border-b border-hairline">
        <div className="max-w-container mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">

            {/* ─── LEFT SIDEBAR ───────────────────────────────────────── */}
            <aside
              aria-label="Account navigation"
              data-testid="account-sidebar"
              className="md:border-r border-hairline py-8 md:pr-6 md:min-h-[600px] flex flex-col"
            >
              {/* Subject card */}
              <div
                data-testid="account-subject-card"
                className="bg-paper-2 border border-hairline p-5"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    aria-hidden="true"
                    className="w-12 h-12 bg-paper-3 border border-hairline inline-flex items-center justify-center font-display text-lg text-ink"
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p
                      data-testid="account-name"
                      className="font-body text-sm text-ink truncate"
                    >
                      {fullName ?? firstName}
                    </p>
                    <p
                      data-testid="account-email"
                      className="font-mono text-[10px] text-graphite truncate mt-0.5"
                    >
                      {displayEmail}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section nav */}
              <nav
                aria-label="Account sections"
                data-testid="account-nav"
                className="mt-7 border-t border-hairline/60"
              >
                <span
                  aria-current="page"
                  data-testid="nav-orders"
                  className="flex items-center py-3.5 pl-3.5 border-b border-hairline/60 border-l-[3px] border-l-ink font-mono text-[10px] tracking-widest uppercase text-ink"
                >
                  01 · Orders{' '}
                  <span className="text-graphite ml-2">({ordersRaw.length})</span>
                </span>
                <Link
                  href="#skin-profile"
                  data-testid="nav-skin-profile"
                  className="flex items-center py-3.5 px-4 border-b border-hairline/60 font-mono text-[10px] tracking-widest uppercase text-graphite hover:text-ink transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
                >
                  02 · Skin profile
                </Link>
                <Link
                  href="/support/new"
                  data-testid="nav-support"
                  className="flex items-center py-3.5 px-4 border-b border-hairline/60 font-mono text-[10px] tracking-widest uppercase text-graphite hover:text-ink transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
                >
                  03 · Support
                </Link>
              </nav>

              {/* Spacer + sign-out */}
              <div className="flex-1 min-h-4" />
              <div className="pt-3 mt-6 border-t border-hairline/60">
                <SignOutButton />
              </div>
            </aside>

            {/* ─── RIGHT CONTENT PANEL ────────────────────────────────── */}
            <div className="md:pl-8 py-10 min-w-0">

              {/* Orders section */}
              <section
                aria-labelledby="orders-heading"
                data-testid="order-history"
                className="mb-10"
              >
                <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
                  <div>
                    <p className="font-mono text-[10px] tracking-ultra uppercase text-graphite">
                      § 01 — Orders
                    </p>
                    <h2
                      id="orders-heading"
                      className="font-display text-[clamp(28px,3.2vw,40px)] text-ink mt-2"
                    >
                      Your consignments.
                    </h2>
                  </div>
                  <p
                    data-testid="orders-summary"
                    className="font-mono text-[10px] tracking-widest uppercase text-graphite whitespace-nowrap"
                  >
                    {ordersRaw.length} {ordersRaw.length === 1 ? 'order' : 'orders'}
                    {ordersRaw.length > 0 && (
                      <> · {formatInr(lifetimeTotal)} lifetime</>
                    )}
                  </p>
                </div>

                {ordersRaw.length === 0 ? (
                  <div
                    data-testid="orders-empty"
                    className="border border-hairline bg-paper px-6 py-14 text-center"
                  >
                    <p className="font-mono text-xs tracking-widest uppercase text-graphite">
                      — No consignments yet.
                    </p>
                    <p className="font-body text-sm text-ink-2 mt-3 max-w-[320px] mx-auto">
                      When you place an order, it will appear here.
                    </p>
                    <Link
                      href="/products"
                      className="inline-block mt-6 font-mono text-[11px] tracking-widest uppercase text-ink border-b border-ink pb-0.5 hover:text-graphite hover:border-graphite transition-colors"
                    >
                      Browse the formulary →
                    </Link>
                  </div>
                ) : (
                  <div data-testid="orders-table" className="border-t border-ink">
                    {/* Header row */}
                    <div
                      aria-hidden="true"
                      className="grid grid-cols-[140px_1fr_140px_120px_120px_80px] gap-3 py-3 border-b border-hairline font-mono text-[9px] tracking-widest uppercase text-graphite"
                    >
                      <span>Order ID</span>
                      <span>Formulas</span>
                      <span>Status</span>
                      <span>Dispatched</span>
                      <span className="text-right">Total</span>
                      <span />
                    </div>

                    {/* Rows */}
                    <ul>
                      {ordersRaw.map((order) => {
                        const cartItems = buildCartItemsForOrder(order, variantMap)
                        return (
                          <li
                            key={order.id}
                            data-testid="order-row"
                            className="grid grid-cols-[140px_1fr_140px_120px_120px_80px] gap-3 py-5 border-b border-hairline/60 items-baseline"
                          >
                            <span className="font-mono text-xs text-ink tabular-nums truncate">
                              {order.order_number}
                            </span>
                            <div className="min-w-0">
                              <p className="font-body text-[13px] text-ink truncate">
                                {summariseOrder(order.order_items)}
                              </p>
                              <p className="font-mono text-[10px] tracking-widest uppercase text-graphite mt-1">
                                {order.order_items.reduce((s, i) => s + i.quantity, 0)}{' '}
                                {order.order_items.reduce((s, i) => s + i.quantity, 0) === 1 ? 'item' : 'items'}
                              </p>
                            </div>
                            <StatusBadge status={order.status} />
                            <span className="font-mono text-[11px] text-ink tabular-nums">
                              {formatShortDate(order.created_at)}
                            </span>
                            <span className="font-mono text-[13px] text-ink text-right tabular-nums">
                              {formatInr(order.total)}
                            </span>
                            <div className="flex items-center gap-3 justify-end">
                              {cartItems.length > 0 && (
                                <ReorderButton
                                  items={cartItems}
                                  label="Reorder"
                                  data-testid="order-reorder"
                                  className="hidden lg:inline-flex"
                                />
                              )}
                              <Link
                                href={`/order/${order.id}`}
                                data-testid="order-view"
                                className="font-mono text-[10px] tracking-widest uppercase text-graphite hover:text-ink transition-colors"
                              >
                                View →
                              </Link>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </section>

              {/* Restock reminder */}
              {restockOrder && restockPrimary && (
                <section
                  data-testid="restock-reminder"
                  className="bg-paper-2 border border-hairline px-6 py-6 mb-12"
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[10px] tracking-ultra uppercase text-graphite">
                        § Restock reminder
                      </p>
                      <p className="font-display text-xl md:text-2xl text-ink mt-2 leading-[1.2]">
                        You typically finish a {restockPrimary.size_ml}ml {restockPrimary.productName.toLowerCase()} in {RESTOCK_TYPICAL_DAYS} days.
                      </p>
                      <p className="font-body text-[13px] text-ink-2 mt-2">
                        Last ordered {formatShortDate(restockOrder.created_at)}. Estimated empty around {addDays(restockOrder.created_at, RESTOCK_TYPICAL_DAYS)}.
                      </p>
                    </div>
                    <ReorderButton
                      items={[{ ...restockPrimary, quantity: 1 }]}
                      variant="primary"
                      label={`Reorder now · ${formatInr(restockPrimary.price)}`}
                      data-testid="restock-reorder"
                    />
                  </div>
                </section>
              )}

              {/* Skin profile */}
              <div id="skin-profile">
                <SkinProfileForm skinType={skinType} concerns={concerns} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
