import Link from 'next/link'
import Image from 'next/image'
import type { ProductSummary, Variant } from '@/types'
import { formatInr } from '@/lib/money'
import { AddToCartButton } from './AddToCartButton'

type VariantData = Pick<Variant, 'id' | 'size_ml' | 'price' | 'sku' | 'stock' | 'is_active'>

interface ProductCardProps {
  product:         ProductSummary
  defaultVariant?: VariantData | null
  /** Shows an inline "+" add-to-cart button (PLP). Home uses `false`. Default true. */
  showAddButton?:  boolean
  /** Optional editorial counter rendered as "NN" in the top-left meta row. */
  index?:          number
  /** Ink placeholder variant rotation — cycles default / mineral / ink per wireframe. */
  placeholderTone?: 'default' | 'mineral' | 'ink'
}

const toneClass: Record<NonNullable<ProductCardProps['placeholderTone']>, string> = {
  default: '',
  mineral: 'm-ph--mineral',
  ink:     'm-ph--ink',
}

export function ProductCard({
  product,
  defaultVariant,
  showAddButton   = true,
  index,
  placeholderTone = 'default',
}: ProductCardProps) {
  const { name, slug, category, image_url, starting_price } = product
  const sizeMl      = defaultVariant?.size_ml
  const isInStock   = Boolean(defaultVariant && defaultVariant.stock > 0)
  const price       = formatInr(starting_price)
  const categoryCap = category.toUpperCase()
  const indexLabel  = typeof index === 'number' ? String(index).padStart(2, '0') : null

  return (
    <article data-testid="product-card" className="relative group">
      <Link
        href={`/products/${slug}`}
        data-testid="product-card-link"
        className="block focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
      >
        {/* Specimen image */}
        <div className="relative aspect-[4/5] overflow-hidden border border-hairline bg-paper-2">
          {image_url ? (
            <Image
              src={image_url}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className={`m-ph ${toneClass[placeholderTone]} absolute inset-0`} aria-hidden="true" />
          )}
          {/* Bottom-edge specimen caption — only when no image overrides */}
          {!image_url && (
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-3 py-3 font-mono text-[9px] tracking-widest uppercase text-graphite z-10">
              <span aria-hidden="true">Specimen{indexLabel ? ` · ${indexLabel}` : ''}</span>
              {sizeMl ? <span aria-hidden="true">{categoryCap} {sizeMl}ML</span> : null}
            </div>
          )}
        </div>

        {/* Meta row — counter (L) / stock status (R) */}
        <div className="flex items-center justify-between pt-4">
          <span
            data-testid="product-card-index"
            className="font-mono text-2xs tracking-widest uppercase text-graphite"
          >
            {indexLabel ?? categoryCap}
          </span>
          <span
            data-testid="product-card-stock"
            data-stock={isInStock ? 'in' : 'out'}
            className={`font-mono text-2xs tracking-widest uppercase ${isInStock ? 'text-assay' : 'text-graphite'}`}
          >
            {isInStock ? '● In lot' : '○ Out of lot'}
          </span>
        </div>

        {/* Display name */}
        <h3 className="font-display text-2xl md:text-3xl text-ink mt-2 leading-[1.1]">
          {name}
        </h3>

        {/* Classification eyebrow */}
        <p className="font-mono text-2xs tracking-widest uppercase text-graphite mt-1.5">
          {categoryCap}
          {sizeMl ? ` · ${sizeMl} ML` : ''}
        </p>

        {/* Hairline footer — price (L) / View assay → (R) */}
        <div className="flex items-baseline justify-between pt-3.5 mt-4 border-t border-hairline/60">
          <span
            data-testid="product-card-price"
            className="font-mono text-base text-ink tabular-nums"
          >
            {price}
          </span>
          {!showAddButton && (
            <span
              aria-hidden="true"
              className="font-mono text-2xs tracking-widest uppercase text-graphite group-hover:text-ink transition-colors"
            >
              View assay →
            </span>
          )}
        </div>
      </Link>

      {/* PLP-only inline Add button — sits above the card as a sibling of the link */}
      {showAddButton && (
        <div className="absolute right-3 top-3 z-10">
          <AddToCartButton product={product} defaultVariant={defaultVariant} />
        </div>
      )}
    </article>
  )
}
