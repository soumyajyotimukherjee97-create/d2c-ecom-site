import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ConsoleHeader } from '@/components/ConsoleHeader'
import { TicketStatusBadge, TicketPriorityBadge } from '@/components/TicketBadges'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { TicketStatus, TicketPriority } from '@/lib/api/schemas/support'
import { TicketUpdateForm } from './TicketUpdateForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Ticket · Internal',
}

interface TicketDetail {
  id:          string
  subject:     string
  body:        string
  status:      TicketStatus
  priority:    TicketPriority
  user_id:     string | null
  guest_email: string | null
  order_id:    string | null
  assigned_to: string | null
  notes:       string | null
  resolved_at: string | null
  created_at:  string
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('support_tickets')
    .select('id, subject, body, status, priority, user_id, guest_email, order_id, assigned_to, notes, resolved_at, created_at')
    .eq('id', id)
    .maybeSingle()

  if (error) console.error('[TicketDetailPage]', error.message)
  if (!data) notFound()

  const ticket = data as TicketDetail

  // Resolve a linked order (order_number) and the currently signed-in staff
  // user id in parallel; both are cheap one-shot reads.
  const [orderRes, meRes] = await Promise.all([
    ticket.order_id
      ? admin.from('orders').select('order_number').eq('id', ticket.order_id).maybeSingle()
      : Promise.resolve({ data: null }),
    (async () => {
      const client = await createClient()
      return client.auth.getUser()
    })(),
  ])

  const linkedOrderNumber = orderRes.data?.order_number ?? null
  const myId = meRes.data.user?.id ?? null
  const assignedToMe = ticket.assigned_to !== null && ticket.assigned_to === myId

  return (
    <main className="min-h-screen bg-offwhite">
      <ConsoleHeader />
      <section className="max-w-5xl mx-auto px-6 py-12">
        <Link href="/support" className="font-mono text-2xs uppercase tracking-wider text-gray-600 hover:text-gray-900">
          ← Back to tickets
        </Link>

        <div className="flex items-start justify-between mt-2 mb-8 gap-6">
          <div>
            <p className="font-mono text-2xs uppercase tracking-wider text-gray-400 mb-1">
              Ticket #{ticket.id.slice(0, 8)}
            </p>
            <h1 className="font-heading text-3xl text-gray-900 mb-1">{ticket.subject}</h1>
            <p className="font-body text-sm text-gray-600">
              Opened {new Date(ticket.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              {ticket.resolved_at && (
                <>
                  {' · resolved '}
                  {new Date(ticket.resolved_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </>
              )}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Panel title="Message">
              <p
                className="font-body text-base text-gray-900 whitespace-pre-wrap"
                data-testid="ticket-body"
              >
                {ticket.body}
              </p>
            </Panel>

            <Panel title="Update ticket">
              <TicketUpdateForm
                ticketId={ticket.id}
                currentStatus={ticket.status}
                currentPriority={ticket.priority}
                currentNotes={ticket.notes ?? ''}
                assignedToMe={assignedToMe}
                assignedTo={ticket.assigned_to}
              />
            </Panel>
          </div>

          {/* Side column */}
          <div className="flex flex-col gap-6">
            <Panel title="From">
              <dl className="font-body text-sm text-gray-900 space-y-1">
                <Row label="Type" value={ticket.user_id ? 'Registered' : 'Guest'} />
                <Row label="Email" value={ticket.guest_email ?? '—'} />
                {ticket.user_id && (
                  <Row label="User ID" value={ticket.user_id.slice(0, 8) + '…'} />
                )}
              </dl>
            </Panel>

            <Panel title="Linked order">
              {linkedOrderNumber ? (
                <Link
                  href={`/orders/${ticket.order_id}`}
                  className="font-mono text-sm text-gray-900 underline hover:no-underline"
                  data-testid="ticket-linked-order"
                >
                  {linkedOrderNumber}
                </Link>
              ) : (
                <p className="font-mono text-2xs uppercase tracking-wider text-gray-400">
                  None
                </p>
              )}
            </Panel>

            <Panel title="Assignment">
              <dl className="font-body text-sm text-gray-900 space-y-1" data-testid="ticket-assignment">
                <Row
                  label="Current"
                  value={
                    ticket.assigned_to
                      ? assignedToMe
                        ? 'You'
                        : ticket.assigned_to.slice(0, 8) + '…'
                      : 'Unassigned'
                  }
                />
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
