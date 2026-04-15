import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isServiceRole } from '@/lib/api/auth'
import { Errors } from '@/lib/api/errors'
import {
  ListProductsSchema,
  CreateProductSchema,
} from '@/lib/api/schemas/products'
import type { Database } from '@/lib/supabase/types'

// ─── Local types ───────────────────────────────────────────────────────────────

type ProductRow      = Database['public']['Tables']['products']['Row']
type VariantRow      = Database['public']['Tables']['product_variants']['Row']
type IngredientRow   = Database['public']['Tables']['product_ingredients']['Row']

type ProductWithVariants = ProductRow & {
  product_variants: Pick<VariantRow, 'price'>[]
}

// ─── GET /api/products ────────────────────────────────────────────────────────
// Public. Returns a paginated, filterable list of products with starting_price.

export async function GET(request: NextRequest) {
  const raw = Object.fromEntries(request.nextUrl.searchParams.entries())
  const parsed = ListProductsSchema.safeParse(raw)

  if (!parsed.success) {
    return Errors.validation(parsed.error.flatten().fieldErrors)
  }

  const { category, skin_type, concern, is_active, limit, offset, sort } = parsed.data

  try {
    const supabase = await createClient()

    // Build query — join active variants to compute starting_price
    let query = supabase
      .from('products')
      .select(
        'id, name, slug, category, skin_types, concerns, image_url, is_active, product_variants!inner(price)',
        { count: 'exact' },
      )
      .eq('is_active', is_active)
      .eq('product_variants.is_active', true)

    if (category)  query = query.eq('category', category)
    if (skin_type) query = query.contains('skin_types', [skin_type])
    if (concern)   query = query.contains('concerns', [concern])

    switch (sort) {
      case 'name_asc':
        query = query.order('name', { ascending: true })
        break
      case 'price_asc':
      case 'price_desc':
        // Price sort applied post-aggregation below; order by name as secondary
        query = query.order('name', { ascending: true })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    query = query.range(offset, offset + limit - 1)

    const { data: rawData, count, error } = await query

    if (error) {
      console.error('[GET /api/products]', error.message)
      return Errors.internal()
    }

    // Supabase join inference on hand-authored types requires explicit cast
    const rows = (rawData as ProductWithVariants[] | null) ?? []

    // Compute starting_price: lowest active variant price per product
    const products = rows.map((row) => {
      const prices = row.product_variants.map((v) => v.price)
      const starting_price = prices.length ? Math.min(...prices) : 0

      return {
        id:             row.id,
        name:           row.name,
        slug:           row.slug,
        category:       row.category,
        skin_types:     row.skin_types,
        concerns:       row.concerns,
        image_url:      row.image_url,
        is_active:      row.is_active,
        starting_price,
      }
    })

    if (sort === 'price_asc') products.sort((a, b) => a.starting_price - b.starting_price)
    if (sort === 'price_desc') products.sort((a, b) => b.starting_price - a.starting_price)

    return NextResponse.json({ data: products, total: count ?? 0, limit, offset })
  } catch (err) {
    console.error('[GET /api/products] unexpected', err)
    return Errors.internal()
  }
}

// ─── POST /api/products ───────────────────────────────────────────────────────
// Internal only — requires SUPABASE_SERVICE_ROLE_KEY as Bearer token.

export async function POST(request: NextRequest) {
  if (!isServiceRole(request)) return Errors.forbidden()

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Errors.validation({ _: ['Invalid JSON body.'] })
  }

  const parsed = CreateProductSchema.safeParse(body)
  if (!parsed.success) {
    return Errors.validation(parsed.error.flatten().fieldErrors)
  }

  const { name, slug, description, category, skin_types, concerns, image_url, variants, ingredients } =
    parsed.data

  try {
    const supabase = createAdminClient()

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (existing) {
      return Errors.conflict('SLUG_CONFLICT', `A product with slug "${slug}" already exists.`)
    }

    // Insert product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name,
        slug,
        description:  description ?? null,
        category,
        skin_types,
        concerns,
        image_url:    image_url ?? null,
      })
      .select('id, slug')
      .single()

    if (productError || !product) {
      console.error('[POST /api/products] insert product', productError?.message)
      return Errors.internal()
    }

    // Insert variants
    const { error: variantsError } = await supabase
      .from('product_variants')
      .insert(variants.map((v) => ({ ...v, product_id: product.id })))

    if (variantsError) {
      console.error('[POST /api/products] insert variants', variantsError.message)
      return Errors.internal()
    }

    // Insert ingredients (optional)
    if (ingredients.length > 0) {
      const { error: ingredientsError } = await supabase
        .from('product_ingredients')
        .insert(
          ingredients.map((i) => ({
            product_id:    product.id,
            name:          i.name,
            concentration: i.concentration ?? null,
            benefit:       i.benefit ?? null,
            science_note:  i.science_note ?? null,
            display_order: i.display_order,
          } satisfies Database['public']['Tables']['product_ingredients']['Insert'])),
        )

      if (ingredientsError) {
        console.error('[POST /api/products] insert ingredients', ingredientsError.message)
        return Errors.internal()
      }
    }

    return NextResponse.json({ id: product.id, slug: product.slug }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/products] unexpected', err)
    return Errors.internal()
  }
}

