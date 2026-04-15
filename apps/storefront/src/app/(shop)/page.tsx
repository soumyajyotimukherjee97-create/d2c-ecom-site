import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/shop/ProductCard'
import { NewsletterForm } from '@/components/shop/NewsletterForm'
import { IngredientTag } from '@/components/ui'
import type { ProductSummary } from '@/types'

export const revalidate = 60

// ─── Data fetching ────────────────────────────────────────────────────────────

type RawRow = {
  id: string
  name: string
  slug: string
  category: string
  skin_types: string[]
  concerns: string[]
  image_url: string | null
  is_active: boolean
  product_variants: { price: number }[]
}

async function getFeaturedProducts(): Promise<ProductSummary[]> {
  try {
    const supabase = await createClient()

    const { data: rawData, error } = await supabase
      .from('products')
      .select(
        'id, name, slug, category, skin_types, concerns, image_url, is_active, product_variants!inner(price)',
      )
      .eq('is_active', true)
      .eq('product_variants.is_active', true)
      .order('created_at', { ascending: false })
      .limit(3)

    if (error || !rawData) return []

    const rows = rawData as RawRow[]

    return rows.map((row) => {
      const prices = row.product_variants.map((v) => v.price)
      return {
        id:             row.id,
        name:           row.name,
        slug:           row.slug,
        category:       row.category as ProductSummary['category'],
        skin_types:     row.skin_types as ProductSummary['skin_types'],
        concerns:       row.concerns as ProductSummary['concerns'],
        image_url:      row.image_url,
        is_active:      row.is_active,
        starting_price: prices.length ? Math.min(...prices) : 0,
      }
    })
  } catch {
    return []
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const products = await getFeaturedProducts()

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section
        aria-label="Hero"
        className="text-center px-6 py-24 md:py-32"
      >
        <p className="font-mono text-2xs uppercase tracking-widest text-gray-400 mb-6">
          New — Vitamin C Brightening Serum
        </p>

        <h1 className="font-heading text-4xl font-normal tracking-tight leading-tight mb-4">
          Skin reduced<br />
          <em>to its essentials.</em>
        </h1>

        <p className="font-body text-base text-gray-600 max-w-xs mx-auto mb-8">
          Ingredient-led formulas. No filler. No fragrance. Just what your skin needs.
        </p>

        <div className="flex gap-2 justify-center">
          <Link
            href="/products"
            className="inline-block font-body text-xs uppercase tracking-wider bg-gray-900 text-white px-6 py-2 rounded-sm hover:bg-gray-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
          >
            Shop all products
          </Link>
          <Link
            href="/products?quiz=true"
            className="inline-block font-body text-xs uppercase tracking-wider bg-white border border-gray-200 text-gray-900 px-6 py-2 rounded-sm hover:border-gray-400 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
          >
            Take the skin quiz
          </Link>
        </div>
      </section>

      {/* ── Philosophy strip ──────────────────────────────────────────────────── */}
      <section
        aria-label="Our philosophy"
        className="border-t border-b border-gray-100 bg-offwhite"
      >
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {[
            { label: 'PHILOSOPHY',   value: 'Ingredient-led' },
            { label: 'FORMULATION',  value: 'pH-optimised' },
            { label: 'TESTED',       value: 'Dermatologist approved' },
            { label: 'PROMISE',      value: 'No fragrance. Ever.' },
          ].map(({ label, value }, i, arr) => (
            <div
              key={label}
              className={[
                'py-4 px-6 text-center',
                i < arr.length - 1 ? 'border-b md:border-b-0 md:border-r border-gray-100' : '',
              ].join(' ')}
            >
              <p className="font-mono text-2xs uppercase tracking-widest text-gray-400 mb-1">
                {label}
              </p>
              <p className="font-body text-sm font-medium text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured products ─────────────────────────────────────────────────── */}
      <section
        aria-label="Featured products"
        className="max-w-5xl mx-auto px-6 py-16"
      >
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-heading text-2xl font-normal">Featured products</h2>
          <Link
            href="/products"
            className="font-mono text-2xs uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
          >
            View all →
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-gray-100 rounded-md">
            <p className="font-body text-sm text-gray-600 mb-4">
              No products available right now.
            </p>
            <Link
              href="/products"
              className="font-mono text-2xs uppercase tracking-widest text-gray-900 hover:text-gray-600 transition-colors"
            >
              Browse the full range →
            </Link>
          </div>
        )}
      </section>

      {/* ── Ingredient spotlight ──────────────────────────────────────────────── */}
      <section
        aria-label="Ingredient spotlight"
        className="bg-offwhite border-t border-gray-100"
      >
        <div className="max-w-5xl mx-auto px-6 py-16 flex gap-8 items-center">
          <div className="flex-1">
            <p className="font-mono text-2xs uppercase tracking-widest text-gray-400 mb-2">
              INGREDIENT SPOTLIGHT
            </p>
            <h2 className="font-heading text-2xl font-normal leading-snug mb-4">
              Niacinamide —<br />
              why 2% is the sweet spot.
            </h2>
            <p className="font-body text-sm text-gray-600 mb-4">
              At 2%, niacinamide visibly reduces pore size and regulates sebum without
              irritating sensitive skin. Higher isn&apos;t better — it&apos;s about precision.
            </p>
            <div className="mb-6">
              <IngredientTag
                name="NIACINAMIDE"
                concentration={2}
              />
            </div>
            <Link
              href="/journal"
              className="inline-block font-body text-xs uppercase tracking-wider border border-gray-200 text-gray-900 px-6 py-2 rounded-sm hover:border-gray-400 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
            >
              Read the science →
            </Link>
          </div>

          {/* Product image placeholder */}
          <div
            aria-hidden="true"
            className="w-48 shrink-0 h-64 bg-mist border border-gray-100 rounded-sm hidden md:block"
          />
        </div>
      </section>

      {/* ── Press strip ───────────────────────────────────────────────────────── */}
      <section
        aria-label="As seen in"
        className="py-12 px-6 text-center border-t border-gray-100"
      >
        <p className="font-mono text-2xs uppercase tracking-widest text-gray-400 mb-6">
          AS SEEN IN
        </p>
        <div className="flex items-center justify-center gap-8 flex-wrap">
          {['Vogue', 'Harper&apos;s Bazaar', 'Femina', 'Cosmopolitan'].map((name) => (
            <span
              key={name}
              className="font-mono text-xs text-gray-400 uppercase tracking-widest"
            >
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* ── Newsletter ────────────────────────────────────────────────────────── */}
      <section
        aria-label="Newsletter"
        className="bg-offwhite border-t border-gray-100 py-12 px-6 text-center"
      >
        <p className="font-mono text-2xs uppercase tracking-widest text-gray-400 mb-2">
          STAY INFORMED
        </p>
        <h2 className="font-heading text-xl font-normal mb-1">
          Ingredient updates. Routine edits.
        </h2>
        <p className="font-body text-sm text-gray-600 mb-6">
          No marketing email. Just skin science.
        </p>
        <div className="flex justify-center">
          <NewsletterForm />
        </div>
      </section>
    </>
  )
}
