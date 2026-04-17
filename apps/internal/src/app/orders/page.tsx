import type { Metadata } from 'next'
import Link from 'next/link'
import { ConsoleHeader } from '@/components/ConsoleHeader'
import { OrderStatusBadge } from '@/components/OrderStatusBadge'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatInr } from '@/lib/money'
import { ListOrdersQuerySchema, PAGE_SIZE, type OrderStatus } from '@/lib/api/schemas/orders'
import { Th, Td } from '@/components/ui/Table'
import { OrdersFilterBar } from './OrdersFilterBar'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Orders · Internal',
}

interface OrderRow {
  id:            string
  order_number:  string
  status:        OrderStatus
  total:         number
  contact_email: string
  created_at:    string
  item_count:    number
}

export default async function OrdersListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw    = await searchParams
  const parsed = ListOrdersQuerySchema.safeParse(raw)
  const { q, status, page } = parsed.success
    ? parsed.data
    : ListOrdersQuerySchema.parse({})

  const supabase = createAdminClient()

  let query = supabase
    .from('orders')
    .select('id, order_number, status, total, contact_email, created_at', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  if (status) query = query.eq('status', status)
  if (q)      query = query.or(`order_number.ilike.%${q}%,contact_email.ilike.%${q}%`)

  const { data, count, error } = await query

  if (error) {
    console.error('[OrdersListPage]', error)
  }

  // Separate query for item counts — splits the PostgREST FK discovery issue.
  const orderIds = (data ?? []).map((o) => o.id)
  const itemCounts: Record<string, number> = {}
  if (orderIds.length > 0) {
    const { data: itemsData, error: itemsErr } = await supabase
      .from('order_items')
      .select('order_id')
      .in('order_id', orderIds)
    if (itemsErr) console.error('[OrdersListPage:items]', itemsErr)
    for (const row of itemsData ?? []) {
      itemCounts[row.order_id] = (itemCounts[row.order_id] ?? 0) + 1
    }
  }

  const rows: OrderRow[] = (data ?? []).map((o) => ({
    ...o,
    status: o.status as OrderStatus,
    item_count: itemCounts[o.id] ?? 0,
  }))
  const total      = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <main className="min-h-screen bg-offwhite">
      <ConsoleHeader />
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="font-heading text-3xl text-gray-900 mb-1">Orders</h1>
            <p className="font-body text-sm text-gray-600">
              {total} {total === 1 ? 'order' : 'orders'} · page {page} of {totalPages}
            </p>
          </div>
        </div>

        <OrdersFilterBar defaultQ={q ?? ''} defaultStatus={status ?? ''} />

        {error && (
          <div
            className="border border-error bg-red-50 rounded-sm p-4 mb-4 font-mono text-2xs text-error"
            data-testid="orders-db-error"
          >
            Failed to load orders. Check server logs for details.
          </div>
        )}

        {rows.length === 0 ? (
          <div className="border border-gray-200 rounded-sm bg-white p-12 text-center" data-testid="orders-empty">
            <p className="font-body text-sm text-gray-600">No orders match these filters.</p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-sm bg-white overflow-hidden">
            <table className="w-full" data-testid="orders-table">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <Th>Order</Th>
                  <Th>Placed</Th>
                  <Th>Customer</Th>
                  <Th>Items</Th>
                  <Th>Total</Th>
                  <Th>Status</Th>
                  <Th className="text-right pr-4">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <tr key={o.id} className="border-b border-gray-100 last:border-0" data-testid={`order-row-${o.order_number}`}>
                    <Td className="font-mono text-2xs">{o.order_number}</Td>
                    <Td>{new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Td>
                    <Td>{o.contact_email}</Td>
                    <Td>{o.item_count}</Td>
                    <Td>{formatInr(o.total)}</Td>
                    <Td><OrderStatusBadge status={o.status} /></Td>
                    <Td className="text-right pr-4">
                      <Link
                        href={`/orders/${o.id}`}
                        className="font-mono text-2xs uppercase tracking-wider text-gray-900 underline hover:no-underline"
                        data-testid={`order-detail-${o.order_number}`}
                      >
                        View
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && <Pagination q={q} status={status} page={page} totalPages={totalPages} />}
      </section>
    </main>
  )
}


function Pagination({
  q, status, page, totalPages,
}: {
  q?:         string
  status?:    OrderStatus
  page:       number
  totalPages: number
}) {
  const base = new URLSearchParams()
  if (q)      base.set('q', q)
  if (status) base.set('status', status)

  const hrefFor = (p: number) => {
    const qs = new URLSearchParams(base)
    if (p > 1) qs.set('page', String(p))
    const s = qs.toString()
    return `/orders${s ? `?${s}` : ''}`
  }

  return (
    <div className="flex items-center justify-between mt-6" data-testid="orders-pagination">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`font-mono text-2xs uppercase tracking-wider ${page === 1 ? 'text-gray-400 pointer-events-none' : 'text-gray-900 hover:underline'}`}
      >
        ← Previous
      </Link>
      <span className="font-mono text-2xs uppercase tracking-wider text-gray-600">
        {page} / {totalPages}
      </span>
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={`font-mono text-2xs uppercase tracking-wider ${page === totalPages ? 'text-gray-400 pointer-events-none' : 'text-gray-900 hover:underline'}`}
      >
        Next →
      </Link>
    </div>
  )
}
