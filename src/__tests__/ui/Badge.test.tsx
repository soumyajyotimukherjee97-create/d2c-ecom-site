import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Badge } from '@/components/ui/Badge'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>In Stock</Badge>)
    expect(screen.getByTestId('badge')).toHaveTextContent('In Stock')
  })

  it('renders as a span', () => {
    render(<Badge>Tag</Badge>)
    expect(screen.getByTestId('badge').tagName).toBe('SPAN')
  })

  it('applies default variant by default', () => {
    render(<Badge>Default</Badge>)
    expect(screen.getByTestId('badge').className).toContain('bg-gray-100')
  })

  it('applies mist variant classes', () => {
    render(<Badge variant="mist">Mist</Badge>)
    const el = screen.getByTestId('badge')
    expect(el.className).toContain('bg-mist')
    expect(el.className).toContain('text-mist-text')
  })

  it('applies blush variant classes', () => {
    render(<Badge variant="blush">Blush</Badge>)
    const el = screen.getByTestId('badge')
    expect(el.className).toContain('bg-blush')
    expect(el.className).toContain('text-blush-text')
  })

  it('applies error variant classes', () => {
    render(<Badge variant="error">Error</Badge>)
    const el = screen.getByTestId('badge')
    expect(el.className).toContain('text-error')
    expect(el.className).toContain('border-error')
  })

  it('applies uppercase and monospace classes', () => {
    render(<Badge>Style</Badge>)
    const el = screen.getByTestId('badge')
    expect(el.className).toContain('uppercase')
    expect(el.className).toContain('font-mono')
  })

  it('forwards additional className', () => {
    render(<Badge className="ml-2">Extra</Badge>)
    expect(screen.getByTestId('badge').className).toContain('ml-2')
  })
})
