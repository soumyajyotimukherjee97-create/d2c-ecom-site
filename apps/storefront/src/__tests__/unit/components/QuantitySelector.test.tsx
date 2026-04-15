import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuantitySelector } from '@/components/ui/QuantitySelector'

describe('QuantitySelector', () => {
  it('has data-testid="quantity-selector"', () => {
    render(<QuantitySelector value={1} onChange={vi.fn()} />)
    expect(screen.getByTestId('quantity-selector')).toBeDefined()
  })

  it('displays the current value', () => {
    render(<QuantitySelector value={3} onChange={vi.fn()} />)
    expect(screen.getByTestId('qty-value').textContent).toBe('3')
  })

  it('calls onChange with value + 1 when increase is clicked', () => {
    const onChange = vi.fn()
    render(<QuantitySelector value={2} onChange={onChange} max={10} />)
    fireEvent.click(screen.getByTestId('qty-increase'))
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('calls onChange with value - 1 when decrease is clicked', () => {
    const onChange = vi.fn()
    render(<QuantitySelector value={3} onChange={onChange} min={1} />)
    fireEvent.click(screen.getByTestId('qty-decrease'))
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('disables decrease button at min value', () => {
    render(<QuantitySelector value={1} onChange={vi.fn()} min={1} />)
    expect((screen.getByTestId('qty-decrease') as HTMLButtonElement).disabled).toBe(true)
  })

  it('disables increase button at max value', () => {
    render(<QuantitySelector value={5} onChange={vi.fn()} max={5} />)
    expect((screen.getByTestId('qty-increase') as HTMLButtonElement).disabled).toBe(true)
  })

  it('does not exceed max when increase clicked at limit', () => {
    const onChange = vi.fn()
    render(<QuantitySelector value={5} onChange={onChange} max={5} />)
    fireEvent.click(screen.getByTestId('qty-increase'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not go below min when decrease clicked at limit', () => {
    const onChange = vi.fn()
    render(<QuantitySelector value={1} onChange={onChange} min={1} />)
    fireEvent.click(screen.getByTestId('qty-decrease'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('has accessible aria-labels on buttons', () => {
    render(<QuantitySelector value={2} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Increase quantity')).toBeDefined()
    expect(screen.getByLabelText('Decrease quantity')).toBeDefined()
  })
})
