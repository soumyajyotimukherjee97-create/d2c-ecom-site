import type { Metadata } from 'next'
import Link from 'next/link'
import { ConsoleHeader } from '@/components/ConsoleHeader'
import { TicketStatusBadge, TicketPriorityBadge } from '@/components/TicketBadges'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  ListTicketsQuerySchema,
  PAGE_SIZE,
  type TicketStatus,
  type TicketPriority,
} from '@/lib/api/schemas/support'
import { SupportFilterBar } from './SupportFilterBar'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Support · Internal',
}

interface TicketRow {
  id:          string
  subject:     string
  status:      TicketStatus
  priority:    TicketPriority
  user_id:     string | null
  guest_email: string | null
  assigned_to: string | null
  created_at:  string
}

export default async function SupportListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw    = await searchParams
  const parsed = ListTicketsQuerySchema.safeParse(raw)
  const { q, status, priority, page } = parsed.success
    ? parsed.data
    : ListTicketsQuerySchema.parse({})

  const supabase = createAdminClient()

  let query = supabase
    .from('support_tickets')
    .select('id, subject, status, priority, user_id, guest_email, assigned_to, created_at', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  if (status)   query = query.eq('status', status)
  if (priority) query = query.eq('priority', priority)
  if (q)        query = query.or(`subject.ilike.%${q}%,guest_email.ilike.%${q}%`)

  const { data, count, error } = await query
  if (error) console.error('[SupportListPage]', error.message)

  const rows       = ((data ?? []) as unknown as TicketRow[])
  const total      = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <main className="min-h-screen bg-offwhite">
      <ConsoleHeader />
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="font-heading text-3xl text-gray-900 mb-1">Support</h1>
            <p className="font-body text-sm text-gray-600">
              {total} {total === 1 ? 'ticket' : 'tickets'} · page {page} of {totalPages}
            </p>
          </div>
        </div>

        <SupportFilterBar
          defaultQ={q ?? ''}
          defaultStatus={status ?? ''}
          defaultPriority={priority ?? ''}
        />

        {rows.length === 0 ? (
          <div className="border border-gray-200 rounded-sm bg-white p-12 text-center" data-testid="tickets-empty">
            <p className="font-body text-sm text-gray-600">No tickets match these filters.</p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-sm bg-white overflow-hidden">
            <table className="w-full" data-testid="tickets-table">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <Th>Ticket</Th>
                  <Th>Subject</Th>
                  <Th>Opened</Th>
                  <Th>From</Th>
                  <Th>Priority</Th>
                  <Th>Status</Th>
                  <Th>Assigned</Th>
                  <Th className="text-right pr-4">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id} className="border-b border-gray-100 last:border-0" data-testid={`ticket-row-${t.id.slice(0, 8)}`}>
                    <Td className="font-mono text-2xs">#{t.id.slice(0, 8)}</Td>
                    <Td className="max-w-xs truncate">{t.subject}</Td>
                    <Td>{new Date(t.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</Td>
                    <Td>{t.guest_email ?? (t.user_id ? 'Registered' : '—')}</Td>
                    <Td><TicketPriorityBadge priority={t.priority} /></Td>
                    <Td><TicketStatusBadge status={t.status} /></Td>
                    <Td>
                      {t.assigned_to
                        ? <span className="font-mono text-2xs">{t.assigned_to.slice(0, 8)}</span>
                        : <span className="font-mono text-2xs uppercase tracking-wider text-gray-400">Unassigned</span>}
                    </Td>
                    <Td className="text-right pr-4">
                      <Link
                        href={`/support/${t.id}`}
                        className="font-mono text-2xs uppercase tracking-wider text-gray-900 underline hover:no-underline"
                        data-testid={`ticket-detail-${t.id.slice(0, 8)}`}
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

        {totalPages > 1 && (
          <Pagination q={q} status={status} priority={priority} page={page} totalPages={totalPages} />
        )}
      </section>
    </main>
  )
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`text-left px-4 py-3 font-mono text-2xs uppercase tracking-wider text-gray-600 ${className}`}>
      {children}
    </th>
  )
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 font-body text-sm text-gray-900 ${className}`}>{children}</td>
}

function Pagination({
  q, status, priority, page, totalPages,
}: {
  q?:         string
  status?:    TicketStatus
  priority?:  TicketPriority
  page:       number
  totalPages: number
}) {
  const base = new URLSearchParams()
  if (q)        base.set('q', q)
  if (status)   base.set('status', status)
  if (priority) base.set('priority', priority)

  const hrefFor = (p: number) => {
    const qs = new URLSearchParams(base)
    if (p > 1) qs.set('page', String(p))
    const s = qs.toString()
    return `/support${s ? `?${s}` : ''}`
  }

  return (
    <div className="flex items-center justify-between mt-6" data-testid="tickets-pagination">
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
