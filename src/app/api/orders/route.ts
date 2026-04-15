import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isServiceRole } from '@/lib/api/auth'
import { Errors } from '@/lib/api/errors'
import { CreateOrderSchema, ListOrdersSchema } from '@/lib/api/schemas/orders'
import type { Database, Json } from '@/lib/supabase/types'

// NOTE: `createAdminClient` is used for the `create_order` RPC call because:
// 1. The RPC is SECURITY DEFINER and requires admin-level DB access for the
//    atomic stock decrement (product_variants UPDATE has no anon/auth RLS policy).
// 2. The `@supabase/ssr` client's rpc() args type degrades to `never` for custom
//    functions because the SSR wrapper's Schema generic doesn't preserve the
//    Functions type correctly at call sites.
// Security boundary is enforced at the API route level (Zod + session checks)
// before the admin client is ever used — no privileged data is returned directly.

// ─── Constants ────────────────────────────────────────────────────────────────

const FREE_SHIPPING_THRESHOLD = 99900  // ₹999 in paise
const SHIPPING_COST            = 9900  // ₹99 in paise

// ─── Local types ──────────────────────────────────────────────────────────────

type VariantRow    = Database['public']['Tables']['product_variants']['Row']
type VariantWithProduct = VariantRow & { products: { name: string } | null }

// ─── POST /api/orders ─────────────────────────────────────────────────────────
// Public — both authenticated users and guests can create orders.
// user_id is always derived from the server-side session, never trusted from client.

export async function POST(request: NextRequest) {
  // ── 1. Parse + validate body ──────────────────────────────────────────────
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Errors.validation({ _: ['Invalid JSON body.'] })
  }

  const parsed = CreateOrderSchema.safeParse(body)
  if (!parsed.success) {
    return Errors.validation(parsed.error.flatten().fieldErrors)
  }

  const { items, shipping_address, contact_email, contact_phone } = parsed.data

  // ── 2. Derive user_id from session (never from client) ────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId    = user?.id ?? null
  const guestEmail = userId ? null : contact_email

  // ── 3. Fetch variant details (price, sku, product name for snapshot) ──────
  const variantIds = items.map((i) => i.variant_id)

  const { data: rawVariants, error: variantsError } = await supabase
    .from('product_variants')
    .select('id, sku, price, stock, is_active, products(name)')
    .in('id', variantIds)

  if (variantsError) {
    console.error('[POST /api/orders] variants fetch', variantsError.message)
    return Errors.internal()
  }

  const variants = (rawVariants ?? []) as VariantWithProduct[]

  // ── 4. Validate all variants exist and are active ─────────────────────────
  for (const item of items) {
    const variant = variants.find((v) => v.id === item.variant_id)
    if (!variant || !variant.is_active) {
      return Errors.notFound('Variant')
    }
  }

  // ── 5. Pre-check stock (fast path — the RPC also checks atomically) ───────
  const insufficientVariantIds: string[] = []
  for (const item of items) {
    const variant = variants.find((v) => v.id === item.variant_id)!
    if (variant.stock < item.quantity) {
      insufficientVariantIds.push(item.variant_id)
    }
  }

  if (insufficientVariantIds.length > 0) {
    return Errors.conflict('INSUFFICIENT_STOCK', 'One or more variants are out of stock.', {
      variant_ids: insufficientVariantIds,
    })
  }

  // ── 6. Compute order totals ───────────────────────────────────────────────
  const enrichedItems = items.map((item) => {
    const variant = variants.find((v) => v.id === item.variant_id)!
    const lineTotal = variant.price * item.quantity
    return {
      variant_id:   item.variant_id,
      quantity:     item.quantity,
      product_name: variant.products?.name ?? '',
      variant_sku:  variant.sku,
      unit_price:   variant.price,
      line_total:   lineTotal,
    }
  })

  const subtotal      = enrichedItems.reduce((sum, i) => sum + i.line_total, 0)
  const shippingTotal = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const total         = subtotal + shippingTotal

  // ── 7. Create order atomically via the SECURITY DEFINER RPC ──────────────
  // See note at top of file — admin client is required here.
  const admin = createAdminClient()
  const { data: rpcResult, error: rpcError } = await admin.rpc('create_order', {
    p_user_id:          userId,
    p_guest_email:      guestEmail,
    p_contact_email:    contact_email,
    p_contact_phone:    contact_phone ?? null,
    p_shipping_address: shipping_address as unknown as Json,
    p_subtotal:         subtotal,
    p_shipping_total:   shippingTotal,
    p_total:            total,
    p_items:            enrichedItems as unknown as Json,
  })

  if (rpcError) {
    const msg = rpcError.message ?? ''

    if (msg.includes('VARIANT_NOT_FOUND')) {
      return Errors.notFound('Variant')
    }
    if (msg.includes('INSUFFICIENT_STOCK')) {
      // Extract variant_id from the error message if present
      const match = msg.match(/INSUFFICIENT_STOCK::(.+)/)
      const variantId = match ? [match[1].trim()] : []
      return Errors.conflict('INSUFFICIENT_STOCK', 'One or more variants are out of stock.', {
        variant_ids: variantId,
      })
    }

    console.error('[POST /api/orders] rpc error', rpcError.message)
    return Errors.internal()
  }

  if (!rpcResult) {
    return Errors.internal()
  }

  const result = rpcResult as { id: string; order_number: string }

  // ── 8. Build 201 response ─────────────────────────────────────────────────
  return NextResponse.json(
    {
      id:            result.id,
      order_number:  result.order_number,
      status:        'confirmed',
      subtotal,
      shipping_total: shippingTotal,
      total,
      items: enrichedItems.map((i) => ({
        variant_id:   i.variant_id,
        product_name: i.product_name,
        variant_sku:  i.variant_sku,
        quantity:     i.quantity,
        unit_price:   i.unit_price,
        line_total:   i.line_total,
      })),
      created_at: new Date().toISOString(),
    },
    { status: 201 },
  )
}

// ─── GET /api/orders ──────────────────────────────────────────────────────────
// Authenticated user: returns own orders only.
// service_role: returns all orders with optional filters.

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const internalRequest = isServiceRole(request)

  // ── Parse query params ────────────────────────────────────────────────────
  const paramsParsed = ListOrdersSchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  )
  if (!paramsParsed.success) {
    return Errors.validation(paramsParsed.error.flatten().fieldErrors)
  }

  const { status, limit, offset, search, date_from, date_to } = paramsParsed.data

  if (internalRequest) {
    // ── Internal platform: return all orders with filters ─────────────────
    const admin = createAdminClient()

    let query = admin
      .from('orders')
      .select('id, order_number, status, subtotal, shipping_total, total, contact_email, created_at, updated_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) query = query.eq('status', status)
    if (search) {
      query = query.or(`order_number.ilike.%${search}%,contact_email.ilike.%${search}%`)
    }
    if (date_from) query = query.gte('created_at', date_from)
    if (date_to)   query = query.lte('created_at', date_to)

    const { data, error, count } = await query

    if (error) {
      console.error('[GET /api/orders] internal list', error.message)
      return Errors.internal()
    }

    return NextResponse.json({
      data:   data ?? [],
      total:  count ?? 0,
      limit,
      offset,
    })
  }

  // ── Customer: return own orders (RLS enforces ownership) ─────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Errors.unauthorized()
  }

  let query = supabase
    .from('orders')
    .select('id, order_number, status, subtotal, shipping_total, total, contact_email, created_at, updated_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) query = query.eq('status', status)

  const { data, error, count } = await query

  if (error) {
    console.error('[GET /api/orders] customer list', error.message)
    return Errors.internal()
  }

  return NextResponse.json({
    data:   data ?? [],
    total:  count ?? 0,
    limit,
    offset,
  })
}
