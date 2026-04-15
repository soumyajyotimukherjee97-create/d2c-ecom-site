import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ConsoleHeader } from '@/components/ConsoleHeader'
import { OrderStatusBadge } from '@/components/OrderStatusBadge'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatInr } from '@/lib/money'
import type { OrderStatus } from '@/lib/api/schemas/orders'
import { StatusTransitionForm } from './StatusTransitionForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Order · Internal',
}

interface Address {
  line1: string
  line2: string | null
  city:  string
  state: string
  pin:   string
  country: string
}

interface OrderDetail {
  id:               string
  order_number:     string
  status:           OrderStatus
  user_id:          string | null
  guest_email:      string | null
  subtotal:         number
  shipping_total:   number
  total:            number
  shipping_address: Address
  contact_email:    string
  contact_phone:    string | null
  tracking_id:      string | null
  carrier:          string | null
  notes:            string | null
  created_at:       string
  updated_at:       string
  order_items: {
    id:           string
    product_name: string
    variant_sku:  string
    quantity:     number
    unit_price:   number
    line_total:   number
  }[]
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('orders')
    .select(
      `id, order_number, status, user_id, guest_email, subtotal, shipping_total, total,
       shipping_address, contact_email, contact_phone, tracking_id, carrier, notes,
       created_at, updated_at,
       order_items(id, product_name, variant_sku, quantity, unit_price, line_total)`,
    )
    .eq('id', id)
    .maybeSingle()

  if (error) console.error('[OrderDetailPage]', error.message)
  if (!data) notFound()

  const order = data as unknown as OrderDetail
  const isGuest = order.user_id === null

  return (
    <main className="min-h-screen bg-offwhite">
      <ConsoleHeader />
      <section className="max-w-5xl mx-auto px-6 py-12">
        <Link href="/orders" className="font-mono text-2xs uppercase tracking-wider text-gray-600 hover:text-gray-900">
          ← Back to orders
        </Link>

        <div className="flex items-end justify-between mt-2 mb-8">
          <div>
            <h1 className="font-mono text-xl text-gray-900 mb-1">{order.order_number}</h1>
            <p className="font-body text-sm text-gray-600">
              Placed {new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} ·
              last updated {new Date(order.updated_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Panel title="Items">
              <table className="w-full" data-testid="order-items">
                <thead>
                  <tr className="border-b border-gray-200">
                    <Th>Product</Th>
                    <Th>SKU</Th>
                    <Th className="text-right">Qty</Th>
                    <Th className="text-right">Unit</Th>
                    <Th className="text-right pr-0">Line total</Th>
                  </tr>
                </thead>
                <tbody>
                  {order.order_items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 last:border-0">
                      <Td>{item.product_name}</Td>
                      <Td className="font-mono text-2xs">{item.variant_sku}</Td>
                      <Td className="text-right">{item.quantity}</Td>
                      <Td className="text-right">{formatInr(item.unit_price)}</Td>
                      <Td className="text-right pr-0">{formatInr(item.line_total)}</Td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200">
                    <Td colSpan={4} className="text-right font-mono text-2xs uppercase tracking-wider text-gray-600">
                      Subtotal
                    </Td>
                    <Td className="text-right pr-0">{formatInr(order.subtotal)}</Td>
                  </tr>
                  <tr>
                    <Td colSpan={4} className="text-right font-mono text-2xs uppercase tracking-wider text-gray-600">
                      Shipping
                    </Td>
                    <Td className="text-right pr-0">{formatInr(order.shipping_total)}</Td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <Td colSpan={4} className="text-right font-heading text-lg text-gray-900">
                      Total
                    </Td>
                    <Td className="text-right pr-0 font-heading text-lg text-gray-900">
                      {formatInr(order.total)}
                    </Td>
                  </tr>
                </tfoot>
              </table>
            </Panel>

            <Panel title="Update status">
              <StatusTransitionForm
                orderId={order.id}
                currentStatus={order.status}
                currentTrackingId={order.tracking_id ?? ''}
                currentCarrier={order.carrier ?? ''}
                currentNotes={order.notes ?? ''}
              />
            </Panel>
          </div>

          {/* Side column */}
          <div className="flex flex-col gap-6">
            <Panel title="Customer">
              <dl className="font-body text-sm text-gray-900 space-y-1">
                <Row label="Type" value={isGuest ? 'Guest' : 'Registered'} />
                <Row label="Email" value={order.contact_email} />
                {order.contact_phone && <Row label="Phone" value={order.contact_phone} />}
              </dl>
            </Panel>

            <Panel title="Shipping address">
              <address className="not-italic font-body text-sm text-gray-900 space-y-0.5">
                <div>{order.shipping_address.line1}</div>
                {order.shipping_address.line2 && <div>{order.shipping_address.line2}</div>}
                <div>
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pin}
                </div>
                <div>{order.shipping_address.country}</div>
              </address>
            </Panel>

            <Panel title="Fulfilment">
              <dl className="font-body text-sm text-gray-900 space-y-1" data-testid="order-fulfilment">
                <Row label="Carrier"     value={order.carrier ?? '—'} />
                <Row label="Tracking ID" value={order.tracking_id ?? '—'} />
                <Row label="Notes"       value={order.notes ?? '—'} />
              </dl>
            </Panel>
          </div>
        </div>
      </section>
    </main>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-gray-200 rounded-sm bg-white p-6">
      <h2 className="font-heading text-xl text-gray-900 mb-4">{title}</h2>
      {children}
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="font-mono text-2xs uppercase tracking-wider text-gray-400 w-24 shrink-0 pt-0.5">
        {label}
      </dt>
      <dd className="flex-1 break-all">{value}</dd>
    </div>
  )
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`text-left px-0 py-2 font-mono text-2xs uppercase tracking-wider text-gray-600 ${className}`}>
      {children}
    </th>
  )
}

function Td({
  children,
  className = '',
  colSpan,
}: {
  children:  React.ReactNode
  className?: string
  colSpan?:  number
}) {
  return (
    <td colSpan={colSpan} className={`px-0 py-2 font-body text-sm text-gray-900 ${className}`}>
      {children}
    </td>
  )
}
