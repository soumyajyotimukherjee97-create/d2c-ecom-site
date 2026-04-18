'use client'

import { useState } from 'react'
import type { Review, ReviewsSummary } from '@/types'

const PER_PAGE = 3

function ArrowButton({
  direction,
  onClick,
  disabled,
}: {
  direction: 'prev' | 'next'
  onClick:   () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'prev' ? 'Previous reviews' : 'Next reviews'}
      data-testid={`pdp-reviews-arrow-${direction}`}
      className="inline-flex w-10 h-10 items-center justify-center border border-ink text-ink hover:bg-ink hover:text-paper disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
        {direction === 'prev'
          ? <path d="M 9 2 L 4 7 L 9 12" />
          : <path d="M 5 2 L 10 7 L 5 12" />}
      </svg>
    </button>
  )
}

function StarRow({ rating }: { rating: number }) {
  return (
    <p
      aria-label={`Rated ${rating} out of 5`}
      className="font-mono text-sm tracking-[0.18em] text-ink"
    >
      {'★'.repeat(rating)}
      <span className="text-hairline">{'★'.repeat(5 - rating)}</span>
    </p>
  )
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(d.getUTCDate()).padStart(2, '0')
    const yy = String(d.getUTCFullYear()).slice(-2)
    return `${mm}/${dd}/${yy}`
  } catch {
    return ''
  }
}

interface PDPReviewsProps {
  productName: string
  reviews:     Review[]
  summary:     ReviewsSummary
}

export function PDPReviews({ productName, reviews, summary }: PDPReviewsProps) {
  const totalPages = Math.max(1, Math.ceil(reviews.length / PER_PAGE))
  const [page, setPage] = useState(0)
  const safePage = Math.min(page, totalPages - 1)
  const canPrev  = reviews.length > PER_PAGE && safePage > 0
  const canNext  = reviews.length > PER_PAGE && safePage < totalPages - 1

  const prev = () => setPage((p) => Math.max(0, p - 1))
  const next = () => setPage((p) => Math.min(totalPages - 1, p + 1))

  const slice = reviews.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE)

  return (
    <section
      id="reviews"
      data-testid="pdp-reviews"
      aria-label="Product reviews"
      className="bg-paper border-b border-hairline"
    >
      <div className="max-w-container mx-auto px-8 py-20">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-graphite">
              § Correspondence
            </p>
            <h2 className="font-display font-normal text-[clamp(32px,3.5vw,40px)] leading-[1.05] tracking-tighter mt-3.5">
              What people say about <em className="italic">{productName}</em>.
            </h2>
          </div>
          {summary.count > 0 && (
            <div className="flex items-center gap-5 flex-wrap">
              <p
                data-testid="pdp-reviews-aggregate"
                className="font-mono text-[10px] tracking-widest uppercase text-graphite whitespace-nowrap"
              >
                n = {summary.count} · avg {summary.average.toFixed(1)} / 5
              </p>
              {reviews.length > PER_PAGE && (
                <>
                  <span
                    data-testid="pdp-reviews-counter"
                    className="font-mono text-[10px] tracking-widest uppercase text-graphite whitespace-nowrap"
                  >
                    {String(safePage + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
                  </span>
                  <div className="flex gap-2">
                    <ArrowButton direction="prev" onClick={prev} disabled={!canPrev} />
                    <ArrowButton direction="next" onClick={next} disabled={!canNext} />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <div
            data-testid="pdp-reviews-empty"
            className="border border-hairline px-8 py-16 text-center"
          >
            <p className="font-mono text-xs tracking-widest uppercase text-graphite">
              — No correspondence yet for this formula.
            </p>
            <p className="font-body text-sm text-ink-2 mt-3 max-w-[320px] mx-auto">
              The first review typically lands within two weeks of dispatch.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-b border-hairline">
            {slice.map((r, i) => (
              <article
                key={r.id}
                data-testid="pdp-review-card"
                className={`p-7 flex flex-col min-h-[260px] ${i < PER_PAGE - 1 ? 'md:border-r border-hairline/60' : ''}`}
              >
                <div className="flex items-baseline justify-between mb-3.5">
                  <p className="font-mono text-xs text-ink">
                    {r.user_initials || '•'}
                    <span
                      aria-hidden="true"
                      className="inline-block w-1.5 h-1.5 rounded-full bg-assay mx-1.5"
                    />
                    <span className="text-graphite">Verified</span>
                  </p>
                  <span className="font-mono text-2xs text-graphite">
                    {formatDate(r.created_at)}
                  </span>
                </div>

                <StarRow rating={r.rating} />

                {r.title && (
                  <h3 className="font-display text-2xl text-ink mt-3.5 mb-2.5 leading-[1.15]">
                    {r.title}
                  </h3>
                )}
                {r.body && (
                  <p className="font-body text-sm leading-[1.6] text-ink-2 flex-1">
                    {r.body}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
