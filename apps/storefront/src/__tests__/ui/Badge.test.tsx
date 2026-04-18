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

  it('defaults to the default variant', () => {
    render(<Badge>Default</Badge>)
    expect(screen.getByTestId('badge')).toHaveAttribute('data-variant', 'default')
  })

  it('exposes the ink variant via data-variant', () => {
    render(<Badge variant="ink">Ink</Badge>)
    expect(screen.getByTestId('badge')).toHaveAttribute('data-variant', 'ink')
  })

  it('exposes the assay variant via data-variant', () => {
    render(<Badge variant="assay">Active</Badge>)
    expect(screen.getByTestId('badge')).toHaveAttribute('data-variant', 'assay')
  })

  it('exposes the filled variant via data-variant', () => {
    render(<Badge variant="filled">Filled</Badge>)
    expect(screen.getByTestId('badge')).toHaveAttribute('data-variant', 'filled')
  })

  it('exposes the error variant via data-variant', () => {
    render(<Badge variant="error">Error</Badge>)
    expect(screen.getByTestId('badge')).toHaveAttribute('data-variant', 'error')
  })

  it('forwards additional className', () => {
    render(<Badge className="ml-2">Extra</Badge>)
    expect(screen.getByTestId('badge').className).toContain('ml-2')
  })
})
