import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from '@/components/ui/EmptyState'

describe('EmptyState', () => {
  it('has data-testid="empty-state"', () => {
    render(<EmptyState heading="Nothing here" body="Try something else." />)
    expect(screen.getByTestId('empty-state')).toBeDefined()
  })

  it('renders the heading', () => {
    render(<EmptyState heading="No products found" body="Adjust your filters." />)
    expect(screen.getByText('No products found')).toBeDefined()
  })

  it('renders the body text', () => {
    render(<EmptyState heading="No products found" body="Adjust your filters." />)
    expect(screen.getByText('Adjust your filters.')).toBeDefined()
  })

  it('renders actions when provided', () => {
    render(
      <EmptyState
        heading="Empty"
        body="No results."
        actions={<button data-testid="action-btn">Clear filters</button>}
      />,
    )
    expect(screen.getByTestId('action-btn')).toBeDefined()
  })

  it('renders without actions when not provided', () => {
    const { container } = render(<EmptyState heading="Empty" body="No results." />)
    // No extra wrapper div when actions is undefined
    expect(container.querySelector('button')).toBeNull()
  })
})
