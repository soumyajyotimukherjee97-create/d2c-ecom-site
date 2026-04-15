import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SkeletonCard } from '@/components/ui/SkeletonCard'

describe('SkeletonCard', () => {
  it('renders with data-testid', () => {
    render(<SkeletonCard />)
    expect(screen.getByTestId('skeleton-card')).toBeInTheDocument()
  })

  it('is aria-hidden so screen readers skip it', () => {
    render(<SkeletonCard />)
    expect(screen.getByTestId('skeleton-card')).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders default 3 text line placeholders', () => {
    render(<SkeletonCard />)
    // The image block + 3 line divs = 4 child divs total
    const card = screen.getByTestId('skeleton-card')
    expect(card.querySelectorAll('div').length).toBe(4)
  })

  it('renders the correct number of lines when specified', () => {
    render(<SkeletonCard lines={5} />)
    const card = screen.getByTestId('skeleton-card')
    // 1 image block + 5 lines = 6
    expect(card.querySelectorAll('div').length).toBe(6)
  })

  it('has animate-pulse class', () => {
    render(<SkeletonCard />)
    expect(screen.getByTestId('skeleton-card').className).toContain('animate-pulse')
  })

  it('forwards additional className', () => {
    render(<SkeletonCard className="col-span-2" />)
    expect(screen.getByTestId('skeleton-card').className).toContain('col-span-2')
  })
})
