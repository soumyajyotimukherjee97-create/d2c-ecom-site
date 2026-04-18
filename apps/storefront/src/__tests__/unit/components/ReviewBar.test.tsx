import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReviewBar } from '@/components/shop/ReviewBar'
import type { ReviewsSummary } from '@/types'

const summary: ReviewsSummary = {
  average:      4.2,
  count:        84,
  distribution: { '1': 1, '2': 2, '3': 7, '4': 17, '5': 57 },
}

describe('ReviewBar', () => {
  it('has data-testid="review-bar"', () => {
    render(<ReviewBar summary={summary} />)
    expect(screen.getByTestId('review-bar')).toBeDefined()
  })

  it('displays the numeric average', () => {
    render(<ReviewBar summary={summary} />)
    expect(screen.getByText('4.2')).toBeDefined()
  })

  it('displays the review count using matter mono format', () => {
    render(<ReviewBar summary={summary} />)
    expect(screen.getByTestId('review-bar')).toHaveTextContent('n = 84')
  })

  it('renders stars with an accessible label', () => {
    render(<ReviewBar summary={summary} />)
    expect(screen.getByLabelText('4.2 out of 5 stars')).toBeDefined()
  })

  it('renders as an anchor link when scrollTargetId is provided', () => {
    render(<ReviewBar summary={summary} scrollTargetId="reviews" />)
    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe('#reviews')
  })

  it('renders without a link when scrollTargetId is omitted', () => {
    render(<ReviewBar summary={summary} />)
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('returns null when count is 0', () => {
    const emptySummary: ReviewsSummary = {
      average: 0, count: 0,
      distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
    }
    const { container } = render(<ReviewBar summary={emptySummary} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders n = 1 when count is 1 (no singular/plural distinction in matter format)', () => {
    const one: ReviewsSummary = {
      average: 5, count: 1,
      distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 1 },
    }
    render(<ReviewBar summary={one} />)
    expect(screen.getByTestId('review-bar')).toHaveTextContent('n = 1')
  })
})
