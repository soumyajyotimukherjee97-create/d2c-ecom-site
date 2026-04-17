'use server'

import { revalidatePath } from 'next/cache'
import { sendOrderShipped, sendOrderDelivered } from '@d2c/email'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireStaff } from '@/lib/actions/auth-guard'
import type { Database } from '@/lib/supabase/types'
import {
  UpdateOrderStatusSchema,
  VALID_TRANSITIONS,
  type OrderStatus,
  type UpdateOrderStatusInput,
} from '@/lib/api/schemas/orders'

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; code: 'VALIDATION_ERROR' | 'INVALID_TRANSITION' | 'NOT_FOUND' | 'INTERNAL'; message: string; fieldErrors?: Record<string, string[]> }

export async function updateOrderStatusAction(
  id:    string,
  input: UpdateOrderStatusInput,
): Promise<ActionResult<{ id: string; status: OrderStatus }>> {
  await requireStaff()

  const parsed = UpdateOrderStatusSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok:          false,
      code:        'VALIDATION_ERROR',
      message:     'Please fix the highlighted fields.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const { status, tracking_id, carrier, notes } = parsed.data
  const admin = createAdminClient()

  const { data: current, error: fetchErr } = await admin
    .from('orders')
    .select('id, order_number, status, contact_email')
    .eq('id', id)
    .maybeSingle()

  if (fetchErr) {
    console.error('[updateOrderStatusAction] fetch', fetchErr.message)
    return { ok: false, code: 'INTERNAL', message: 'Failed to load order.' }
  }
  if (!current) return { ok: false, code: 'NOT_FOUND', message: 'Order not found.' }

  const currentStatus = current.status
  const allowed       = VALID_TRANSITIONS[currentStatus]
  if (!allowed.includes(status)) {
    return {
      ok:      false,
      code:    'INVALID_TRANSITION',
      message:
        `Cannot move "${currentStatus}" → "${status}". ` +
        (allowed.length ? `Allowed next: ${allowed.join(', ')}.` : 'This is a terminal state.'),
    }
  }

  const payload: Database['public']['Tables']['orders']['Update'] = { status }
  if (tracking_id !== undefined) payload.tracking_id = tracking_id
  if (carrier     !== undefined) payload.carrier     = carrier
  if (notes       !== undefined) payload.notes       = notes

  const { data: updated, error: updateErr } = await admin
    .from('orders')
    .update(payload)
    .eq('id', id)
    .select('id, status')
    .maybeSingle()

  if (updateErr) {
    console.error('[updateOrderStatusAction] update', updateErr.message)
    return { ok: false, code: 'INTERNAL', message: 'Failed to update order.' }
  }
  if (!updated) return { ok: false, code: 'NOT_FOUND', message: 'Order not found.' }

  // ── Fire the right transactional email for this transition (non-blocking) ─
  const orderNumber  = current.order_number
  const contactEmail = current.contact_email
  if (status === 'shipped' && tracking_id && carrier) {
    void sendOrderShipped(contactEmail, {
      order_number: orderNumber,
      carrier,
      tracking_id,
    })
  } else if (status === 'delivered') {
    void sendOrderDelivered(contactEmail, {
      order_number: orderNumber,
    })
  }

  revalidatePath('/orders')
  revalidatePath(`/orders/${id}`)
  return { ok: true, data: { id: updated.id, status: updated.status } }
}
