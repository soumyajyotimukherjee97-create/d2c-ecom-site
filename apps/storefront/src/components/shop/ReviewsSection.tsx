'use client'

import { useState } from 'react'
import type { Review, ReviewsSummary } from '@/types'

const INITIAL_COUNT  = 3
const LOAD_MORE_STEP = 3

// ─── Rating bar row ───────────────────────────────────────────────────────────

function RatingRow({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-2xs text-gray-400 w-2 shrink-0">{star}</span>
      <div className="flex-1 h-1 bg-gray-100 rounded-sm overflow-hidden">
        <div
          className="h-full bg-gray-900 rounded-sm"
          style={{ width: `${pct}%` }}
          aria-hidden="true"
        />
      </div>
      <span className="font-mono text-2xs text-gray-400 w-6 text-right shrink-0">{pct}%</span>
    </div>
  )
}

// ─── Single review card ───────────────────────────────────────────────────────

function ReviewCard({ review }: { review: Review }) {
  const stars = Array.from({ length: 5 }, (_, i) =>
    i < review.rating ? '★' : '☆',
  ).join('')

  const date = new Date(review.created_at).toLocaleDateString('en-IN', {
    year:  'numeric',
    month: 'short',
    day:   'numeric',
  })

  return (
    <div
      data-testid="review-card"
      className="py-4 border-t border-gray-100 first:border-t-0"
    >
      <div className="flex justify-between items-baseline mb-1">
        <span className="font-body text-sm font-medium text-gray-900">
          {review.user_initials}
        </span>
        <span className="font-mono text-2xs text-gray-400">{date}</span>
      </div>
      <p aria-label={`${review.rating} out of 5 stars`} className="font-mono text-sm text-gray-900 mb-2">
        {stars}
      </p>
      {review.title && (
        <p className="font-body text-sm font-medium text-gray-900 mb-1">{review.title}</p>
      )}
      {review.body && (
        <p className="font-body text-sm text-gray-600">{review.body}</p>
      )}
    </div>
  )
}

// ─── ReviewsSection ───────────────────────────────────────────────────────────

interface ReviewsSectionProps {
  reviews: Review[]
  summary: ReviewsSummary
}

export function ReviewsSection({ reviews, summary }: ReviewsSectionProps) {
  const [visible, setVisible] = useState(INITIAL_COUNT)
  const displayed = reviews.slice(0, visible)
  const hasMore   = visible < reviews.length

  return (
    <section id="reviews" aria-label="Customer reviews" className="py-8">

      {/* Section heading + summary */}
      <h2 className="font-heading text-2xl font-normal mb-6">
        Reviews
        {summary.count > 0 && (
          <span className="font-mono text-xs text-gray-400 ml-2 font-normal align-middle">
            {summary.average.toFixed(1)} average ({summary.count})
          </span>
        )}
      </h2>

      {summary.count === 0 ? (
        <p className="font-body text-sm text-gray-600">No reviews yet. Be the first.</p>
      ) : (
        <>
          {/* Rating breakdown */}
          <div className="flex gap-8 items-center mb-8">
            <div className="flex-1 flex flex-col gap-2 max-w-xs">
              {([5, 4, 3, 2, 1] as const).map((star) => (
                <RatingRow
                  key={star}
                  star={star}
                  count={summary.distribution[String(star) as keyof typeof summary.distribution]}
                  total={summary.count}
                />
              ))}
            </div>
            <div className="text-center shrink-0 px-4">
              <p className="font-heading text-4xl font-normal">{summary.average.toFixed(1)}</p>
              <p className="font-mono text-sm text-gray-400 mt-1">
                {Array.from({ length: 5 }, (_, i) => i < Math.round(summary.average) ? '★' : '☆').join('')}
              </p>
              <p className="font-mono text-2xs text-gray-400 mt-1">
                {summary.count} {summary.count === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>

          {/* Review list */}
          <div data-testid="reviews-list">
            {displayed.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <button
              type="button"
              data-testid="load-more-reviews"
              onClick={() => setVisible((v) => v + LOAD_MORE_STEP)}
              className="mt-4 font-mono text-2xs uppercase tracking-wider border border-gray-200 text-gray-900 px-4 py-2 rounded-sm hover:border-gray-400 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
            >
              Load more reviews
            </button>
          )}
        </>
      )}
    </section>
  )
}
