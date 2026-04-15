import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isServiceRole } from '@/lib/api/auth'
import { Errors } from '@/lib/api/errors'
import { UpdateProductSchema } from '@/lib/api/schemas/products'
import type { Database } from '@/lib/supabase/types'

type RouteContext = { params: Promise<{ id: string }> }

// ─── Local types ───────────────────────────────────────────────────────────────

type ProductRow    = Database['public']['Tables']['products']['Row']
type VariantRow    = Database['public']['Tables']['product_variants']['Row']
type IngredientRow = Database['public']['Tables']['product_ingredients']['Row']
type ReviewRow     = Database['public']['Tables']['reviews']['Row']

type ProductDetail = ProductRow & {
  product_variants:    VariantRow[]
  product_ingredients: IngredientRow[]
}

// ─── GET /api/products/[id] ───────────────────────────────────────────────────
// Public. The `id` path segment carries the product SLUG.
// Returns full product detail including variants, ingredients, and reviews.

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id: slug } = await params

  try {
    const supabase = await createClient()

    const { data: rawProduct, error } = await supabase
      .from('products')
      .select(
        `id, name, slug, description, category, skin_types, concerns, image_url, is_active,
         product_variants(id, size_ml, price, sku, stock, is_active),
         product_ingredients(id, name, concentration, benefit, science_note, display_order)`,
      )
      .eq('slug', slug)
      .single()

    if (error || !rawProduct) {
      return Errors.notFound('Product')
    }

    // Supabase join inference on hand-authored types requires explicit cast
    const product = rawProduct as ProductDetail

    if (!product.is_active) {
      return Errors.notFound('Product')
    }

    // ── Reviews ───────────────────────────────────────────────────────────────
    const { data: rawReviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, rating, title, body, created_at, user_id')
      .eq('product_id', product.id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    if (reviewsError) {
      console.error('[GET /api/products/[id]] reviews', reviewsError.message)
      return Errors.internal()
    }

    const reviews = (rawReviews as Pick<ReviewRow, 'id' | 'rating' | 'title' | 'body' | 'created_at' | 'user_id'>[] | null) ?? []

    // ── Reviews summary ───────────────────────────────────────────────────────
    const count   = reviews.length
    const average = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0

    const distribution: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
    for (const r of reviews) {
      distribution[String(r.rating)] = (distribution[String(r.rating)] ?? 0) + 1
    }

    // ── Sort ingredients by display_order ─────────────────────────────────────
    const ingredients = [...(product.product_ingredients ?? [])].sort(
      (a, b) => a.display_order - b.display_order,
    )

    return NextResponse.json({
      id:          product.id,
      name:        product.name,
      slug:        product.slug,
      description: product.description,
      category:    product.category,
      skin_types:  product.skin_types,
      concerns:    product.concerns,
      image_url:   product.image_url,
      is_active:   product.is_active,
      variants:    product.product_variants ?? [],
      ingredients,
      reviews_summary: {
        average: Math.round(average * 10) / 10,
        count,
        distribution,
      },
      reviews: reviews.map((r) => ({
        id:            r.id,
        rating:        r.rating,
        title:         r.title,
        body:          r.body,
        created_at:    r.created_at,
        user_initials: '••',
      })),
    })
  } catch (err) {
    console.error('[GET /api/products/[id]] unexpected', err)
    return Errors.internal()
  }
}

// ─── PATCH /api/products/[id] ─────────────────────────────────────────────────
// Internal only. The `id` path segment carries the product UUID.

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  if (!isServiceRole(request)) return Errors.forbidden()

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Errors.validation({ _: ['Invalid JSON body.'] })
  }

  const parsed = UpdateProductSchema.safeParse(body)
  if (!parsed.success) {
    return Errors.validation(parsed.error.flatten().fieldErrors)
  }

  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('products')
      .update(parsed.data)
      .eq('id', id)
      .select('id, updated_at')
      .single()

    if (error || !data) {
      return Errors.notFound('Product')
    }

    return NextResponse.json({ id: data.id, updated_at: data.updated_at })
  } catch (err) {
    console.error('[PATCH /api/products/[id]] unexpected', err)
    return Errors.internal()
  }
}

// ─── DELETE /api/products/[id] ────────────────────────────────────────────────
// Internal only. Soft-delete: sets is_active = false. Never hard-deletes.

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  if (!isServiceRole(request)) return Errors.forbidden()

  const { id } = await params

  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id)
      .select('id, is_active')
      .single()

    if (error || !data) {
      return Errors.notFound('Product')
    }

    return NextResponse.json({ id: data.id, is_active: false })
  } catch (err) {
    console.error('[DELETE /api/products/[id]] unexpected', err)
    return Errors.internal()
  }
}
