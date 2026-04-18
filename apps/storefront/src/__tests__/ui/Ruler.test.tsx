import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Ruler } from '@/components/ui/Ruler'

describe('Ruler', () => {
  it('renders with data-testid', () => {
    render(<Ruler />)
    expect(screen.getByTestId('ruler')).toBeInTheDocument()
  })

  it('is aria-hidden (purely decorative)', () => {
    render(<Ruler />)
    expect(screen.getByTestId('ruler')).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders 12 zero-padded numbers by default', () => {
    render(<Ruler />)
    const el = screen.getByTestId('ruler')
    const spans = el.querySelectorAll('span')
    expect(spans.length).toBe(12)
    expect(spans[0]).toHaveTextContent('01')
    expect(spans[11]).toHaveTextContent('12')
  })

  it('respects a custom column count', () => {
    render(<Ruler columns={6} />)
    const spans = screen.getByTestId('ruler').querySelectorAll('span')
    expect(spans.length).toBe(6)
    expect(spans[5]).toHaveTextContent('06')
  })

  it('forwards additional className', () => {
    render(<Ruler className="mt-4" />)
    expect(screen.getByTestId('ruler').className).toContain('mt-4')
  })
})
