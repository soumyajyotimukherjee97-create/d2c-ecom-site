import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isServiceRole } from '@/lib/api/auth'
import { Errors } from '@/lib/api/errors'

type RouteContext = { params: Promise<{ id: string }> }

// ─── GET /api/orders/[id] ─────────────────────────────────────────────────────
// service_role: returns any order by ID.
// Authenticated user: returns only own orders (RLS enforces this).
// Unauthenticated: 401 (guest access via signed token is Phase 2).

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params

  const internalRequest = isServiceRole(_request)

  if (internalRequest) {
    // ── Internal: bypass RLS, return any order ───────────────────────────────
    const admin = createAdminClient()

    const { data: order, error } = await admin
      .from('orders')
      .select(`
        id, order_number, user_id, status,
        subtotal, shipping_total, total,
        shipping_address, contact_email, contact_phone,
        tracking_id, carrier, notes,
        created_at, updated_at,
        order_items(id, variant_id, product_name, variant_sku, quantity, unit_price, line_total)
      `)
      .eq('id', id)
      .single()

    if (error || !order) {
      return Errors.notFound('Order')
    }

    return NextResponse.json(order)
  }

  // ── Customer: require authentication ────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Errors.unauthorized()
  }

  // RLS (orders_select_own: auth.uid() = user_id) filters automatically.
  // If the order belongs to a different user, Supabase returns no rows.
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id, order_number, status,
      subtotal, shipping_total, total,
      shipping_address, contact_email, contact_phone,
      tracking_id, carrier, notes,
      created_at, updated_at,
      order_items(id, variant_id, product_name, variant_sku, quantity, unit_price, line_total)
    `)
    .eq('id', id)
    .single()

  if (error || !order) {
    return Errors.notFound('Order')
  }

  return NextResponse.json(order)
}
