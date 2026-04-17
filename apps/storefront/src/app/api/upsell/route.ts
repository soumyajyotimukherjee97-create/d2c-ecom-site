import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { Errors } from '@/lib/api/errors'
import type { ProductSummary, Variant } from '@/types'

const QuerySchema = z.object({
  exclude:  z.string().optional().default(''),
  cart_key: z.string().optional().default(''),
})

type UpsellRow = {
  id: string
  name: string
  slug: string
  category: string
  skin_types: string[] | null
  concerns: string[] | null
  image_url: string | null
  is_active: boolean
  product_variants: {
    id: string
    size_ml: number
    price: number
    sku: string
    stock: number
    is_active: boolean
  }[]
}

export async function GET(request: NextRequest) {
  const raw = Object.fromEntries(request.nextUrl.searchParams.entries())
  const parsed = QuerySchema.safeParse(raw)

  if (!parsed.success) {
    return Errors.validation(parsed.error.flatten().fieldErrors)
  }

  const { exclude, cart_key } = parsed.data
  const excludeIds = exclude.split(',').filter(Boolean)

  try {
    const supabase = await createClient()
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, slug, category, skin_types, concerns, image_url, is_active, product_variants(id, size_ml, price, sku, stock, is_active)')
      .eq('is_active', true)
      .limit(10)

    if (error) {
      console.error('[GET /api/upsell]', error.message)
      return Errors.internal()
    }

    const rows = (products ?? []) as unknown as UpsellRow[]
    const candidates = rows.filter((p) => !excludeIds.includes(p.id))

    if (candidates.length === 0) {
      return NextResponse.json({ product: null, variant: null })
    }

    let hash = 0
    for (let i = 0; i < cart_key.length; i++) {
      hash = (hash * 31 + cart_key.charCodeAt(i)) | 0
    }
    const pick = candidates[Math.abs(hash) % candidates.length]
    const activeVariants = (pick.product_variants || []).filter((v) => v.is_active && v.stock > 0)

    if (activeVariants.length === 0) {
      return NextResponse.json({ product: null, variant: null })
    }

    const cheapest = activeVariants.sort((a, b) => a.price - b.price)[0]

    const product: ProductSummary = {
      id:             pick.id,
      name:           pick.name,
      slug:           pick.slug,
      category:       pick.category as ProductSummary['category'],
      skin_types:     (pick.skin_types ?? []) as ProductSummary['skin_types'],
      concerns:       (pick.concerns ?? []) as ProductSummary['concerns'],
      starting_price: cheapest.price,
      image_url:      pick.image_url,
      is_active:      true,
    }

    const variant: Variant = {
      id:        cheapest.id,
      size_ml:   cheapest.size_ml,
      price:     cheapest.price,
      sku:       cheapest.sku,
      stock:     cheapest.stock,
      is_active: true,
    }

    return NextResponse.json({ product, variant })
  } catch (err) {
    console.error('[GET /api/upsell] unexpected', err)
    return Errors.internal()
  }
}
