import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Errors } from '@/lib/api/errors'

type RouteContext = { params: Promise<{ id: string }> }

// ─── GET /api/products/[id]/stock ─────────────────────────────────────────────
// Public. Real-time stock check called before checkout.
// The `id` segment carries the product UUID.

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params

  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('product_variants')
      .select('id, sku, stock, is_active')
      .eq('product_id', id)

    if (error) {
      console.error('[GET /api/products/[id]/stock]', error.message)
      return Errors.internal()
    }

    if (!data || data.length === 0) {
      return Errors.notFound('Product')
    }

    return NextResponse.json({ variants: data })
  } catch (err) {
    console.error('[GET /api/products/[id]/stock] unexpected', err)
    return Errors.internal()
  }
}
