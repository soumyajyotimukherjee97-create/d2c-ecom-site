import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/shop/ProductCard'
import { NewsletterForm } from '@/components/shop/NewsletterForm'
import { HomeSpotlight } from '@/components/shop/HomeSpotlight'
import { HomeReviewsCarousel } from '@/components/shop/HomeReviewsCarousel'
import { formatInr } from '@/lib/money'
import type { ProductSummary, Variant } from '@/types'

export const revalidate = 60

// ─── Data fetching ────────────────────────────────────────────────────────────

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

type FeaturedItem = {
  product: ProductSummary
  defaultVariant: VariantData | null
}

const PLACEHOLDER_TONES = ['mineral', 'default', 'ink'] as const

function pickDefaultVariant(variants: RawVariantRow[]): VariantData | null {
  const inStock = variants.filter((v) => v.is_active && v.stock > 0)
  if (inStock.length === 0) return null
  return inStock.reduce((cheapest, v) => (v.price < cheapest.price ? v : cheapest))
}

async function getFeaturedProducts(): Promise<FeaturedItem[]> {
  try {
    const supabase = await createClient()

    const { data: rawData, error } = await supabase
      .from('products')
      .select(
        'id, name, slug, category, skin_types, concerns, image_url, is_active, product_variants!inner(id, size_ml, price, sku, stock, is_active)',
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

// ─── Principles (Section 5) ──────────────────────────────────────────────────

const PRINCIPLES = [
  {
    label: 'Transparency',
    copy:  'Full disclosure of every active and its concentration, published with each lot.',
    icon: (
      <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" aria-hidden="true">
        <circle cx="24" cy="24" r="16" />
        <path d="M 12 24 L 36 24" />
        <path d="M 14 18 L 34 18" />
        <path d="M 14 30 L 34 30" />
        <path d="M 24 8 L 24 40" />
      </svg>
    ),
  },
  {
    label: 'Efficacy',
    copy:  'Formulations developed in-house, validated through blinded clinical trials.',
    icon: (
      <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" aria-hidden="true">
        <path d="M 18 8 L 18 20 L 10 38 L 38 38 L 30 20 L 30 8 Z" />
        <path d="M 16 8 L 32 8" />
        <path d="M 14 30 L 34 30" />
        <circle cx="22" cy="34" r="1.2" />
        <circle cx="28" cy="32" r="1.2" />
      </svg>
    ),
  },
  {
    label: 'Accessible',
    copy:  'Luxury-grade actives at the price of doing the science, not the marketing.',
    icon: (
      <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" aria-hidden="true">
        <path d="M 20 8 L 28 8 L 28 14 L 32 18 L 32 38 L 16 38 L 16 18 L 20 14 Z" />
        <path d="M 20 22 L 28 22" />
        <path d="M 20 28 L 28 28" />
      </svg>
    ),
  },
  {
    label: 'Sourced well',
    copy:  'Raw materials traced to origin; provenance published for every batch.',
    icon: (
      <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" aria-hidden="true">
        <circle cx="24" cy="24" r="16" />
        <ellipse cx="24" cy="24" rx="8" ry="16" />
        <path d="M 8 24 L 40 24" />
        <path d="M 10 16 L 38 16" />
        <path d="M 10 32 L 38 32" />
      </svg>
    ),
  },
]

const PRESS = ['Vogue Paris', 'Monocle', 'Financial Times', 'Kinfolk', 'NYT Styles', 'Elle Japon']

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const featured = await getFeaturedProducts()
  const hero = featured[0] ?? null

  return (
    <>
      {/* ── Section 1 · Hero ─────────────────────────────────────────────── */}
      <section
        aria-label="Hero"
        data-testid="home-hero"
        className="bg-paper border-b border-hairline"
      >
        <div className="max-w-container mx-auto px-8 pt-20 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8">
              <h1 className="font-display font-normal text-[clamp(56px,7vw,104px)] leading-[0.98] tracking-tightest">
                Skin, reduced<br />
                to its <em className="italic">matter</em>.
              </h1>
              <p className="font-body text-base text-ink-2 max-w-[460px] mt-8 leading-[1.6]">
                Ingredient-led formulas, specified to the percentage proven in trial.
                No fragrance, no fillers, no filler claims.
              </p>
              <div className="flex flex-wrap gap-2.5 mt-9">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-ink text-paper px-5 py-3.5 font-mono text-xs tracking-widest uppercase hover:bg-ink-2 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
                >
                  View the formulary <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/ingredients"
                  className="inline-flex items-center border border-ink text-ink px-5 py-3.5 font-mono text-xs tracking-widest uppercase hover:bg-paper-2 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
                >
                  Read the science
                </Link>
              </div>
            </div>

            <div className="md:col-span-4">
              {hero ? (
                <Link
                  href={`/products/${hero.product.slug}`}
                  data-testid="hero-specimen-link"
                  className="block focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
                >
                  <div className="m-ph m-ph--mineral relative aspect-[3/4] flex items-end justify-between p-4 font-mono text-[9px] tracking-widest uppercase text-graphite">
                    <span>Specimen · 01</span>
                    <span>{hero.defaultVariant?.size_ml ?? 30}ML</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-3.5 mt-1 border-t border-hairline/50">
                    <span className="font-mono text-xs text-graphite tracking-wider">
                      01 / {hero.product.name}
                    </span>
                    <span className="font-mono text-sm text-ink tabular-nums">
                      {formatInr(hero.product.starting_price)}
                    </span>
                  </div>
                </Link>
              ) : (
                <div
                  aria-hidden="true"
                  className="m-ph m-ph--mineral aspect-[3/4]"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2 · Featured formulas ────────────────────────────────── */}
      <section
        aria-label="Featured formulas"
        data-testid="home-featured"
        className="bg-paper border-b border-hairline"
      >
        <div className="max-w-container mx-auto px-8 py-24">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12">
            <div>
              <p className="font-mono text-2xs tracking-widest uppercase text-graphite">
                § II — Featured formulas
              </p>
              <h2 className="font-display text-4xl md:text-5xl text-ink mt-3.5">
                Start your <em className="italic">journey</em> here.
              </h2>
            </div>
            <Link
              href="/products"
              data-testid="home-featured-viewall"
              className="font-mono text-xs tracking-widest uppercase text-ink border-b border-ink pb-0.5 hover:text-graphite hover:border-graphite transition-colors"
            >
              View all nine →
            </Link>
          </div>

          {featured.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featured.map(({ product, defaultVariant }, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  defaultVariant={defaultVariant}
                  showAddButton={false}
                  index={idx + 1}
                  placeholderTone={PLACEHOLDER_TONES[idx % PLACEHOLDER_TONES.length]}
                />
              ))}
            </div>
          ) : (
            <div
              data-testid="home-featured-empty"
              className="text-center py-24 border border-hairline"
            >
              <p className="font-mono text-2xs tracking-widest uppercase text-graphite">
                — No formulas in stock.
              </p>
              <Link
                href="/products"
                className="inline-block font-mono text-xs tracking-widest uppercase text-ink border-b border-ink pb-0.5 mt-4 hover:text-graphite hover:border-graphite transition-colors"
              >
                Browse the formulary →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Section 3 · Know your ingredient (client) ────────────────────── */}
      <HomeSpotlight />

      {/* ── Section 4 · Principles (4-up) ────────────────────────────────── */}
      <section
        aria-label="Principles"
        data-testid="home-principles"
        className="bg-paper border-b border-hairline"
      >
        <div className="max-w-container mx-auto px-8 py-30 text-center">
          <p className="font-mono text-2xs tracking-widest uppercase text-graphite">
            § III — Principles
          </p>
          <h2 className="font-display font-normal text-[clamp(40px,5vw,64px)] leading-[1.05] tracking-tighter mt-4 mx-auto max-w-[840px]">
            The <em className="italic">future</em> of personal care is here.
          </h2>
          <p className="font-body text-[15px] leading-[1.7] text-ink-2 max-w-[560px] mx-auto mt-6">
            Embrace matter — where each element is chosen for its scientific merit,
            offering you authentic, effective skincare.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 border border-hairline mt-24 text-left">
            {PRINCIPLES.map((p, i) => (
              <div
                key={p.label}
                data-testid={`principle-${p.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={[
                  'px-6 py-14 flex flex-col items-center text-center',
                  i < PRINCIPLES.length - 1 ? 'md:border-r border-hairline' : '',
                  i < 2 ? 'border-b md:border-b-0' : '',
                  i === 0 ? 'border-r' : '',
                  i === 2 ? 'border-r md:border-r' : '',
                ].join(' ')}
              >
                <p className="font-mono text-[9px] tracking-widest uppercase text-graphite">
                  0{i + 1}
                </p>
                <div className="text-ink my-6">{p.icon}</div>
                <h3 className="font-display text-2xl text-ink">{p.label}</h3>
                <p className="font-body text-sm leading-[1.6] text-ink-2 mt-3.5 max-w-[220px]">
                  {p.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 5 · Reviews carousel (client) ────────────────────────── */}
      <HomeReviewsCarousel />

      {/* ── Section 6 · Press (6-cell) ───────────────────────────────────── */}
      <section
        aria-label="As seen in"
        data-testid="home-press"
        className="bg-paper border-b border-hairline"
      >
        <div className="max-w-container mx-auto px-8 py-18">
          <div className="flex items-center justify-between mb-8">
            <p className="font-mono text-2xs tracking-widest uppercase text-graphite">
              § IV — As seen in
            </p>
            <span className="font-mono text-2xs tracking-widest uppercase text-graphite">
              Press · 2024 – 2026
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 border-t border-b border-hairline">
            {PRESS.map((p, i) => (
              <div
                key={p}
                data-testid={`press-cell-${i}`}
                className={[
                  'py-9 px-4 text-center',
                  i < PRESS.length - 1 ? 'md:border-r border-hairline/60' : '',
                  i % 2 === 0 && i < PRESS.length - 1 ? 'border-r' : '',
                  i < PRESS.length - 2 ? 'border-b md:border-b-0' : '',
                ].join(' ')}
              >
                <span className="font-display text-xl md:text-2xl text-ink">
                  {p}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 7 · Newsletter ───────────────────────────────────────── */}
      <section
        aria-label="Newsletter"
        data-testid="home-newsletter"
        className="bg-paper-2 border-b border-hairline"
      >
        <div className="max-w-container mx-auto px-8 py-24">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-6">
              <p className="font-mono text-2xs tracking-widest uppercase text-graphite">
                § V — Stay informed
              </p>
              <h2 className="font-display font-normal text-[clamp(40px,4.5vw,60px)] leading-[1.02] mt-4">
                Formulary updates.<br />
                <em className="italic">Nothing</em> else.
              </h2>
              <p className="font-body text-sm leading-[1.6] text-ink-2 max-w-[440px] mt-5">
                New lots, active revisions, the occasional trial publication.
                No promotions, no unsubscribe-bait.
              </p>
            </div>
            <div className="md:col-span-6">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
