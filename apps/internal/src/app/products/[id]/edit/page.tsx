import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ConsoleHeader } from '@/components/ConsoleHeader'
import { createAdminClient } from '@/lib/supabase/admin'
import { EditProductForm, type ProductForEdit } from './EditProductForm'
import { VariantsManager, type VariantRow } from './VariantsManager'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Edit product · Internal',
}

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params:       Promise<{ id: string }>
  searchParams: Promise<{ created?: string }>
}) {
  const { id }      = await params
  const { created } = await searchParams

  const supabase = createAdminClient()
  const { data: product, error } = await supabase
    .from('products')
    .select('id, name, slug, description, category, skin_types, concerns, image_url, is_active')
    .eq('id', id)
    .maybeSingle()

  if (error) console.error('[EditProductPage] product', error.message)
  if (!product) notFound()

  const { data: variants } = await supabase
    .from('product_variants')
    .select('id, size_ml, price, sku, stock, is_active')
    .eq('product_id', id)
    .order('size_ml', { ascending: true })

  return (
    <main className="min-h-screen bg-offwhite">
      <ConsoleHeader />
      <section className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/products" className="font-mono text-2xs uppercase tracking-wider text-gray-600 hover:text-gray-900">
          ← Back to products
        </Link>
        <div className="flex items-end justify-between mt-2 mb-6">
          <h1 className="font-heading text-3xl text-gray-900">{(product as ProductForEdit).name}</h1>
          <span className="font-mono text-2xs uppercase tracking-wider text-gray-400">
            {(product as ProductForEdit).slug}
          </span>
        </div>

        {created === '1' && (
          <div className="border border-mist-border bg-mist text-mist-text rounded-sm px-4 py-3 mb-6 font-body text-sm" data-testid="created-toast">
            Product created. You can add more variants or edit details below.
          </div>
        )}

        <EditProductForm product={product as ProductForEdit} />

        <div className="mt-12">
          <h2 className="font-heading text-2xl text-gray-900 mb-1">Variants</h2>
          <p className="font-mono text-2xs uppercase tracking-wider text-gray-400 mb-4">
            Prices stored in paise · ₹1 = 100 paise
          </p>
          <VariantsManager productId={id} variants={(variants ?? []) as VariantRow[]} />
        </div>
      </section>
    </main>
  )
}
