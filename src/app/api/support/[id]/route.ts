import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isServiceRole } from '@/lib/api/auth'
import { Errors } from '@/lib/api/errors'
import { UpdateTicketSchema } from '@/lib/api/schemas/support'
import type { Database } from '@/lib/supabase/types'

type TicketUpdate = Database['public']['Tables']['support_tickets']['Update']

// ─── PATCH /api/support/[id] ──────────────────────────────────────────────────
// Internal platform only — staff updates ticket status/priority/assignment.

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isServiceRole(request)) {
    return Errors.forbidden()
  }

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Errors.validation({ _: ['Invalid JSON body.'] })
  }

  const parsed = UpdateTicketSchema.safeParse(body)
  if (!parsed.success) {
    return Errors.validation(parsed.error.flatten().fieldErrors)
  }

  const updatePayload: TicketUpdate = {}
  if (parsed.data.status      !== undefined) updatePayload.status      = parsed.data.status
  if (parsed.data.priority    !== undefined) updatePayload.priority    = parsed.data.priority
  if (parsed.data.assigned_to !== undefined) updatePayload.assigned_to = parsed.data.assigned_to
  if (parsed.data.notes       !== undefined) updatePayload.notes       = parsed.data.notes

  // resolved_at is a derived field — stamp it when a ticket transitions to resolved,
  // clear it if reopened.
  if (parsed.data.status === 'resolved') {
    updatePayload.resolved_at = new Date().toISOString()
  } else if (parsed.data.status && parsed.data.status !== 'closed') {
    updatePayload.resolved_at = null
  }

  const admin = createAdminClient()
  const { data: updated, error } = await admin
    .from('support_tickets')
    .update(updatePayload)
    .eq('id', id)
    .select('id, status, priority, assigned_to, notes, resolved_at')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return Errors.notFound('Ticket')
    }
    console.error('[PATCH /api/support/[id]]', error.message)
    return Errors.internal()
  }

  return NextResponse.json({
    id:          updated.id,
    status:      updated.status,
    priority:    updated.priority,
    assigned_to: updated.assigned_to,
    notes:       updated.notes,
    resolved_at: updated.resolved_at,
  })
}
