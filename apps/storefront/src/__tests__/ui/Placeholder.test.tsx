import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Placeholder } from '@/components/ui/Placeholder'

describe('Placeholder', () => {
  it('renders with data-testid', () => {
    render(<Placeholder label="SPECIMEN · 01" caption="serum 30ml" />)
    expect(screen.getByTestId('placeholder')).toBeInTheDocument()
  })

  it('renders label and caption text', () => {
    render(<Placeholder label="SPECIMEN · 01" caption="serum 30ml" />)
    const el = screen.getByTestId('placeholder')
    expect(el).toHaveTextContent('SPECIMEN · 01')
    expect(el).toHaveTextContent('serum 30ml')
  })

  it('defaults to the "default" variant', () => {
    render(<Placeholder />)
    expect(screen.getByTestId('placeholder')).toHaveAttribute('data-variant', 'default')
  })

  it('exposes each variant via data-variant', () => {
    const variants = ['default', 'ink', 'mineral'] as const
    variants.forEach(v => {
      const { unmount } = render(<Placeholder variant={v} />)
      expect(screen.getByTestId('placeholder')).toHaveAttribute('data-variant', v)
      unmount()
    })
  })

  it('applies the correct m-ph class for each variant', () => {
    const { rerender } = render(<Placeholder variant="default" />)
    expect(screen.getByTestId('placeholder').className).toContain('m-ph')
    rerender(<Placeholder variant="ink" />)
    expect(screen.getByTestId('placeholder').className).toContain('m-ph--ink')
    rerender(<Placeholder variant="mineral" />)
    expect(screen.getByTestId('placeholder').className).toContain('m-ph--mineral')
  })

  it('applies aspect ratio via inline style', () => {
    render(<Placeholder ratio="1 / 1" />)
    expect(screen.getByTestId('placeholder').style.aspectRatio).toBe('1 / 1')
  })

  it('defaults aspect ratio to 3/4', () => {
    render(<Placeholder />)
    expect(screen.getByTestId('placeholder').style.aspectRatio).toBe('3 / 4')
  })

  it('omits the caption strip when no label or caption is passed', () => {
    render(<Placeholder />)
    const el = screen.getByTestId('placeholder')
    expect(el.querySelector('.absolute')).toBeNull()
  })

  it('forwards additional className', () => {
    render(<Placeholder className="w-full" />)
    expect(screen.getByTestId('placeholder').className).toContain('w-full')
  })
})
