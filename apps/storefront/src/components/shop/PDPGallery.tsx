'use client'

import { useState } from 'react'
import Image from 'next/image'

interface PDPGalleryProps {
  /** Single image URL from product.image_url. MVP: shown as hero + repeated in 4 thumbs. */
  imageUrl: string | null
  /** Product name — used for alt text. */
  name:     string
  /** Placeholder tone when no image is supplied. */
  placeholderTone?: 'default' | 'mineral' | 'ink'
}

const toneClass: Record<NonNullable<PDPGalleryProps['placeholderTone']>, string> = {
  default: '',
  mineral: 'm-ph--mineral',
  ink:     'm-ph--ink',
}

export function PDPGallery({
  imageUrl,
  name,
  placeholderTone = 'mineral',
}: PDPGalleryProps) {
  // Four slots. MVP: same image in every slot. Once real galleries ship, this
  // becomes an array of { url, alt } and the hero swaps on thumbnail click.
  const slots = [0, 1, 2, 3]
  const [selected, setSelected] = useState(0)

  return (
    <div data-testid="pdp-gallery">
      {/* Hero — 1:1 square */}
      <div
        data-testid="pdp-gallery-hero"
        className="relative aspect-square overflow-hidden border border-hairline bg-paper-2"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <>
            <div
              className={`m-ph ${toneClass[placeholderTone]} absolute inset-0`}
              aria-hidden="true"
            />
            <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between px-4 py-3 font-mono text-[9px] tracking-widest uppercase text-graphite">
              <span aria-hidden="true">Specimen · Hero</span>
              <span aria-hidden="true">Selected image</span>
            </div>
          </>
        )}
      </div>

      {/* Thumbnail row */}
      <div
        data-testid="pdp-gallery-thumbs"
        role="tablist"
        aria-label="Product images"
        className="grid grid-cols-4 gap-3 mt-3"
      >
        {slots.map((i) => {
          const isSelected = i === selected
          return (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-label={`Image ${i + 1}`}
              data-testid={`pdp-gallery-thumb-${i}`}
              data-selected={isSelected}
              onClick={() => setSelected(i)}
              className={[
                'relative aspect-square overflow-hidden transition-colors',
                isSelected ? 'border border-ink' : 'border border-hairline hover:border-ink',
                'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2',
              ].join(' ')}
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 25vw, 12vw"
                />
              ) : (
                <>
                  <div className={`m-ph ${toneClass[placeholderTone]} absolute inset-0`} aria-hidden="true" />
                  <span className="absolute inset-x-0 bottom-1.5 text-center font-mono text-[9px] tracking-widest uppercase text-graphite">
                    T{i + 1}
                  </span>
                </>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
