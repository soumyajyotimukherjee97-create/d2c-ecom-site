import { describe, it, expect } from 'vitest'
import {
  ListProductsSchema,
  CreateProductSchema,
  UpdateProductSchema,
  UpdateVariantSchema,
} from '@/lib/api/schemas/products'

// ─── ListProductsSchema ────────────────────────────────────────────────────────

describe('ListProductsSchema', () => {
  it('accepts empty input and applies defaults', () => {
    const result = ListProductsSchema.safeParse({})
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.is_active).toBe(true)
    expect(result.data.limit).toBe(20)
    expect(result.data.offset).toBe(0)
    expect(result.data.sort).toBe('created_at_desc')
  })

  it('accepts all valid filter params', () => {
    const result = ListProductsSchema.safeParse({
      category:  'serum',
      skin_type: 'dry',
      concern:   'acne',
      is_active: 'false',
      limit:     '10',
      offset:    '20',
      sort:      'price_asc',
    })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.category).toBe('serum')
    expect(result.data.skin_type).toBe('dry')
    expect(result.data.concern).toBe('acne')
    expect(result.data.is_active).toBe(false)
    expect(result.data.limit).toBe(10)
    expect(result.data.offset).toBe(20)
    expect(result.data.sort).toBe('price_asc')
  })

  it('rejects invalid category', () => {
    const result = ListProductsSchema.safeParse({ category: 'sunscreen' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid skin_type', () => {
    const result = ListProductsSchema.safeParse({ skin_type: 'normal' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid concern', () => {
    const result = ListProductsSchema.safeParse({ concern: 'wrinkles' })
    expect(result.success).toBe(false)
  })

  it('rejects limit above 100', () => {
    const result = ListProductsSchema.safeParse({ limit: '101' })
    expect(result.success).toBe(false)
  })

  it('rejects limit below 1', () => {
    const result = ListProductsSchema.safeParse({ limit: '0' })
    expect(result.success).toBe(false)
  })

  it('rejects negative offset', () => {
    const result = ListProductsSchema.safeParse({ offset: '-1' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid sort value', () => {
    const result = ListProductsSchema.safeParse({ sort: 'random' })
    expect(result.success).toBe(false)
  })

  it('accepts all valid sort values', () => {
    for (const sort of ['created_at_desc', 'price_asc', 'price_desc', 'name_asc']) {
      expect(ListProductsSchema.safeParse({ sort }).success).toBe(true)
    }
  })
})

// ─── CreateProductSchema ───────────────────────────────────────────────────────

describe('CreateProductSchema', () => {
  const valid = {
    name:       'Brightening Serum',
    slug:       'brightening-serum',
    category:   'serum',
    skin_types: ['dry', 'combination'],
    variants:   [{ size_ml: 30, price: 129900, sku: 'SERUM-30' }],
  }

  it('accepts valid input', () => {
    expect(CreateProductSchema.safeParse(valid).success).toBe(true)
  })

  it('applies default concerns and ingredients', () => {
    const result = CreateProductSchema.safeParse(valid)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.concerns).toEqual([])
    expect(result.data.ingredients).toEqual([])
  })

  it('rejects missing name', () => {
    expect(CreateProductSchema.safeParse({ ...valid, name: '' }).success).toBe(false)
  })

  it('rejects invalid slug characters', () => {
    expect(CreateProductSchema.safeParse({ ...valid, slug: 'My Product!' }).success).toBe(false)
  })

  it('rejects slug with uppercase', () => {
    expect(CreateProductSchema.safeParse({ ...valid, slug: 'My-Product' }).success).toBe(false)
  })

  it('rejects slug longer than 100 chars', () => {
    expect(CreateProductSchema.safeParse({ ...valid, slug: 'a'.repeat(101) }).success).toBe(false)
  })

  it('rejects invalid category', () => {
    expect(CreateProductSchema.safeParse({ ...valid, category: 'sunscreen' }).success).toBe(false)
  })

  it('rejects empty skin_types array', () => {
    expect(CreateProductSchema.safeParse({ ...valid, skin_types: [] }).success).toBe(false)
  })

  it('rejects empty variants array', () => {
    expect(CreateProductSchema.safeParse({ ...valid, variants: [] }).success).toBe(false)
  })

  it('rejects variant with non-positive price', () => {
    const bad = { ...valid, variants: [{ size_ml: 30, price: 0, sku: 'X' }] }
    expect(CreateProductSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects variant with negative stock', () => {
    const bad = { ...valid, variants: [{ size_ml: 30, price: 1000, sku: 'X', stock: -1 }] }
    expect(CreateProductSchema.safeParse(bad).success).toBe(false)
  })

  it('accepts optional image_url', () => {
    const result = CreateProductSchema.safeParse({
      ...valid,
      image_url: 'https://example.com/img.jpg',
    })
    expect(result.success).toBe(true)
  })

  it('rejects malformed image_url', () => {
    expect(CreateProductSchema.safeParse({ ...valid, image_url: 'not-a-url' }).success).toBe(false)
  })
})

// ─── UpdateProductSchema ───────────────────────────────────────────────────────

describe('UpdateProductSchema', () => {
  it('accepts a partial update with one field', () => {
    expect(UpdateProductSchema.safeParse({ is_active: false }).success).toBe(true)
  })

  it('accepts all patchable fields', () => {
    const result = UpdateProductSchema.safeParse({
      name:        'New Name',
      description: 'New description',
      category:    'toner',
      skin_types:  ['oily'],
      concerns:    ['acne'],
      is_active:   true,
    })
    expect(result.success).toBe(true)
  })

  it('rejects an empty object', () => {
    expect(UpdateProductSchema.safeParse({}).success).toBe(false)
  })

  it('rejects empty skin_types array', () => {
    expect(UpdateProductSchema.safeParse({ skin_types: [] }).success).toBe(false)
  })

  it('rejects invalid category', () => {
    expect(UpdateProductSchema.safeParse({ category: 'sunscreen' }).success).toBe(false)
  })
})

// ─── UpdateVariantSchema ───────────────────────────────────────────────────────

describe('UpdateVariantSchema', () => {
  it('accepts a single-field update', () => {
    expect(UpdateVariantSchema.safeParse({ stock: 50 }).success).toBe(true)
  })

  it('accepts all patchable fields', () => {
    expect(UpdateVariantSchema.safeParse({ price: 99900, stock: 10, is_active: true }).success).toBe(true)
  })

  it('rejects an empty object', () => {
    expect(UpdateVariantSchema.safeParse({}).success).toBe(false)
  })

  it('rejects non-positive price', () => {
    expect(UpdateVariantSchema.safeParse({ price: 0 }).success).toBe(false)
  })

  it('rejects negative stock', () => {
    expect(UpdateVariantSchema.safeParse({ stock: -1 }).success).toBe(false)
  })

  it('accepts zero stock', () => {
    expect(UpdateVariantSchema.safeParse({ stock: 0 }).success).toBe(true)
  })
})
