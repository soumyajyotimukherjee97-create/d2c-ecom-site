import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PDPReviews } from '@/components/shop/PDPReviews'
import type { Review, ReviewsSummary } from '@/types'

function makeReview(overrides: Partial<Review> = {}): Review {
  return {
    id:            `r-${Math.random().toString(36).slice(2, 8)}`,
    rating:        5,
    title:         'Great',
    body:          'Works as advertised.',
    created_at:    '2026-04-01T00:00:00Z',
    user_initials: 'AR',
    ...overrides,
  }
}

const emptySummary: ReviewsSummary = {
  average:      0,
  count:        0,
  distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
}

const fullSummary: ReviewsSummary = {
  average:      4.9,
  count:        6,
  distribution: { '1': 0, '2': 0, '3': 0, '4': 1, '5': 5 },
}

describe('PDPReviews', () => {
  it('renders the correspondence heading with the product name', () => {
    render(<PDPReviews productName="Night Repair Cream" reviews={[]} summary={emptySummary} />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/Night Repair Cream/)
  })

  it('shows the empty state when there are no reviews', () => {
    render(<PDPReviews productName="X" reviews={[]} summary={emptySummary} />)
    const empty = screen.getByTestId('pdp-reviews-empty')
    expect(empty).toHaveTextContent(/no correspondence yet/i)
  })

  it('renders up to 3 review cards on the first page', () => {
    const reviews = [
      makeReview({ id: 'a' }),
      makeReview({ id: 'b' }),
      makeReview({ id: 'c' }),
      makeReview({ id: 'd' }),
      makeReview({ id: 'e' }),
      makeReview({ id: 'f' }),
    ]
    render(<PDPReviews productName="X" reviews={reviews} summary={fullSummary} />)
    expect(screen.getAllByTestId('pdp-review-card')).toHaveLength(3)
  })

  it('shows aggregate line only when there are reviews', () => {
    render(<PDPReviews productName="X" reviews={[makeReview()]} summary={{ ...fullSummary, count: 1 }} />)
    expect(screen.getByTestId('pdp-reviews-aggregate')).toHaveTextContent('n = 1')
  })

  it('hides the page counter + arrows when reviews fit on one page', () => {
    render(<PDPReviews productName="X" reviews={[makeReview(), makeReview()]} summary={{ ...fullSummary, count: 2 }} />)
    expect(screen.queryByTestId('pdp-reviews-counter')).toBeNull()
    expect(screen.queryByTestId('pdp-reviews-arrow-prev')).toBeNull()
  })

  it('renders the page counter + arrows when reviews span multiple pages', () => {
    const reviews = Array.from({ length: 4 }, (_, i) => makeReview({ id: `r${i}` }))
    render(<PDPReviews productName="X" reviews={reviews} summary={{ ...fullSummary, count: 4 }} />)
    expect(screen.getByTestId('pdp-reviews-counter')).toHaveTextContent('01 / 02')
    expect(screen.getByTestId('pdp-reviews-arrow-prev')).toBeDefined()
    expect(screen.getByTestId('pdp-reviews-arrow-next')).toBeDefined()
  })

  it('next arrow advances the counter and swaps the visible page', async () => {
    const user = userEvent.setup()
    const reviews = Array.from({ length: 4 }, (_, i) =>
      makeReview({ id: `r${i}`, title: `Title ${i}` }),
    )
    render(<PDPReviews productName="X" reviews={reviews} summary={{ ...fullSummary, count: 4 }} />)

    await user.click(screen.getByTestId('pdp-reviews-arrow-next'))

    expect(screen.getByTestId('pdp-reviews-counter')).toHaveTextContent('02 / 02')
    // Page 2 contains only review index 3 (one card remaining)
    expect(screen.getAllByTestId('pdp-review-card')).toHaveLength(1)
    expect(screen.getByText('Title 3')).toBeDefined()
  })

  it('prev arrow is disabled on the first page', () => {
    const reviews = Array.from({ length: 4 }, (_, i) => makeReview({ id: `r${i}` }))
    render(<PDPReviews productName="X" reviews={reviews} summary={{ ...fullSummary, count: 4 }} />)
    const prev = screen.getByTestId('pdp-reviews-arrow-prev') as HTMLButtonElement
    expect(prev.disabled).toBe(true)
  })
})
