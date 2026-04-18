import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HomeReviewsCarousel } from '@/components/shop/HomeReviewsCarousel'

describe('HomeReviewsCarousel', () => {
  it('renders the section with eyebrow + headline', () => {
    render(<HomeReviewsCarousel />)
    expect(screen.getByTestId('home-reviews')).toBeDefined()
    expect(screen.getByText(/§ IV — Correspondence/i)).toBeDefined()
  })

  it('renders all 6 review cards across both pages (hidden by transform)', () => {
    render(<HomeReviewsCarousel />)
    expect(screen.getAllByTestId('review-card')).toHaveLength(6)
  })

  it('page counter starts at "01 / 02"', () => {
    render(<HomeReviewsCarousel />)
    expect(screen.getByTestId('reviews-counter')).toHaveTextContent('01 / 02')
  })

  it('next arrow advances to page 2', async () => {
    const user = userEvent.setup()
    render(<HomeReviewsCarousel />)

    await user.click(screen.getByTestId('reviews-arrow-next'))

    expect(screen.getByTestId('reviews-counter')).toHaveTextContent('02 / 02')
  })

  it('next wraps around from last page to first', async () => {
    const user = userEvent.setup()
    render(<HomeReviewsCarousel />)

    await user.click(screen.getByTestId('reviews-arrow-next'))
    await user.click(screen.getByTestId('reviews-arrow-next'))

    expect(screen.getByTestId('reviews-counter')).toHaveTextContent('01 / 02')
  })

  it('prev arrow wraps from page 1 to last page', async () => {
    const user = userEvent.setup()
    render(<HomeReviewsCarousel />)

    await user.click(screen.getByTestId('reviews-arrow-prev'))

    expect(screen.getByTestId('reviews-counter')).toHaveTextContent('02 / 02')
  })

  it('carousel track translateX reflects current page', async () => {
    const user = userEvent.setup()
    render(<HomeReviewsCarousel />)

    const track = screen.getByTestId('reviews-track')
    expect(track.style.transform).toBe('translateX(-0%)')

    await user.click(screen.getByTestId('reviews-arrow-next'))
    expect(track.style.transform).toBe('translateX(-100%)')
  })

  it('renders aggregate "n = 1,284 · avg 4.9 / 5" meta', () => {
    render(<HomeReviewsCarousel />)
    expect(screen.getByText(/n = 1,284/)).toBeDefined()
  })

  it('each card has an accessible star rating label', () => {
    render(<HomeReviewsCarousel />)
    const cards = screen.getAllByTestId('review-card')
    cards.forEach((card) => {
      expect(card.querySelector('[aria-label^="Rated"]')).not.toBeNull()
    })
  })

  it('arrow buttons have accessible labels', () => {
    render(<HomeReviewsCarousel />)
    expect(screen.getByTestId('reviews-arrow-prev')).toHaveAccessibleName(/previous/i)
    expect(screen.getByTestId('reviews-arrow-next')).toHaveAccessibleName(/next/i)
  })
})
