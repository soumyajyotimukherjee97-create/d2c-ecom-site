import type { ReviewsSummary } from '@/types'

interface ReviewBarProps {
  summary: ReviewsSummary
  /** If provided, clicking the bar scrolls to this element id */
  scrollTargetId?: string
}

function Stars({ rating }: { rating: number }) {
  const filled = Math.round(rating)
  return (
    <span aria-label={`${rating} out of 5 stars`} className="text-gray-900 tracking-tight">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} aria-hidden="true">{i < filled ? '★' : '☆'}</span>
      ))}
    </span>
  )
}

export function ReviewBar({ summary, scrollTargetId }: ReviewBarProps) {
  if (summary.count === 0) return null

  const inner = (
    <div
      data-testid="review-bar"
      className="flex items-center gap-2"
    >
      <Stars rating={summary.average} />
      <span className="font-mono text-2xs text-gray-400">
        {summary.average.toFixed(1)}
      </span>
      <span className="font-mono text-2xs text-gray-400">
        ({summary.count} {summary.count === 1 ? 'review' : 'reviews'})
      </span>
    </div>
  )

  if (scrollTargetId) {
    return (
      <a
        href={`#${scrollTargetId}`}
        className="inline-flex focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
      >
        {inner}
      </a>
    )
  }

  return inner
}
