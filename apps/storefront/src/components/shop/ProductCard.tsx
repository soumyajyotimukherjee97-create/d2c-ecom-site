import Link from 'next/link'
import Image from 'next/image'
import type { ProductSummary, Variant } from '@/types'
import { formatInr } from '@/lib/money'
import { AddToCartButton } from './AddToCartButton'

type VariantData = Pick<Variant, 'id' | 'size_ml' | 'price' | 'sku' | 'stock' | 'is_active'>

interface ProductCardProps {
  product: ProductSummary
  defaultVariant?: VariantData | null
}

const categoryBg: Record<string, string> = {
  serum:       'bg-gray-50',
  moisturiser: 'bg-blush',
  toner:       'bg-mist',
  spf:         'bg-gray-50',
}

export function ProductCard({ product, defaultVariant }: ProductCardProps) {
  const { id, name, slug, category, concerns, image_url, starting_price } = product
  const price = formatInr(starting_price)
  const imageBg = categoryBg[category] ?? 'bg-gray-50'
  const concernsText = concerns.length
    ? concerns.map((c) => c.toUpperCase()).join(' · ')
    : null

  return (
    <article
      data-testid="product-card"
      className="border border-gray-100 rounded-md overflow-hidden"
    >
      <Link
        href={`/products/${slug}`}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
      >
        <div className={`w-full aspect-square ${imageBg} relative`}>
          {image_url ? (
            <Image
              src={image_url}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <span className="sr-only">{name}</span>
          )}
        </div>
      </Link>

      <div className="p-3">
        <p className="font-mono text-2xs uppercase tracking-widest text-gray-400 mb-1">
          {category}
        </p>

        <Link
          href={`/products/${slug}`}
          className="block mb-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
        >
          <h3 className="font-body text-sm text-gray-900">{name}</h3>
        </Link>

        {concernsText && (
          <p className="font-mono text-2xs text-gray-400 mb-2">{concernsText}</p>
        )}

        <div className="flex items-center justify-between">
          <span className="font-body text-sm text-gray-900">{price}</span>
          <AddToCartButton product={product} defaultVariant={defaultVariant} />
        </div>
      </div>
    </article>
  )
}
