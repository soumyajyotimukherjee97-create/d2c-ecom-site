import { cache } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PDPPurchasePanel } from '@/components/shop/PDPPurchasePanel'
import { ReviewsSection } from '@/components/shop/ReviewsSection'
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
      .limit(3)

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
    title:       `${product.name} — Form.`,
    description: product.description ?? `Shop ${product.name} from Form.`,
    openGraph: {
      title:       `${product.name} — Form.`,
      description: product.description ?? `Shop ${product.name} from Form.`,
      images:      product.image_url ? [product.image_url] : [],
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const [product, related] = await Promise.all([
    getProduct(params.slug),
    // related is fetched after product — category needed, so sequential is fine
    // but we optimistically start fetching with getProduct above
    getProduct(params.slug).then((p) =>
      p ? getRelatedProducts(p.category, p.slug) : [],
    ),
  ])

  if (!product) notFound()

  const categoryBg: Record<string, string> = {
    serum:       'bg-gray-50',
    moisturiser: 'bg-blush',
    toner:       'bg-mist',
    spf:         'bg-gray-50',
  }
  const imageBg = categoryBg[product.category] ?? 'bg-gray-50'

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

      <main className="max-w-5xl mx-auto px-6 py-8">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-1 font-mono text-2xs text-gray-400">
            <li><Link href="/" className="hover:text-gray-900 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/products" className="hover:text-gray-900 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2">Shop</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-gray-900 truncate max-w-xs">{product.name}</li>
          </ol>
        </nav>

        {/* ── Two-column layout ─────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-8 mb-16">

          {/* Left — image */}
          <div className="flex-1">
            <div className={`w-full aspect-square ${imageBg} relative rounded-sm border border-gray-100 mb-2`}>
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  priority
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <span className="sr-only">{product.name}</span>
              )}
            </div>

            {/* Thumbnail row — single image MVP */}
            <div className="flex gap-2">
              <div
                aria-current="true"
                className={`flex-1 aspect-square ${imageBg} relative border-2 border-gray-900 rounded-sm overflow-hidden`}
              >
                {product.image_url && (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 25vw, 12vw"
                  />
                )}
              </div>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  aria-hidden="true"
                  className={`flex-1 aspect-square ${imageBg} border border-gray-100 rounded-sm`}
                />
              ))}
            </div>
          </div>

          {/* Right — purchase panel */}
          <div className="flex-1 md:flex-[1.2]">
            <PDPPurchasePanel product={product} />
          </div>

        </div>

        {/* ── Description (replaces "How to use" — no API field for steps) ─── */}
        {product.description && (
          <section aria-label="About this product" className="mb-12 max-w-2xl">
            <h2 className="font-heading text-2xl font-normal mb-4">About this product</h2>
            <p className="font-body text-base text-gray-600">{product.description}</p>
          </section>
        )}

        {/* ── Full ingredients list ─────────────────────────────────────────── */}
        {product.ingredients.length > 0 && (
          <section aria-label="Full ingredients" className="mb-12">
            <h2 className="font-heading text-2xl font-normal mb-4">Ingredients</h2>
            <div className="flex flex-col gap-2 max-w-md">
              {product.ingredients.map((ing) => (
                <IngredientTag
                  key={ing.id}
                  name={ing.name}
                  concentration={ing.concentration ?? undefined}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Reviews ──────────────────────────────────────────────────────── */}
        <ReviewsSection reviews={product.reviews} summary={product.reviews_summary} />

        {/* ── Related products ──────────────────────────────────────────────── */}
        {related.length > 0 && (
          <section aria-label="Related products" className="mt-12 pt-8 border-t border-gray-100">
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="font-heading text-2xl font-normal">You may also like</h2>
              <Link
                href="/products"
                className="font-mono text-2xs uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {related.map(({ product: p, defaultVariant }) => (
                <ProductCard key={p.id} product={p} defaultVariant={defaultVariant} />
              ))}
            </div>
          </section>
        )}

      </main>
    </>
  )
}
