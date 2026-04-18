import type { ReviewsSummary } from '@/types'

interface ReviewBarProps {
  summary: ReviewsSummary
  /** If provided, clicking the bar scrolls to this element id */
  scrollTargetId?: string
}

function Stars({ rating }: { rating: number }) {
  const filled = Math.round(rating)
  return (
    <span
      aria-label={`${rating} out of 5 stars`}
      data-testid="review-stars"
      className="font-mono text-sm tracking-[0.18em] text-ink"
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} aria-hidden="true" className={i < filled ? '' : 'text-hairline'}>
          ★
        </span>
      ))}
    </span>
  )
}

export function ReviewBar({ summary, scrollTargetId }: ReviewBarProps) {
  if (summary.count === 0) return null

  const inner = (
    <div data-testid="review-bar" className="inline-flex items-center gap-3">
      <Stars rating={summary.average} />
      <span className="font-mono text-2xs tracking-wide text-graphite tabular-nums">
        {summary.average.toFixed(1)}
      </span>
      <span className="font-mono text-2xs uppercase tracking-widest text-graphite">
        · n = {summary.count}
      </span>
    </div>
  )

  if (scrollTargetId) {
    return (
      <a
        href={`#${scrollTargetId}`}
        className="inline-flex focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
      >
        {inner}
      </a>
    )
  }

  return inner
}
