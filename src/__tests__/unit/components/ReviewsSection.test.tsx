import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ReviewsSection } from '@/components/shop/ReviewsSection'
import type { Review, ReviewsSummary } from '@/types'

const summary: ReviewsSummary = {
  average:      4.5,
  count:        5,
  distribution: { '1': 0, '2': 0, '3': 0, '4': 2, '5': 3 },
}

function makeReview(i: number): Review {
  return {
    id:            `rev-${i}`,
    rating:        5,
    title:         `Title ${i}`,
    body:          `Body ${i}`,
    created_at:    '2026-01-01T00:00:00Z',
    user_initials: '••',
  }
}

const reviews: Review[] = Array.from({ length: 7 }, (_, i) => makeReview(i + 1))

describe('ReviewsSection', () => {
  it('shows 3 reviews by default', () => {
    render(<ReviewsSection reviews={reviews} summary={summary} />)
    expect(screen.getAllByTestId('review-card')).toHaveLength(3)
  })

  it('shows a "Load more" button when there are more than 3 reviews', () => {
    render(<ReviewsSection reviews={reviews} summary={summary} />)
    expect(screen.getByTestId('load-more-reviews')).toBeDefined()
  })

  it('shows 3 additional reviews when "Load more" is clicked', () => {
    render(<ReviewsSection reviews={reviews} summary={summary} />)
    fireEvent.click(screen.getByTestId('load-more-reviews'))
    expect(screen.getAllByTestId('review-card')).toHaveLength(6)
  })

  it('hides "Load more" when all reviews are visible', () => {
    const threeReviews = reviews.slice(0, 3)
    render(<ReviewsSection reviews={threeReviews} summary={summary} />)
    expect(screen.queryByTestId('load-more-reviews')).toBeNull()
  })

  it('hides "Load more" after loading all reviews', () => {
    render(<ReviewsSection reviews={reviews} summary={summary} />)
    // Load to 6
    fireEvent.click(screen.getByTestId('load-more-reviews'))
    // Load remaining (7 total)
    fireEvent.click(screen.getByTestId('load-more-reviews'))
    expect(screen.getAllByTestId('review-card')).toHaveLength(7)
    expect(screen.queryByTestId('load-more-reviews')).toBeNull()
  })

  it('shows empty state when there are no reviews', () => {
    const empty: ReviewsSummary = {
      average: 0, count: 0,
      distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
    }
    render(<ReviewsSection reviews={[]} summary={empty} />)
    expect(screen.getByText(/No reviews yet/i)).toBeDefined()
  })

  it('has id="reviews" on the section for scroll targeting', () => {
    render(<ReviewsSection reviews={reviews} summary={summary} />)
    expect(document.getElementById('reviews')).toBeDefined()
  })

  it('renders the rating summary section heading', () => {
    render(<ReviewsSection reviews={reviews} summary={summary} />)
    expect(screen.getByRole('heading', { name: /reviews/i })).toBeDefined()
  })
})
