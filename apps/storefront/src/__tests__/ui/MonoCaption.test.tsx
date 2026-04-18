import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MonoCaption } from '@/components/ui/MonoCaption'

describe('MonoCaption', () => {
  it('renders children', () => {
    render(<MonoCaption>pH 5.5</MonoCaption>)
    expect(screen.getByTestId('mono-caption')).toHaveTextContent('pH 5.5')
  })

  it('renders as a span by default', () => {
    render(<MonoCaption>caption</MonoCaption>)
    expect(screen.getByTestId('mono-caption').tagName).toBe('SPAN')
  })

  it('supports polymorphic `as` prop', () => {
    render(<MonoCaption as="p">paragraph</MonoCaption>)
    expect(screen.getByTestId('mono-caption').tagName).toBe('P')
  })

  it('defaults to graphite tone', () => {
    render(<MonoCaption>default</MonoCaption>)
    expect(screen.getByTestId('mono-caption')).toHaveAttribute('data-tone', 'graphite')
  })

  it('exposes each supported tone via data-tone', () => {
    const tones = ['ink', 'assay', 'oxblood', 'paper'] as const
    tones.forEach(tone => {
      const { unmount } = render(<MonoCaption tone={tone}>t</MonoCaption>)
      expect(screen.getByTestId('mono-caption')).toHaveAttribute('data-tone', tone)
      unmount()
    })
  })

  it('adds uppercase + widest tracking when uppercase={true}', () => {
    render(<MonoCaption uppercase>label</MonoCaption>)
    const el = screen.getByTestId('mono-caption')
    expect(el.className).toContain('uppercase')
    expect(el.className).toContain('tracking-widest')
  })
})
