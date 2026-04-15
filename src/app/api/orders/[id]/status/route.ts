import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isServiceRole } from '@/lib/api/auth'
import { Errors } from '@/lib/api/errors'
import { UpdateOrderStatusSchema } from '@/lib/api/schemas/orders'
import type { OrderStatus } from '@/lib/api/schemas/orders'
import type { Database } from '@/lib/supabase/types'

type OrderUpdate = Database['public']['Tables']['orders']['Update']

type RouteContext = { params: Promise<{ id: string }> }

// ─── Valid status transitions ─────────────────────────────────────────────────

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  confirmed:  ['processing', 'cancelled'],
  processing: ['shipped',    'cancelled'],
  shipped:    ['delivered'],
  delivered:  [],
  cancelled:  [],
}

// ─── PATCH /api/orders/[id]/status ───────────────────────────────────────────
// Internal only — requires service_role Bearer token.
// Enforces the status machine defined in TDD §5.4.

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  if (!isServiceRole(request)) return Errors.forbidden()

  const { id } = await params

  // ── 1. Parse + validate body ────────────────────────────────────────────
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Errors.validation({ _: ['Invalid JSON body.'] })
  }

  const parsed = UpdateOrderStatusSchema.safeParse(body)
  if (!parsed.success) {
    return Errors.validation(parsed.error.flatten().fieldErrors)
  }

  const { status, tracking_id, carrier, notes } = parsed.data

  const admin = createAdminClient()

  // ── 2. Fetch current order ──────────────────────────────────────────────
  const { data: order, error: fetchError } = await admin
    .from('orders')
    .select('id, status')
    .eq('id', id)
    .single()

  if (fetchError || !order) {
    return Errors.notFound('Order')
  }

  // ── 3. Validate transition ──────────────────────────────────────────────
  const currentStatus = order.status as OrderStatus
  const allowed       = VALID_TRANSITIONS[currentStatus]

  if (!allowed.includes(status)) {
    return Errors.validation({
      status: [
        `Invalid transition: "${currentStatus}" → "${status}". Allowed: ${allowed.length ? allowed.join(', ') : 'none (terminal state)'}.`,
      ],
    })
  }

  // ── 4. Apply update ─────────────────────────────────────────────────────
  const updatePayload: OrderUpdate = { status }
  if (tracking_id !== undefined) updatePayload.tracking_id = tracking_id
  if (carrier     !== undefined) updatePayload.carrier     = carrier
  if (notes       !== undefined) updatePayload.notes       = notes

  const { data: updated, error: updateError } = await admin
    .from('orders')
    .update(updatePayload)
    .eq('id', id)
    .select('id, status, updated_at')
    .single()

  if (updateError || !updated) {
    console.error('[PATCH /api/orders/[id]/status]', updateError?.message)
    return Errors.internal()
  }

  return NextResponse.json(updated)
}
