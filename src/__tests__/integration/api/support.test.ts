/**
 * Integration tests for /api/support
 *
 * Prerequisites:
 *   supabase start && supabase db reset
 *
 * Run with:
 *   pnpm vitest run --config vitest.integration.config.ts
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { POST as createTicket, GET as listTickets } from '@/app/api/support/route'
import { PATCH as updateTicket } from '@/app/api/support/[id]/route'

// ─── Admin client (bypasses RLS for setup/teardown) ───────────────────────────

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
)

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

// ─── Helpers ──────────────────────────────────────────────────────────────────

function req(
  url: string,
  { method = 'GET', body, serviceRole = false }: {
    method?: string
    body?: unknown
    serviceRole?: boolean
  } = {},
): NextRequest {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (serviceRole) headers['Authorization'] = `Bearer ${SERVICE_KEY}`
  return new NextRequest(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
}

function params<T extends Record<string, string>>(p: T): { params: Promise<T> } {
  return { params: Promise.resolve(p) }
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const createdTicketIds: string[] = []

// ─── Teardown ─────────────────────────────────────────────────────────────────

afterAll(async () => {
  if (createdTicketIds.length > 0) {
    await supabase.from('support_tickets').delete().in('id', createdTicketIds)
  }
})

// ─── POST /api/support ───────────────────────────────────────────────────────

describe('POST /api/support', () => {
  it('creates a guest ticket and returns 201', async () => {
    const body = {
      guest_email: 'buyer@example.com',
      subject:     'My delivery is late',
      body:        'The tracking has not updated in a week.',
    }

    const res = await createTicket(req('http://localhost/api/support', { method: 'POST', body }))
    expect(res.status).toBe(201)

    const data = await res.json()
    expect(data.id).toBeDefined()
    expect(data.status).toBe('open')
    expect(data.created_at).toBeDefined()

    createdTicketIds.push(data.id)

    // Verify row in DB has the trusted values
    const { data: row } = await supabase
      .from('support_tickets')
      .select('user_id, guest_email, subject, status, priority')
      .eq('id', data.id)
      .single()
    expect(row?.user_id).toBeNull()
    expect(row?.guest_email).toBe('buyer@example.com')
    expect(row?.status).toBe('open')
    expect(row?.priority).toBe('normal')
  })

  it('trims subject and body before insert', async () => {
    const res = await createTicket(
      req('http://localhost/api/support', {
        method: 'POST',
        body: {
          guest_email: 'trim@example.com',
          subject: '   trimmed subject   ',
          body: '   trimmed body   ',
        },
      }),
    )
    expect(res.status).toBe(201)
    const data = await res.json()
    createdTicketIds.push(data.id)

    const { data: row } = await supabase
      .from('support_tickets')
      .select('subject, body')
      .eq('id', data.id)
      .single()
    expect(row?.subject).toBe('trimmed subject')
    expect(row?.body).toBe('trimmed body')
  })

  it('rejects a guest submission without guest_email (400)', async () => {
    const res = await createTicket(
      req('http://localhost/api/support', {
        method: 'POST',
        body: { subject: 'no email', body: 'anonymous' },
      }),
    )
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('rejects a guest submission with an order_id (400)', async () => {
    const res = await createTicket(
      req('http://localhost/api/support', {
        method: 'POST',
        body: {
          guest_email: 'guest@example.com',
          order_id: 'a0000000-0000-0000-0000-000000000001',
          subject: 'linked',
          body: 'cannot link',
        },
      }),
    )
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details?.order_id).toBeDefined()
  })

  it('rejects subject > 200 chars (400)', async () => {
    const res = await createTicket(
      req('http://localhost/api/support', {
        method: 'POST',
        body: {
          guest_email: 'buyer@example.com',
          subject: 'x'.repeat(201),
          body: 'something',
        },
      }),
    )
    expect(res.status).toBe(400)
  })

  it('rejects an invalid JSON body (400)', async () => {
    const res = await createTicket(
      new NextRequest('http://localhost/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not json',
      }),
    )
    expect(res.status).toBe(400)
  })
})

// ─── GET /api/support (internal) ──────────────────────────────────────────────

describe('GET /api/support', () => {
  it('returns 403 without the service-role bearer', async () => {
    const res = await listTickets(req('http://localhost/api/support'))
    expect(res.status).toBe(403)
  })

  it('returns tickets with service-role bearer', async () => {
    const res = await listTickets(
      req('http://localhost/api/support', { serviceRole: true }),
    )
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data.data)).toBe(true)
    expect(data.total).toBeGreaterThanOrEqual(createdTicketIds.length)
    expect(data.limit).toBe(50)
  })

  it('filters by status=open', async () => {
    const res = await listTickets(
      req('http://localhost/api/support?status=open', { serviceRole: true }),
    )
    expect(res.status).toBe(200)
    const data = await res.json()
    const nonOpen = data.data.filter(
      (t: { status: string }) => t.status !== 'open',
    )
    expect(nonOpen).toHaveLength(0)
  })

  it('rejects an unknown status (400)', async () => {
    const res = await listTickets(
      req('http://localhost/api/support?status=archived', { serviceRole: true }),
    )
    expect(res.status).toBe(400)
  })
})

// ─── PATCH /api/support/[id] (internal) ──────────────────────────────────────

describe('PATCH /api/support/[id]', () => {
  it('returns 403 without the service-role bearer', async () => {
    const id = createdTicketIds[0] ?? '00000000-0000-0000-0000-000000000000'
    const res = await updateTicket(
      req(`http://localhost/api/support/${id}`, {
        method: 'PATCH',
        body: { status: 'resolved' },
      }),
      params({ id }),
    )
    expect(res.status).toBe(403)
  })

  it('transitions a ticket to resolved and stamps resolved_at', async () => {
    const id = createdTicketIds[0]!
    const res = await updateTicket(
      req(`http://localhost/api/support/${id}`, {
        method: 'PATCH',
        serviceRole: true,
        body: { status: 'resolved', priority: 'high' },
      }),
      params({ id }),
    )
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.status).toBe('resolved')
    expect(data.priority).toBe('high')
    expect(data.resolved_at).not.toBeNull()
  })

  it('clears resolved_at when reopening to in_progress', async () => {
    const id = createdTicketIds[0]!
    const res = await updateTicket(
      req(`http://localhost/api/support/${id}`, {
        method: 'PATCH',
        serviceRole: true,
        body: { status: 'in_progress' },
      }),
      params({ id }),
    )
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.resolved_at).toBeNull()
  })

  it('persists notes on the ticket', async () => {
    const id = createdTicketIds[0]!
    const res = await updateTicket(
      req(`http://localhost/api/support/${id}`, {
        method: 'PATCH',
        serviceRole: true,
        body: { notes: 'Called the customer, awaiting photo of damage.' },
      }),
      params({ id }),
    )
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.notes).toBe('Called the customer, awaiting photo of damage.')

    const { data: row } = await supabase
      .from('support_tickets')
      .select('notes')
      .eq('id', id)
      .single()
    expect(row?.notes).toBe('Called the customer, awaiting photo of damage.')
  })

  it('rejects an empty payload (400)', async () => {
    const id = createdTicketIds[0]!
    const res = await updateTicket(
      req(`http://localhost/api/support/${id}`, {
        method: 'PATCH',
        serviceRole: true,
        body: {},
      }),
      params({ id }),
    )
    expect(res.status).toBe(400)
  })

  it('returns 404 for a non-existent ticket', async () => {
    const missing = '00000000-0000-0000-0000-000000000000'
    const res = await updateTicket(
      req(`http://localhost/api/support/${missing}`, {
        method: 'PATCH',
        serviceRole: true,
        body: { status: 'closed' },
      }),
      params({ id: missing }),
    )
    expect(res.status).toBe(404)
  })
})
