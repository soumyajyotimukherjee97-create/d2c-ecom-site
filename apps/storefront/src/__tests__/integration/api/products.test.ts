/**
 * Integration tests for /api/products
 *
 * Prerequisites:
 *   supabase start && supabase db reset
 *
 * Run with:
 *   pnpm vitest run --config vitest.integration.config.ts
 *
 * These tests call the Next.js route handlers directly (not over HTTP),
 * using a real local Supabase instance.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { GET as listProducts, POST as createProduct } from '@/app/api/products/route'
import {
  GET as getProduct,
  PATCH as updateProduct,
  DELETE as deleteProduct,
} from '@/app/api/products/[id]/route'
import { GET as getStock } from '@/app/api/products/[id]/stock/route'
import { PATCH as updateVariant } from '@/app/api/products/[id]/variants/[variantId]/route'

// ─── Test client (admin — bypasses RLS for setup/teardown) ────────────────────

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
)

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'test-service-key'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(
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

function makeParams<T extends Record<string, string>>(params: T): { params: Promise<T> } {
  return { params: Promise.resolve(params) }
}

// ─── Seed data ────────────────────────────────────────────────────────────────

let productId: string
let variantId: string
const TEST_SLUG = 'test-brightening-serum'

beforeAll(async () => {
  // Clean up any leftover test data
  await supabase.from('products').delete().eq('slug', TEST_SLUG)

  // Insert a known product
  const { data: product } = await supabase
    .from('products')
    .insert({
      name:        'Test Brightening Serum',
      slug:        TEST_SLUG,
      category:    'serum',
      skin_types:  ['dry', 'combination'],
      concerns:    ['dullness'],
      is_active:   true,
    })
    .select('id')
    .single()

  productId = product!.id

  const { data: variant } = await supabase
    .from('product_variants')
    .insert({ product_id: productId, size_ml: 30, price: 129900, sku: 'INT-TEST-30', stock: 10 })
    .select('id')
    .single()

  variantId = variant!.id
})

afterAll(async () => {
  await supabase.from('products').delete().eq('id', productId)
})

// ─── GET /api/products ────────────────────────────────────────────────────────

describe('GET /api/products', () => {
  it('returns 200 with data array and pagination', async () => {
    const req = makeRequest('http://localhost/api/products')
    const res = await listProducts(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(Array.isArray(json.data)).toBe(true)
    expect(typeof json.total).toBe('number')
    expect(json.limit).toBe(20)
    expect(json.offset).toBe(0)
  })

  it('returns test product in the list', async () => {
    const req = makeRequest('http://localhost/api/products')
    const res = await listProducts(req)
    const json = await res.json()

    const found = json.data.find((p: { slug: string }) => p.slug === TEST_SLUG)
    expect(found).toBeDefined()
    expect(found.starting_price).toBe(129900)
  })

  it('filters by category', async () => {
    const req = makeRequest('http://localhost/api/products?category=serum')
    const res = await listProducts(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    json.data.forEach((p: { category: string }) => expect(p.category).toBe('serum'))
  })

  it('respects limit and offset', async () => {
    const req = makeRequest('http://localhost/api/products?limit=1&offset=0')
    const res = await listProducts(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.data.length).toBeLessThanOrEqual(1)
  })

  it('returns 400 for invalid category', async () => {
    const req = makeRequest('http://localhost/api/products?category=sunscreen')
    const res = await listProducts(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 for limit above 100', async () => {
    const req = makeRequest('http://localhost/api/products?limit=999')
    const res = await listProducts(req)
    expect(res.status).toBe(400)
  })
})

// ─── POST /api/products ───────────────────────────────────────────────────────

describe('POST /api/products', () => {
  const NEW_SLUG = 'integration-test-new-product'
  let createdId: string

  afterAll(async () => {
    if (createdId) await supabase.from('products').delete().eq('id', createdId)
  })

  const validBody = {
    name:       'Integration Test Product',
    slug:       NEW_SLUG,
    category:   'toner',
    skin_types: ['oily'],
    variants:   [{ size_ml: 100, price: 89900, sku: 'INT-TONER-100' }],
  }

  it('returns 403 without service role key', async () => {
    const req = makeRequest('http://localhost/api/products', { method: 'POST', body: validBody })
    const res = await createProduct(req)
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error.code).toBe('FORBIDDEN')
  })

  it('creates a product and returns 201 with id and slug', async () => {
    const req = makeRequest('http://localhost/api/products', {
      method:      'POST',
      body:        validBody,
      serviceRole: true,
    })
    const res = await createProduct(req)
    const json = await res.json()

    expect(res.status).toBe(201)
    expect(json.id).toBeDefined()
    expect(json.slug).toBe(NEW_SLUG)
    createdId = json.id
  })

  it('returns 409 on duplicate slug', async () => {
    const req = makeRequest('http://localhost/api/products', {
      method:      'POST',
      body:        { ...validBody, slug: TEST_SLUG }, // already exists
      serviceRole: true,
    })
    const res = await createProduct(req)
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error.code).toBe('SLUG_CONFLICT')
  })

  it('returns 400 for missing required fields', async () => {
    const req = makeRequest('http://localhost/api/products', {
      method:      'POST',
      body:        { name: 'Incomplete' },
      serviceRole: true,
    })
    const res = await createProduct(req)
    expect(res.status).toBe(400)
    expect((await res.json()).error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 for empty variants array', async () => {
    const req = makeRequest('http://localhost/api/products', {
      method:      'POST',
      body:        { ...validBody, slug: 'another-slug', variants: [] },
      serviceRole: true,
    })
    const res = await createProduct(req)
    expect(res.status).toBe(400)
  })
})

// ─── GET /api/products/[id] ───────────────────────────────────────────────────

describe('GET /api/products/[id]', () => {
  it('returns 200 with full product detail', async () => {
    const req = makeRequest(`http://localhost/api/products/${TEST_SLUG}`)
    const res = await getProduct(req, makeParams({ id: TEST_SLUG }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.slug).toBe(TEST_SLUG)
    expect(Array.isArray(json.variants)).toBe(true)
    expect(Array.isArray(json.ingredients)).toBe(true)
    expect(json.reviews_summary).toBeDefined()
    expect(typeof json.reviews_summary.count).toBe('number')
  })

  it('returns 404 for unknown slug', async () => {
    const req = makeRequest('http://localhost/api/products/does-not-exist')
    const res = await getProduct(req, makeParams({ id: 'does-not-exist' }))
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.error.code).toBe('PRODUCT_NOT_FOUND')
  })

  it('returns 404 for inactive product', async () => {
    // Temporarily deactivate
    await supabase.from('products').update({ is_active: false }).eq('id', productId)

    const req = makeRequest(`http://localhost/api/products/${TEST_SLUG}`)
    const res = await getProduct(req, makeParams({ id: TEST_SLUG }))
    expect(res.status).toBe(404)

    // Restore
    await supabase.from('products').update({ is_active: true }).eq('id', productId)
  })
})

// ─── GET /api/products/[id]/stock ─────────────────────────────────────────────

describe('GET /api/products/[id]/stock', () => {
  it('returns 200 with variants stock info', async () => {
    const req = makeRequest(`http://localhost/api/products/${productId}/stock`)
    const res = await getStock(req, makeParams({ id: productId }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(Array.isArray(json.variants)).toBe(true)
    expect(json.variants[0]).toHaveProperty('stock')
    expect(json.variants[0]).toHaveProperty('sku')
  })

  it('returns 404 for unknown product id', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000'
    const req = makeRequest(`http://localhost/api/products/${fakeId}/stock`)
    const res = await getStock(req, makeParams({ id: fakeId }))
    expect(res.status).toBe(404)
  })
})

// ─── PATCH /api/products/[id] ─────────────────────────────────────────────────

describe('PATCH /api/products/[id]', () => {
  it('returns 403 without service role', async () => {
    const req = makeRequest(`http://localhost/api/products/${productId}`, {
      method: 'PATCH',
      body:   { is_active: true },
    })
    const res = await updateProduct(req, makeParams({ id: productId }))
    expect(res.status).toBe(403)
  })

  it('updates a product field and returns id + updated_at', async () => {
    const req = makeRequest(`http://localhost/api/products/${productId}`, {
      method:      'PATCH',
      body:        { name: 'Updated Serum Name' },
      serviceRole: true,
    })
    const res = await updateProduct(req, makeParams({ id: productId }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.id).toBe(productId)
    expect(json.updated_at).toBeDefined()
  })

  it('returns 400 for empty patch body', async () => {
    const req = makeRequest(`http://localhost/api/products/${productId}`, {
      method:      'PATCH',
      body:        {},
      serviceRole: true,
    })
    const res = await updateProduct(req, makeParams({ id: productId }))
    expect(res.status).toBe(400)
  })

  it('returns 404 for unknown product id', async () => {
    const req = makeRequest('http://localhost/api/products/00000000-0000-0000-0000-000000000000', {
      method:      'PATCH',
      body:        { is_active: false },
      serviceRole: true,
    })
    const res = await updateProduct(
      req,
      makeParams({ id: '00000000-0000-0000-0000-000000000000' }),
    )
    expect(res.status).toBe(404)
  })
})

// ─── DELETE /api/products/[id] ────────────────────────────────────────────────

describe('DELETE /api/products/[id]', () => {
  it('returns 403 without service role', async () => {
    const req = makeRequest(`http://localhost/api/products/${productId}`, { method: 'DELETE' })
    const res = await deleteProduct(req, makeParams({ id: productId }))
    expect(res.status).toBe(403)
  })

  it('soft-deletes a product (sets is_active = false)', async () => {
    const req = makeRequest(`http://localhost/api/products/${productId}`, {
      method:      'DELETE',
      serviceRole: true,
    })
    const res = await deleteProduct(req, makeParams({ id: productId }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.id).toBe(productId)
    expect(json.is_active).toBe(false)

    // Verify in DB
    const { data } = await supabase.from('products').select('is_active').eq('id', productId).single()
    expect(data?.is_active).toBe(false)

    // Restore for subsequent tests
    await supabase.from('products').update({ is_active: true }).eq('id', productId)
  })

  it('returns 404 for unknown product id', async () => {
    const req = makeRequest('http://localhost/api/products/00000000-0000-0000-0000-000000000000', {
      method:      'DELETE',
      serviceRole: true,
    })
    const res = await deleteProduct(
      req,
      makeParams({ id: '00000000-0000-0000-0000-000000000000' }),
    )
    expect(res.status).toBe(404)
  })
})

// ─── PATCH /api/products/[id]/variants/[variantId] ────────────────────────────

describe('PATCH /api/products/[id]/variants/[variantId]', () => {
  it('returns 403 without service role', async () => {
    const req = makeRequest(
      `http://localhost/api/products/${productId}/variants/${variantId}`,
      { method: 'PATCH', body: { stock: 5 } },
    )
    const res = await updateVariant(req, makeParams({ id: productId, variantId }))
    expect(res.status).toBe(403)
  })

  it('updates stock and returns id, stock, updated_at', async () => {
    const req = makeRequest(
      `http://localhost/api/products/${productId}/variants/${variantId}`,
      { method: 'PATCH', body: { stock: 25 }, serviceRole: true },
    )
    const res = await updateVariant(req, makeParams({ id: productId, variantId }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.id).toBe(variantId)
    expect(json.stock).toBe(25)
  })

  it('returns 400 for empty patch body', async () => {
    const req = makeRequest(
      `http://localhost/api/products/${productId}/variants/${variantId}`,
      { method: 'PATCH', body: {}, serviceRole: true },
    )
    const res = await updateVariant(req, makeParams({ id: productId, variantId }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for negative stock', async () => {
    const req = makeRequest(
      `http://localhost/api/products/${productId}/variants/${variantId}`,
      { method: 'PATCH', body: { stock: -5 }, serviceRole: true },
    )
    const res = await updateVariant(req, makeParams({ id: productId, variantId }))
    expect(res.status).toBe(400)
  })

  it('returns 404 for mismatched product/variant combination', async () => {
    const wrongId = '00000000-0000-0000-0000-000000000000'
    const req = makeRequest(
      `http://localhost/api/products/${wrongId}/variants/${variantId}`,
      { method: 'PATCH', body: { stock: 5 }, serviceRole: true },
    )
    const res = await updateVariant(req, makeParams({ id: wrongId, variantId }))
    expect(res.status).toBe(404)
  })
})
