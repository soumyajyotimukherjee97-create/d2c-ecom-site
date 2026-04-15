'use server'

import { revalidatePath } from 'next/cache'
import { sendTicketResolved } from '@d2c/email'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/actions/auth-guard'
import { UpdateTicketSchema, type UpdateTicketInput } from '@/lib/api/schemas/support'

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'INTERNAL'; message: string; fieldErrors?: Record<string, string[]> }

export async function updateTicketAction(
  id:    string,
  input: UpdateTicketInput,
): Promise<ActionResult> {
  await requireStaff()

  const parsed = UpdateTicketSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok:          false,
      code:        'VALIDATION_ERROR',
      message:     'Please fix the highlighted fields.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const payload: Record<string, string | null> = {}
  if (parsed.data.status      !== undefined) payload.status      = parsed.data.status
  if (parsed.data.priority    !== undefined) payload.priority    = parsed.data.priority
  if (parsed.data.assigned_to !== undefined) payload.assigned_to = parsed.data.assigned_to
  if (parsed.data.notes       !== undefined) payload.notes       = parsed.data.notes

  // Stamp resolved_at when moving to resolved, clear it if reopening to a
  // non-terminal state. 'closed' is a human dismissal — keep the last resolved_at.
  if (parsed.data.status === 'resolved') {
    payload.resolved_at = new Date().toISOString()
  } else if (parsed.data.status && parsed.data.status !== 'closed') {
    payload.resolved_at = null
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('support_tickets')
    .update(payload)
    .eq('id', id)
    .select('id, subject, status, guest_email, user_id')
    .maybeSingle()

  if (error) {
    console.error('[updateTicketAction]', error.message)
    return { ok: false, code: 'INTERNAL', message: 'Failed to update ticket.' }
  }
  if (!data) return { ok: false, code: 'NOT_FOUND', message: 'Ticket not found.' }

  // Fire ticket-resolved email once, at the transition to "resolved" only.
  if (parsed.data.status === 'resolved') {
    const row = data as {
      id:          string
      subject:     string
      guest_email: string | null
      user_id:     string | null
    }
    const recipient = row.guest_email ?? (row.user_id ? await lookupUserEmail(admin, row.user_id) : null)
    if (recipient) {
      void sendTicketResolved(recipient, {
        ticket_id: row.id,
        subject:   row.subject,
        resolution_summary: parsed.data.notes ?? undefined,
      })
    }
  }

  revalidatePath('/support')
  revalidatePath(`/support/${id}`)
  return { ok: true, data: undefined }
}

async function lookupUserEmail(admin: ReturnType<typeof createAdminClient>, userId: string): Promise<string | null> {
  const { data, error } = await admin.auth.admin.getUserById(userId)
  if (error) {
    console.error('[updateTicketAction] lookup user', error.message)
    return null
  }
  return data.user?.email ?? null
}

/** Assign the ticket to the currently signed-in staff user. */
export async function assignToMeAction(id: string): Promise<ActionResult> {
  await requireStaff()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, code: 'INTERNAL', message: 'No session.' }

  return updateTicketAction(id, { assigned_to: user.id })
}

/** Clear the current assignee. */
export async function unassignAction(id: string): Promise<ActionResult> {
  await requireStaff()
  return updateTicketAction(id, { assigned_to: null })
}
