import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isServiceRole } from '@/lib/api/auth'
import { Errors } from '@/lib/api/errors'
import { UpdateVariantSchema } from '@/lib/api/schemas/products'

type RouteContext = { params: Promise<{ id: string; variantId: string }> }

// ─── PATCH /api/products/[id]/variants/[variantId] ────────────────────────────
// Internal only. Updates price, stock, or active state of a specific variant.

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  if (!isServiceRole(request)) return Errors.forbidden()

  const { id: productId, variantId } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Errors.validation({ _: ['Invalid JSON body.'] })
  }

  const parsed = UpdateVariantSchema.safeParse(body)
  if (!parsed.success) {
    return Errors.validation(parsed.error.flatten().fieldErrors)
  }

  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('product_variants')
      .update(parsed.data)
      .eq('id', variantId)
      .eq('product_id', productId)
      .select('id, stock')
      .single()

    if (error || !data) {
      return Errors.notFound('Variant')
    }

    return NextResponse.json({ id: data.id, stock: data.stock })
  } catch (err) {
    console.error('[PATCH /api/products/[id]/variants/[variantId]] unexpected', err)
    return Errors.internal()
  }
}
