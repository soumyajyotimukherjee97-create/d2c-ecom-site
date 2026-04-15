import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isServiceRole } from '@/lib/api/auth'
import { Errors } from '@/lib/api/errors'
import { CreateTicketSchema, ListTicketsSchema } from '@/lib/api/schemas/support'

// ─── POST /api/support ────────────────────────────────────────────────────────
// Public — authenticated customer OR guest with email.
// Never trust client-supplied user_id; derive from session.

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Errors.validation({ _: ['Invalid JSON body.'] })
  }

  const parsed = CreateTicketSchema.safeParse(body)
  if (!parsed.success) {
    return Errors.validation(parsed.error.flatten().fieldErrors)
  }

  const { order_id, guest_email, subject, body: messageBody } = parsed.data

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Identity rule: either a session user or a guest_email — never both trusted from client.
  if (!user && !guest_email) {
    return Errors.validation({ guest_email: ['Email is required for guest submissions.'] })
  }

  // If an order_id is provided, verify the caller can actually see that order.
  // RLS on `orders` restricts SELECT to own orders; a guest cannot reference an order.
  if (order_id) {
    if (!user) {
      return Errors.validation({ order_id: ['Sign in to link a support ticket to an order.'] })
    }
    const { data: owned, error: ownedError } = await supabase
      .from('orders')
      .select('id')
      .eq('id', order_id)
      .maybeSingle()
    if (ownedError) {
      console.error('[POST /api/support] order lookup', ownedError.message)
      return Errors.internal()
    }
    if (!owned) {
      return Errors.notFound('Order')
    }
  }

  // Admin client for INSERT — the SSR-client Insert generic degrades to `never`.
  // RLS allows inserts from anon/auth, but the generics don't round-trip; admin
  // keeps the write typed. All trusted identity fields are derived server-side.
  const admin = createAdminClient()
  const { data: ticket, error } = await admin
    .from('support_tickets')
    .insert({
      order_id:    order_id ?? null,
      user_id:     user?.id ?? null,
      guest_email: user ? null : guest_email ?? null,
      subject,
      body:        messageBody,
    })
    .select('id, status, created_at')
    .single()

  if (error || !ticket) {
    console.error('[POST /api/support] insert', error?.message)
    return Errors.internal()
  }

  return NextResponse.json(
    {
      id:         ticket.id,
      status:     ticket.status,
      created_at: ticket.created_at,
    },
    { status: 201 },
  )
}

// ─── GET /api/support ─────────────────────────────────────────────────────────
// Internal platform only — requires the service-role bearer token.

export async function GET(request: NextRequest) {
  if (!isServiceRole(request)) {
    return Errors.forbidden()
  }

  const { searchParams } = new URL(request.url)
  const parsed = ListTicketsSchema.safeParse(Object.fromEntries(searchParams.entries()))
  if (!parsed.success) {
    return Errors.validation(parsed.error.flatten().fieldErrors)
  }

  const { status, priority, limit, offset } = parsed.data

  const admin = createAdminClient()
  let query = admin
    .from('support_tickets')
    .select(
      'id, order_id, user_id, guest_email, subject, status, priority, assigned_to, created_at',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status)   query = query.eq('status', status)
  if (priority) query = query.eq('priority', priority)

  const { data, error, count } = await query

  if (error) {
    console.error('[GET /api/support]', error.message)
    return Errors.internal()
  }

  return NextResponse.json({
    data:  data ?? [],
    total: count ?? 0,
    limit,
    offset,
  })
}
