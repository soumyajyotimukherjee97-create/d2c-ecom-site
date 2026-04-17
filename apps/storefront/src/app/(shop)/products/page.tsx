import { unstable_cache } from 'next/cache'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { ProductCard } from '@/components/shop/ProductCard'
import { FilterBar } from '@/components/shop/FilterBar'
import { EmptyState } from '@/components/ui/EmptyState'
import type { ProductSummary, Variant } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type SearchParams = { [key: string]: string | string[] | undefined }

type VariantData = Pick<Variant, 'id' | 'size_ml' | 'price' | 'sku' | 'stock' | 'is_active'>

type RawVariantRow = {
  id: string
  size_ml: number
  price: number
  sku: string
  stock: number
  is_active: boolean
}

type RawRow = {
  id: string
  name: string
  slug: string
  category: string
  skin_types: string[]
  concerns: string[]
  image_url: string | null
  is_active: boolean
  product_variants: RawVariantRow[]
}

type ProductWithDefault = {
  product: ProductSummary
  defaultVariant: VariantData | null
}

export const revalidate = 60

// ─── Data fetching ────────────────────────────────────────────────────────────

const LIMIT = 20

function pickDefaultVariant(variants: RawVariantRow[]): VariantData | null {
  const inStock = variants.filter((v) => v.is_active && v.stock > 0)
  if (inStock.length === 0) return null
  return inStock.reduce((cheapest, v) => (v.price < cheapest.price ? v : cheapest))
}

async function fetchProducts(
  skin_type: string,
  concern: string,
  sort: string,
  offset: number,
): Promise<{ items: ProductWithDefault[]; total: number }> {
  try {
    const supabase = createAdminClient()

    let query = supabase
      .from('products')
      .select(
        'id, name, slug, category, skin_types, concerns, image_url, is_active, product_variants!inner(id, size_ml, price, sku, stock, is_active)',
        { count: 'exact' },
      )
      .eq('is_active', true)
      .eq('product_variants.is_active', true)

    if (skin_type) {
      query = query.contains('skin_types', [skin_type])
    }
    if (concern) {
      query = query.contains('concerns', [concern])
    }

    switch (sort) {
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

    query = query.range(offset, offset + LIMIT - 1)

    const { data: rawData, count, error } = await query

    if (error || !rawData) return { items: [], total: 0 }

    const rows = rawData as RawRow[]
    let items = rows.map((row) => {
      const prices = row.product_variants.map((v) => v.price)
      return {
        product: {
          id:             row.id,
          name:           row.name,
          slug:           row.slug,
          category:       row.category as ProductSummary['category'],
          skin_types:     row.skin_types as ProductSummary['skin_types'],
          concerns:       row.concerns as ProductSummary['concerns'],
          image_url:      row.image_url,
          is_active:      row.is_active,
          starting_price: prices.length ? Math.min(...prices) : 0,
        },
        defaultVariant: pickDefaultVariant(row.product_variants),
      }
    })

    if (sort === 'price_asc')  items.sort((a, b) => a.product.starting_price - b.product.starting_price)
    if (sort === 'price_desc') items.sort((a, b) => b.product.starting_price - a.product.starting_price)

    return { items, total: count ?? 0 }
  } catch {
    return { items: [], total: 0 }
  }
}

const getProducts = unstable_cache(
  fetchProducts,
  ['plp-products'],
  { revalidate: 60, tags: ['products'] },
)

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

  const { items, total } = await getProducts(skinType ?? '', concern ?? '', sort, offset)

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

        {items.length > 0 ? (
          <>
            <div
              data-testid="product-grid"
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              {items.map(({ product, defaultVariant }) => (
                <ProductCard key={product.id} product={product} defaultVariant={defaultVariant} />
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
