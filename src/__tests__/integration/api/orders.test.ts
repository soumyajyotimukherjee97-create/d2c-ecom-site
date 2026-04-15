/**
 * Integration tests for /api/orders
 *
 * Prerequisites:
 *   supabase start && supabase db reset
 *
 * Run with:
 *   pnpm vitest run --config vitest.integration.config.ts
 *
 * Uses the real local Supabase instance and calls route handlers directly.
 * Test variants are created in beforeAll and deleted in afterAll to avoid
 * polluting seed data stock counts.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { POST as createOrder, GET as listOrders } from '@/app/api/orders/route'
import { GET as getOrder } from '@/app/api/orders/[id]/route'
import { PATCH as updateStatus } from '@/app/api/orders/[id]/status/route'

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

// ─── Test fixtures ────────────────────────────────────────────────────────────

// Use seed product a1000000-0000-0000-0000-000000000001 (Brightening Serum)
const SEED_PRODUCT_ID = 'a1000000-0000-0000-0000-000000000001'

let testVariantId = ''        // in-stock test variant
let zeroStockVariantId = ''   // out-of-stock test variant
const createdOrderIds: string[] = []

const validAddress = {
  line1:   '12 MG Road',
  line2:   null,
  city:    'Bengaluru',
  state:   'Karnataka',
  pin:     '560001',
  country: 'IN' as const,
}

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeAll(async () => {
  // Create isolated test variants so seed stock is untouched
  const { data: v1, error: e1 } = await supabase
    .from('product_variants')
    .insert({
      product_id: SEED_PRODUCT_ID,
      size_ml:    10,
      price:      50000,
      sku:        'TEST-ORD-001',
      stock:      5,
      is_active:  true,
    })
    .select('id')
    .single()

  if (e1 || !v1) throw new Error(`Could not create test variant: ${e1?.message}`)
  testVariantId = v1.id

  const { data: v2, error: e2 } = await supabase
    .from('product_variants')
    .insert({
      product_id: SEED_PRODUCT_ID,
      size_ml:    5,
      price:      25000,
      sku:        'TEST-ORD-002',
      stock:      0,
      is_active:  true,
    })
    .select('id')
    .single()

  if (e2 || !v2) throw new Error(`Could not create zero-stock test variant: ${e2?.message}`)
  zeroStockVariantId = v2.id
})

afterAll(async () => {
  // Delete created orders (cascade deletes order_items)
  if (createdOrderIds.length > 0) {
    await supabase.from('orders').delete().in('id', createdOrderIds)
  }
  // Delete test variants
  if (testVariantId) {
    await supabase.from('product_variants').delete().eq('id', testVariantId)
  }
  if (zeroStockVariantId) {
    await supabase.from('product_variants').delete().eq('id', zeroStockVariantId)
  }
})

// ─── POST /api/orders ─────────────────────────────────────────────────────────

describe('POST /api/orders', () => {
  it('creates an order and returns 201 with the order object', async () => {
    const body = {
      items:            [{ variant_id: testVariantId, quantity: 1 }],
      shipping_address: validAddress,
      contact_email:    'guest@example.com',
    }

    const res = await createOrder(req('http://localhost/api/orders', { method: 'POST', body }))
    expect(res.status).toBe(201)

    const data = await res.json()
    expect(data.id).toBeDefined()
    expect(data.order_number).toMatch(/^ORD-\d{4}-\d{5}$/)
    expect(data.status).toBe('confirmed')
    expect(data.subtotal).toBe(50000)
    expect(data.total).toBe(50000 + 9900) // below ₹999 threshold → ₹99 shipping
    expect(data.items).toHaveLength(1)
    expect(data.items[0].variant_id).toBe(testVariantId)
    expect(data.items[0].quantity).toBe(1)
    expect(data.items[0].unit_price).toBe(50000)

    createdOrderIds.push(data.id)
  })

  it('gives free shipping when subtotal ≥ ₹999 (99900 paise)', async () => {
    // 50000 × 2 = 100000 paise = ₹1000 ≥ ₹999
    const body = {
      items:            [{ variant_id: testVariantId, quantity: 2 }],
      shipping_address: validAddress,
      contact_email:    'guest2@example.com',
    }

    const res = await createOrder(req('http://localhost/api/orders', { method: 'POST', body }))
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.shipping_total).toBe(0)
    expect(data.total).toBe(100000)

    createdOrderIds.push(data.id)
  })

  it('decrements stock after order creation', async () => {
    // Stock starts at 5; we've used 1 + 2 so far → 2 remaining
    const { data: variant } = await supabase
      .from('product_variants')
      .select('stock')
      .eq('id', testVariantId)
      .single()

    expect(variant?.stock).toBe(2)
  })

  it('returns 400 VALIDATION_ERROR when items is empty', async () => {
    const body = { items: [], shipping_address: validAddress, contact_email: 'a@b.com' }
    const res  = await createOrder(req('http://localhost/api/orders', { method: 'POST', body }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 VALIDATION_ERROR when contact_email is missing', async () => {
    const body = { items: [{ variant_id: testVariantId, quantity: 1 }], shipping_address: validAddress }
    const res  = await createOrder(req('http://localhost/api/orders', { method: 'POST', body }))
    expect(res.status).toBe(400)
    expect((await res.json()).error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 VALIDATION_ERROR when PIN is invalid', async () => {
    const body = {
      items:            [{ variant_id: testVariantId, quantity: 1 }],
      shipping_address: { ...validAddress, pin: '12345' },
      contact_email:    'a@b.com',
    }
    const res = await createOrder(req('http://localhost/api/orders', { method: 'POST', body }))
    expect(res.status).toBe(400)
  })

  it('returns 409 INSUFFICIENT_STOCK when variant has 0 stock', async () => {
    const body = {
      items:            [{ variant_id: zeroStockVariantId, quantity: 1 }],
      shipping_address: validAddress,
      contact_email:    'guest@example.com',
    }
    const res = await createOrder(req('http://localhost/api/orders', { method: 'POST', body }))
    expect(res.status).toBe(409)
    const data = await res.json()
    expect(data.error.code).toBe('INSUFFICIENT_STOCK')
  })

  it('returns 404 VARIANT_NOT_FOUND when variant_id does not exist', async () => {
    const body = {
      items:            [{ variant_id: 'ffffffff-ffff-ffff-ffff-ffffffffffff', quantity: 1 }],
      shipping_address: validAddress,
      contact_email:    'guest@example.com',
    }
    const res = await createOrder(req('http://localhost/api/orders', { method: 'POST', body }))
    expect(res.status).toBe(404)
    const data = await res.json()
    expect(data.error.code).toBe('VARIANT_NOT_FOUND')
  })
})

// ─── GET /api/orders/[id] ─────────────────────────────────────────────────────

describe('GET /api/orders/[id]', () => {
  it('returns the order when called with service_role', async () => {
    // Use the first created order from the POST tests
    if (!createdOrderIds[0]) return // safety guard if POST tests failed

    const res = await getOrder(
      req(`http://localhost/api/orders/${createdOrderIds[0]}`, { serviceRole: true }),
      params({ id: createdOrderIds[0] }),
    )
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.id).toBe(createdOrderIds[0])
    expect(Array.isArray(data.order_items)).toBe(true)
  })

  it('returns 404 for a non-existent order ID (service_role)', async () => {
    const res = await getOrder(
      req('http://localhost/api/orders/ffffffff-ffff-ffff-ffff-ffffffffffff', { serviceRole: true }),
      params({ id: 'ffffffff-ffff-ffff-ffff-ffffffffffff' }),
    )
    expect(res.status).toBe(404)
    expect((await res.json()).error.code).toBe('ORDER_NOT_FOUND')
  })

  it('returns 401 when unauthenticated and not service_role', async () => {
    const id  = createdOrderIds[0] ?? '00000000-0000-0000-0000-000000000000'
    const res = await getOrder(
      req(`http://localhost/api/orders/${id}`),
      params({ id }),
    )
    expect(res.status).toBe(401)
  })
})

// ─── GET /api/orders (list) ───────────────────────────────────────────────────

describe('GET /api/orders', () => {
  it('returns paginated order list for service_role', async () => {
    const res = await listOrders(
      req('http://localhost/api/orders?limit=10&offset=0', { serviceRole: true }),
    )
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data.data)).toBe(true)
    expect(typeof data.total).toBe('number')
    expect(data.limit).toBe(10)
    expect(data.offset).toBe(0)
  })

  it('filters by status for service_role', async () => {
    const res = await listOrders(
      req('http://localhost/api/orders?status=confirmed', { serviceRole: true }),
    )
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.data.every((o: { status: string }) => o.status === 'confirmed')).toBe(true)
  })

  it('returns 401 for unauthenticated non-service-role requests', async () => {
    const res = await listOrders(req('http://localhost/api/orders'))
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid query params', async () => {
    const res = await listOrders(
      req('http://localhost/api/orders?status=invalid_status', { serviceRole: true }),
    )
    expect(res.status).toBe(400)
  })
})

// ─── PATCH /api/orders/[id]/status ───────────────────────────────────────────

describe('PATCH /api/orders/[id]/status', () => {
  let orderId = ''

  beforeAll(async () => {
    // Need a fresh confirmed order for status transition tests
    const body = {
      items:            [{ variant_id: testVariantId, quantity: 1 }],
      shipping_address: validAddress,
      contact_email:    'status-test@example.com',
    }
    const res  = await createOrder(req('http://localhost/api/orders', { method: 'POST', body }))
    const data = await res.json()
    orderId = data.id
    if (orderId) createdOrderIds.push(orderId)
  })

  it('returns 403 without service_role', async () => {
    const res = await updateStatus(
      req(`http://localhost/api/orders/${orderId}/status`, { method: 'PATCH', body: { status: 'processing' } }),
      params({ id: orderId }),
    )
    expect(res.status).toBe(403)
  })

  it('advances confirmed → processing', async () => {
    const res = await updateStatus(
      req(`http://localhost/api/orders/${orderId}/status`, {
        method:      'PATCH',
        serviceRole: true,
        body:        { status: 'processing' },
      }),
      params({ id: orderId }),
    )
    expect(res.status).toBe(200)
    expect((await res.json()).status).toBe('processing')
  })

  it('returns 400 for an invalid transition (processing → confirmed)', async () => {
    const res = await updateStatus(
      req(`http://localhost/api/orders/${orderId}/status`, {
        method:      'PATCH',
        serviceRole: true,
        body:        { status: 'confirmed' },
      }),
      params({ id: orderId }),
    )
    expect(res.status).toBe(400)
    expect((await res.json()).error.code).toBe('VALIDATION_ERROR')
  })

  it('advances processing → shipped with tracking info', async () => {
    const res = await updateStatus(
      req(`http://localhost/api/orders/${orderId}/status`, {
        method:      'PATCH',
        serviceRole: true,
        body:        { status: 'shipped', tracking_id: 'BD123456', carrier: 'BlueDart' },
      }),
      params({ id: orderId }),
    )
    expect(res.status).toBe(200)
    expect((await res.json()).status).toBe('shipped')
  })

  it('returns 400 when shipped without tracking_id', async () => {
    // First reset a new order to processing
    const body2 = {
      items:            [{ variant_id: testVariantId, quantity: 1 }],
      shipping_address: validAddress,
      contact_email:    'shipping-test@example.com',
    }
    const createRes  = await createOrder(req('http://localhost/api/orders', { method: 'POST', body: body2 }))
    const createData = await createRes.json()
    const newId = createData.id
    if (newId) createdOrderIds.push(newId)

    // Advance to processing first
    await updateStatus(
      req(`http://localhost/api/orders/${newId}/status`, {
        method: 'PATCH', serviceRole: true, body: { status: 'processing' },
      }),
      params({ id: newId }),
    )

    // Try to ship without tracking_id
    const res = await updateStatus(
      req(`http://localhost/api/orders/${newId}/status`, {
        method:      'PATCH',
        serviceRole: true,
        body:        { status: 'shipped', carrier: 'BlueDart' },
      }),
      params({ id: newId }),
    )
    expect(res.status).toBe(400)
  })

  it('returns 404 for a non-existent order', async () => {
    const res = await updateStatus(
      req('http://localhost/api/orders/ffffffff-ffff-ffff-ffff-ffffffffffff/status', {
        method:      'PATCH',
        serviceRole: true,
        body:        { status: 'processing' },
      }),
      params({ id: 'ffffffff-ffff-ffff-ffff-ffffffffffff' }),
    )
    expect(res.status).toBe(404)
  })
})
