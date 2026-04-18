import Link from 'next/link'
import Image from 'next/image'
import type { ProductSummary, Variant } from '@/types'
import { formatInr } from '@/lib/money'
import { AddToCartButton } from './AddToCartButton'

type VariantData = Pick<Variant, 'id' | 'size_ml' | 'price' | 'sku' | 'stock' | 'is_active'>

interface ProductTileProps {
  product:         ProductSummary
  defaultVariant?: VariantData | null
  /** Rotating placeholder tone for the 1/1 specimen when there is no image. */
  placeholderTone?: 'default' | 'mineral' | 'ink'
}

const toneClass: Record<NonNullable<ProductTileProps['placeholderTone']>, string> = {
  default: '',
  mineral: 'm-ph--mineral',
  ink:     'm-ph--ink',
}

export function ProductTile({
  product,
  defaultVariant,
  placeholderTone = 'default',
}: ProductTileProps) {
  const { name, slug, category, concerns, image_url, starting_price } = product
  const categoryCap = category.toUpperCase()
  const concernsLine = concerns.length ? concerns.map((c) => c.toUpperCase()).join(' · ') : null

  return (
    <article data-testid="product-tile" className="relative">
      {/* The card link wraps image + info text only. The + button is a sibling
          positioned over the bottom-right so button/anchor nesting is avoided. */}
      <Link
        href={`/products/${slug}`}
        data-testid="product-tile-link"
        className="block focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
      >
        {/* 1/1 square specimen */}
        <div className="relative aspect-square overflow-hidden border border-hairline">
          {image_url ? (
            <Image
              src={image_url}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <>
              <div className={`m-ph ${toneClass[placeholderTone]} absolute inset-0`} aria-hidden="true" />
              <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between px-3 py-3 font-mono text-[9px] tracking-widest uppercase text-graphite">
                <span aria-hidden="true" className="truncate max-w-[60%]">
                  Specimen · {name}
                </span>
                <span aria-hidden="true">
                  {categoryCap}{defaultVariant?.size_ml ? ` ${defaultVariant.size_ml}ML` : ''}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Info block — hairline frame, border-top continues from image.
            pr-12 leaves room for the absolutely-positioned Add button. */}
        <div className="bg-paper border border-hairline border-t-0 px-5 pt-4 pb-5 pr-12">
          <p className="font-mono text-[9px] tracking-widest uppercase text-graphite">
            {categoryCap}
          </p>
          <h3
            data-testid="product-tile-name"
            className="font-body text-[15px] font-medium text-ink mt-1.5 mb-2 leading-tight"
          >
            {name}
          </h3>
          {concernsLine && (
            <p
              data-testid="product-tile-concerns"
              className="font-mono text-[9px] tracking-wider uppercase text-graphite"
            >
              {concernsLine}
            </p>
          )}
          <div className="flex items-end mt-5">
            <span
              data-testid="product-tile-price"
              className="font-mono text-[15px] text-ink tabular-nums"
            >
              {formatInr(starting_price)}
            </span>
          </div>
        </div>
      </Link>

      {/* + button sits outside the anchor to avoid invalid nesting.
          Absolute-positioned inside the info block's bottom-right. */}
      <div className="absolute right-4 bottom-4 z-10">
        <AddToCartButton product={product} defaultVariant={defaultVariant} />
      </div>
    </article>
  )
}
