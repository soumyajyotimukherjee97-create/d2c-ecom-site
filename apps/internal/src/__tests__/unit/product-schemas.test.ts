import { describe, it, expect } from 'vitest'
import {
  CreateProductSchema,
  UpdateProductSchema,
  UpdateVariantSchema,
  VariantInputSchema,
  ListProductsQuerySchema,
} from '@/lib/api/schemas/products'

// ─── VariantInputSchema ──────────────────────────────────────────────────────

describe('VariantInputSchema', () => {
  it('accepts a valid variant', () => {
    expect(
      VariantInputSchema.safeParse({ size_ml: 30, price: 49900, sku: 'SER-30', stock: 100 }).success,
    ).toBe(true)
  })

  it('defaults stock to 0 when omitted', () => {
    const parsed = VariantInputSchema.parse({ size_ml: 30, price: 49900, sku: 'SER-30' })
    expect(parsed.stock).toBe(0)
  })

  it('rejects non-positive price', () => {
    expect(
      VariantInputSchema.safeParse({ size_ml: 30, price: 0, sku: 'SER-30' }).success,
    ).toBe(false)
  })

  it('rejects negative stock', () => {
    expect(
      VariantInputSchema.safeParse({ size_ml: 30, price: 100, sku: 'SER-30', stock: -1 }).success,
    ).toBe(false)
  })
})

// ─── CreateProductSchema ─────────────────────────────────────────────────────

const validProduct = {
  name:       'Brightening Serum',
  slug:       'brightening-serum',
  category:   'serum',
  skin_types: ['dry', 'combination'],
  variants: [{ size_ml: 30, price: 49900, sku: 'SER-30' }],
} as const

describe('CreateProductSchema', () => {
  it('accepts a minimal valid product with one variant', () => {
    expect(CreateProductSchema.safeParse(validProduct).success).toBe(true)
  })

  it('rejects invalid slug formats', () => {
    for (const slug of ['Not-Lower', 'has space', 'under_score', '-leading', 'trailing-']) {
      expect(CreateProductSchema.safeParse({ ...validProduct, slug }).success).toBe(false)
    }
  })

  it('rejects empty skin_types', () => {
    expect(
      CreateProductSchema.safeParse({ ...validProduct, skin_types: [] }).success,
    ).toBe(false)
  })

  it('rejects zero variants', () => {
    expect(
      CreateProductSchema.safeParse({ ...validProduct, variants: [] }).success,
    ).toBe(false)
  })

  it('rejects a bad image URL', () => {
    expect(
      CreateProductSchema.safeParse({ ...validProduct, image_url: 'not-a-url' }).success,
    ).toBe(false)
  })

  it('defaults concerns to [] when omitted', () => {
    const parsed = CreateProductSchema.parse(validProduct)
    expect(parsed.concerns).toEqual([])
  })

  it('trims name and slug', () => {
    const parsed = CreateProductSchema.parse({
      ...validProduct,
      name: '  Brightening Serum  ',
      slug: '  brightening-serum  ',
    })
    expect(parsed.name).toBe('Brightening Serum')
    expect(parsed.slug).toBe('brightening-serum')
  })
})

// ─── UpdateProductSchema ─────────────────────────────────────────────────────

describe('UpdateProductSchema', () => {
  it('accepts a partial update', () => {
    expect(UpdateProductSchema.safeParse({ name: 'New name' }).success).toBe(true)
  })

  it('accepts an is_active toggle alone', () => {
    expect(UpdateProductSchema.safeParse({ is_active: false }).success).toBe(true)
  })

  it('rejects an empty payload', () => {
    expect(UpdateProductSchema.safeParse({}).success).toBe(false)
  })

  it('rejects an invalid category', () => {
    expect(UpdateProductSchema.safeParse({ category: 'cleanser' }).success).toBe(false)
  })
})

// ─── UpdateVariantSchema ─────────────────────────────────────────────────────

describe('UpdateVariantSchema', () => {
  it('accepts price-only update', () => {
    expect(UpdateVariantSchema.safeParse({ price: 12900 }).success).toBe(true)
  })

  it('accepts stock = 0', () => {
    expect(UpdateVariantSchema.safeParse({ stock: 0 }).success).toBe(true)
  })

  it('rejects negative stock', () => {
    expect(UpdateVariantSchema.safeParse({ stock: -1 }).success).toBe(false)
  })

  it('rejects empty payload', () => {
    expect(UpdateVariantSchema.safeParse({}).success).toBe(false)
  })
})

// ─── ListProductsQuerySchema ─────────────────────────────────────────────────

describe('ListProductsQuerySchema', () => {
  it('applies default visibility=all and page=1', () => {
    const parsed = ListProductsQuerySchema.parse({})
    expect(parsed.visibility).toBe('all')
    expect(parsed.page).toBe(1)
  })

  it('coerces page from string', () => {
    expect(ListProductsQuerySchema.parse({ page: '3' }).page).toBe(3)
  })

  it('rejects an unknown visibility', () => {
    expect(ListProductsQuerySchema.safeParse({ visibility: 'archived' }).success).toBe(false)
  })

  it('rejects an unknown category', () => {
    expect(ListProductsQuerySchema.safeParse({ category: 'cleanser' }).success).toBe(false)
  })
})
