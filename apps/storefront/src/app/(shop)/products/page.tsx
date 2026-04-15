import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/shop/ProductCard'
import { FilterBar } from '@/components/shop/FilterBar'
import { EmptyState } from '@/components/ui/EmptyState'
import type { ProductSummary } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type SearchParams = { [key: string]: string | string[] | undefined }

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

// ─── Data fetching ────────────────────────────────────────────────────────────

const LIMIT = 20

async function getProducts(params: {
  skin_type?: string
  concern?: string
  sort: string
  offset: number
}): Promise<{ products: ProductSummary[]; total: number }> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('products')
      .select(
        'id, name, slug, category, skin_types, concerns, image_url, is_active, product_variants!inner(price)',
        { count: 'exact' },
      )
      .eq('is_active', true)
      .eq('product_variants.is_active', true)

    if (params.skin_type) {
      query = query.contains('skin_types', [params.skin_type])
    }
    if (params.concern) {
      query = query.contains('concerns', [params.concern])
    }

    switch (params.sort) {
      case 'name_asc':
        query = query.order('name', { ascending: true })
        break
      case 'price_asc':
      case 'price_desc':
        query = query.order('name', { ascending: true })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    query = query.range(params.offset, params.offset + LIMIT - 1)

    const { data: rawData, count, error } = await query

    if (error || !rawData) return { products: [], total: 0 }

    const rows = rawData as RawRow[]
    let products = rows.map((row) => {
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

    if (params.sort === 'price_asc')  products.sort((a, b) => a.starting_price - b.starting_price)
    if (params.sort === 'price_desc') products.sort((a, b) => b.starting_price - a.starting_price)

    return { products, total: count ?? 0 }
  } catch {
    return { products: [], total: 0 }
  }
}

// ─── Pagination component ─────────────────────────────────────────────────────

function Pagination({
  offset,
  total,
  skinType,
  concern,
  sort,
}: {
  offset:   number
  total:    number
  skinType?: string
  concern?:  string
  sort:      string
}) {
  if (total <= LIMIT) return null

  const currentPage = Math.floor(offset / LIMIT) + 1
  const totalPages  = Math.ceil(total / LIMIT)
  const hasPrev     = offset > 0
  const hasNext     = offset + LIMIT < total

  function pageUrl(newOffset: number) {
    const params = new URLSearchParams()
    if (skinType) params.set('skin_type', skinType)
    if (concern)  params.set('concern', concern)
    if (sort !== 'created_at_desc') params.set('sort', sort)
    if (newOffset > 0) params.set('offset', String(newOffset))
    const qs = params.toString()
    return qs ? `/products?${qs}` : '/products'
  }

  return (
    <nav
      aria-label="Pagination"
      data-testid="pagination"
      className="flex items-center justify-center gap-2 mt-8"
    >
      {hasPrev ? (
        <Link
          href={pageUrl(offset - LIMIT)}
          className="font-mono text-2xs uppercase tracking-wider px-4 py-2 border border-gray-100 rounded-sm text-gray-900 hover:border-gray-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
        >
          ← Previous
        </Link>
      ) : (
        <span className="font-mono text-2xs uppercase tracking-wider px-4 py-2 border border-gray-100 rounded-sm text-gray-400 cursor-not-allowed">
          ← Previous
        </span>
      )}

      <span className="font-mono text-2xs text-gray-400 px-3 py-2 border border-gray-100 rounded-sm">
        {currentPage} of {totalPages}
      </span>

      {hasNext ? (
        <Link
          href={pageUrl(offset + LIMIT)}
          className="font-mono text-2xs uppercase tracking-wider px-4 py-2 border border-gray-100 rounded-sm text-gray-900 hover:border-gray-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
        >
          Next →
        </Link>
      ) : (
        <span className="font-mono text-2xs uppercase tracking-wider px-4 py-2 border border-gray-100 rounded-sm text-gray-400 cursor-not-allowed">
          Next →
        </span>
      )}
    </nav>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const skinType = typeof searchParams.skin_type === 'string' ? searchParams.skin_type : undefined
  const concern  = typeof searchParams.concern   === 'string' ? searchParams.concern   : undefined
  const sort     = typeof searchParams.sort      === 'string' ? searchParams.sort      : 'created_at_desc'
  const offset   = typeof searchParams.offset    === 'string' ? Math.max(0, parseInt(searchParams.offset, 10) || 0) : 0

  const { products, total } = await getProducts({ skin_type: skinType, concern, sort, offset })

  const hasActiveFilters = Boolean(skinType || concern)

  return (
    <>
      {/* ── Filter bar ────────────────────────────────────────────────────── */}
      <FilterBar />

      {/* ── Product grid ──────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Heading + count */}
        <div className="flex items-baseline gap-2 mb-6">
          <h1 className="font-heading text-3xl font-normal">All products</h1>
          <span className="font-mono text-xs text-gray-400">({total})</span>
        </div>

        {products.length > 0 ? (
          <>
            <div
              data-testid="product-grid"
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <Pagination
              offset={offset}
              total={total}
              skinType={skinType}
              concern={concern}
              sort={sort}
            />
          </>
        ) : (
          <EmptyState
            heading="No products match these filters."
            body="Try removing a filter or browsing all products."
            actions={
              <>
                <Link
                  href="/products"
                  className="font-body text-xs uppercase tracking-wider bg-gray-900 text-white px-4 py-2 rounded-sm hover:bg-gray-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
                >
                  Clear all filters
                </Link>
                <Link
                  href="/products?quiz=true"
                  className="font-body text-xs uppercase tracking-wider border border-gray-200 text-gray-900 px-4 py-2 rounded-sm hover:border-gray-400 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
                >
                  Take the skin quiz
                </Link>
              </>
            }
          />
        )}
      </main>

      {/* ── Quiz CTA — always shown ────────────────────────────────────────── */}
      <section
        aria-label="Not sure where to start"
        className="bg-offwhite border-t border-gray-100 text-center py-12 px-6"
      >
        <h2 className="font-heading text-xl font-normal mb-1">
          Not sure where to start?
        </h2>
        <p className="font-body text-sm text-gray-600 mb-6">
          Take the 2-minute skin quiz and we&apos;ll match you to the right routine.
        </p>
        <Link
          href="/products?quiz=true"
          className="inline-block font-body text-xs uppercase tracking-wider bg-gray-900 text-white px-6 py-2 rounded-sm hover:bg-gray-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
        >
          Take the quiz →
        </Link>
      </section>
    </>
  )
}
