import { unstable_cache } from 'next/cache'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { ProductTile } from '@/components/shop/ProductTile'
import { FilterBar } from '@/components/shop/FilterBar'
import { SkinInsightCTA } from '@/components/shop/SkinInsightCTA'
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
const PLACEHOLDER_TONES = ['mineral', 'default', 'ink', 'default'] as const

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
    const items = rows.map((row) => {
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
  offset:    number
  total:     number
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

  const cellBase =
    'font-mono text-[10px] tracking-widest uppercase px-3.5 py-2.5 border border-hairline'

  return (
    <nav
      aria-label="Pagination"
      data-testid="pagination"
      className="flex items-center justify-center gap-3 mt-14"
    >
      {hasPrev ? (
        <Link
          href={pageUrl(offset - LIMIT)}
          data-testid="pagination-prev"
          className={`${cellBase} text-ink hover:bg-paper-2 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2`}
        >
          ← Prev
        </Link>
      ) : (
        <span
          data-testid="pagination-prev"
          aria-disabled="true"
          className={`${cellBase} text-graphite cursor-not-allowed`}
        >
          ← Prev
        </span>
      )}

      <span
        data-testid="pagination-counter"
        className={`${cellBase} text-ink tabular-nums`}
      >
        Page {String(currentPage).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
      </span>

      {hasNext ? (
        <Link
          href={pageUrl(offset + LIMIT)}
          data-testid="pagination-next"
          className={`${cellBase} text-ink hover:bg-paper-2 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2`}
        >
          Next →
        </Link>
      ) : (
        <span
          data-testid="pagination-next"
          aria-disabled="true"
          className={`${cellBase} text-graphite cursor-not-allowed`}
        >
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

  return (
    <>
      {/* ── Filter bar ────────────────────────────────────────────────────── */}
      <FilterBar />

      {/* ── Product grid (on paper-2) ─────────────────────────────────────── */}
      <section
        aria-label="All products"
        data-testid="product-grid-section"
        className="bg-paper-2 border-b border-hairline"
      >
        <div className="max-w-container mx-auto px-8 pt-14 pb-24">

          {/* Heading + count */}
          <div className="flex items-baseline gap-3 mb-8">
            <h1 className="font-display text-4xl md:text-[44px] text-ink tracking-tighter">
              All products
            </h1>
            <span
              data-testid="product-count"
              className="font-mono text-xs text-graphite tabular-nums"
            >
              ({total})
            </span>
          </div>

          {items.length > 0 ? (
            <>
              <div
                data-testid="product-grid"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              >
                {items.map(({ product, defaultVariant }, idx) => (
                  <ProductTile
                    key={product.id}
                    product={product}
                    defaultVariant={defaultVariant}
                    placeholderTone={PLACEHOLDER_TONES[idx % PLACEHOLDER_TONES.length]}
                  />
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
            <div
              data-testid="product-grid-empty"
              className="text-center py-24 border border-hairline bg-paper"
            >
              <p className="font-mono text-xs tracking-widest uppercase text-graphite">
                — No formulas match your filters.
              </p>
              <p className="font-body text-sm text-ink-2 mt-3 max-w-[320px] mx-auto">
                Adjust your selection, or take the skin quiz to let us prescribe.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-7">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center bg-ink text-paper font-mono text-2xs tracking-widest uppercase px-5 py-3 hover:bg-ink-2 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
                >
                  Clear filters
                </Link>
                <Link
                  href="/products?quiz=true"
                  className="inline-flex items-center justify-center border border-ink text-ink font-mono text-2xs tracking-widest uppercase px-5 py-3 hover:bg-paper-2 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
                >
                  Take the quiz
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── SkinInsight CTA — always shown below grid ─────────────────────── */}
      <SkinInsightCTA />
    </>
  )
}
