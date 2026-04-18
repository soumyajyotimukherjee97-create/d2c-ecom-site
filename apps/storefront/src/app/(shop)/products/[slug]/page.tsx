import { cache } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PDPGallery } from '@/components/shop/PDPGallery'
import { PDPPurchasePanel } from '@/components/shop/PDPPurchasePanel'
import { PDPReviews } from '@/components/shop/PDPReviews'
import { ProductCard } from '@/components/shop/ProductCard'
import { IngredientTag } from '@/components/ui/IngredientTag'
import type { Product, ProductSummary, Variant } from '@/types'
import type { Database } from '@/lib/supabase/types'

export const revalidate = 60

// ─── Types ────────────────────────────────────────────────────────────────────

type VariantRow    = Database['public']['Tables']['product_variants']['Row']
type IngredientRow = Database['public']['Tables']['product_ingredients']['Row']
type ReviewRow     = Database['public']['Tables']['reviews']['Row']

type ProductDetail = Database['public']['Tables']['products']['Row'] & {
  product_variants:    VariantRow[]
  product_ingredients: IngredientRow[]
}

// ─── Data fetching ────────────────────────────────────────────────────────────

// cache() deduplicates this call between generateMetadata and the page component
const getProduct = cache(async (slug: string): Promise<Product | null> => {
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

    if (error || !rawProduct) return null

    const product = rawProduct as ProductDetail
    if (!product.is_active) return null

    const { data: rawReviews } = await supabase
      .from('reviews')
      .select('id, rating, title, body, created_at, user_id')
      .eq('product_id', product.id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    const reviews = (rawReviews as Pick<ReviewRow, 'id' | 'rating' | 'title' | 'body' | 'created_at' | 'user_id'>[] | null) ?? []
    const count   = reviews.length
    const average = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0
    const distribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 } as Record<string, number>
    for (const r of reviews) {
      distribution[String(r.rating)] = (distribution[String(r.rating)] ?? 0) + 1
    }

    const ingredients = [...(product.product_ingredients ?? [])].sort(
      (a, b) => a.display_order - b.display_order,
    )

    const activeVariantPrices = (product.product_variants ?? [])
      .filter((v) => v.is_active)
      .map((v) => v.price)

    return {
      id:             product.id,
      starting_price: activeVariantPrices.length ? Math.min(...activeVariantPrices) : 0,
      name:           product.name,
      slug:        product.slug,
      description: product.description,
      category:    product.category as Product['category'],
      skin_types:  product.skin_types as Product['skin_types'],
      concerns:    product.concerns as Product['concerns'],
      image_url:   product.image_url,
      is_active:   product.is_active,
      variants:    (product.product_variants ?? []).filter((v) => v.is_active),
      ingredients: ingredients.map((i) => ({
        id:            i.id,
        name:          i.name,
        concentration: i.concentration,
        benefit:       i.benefit,
        science_note:  i.science_note,
        display_order: i.display_order,
      })),
      reviews_summary: {
        average: Math.round(average * 10) / 10,
        count,
        distribution: distribution as Product['reviews_summary']['distribution'],
      },
      reviews: reviews.map((r) => ({
        id:            r.id,
        rating:        r.rating,
        title:         r.title,
        body:          r.body,
        created_at:    r.created_at,
        user_initials: '••',
      })),
    }
  } catch {
    return null
  }
})

type VariantData = Pick<Variant, 'id' | 'size_ml' | 'price' | 'sku' | 'stock' | 'is_active'>

type RelatedItem = {
  product: ProductSummary
  defaultVariant: VariantData | null
}

function pickDefaultVariant(variants: { id: string; size_ml: number; price: number; sku: string; stock: number; is_active: boolean }[]): VariantData | null {
  const inStock = variants.filter((v) => v.is_active && v.stock > 0)
  if (inStock.length === 0) return null
  return inStock.reduce((cheapest, v) => (v.price < cheapest.price ? v : cheapest))
}

async function getRelatedProducts(
  category: string,
  excludeSlug: string,
): Promise<RelatedItem[]> {
  try {
    const supabase = await createClient()

    type RawRow = {
      id: string; name: string; slug: string; category: string
      skin_types: string[]; concerns: string[]; image_url: string | null
      is_active: boolean; product_variants: { id: string; size_ml: number; price: number; sku: string; stock: number; is_active: boolean }[]
    }

    const { data: rawData, error } = await supabase
      .from('products')
      .select(
        'id, name, slug, category, skin_types, concerns, image_url, is_active, product_variants!inner(id, size_ml, price, sku, stock, is_active)',
      )
      .eq('category', category)
      .eq('is_active', true)
      .eq('product_variants.is_active', true)
      .neq('slug', excludeSlug)
      .order('created_at', { ascending: false })
      .limit(4)

    if (error || !rawData) return []

    return (rawData as RawRow[]).map((row) => {
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
  } catch {
    return []
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const product = await getProduct(params.slug)
  if (!product) return {}

  return {
    title:       `${product.name} · matter`,
    description: product.description ?? `Shop ${product.name} from matter.`,
    openGraph: {
      title:       `${product.name} · matter`,
      description: product.description ?? `Shop ${product.name} from matter.`,
      images:      product.image_url ? [product.image_url] : [],
    },
  }
}

const RELATED_TONES = ['mineral', 'default', 'ink', 'default'] as const

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  const related = await getRelatedProducts(product.category, product.slug)

  // JSON-LD breadcrumb
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: '/products' },
      { '@type': 'ListItem', position: 3, name: product.name },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
      <div
        data-testid="pdp-breadcrumb"
        className="bg-paper border-b border-hairline"
      >
        <nav
          aria-label="Breadcrumb"
          className="max-w-container mx-auto px-8 py-5"
        >
          <ol className="flex items-center gap-2.5 font-mono text-[11px] tracking-widest uppercase text-graphite">
            <li>
              <Link href="/" className="hover:text-ink transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="opacity-40">/</li>
            <li>
              <Link href="/products" className="hover:text-ink transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2">
                Shop
              </Link>
            </li>
            <li aria-hidden="true" className="opacity-40">/</li>
            <li aria-current="page" className="text-ink truncate max-w-xs">
              {product.name}
            </li>
          </ol>
        </nav>
      </div>

      {/* ── PDP main: 2-col grid ─────────────────────────────────────────── */}
      <section
        aria-label={product.name}
        data-testid="pdp-main"
        className="bg-paper border-b border-hairline"
      >
        <div className="max-w-container mx-auto px-8 pt-8 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">
            <PDPGallery
              imageUrl={product.image_url}
              name={product.name}
              placeholderTone="mineral"
            />
            <PDPPurchasePanel product={product} />
          </div>
        </div>
      </section>

      {/* ── Description + full ingredients ──────────────────────────────── */}
      {(product.description || product.ingredients.length > 0) && (
        <section
          aria-label="About this product"
          data-testid="pdp-details"
          className="bg-paper-2 border-b border-hairline"
        >
          <div className="max-w-container mx-auto px-8 py-20">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
              {product.description && (
                <div className="md:col-span-6">
                  <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-graphite">
                    § Notes on the formula
                  </p>
                  <h2 className="font-display font-normal text-[clamp(32px,3.5vw,44px)] leading-[1.05] tracking-tighter mt-3.5">
                    The formulation.
                  </h2>
                  <p className="font-body text-[15px] leading-[1.7] text-ink-2 mt-6 max-w-[520px]">
                    {product.description}
                  </p>
                </div>
              )}

              {product.ingredients.length > 0 && (
                <div className="md:col-span-6">
                  <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-graphite">
                    § Full ingredients
                  </p>
                  <h2 className="font-display font-normal text-[clamp(32px,3.5vw,44px)] leading-[1.05] tracking-tighter mt-3.5">
                    The assay.
                  </h2>
                  <div className="flex flex-col gap-1.5 mt-6">
                    {product.ingredients.map((ing) => (
                      <IngredientTag
                        key={ing.id}
                        name={ing.name}
                        concentration={ing.concentration ?? undefined}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Reviews carousel ─────────────────────────────────────────────── */}
      <PDPReviews
        productName={product.name}
        reviews={product.reviews}
        summary={product.reviews_summary}
      />

      {/* ── Related products ─────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section
          aria-label="Related products"
          data-testid="pdp-related"
          className="bg-paper border-b border-hairline"
        >
          <div className="max-w-container mx-auto px-8 pt-18 pb-24">
            <div className="mb-10">
              <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-graphite">
                § Complete the regimen
              </p>
              <h2 className="font-display font-normal text-[clamp(32px,3.5vw,40px)] leading-[1.05] tracking-tighter mt-3.5">
                You might <em className="italic">also</em> like.
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map(({ product: p, defaultVariant }, idx) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  defaultVariant={defaultVariant}
                  showAddButton={false}
                  placeholderTone={RELATED_TONES[idx % RELATED_TONES.length]}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
