import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Eyebrow } from '@/components/ui/Eyebrow'

describe('Eyebrow', () => {
  it('renders children', () => {
    render(<Eyebrow>§ II — Featured formulas</Eyebrow>)
    expect(screen.getByTestId('eyebrow')).toHaveTextContent('§ II — Featured formulas')
  })

  it('renders as a span by default', () => {
    render(<Eyebrow>Label</Eyebrow>)
    expect(screen.getByTestId('eyebrow').tagName).toBe('SPAN')
  })

  it('supports polymorphic `as` prop', () => {
    render(<Eyebrow as="h2">Chapter head</Eyebrow>)
    expect(screen.getByTestId('eyebrow').tagName).toBe('H2')
  })

  it('forwards additional className', () => {
    render(<Eyebrow className="mb-4">Label</Eyebrow>)
    expect(screen.getByTestId('eyebrow').className).toContain('mb-4')
  })

  it('applies matter mono-caps styling', () => {
    render(<Eyebrow>Label</Eyebrow>)
    const el = screen.getByTestId('eyebrow')
    expect(el.className).toContain('font-mono')
    expect(el.className).toContain('uppercase')
    expect(el.className).toContain('text-graphite')
  })
})
