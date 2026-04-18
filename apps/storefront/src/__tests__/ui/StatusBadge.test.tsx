import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatusBadge, StatusChip } from '@/components/ui/StatusBadge'

describe('StatusBadge', () => {
  it('exposes the status via data-status', () => {
    render(<StatusBadge status="shipped" />)
    expect(screen.getByTestId('status-badge')).toHaveAttribute('data-status', 'shipped')
  })

  it('uppercases the label', () => {
    render(<StatusBadge status="confirmed" />)
    expect(screen.getByTestId('status-badge')).toHaveTextContent('CONFIRMED')
  })

  it('renders each order status correctly', () => {
    const statuses = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const
    statuses.forEach(s => {
      const { unmount } = render(<StatusBadge status={s} />)
      const el = screen.getByTestId('status-badge')
      expect(el).toHaveAttribute('data-status', s)
      expect(el.textContent?.toLowerCase()).toContain(s)
      unmount()
    })
  })

  it('does not use border-radius on the chip (square per matter rule)', () => {
    render(<StatusBadge status="shipped" />)
    // Tailwind radius is overridden to 0 across the config. No `rounded-full`
    // on the outer chip — only on the indicator dot inside.
    const el = screen.getByTestId('status-badge')
    expect(el.className).not.toMatch(/rounded-full/)
  })

  it('renders an indicator dot', () => {
    const { container } = render(<StatusBadge status="shipped" />)
    const dot = container.querySelector('[aria-hidden="true"]')
    expect(dot).toBeInTheDocument()
    expect(dot?.className).toContain('rounded-full')
  })
})

describe('StatusChip alias', () => {
  it('exports the same component as StatusBadge', () => {
    expect(StatusChip).toBe(StatusBadge)
  })
})
