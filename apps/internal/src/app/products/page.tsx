import type { Metadata } from 'next'
import Link from 'next/link'
import { ConsoleHeader } from '@/components/ConsoleHeader'
import { createAdminClient } from '@/lib/supabase/admin'
import { ListProductsQuerySchema, PAGE_SIZE } from '@/lib/api/schemas/products'
import { ProductsFilterBar } from './ProductsFilterBar'
import { ToggleActiveButton } from './ToggleActiveButton'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Products · Internal',
}

interface ProductRow {
  id:          string
  name:        string
  slug:        string
  category:    string
  is_active:   boolean
  variants:    { price: number; stock: number; is_active: boolean }[]
}

export default async function ProductsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const parsed = ListProductsQuerySchema.safeParse(raw)
  const { q, category, visibility, page } = parsed.success
    ? parsed.data
    : ListProductsQuerySchema.parse({})

  const supabase = createAdminClient()

  let query = supabase
    .from('products')
    .select(
      'id, name, slug, category, is_active, product_variants(price, stock, is_active)',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  if (q) {
    // ilike on name OR slug; Supabase `.or` uses PostgREST syntax.
    query = query.or(`name.ilike.%${q}%,slug.ilike.%${q}%`)
  }
  if (category) query = query.eq('category', category)
  if (visibility === 'active')   query = query.eq('is_active', true)
  if (visibility === 'inactive') query = query.eq('is_active', false)

  const { data, count, error } = await query

  if (error) {
    console.error('[ProductsListPage]', error.message)
  }

  const rows = ((data ?? []) as unknown as Array<ProductRow & { product_variants: ProductRow['variants'] }>).map(
    (r) => ({ ...r, variants: r.product_variants }),
  )
  const total      = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <main className="min-h-screen bg-offwhite">
      <ConsoleHeader />
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="font-heading text-3xl text-gray-900 mb-1">Products</h1>
            <p className="font-body text-sm text-gray-600">
              {total} {total === 1 ? 'product' : 'products'} · page {page} of {totalPages}
            </p>
          </div>
          <Link
            href="/products/new"
            data-testid="products-new-link"
            className="bg-gray-900 text-white font-mono text-2xs uppercase tracking-wider px-4 py-2 rounded-sm hover:bg-gray-800 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
          >
            New product
          </Link>
        </div>

        <ProductsFilterBar defaultQ={q ?? ''} defaultCategory={category ?? ''} defaultVisibility={visibility} />

        {rows.length === 0 ? (
          <div className="border border-gray-200 rounded-sm bg-white p-12 text-center" data-testid="products-empty">
            <p className="font-body text-sm text-gray-600">
              No products match these filters.
            </p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-sm bg-white overflow-hidden">
            <table className="w-full" data-testid="products-table">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <Th>Name</Th>
                  <Th>Slug</Th>
                  <Th>Category</Th>
                  <Th>Variants</Th>
                  <Th>Lowest price</Th>
                  <Th>Status</Th>
                  <Th className="text-right pr-4">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const activePrices = p.variants.filter((v) => v.is_active).map((v) => v.price)
                  const starting     = activePrices.length ? Math.min(...activePrices) : 0
                  return (
                    <tr key={p.id} className="border-b border-gray-100 last:border-0" data-testid={`product-row-${p.slug}`}>
                      <Td>{p.name}</Td>
                      <Td className="font-mono text-2xs">{p.slug}</Td>
                      <Td className="capitalize">{p.category}</Td>
                      <Td>{p.variants.length}</Td>
                      <Td>{starting ? `₹${Math.round(starting / 100).toLocaleString()}` : '—'}</Td>
                      <Td>
                        <span
                          className={
                            p.is_active
                              ? 'inline-block px-2 py-0.5 rounded-sm bg-mist text-mist-text border border-mist-border font-mono text-2xs uppercase tracking-wider'
                              : 'inline-block px-2 py-0.5 rounded-sm bg-gray-100 text-gray-600 border border-gray-200 font-mono text-2xs uppercase tracking-wider'
                          }
                        >
                          {p.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </Td>
                      <Td className="text-right pr-4">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/products/${p.id}/edit`}
                            className="font-mono text-2xs uppercase tracking-wider text-gray-900 underline hover:no-underline"
                            data-testid={`product-edit-${p.slug}`}
                          >
                            Edit
                          </Link>
                          <ToggleActiveButton productId={p.id} isActive={p.is_active} slug={p.slug} />
                        </div>
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && <Pagination q={q} category={category} visibility={visibility} page={page} totalPages={totalPages} />}
      </section>
    </main>
  )
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`text-left px-4 py-3 font-mono text-2xs uppercase tracking-wider text-gray-600 ${className}`}>
      {children}
    </th>
  )
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 font-body text-sm text-gray-900 ${className}`}>{children}</td>
}

function Pagination({
  q, category, visibility, page, totalPages,
}: {
  q?: string
  category?: string
  visibility: 'all' | 'active' | 'inactive'
  page: number
  totalPages: number
}) {
  const base = new URLSearchParams()
  if (q)        base.set('q', q)
  if (category) base.set('category', category)
  if (visibility !== 'all') base.set('visibility', visibility)

  const hrefFor = (p: number) => {
    const qs = new URLSearchParams(base)
    if (p > 1) qs.set('page', String(p))
    const s = qs.toString()
    return `/products${s ? `?${s}` : ''}`
  }

  return (
    <div className="flex items-center justify-between mt-6" data-testid="products-pagination">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`font-mono text-2xs uppercase tracking-wider ${page === 1 ? 'text-gray-400 pointer-events-none' : 'text-gray-900 hover:underline'}`}
      >
        ← Previous
      </Link>
      <span className="font-mono text-2xs uppercase tracking-wider text-gray-600">
        {page} / {totalPages}
      </span>
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={`font-mono text-2xs uppercase tracking-wider ${page === totalPages ? 'text-gray-400 pointer-events-none' : 'text-gray-900 hover:underline'}`}
      >
        Next →
      </Link>
    </div>
  )
}
