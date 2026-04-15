'use server'

import { revalidatePath } from 'next/cache'
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
    .select('id')
    .maybeSingle()

  if (error) {
    console.error('[updateTicketAction]', error.message)
    return { ok: false, code: 'INTERNAL', message: 'Failed to update ticket.' }
  }
  if (!data) return { ok: false, code: 'NOT_FOUND', message: 'Ticket not found.' }

  revalidatePath('/support')
  revalidatePath(`/support/${id}`)
  return { ok: true, data: undefined }
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
