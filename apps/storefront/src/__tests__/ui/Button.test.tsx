import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Add to cart</Button>)
    expect(screen.getByTestId('button')).toHaveTextContent('Add to cart')
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click me</Button>)
    await userEvent.click(screen.getByTestId('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByTestId('button')).toBeDisabled()
  })

  it('is disabled and aria-busy when loading', () => {
    render(<Button loading>Loading</Button>)
    const btn = screen.getByTestId('button')
    expect(btn).toBeDisabled()
    expect(btn).toHaveAttribute('aria-busy', 'true')
  })

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>No click</Button>)
    await userEvent.click(screen.getByTestId('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders spinner svg when loading', () => {
    render(<Button loading>Saving</Button>)
    const btn = screen.getByTestId('button')
    expect(btn.querySelector('svg')).toBeInTheDocument()
  })

  it('defaults to primary variant', () => {
    render(<Button>Primary</Button>)
    expect(screen.getByTestId('button')).toHaveAttribute('data-variant', 'primary')
  })

  it('exposes the secondary variant via data-variant', () => {
    render(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByTestId('button')).toHaveAttribute('data-variant', 'secondary')
  })

  it('exposes the ghost variant via data-variant', () => {
    render(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByTestId('button')).toHaveAttribute('data-variant', 'ghost')
  })

  it('defaults to md size', () => {
    render(<Button>Default size</Button>)
    expect(screen.getByTestId('button')).toHaveAttribute('data-size', 'md')
  })

  it('exposes the sm size via data-size', () => {
    render(<Button size="sm">Small</Button>)
    expect(screen.getByTestId('button')).toHaveAttribute('data-size', 'sm')
  })

  it('exposes the lg size via data-size', () => {
    render(<Button size="lg">Large</Button>)
    expect(screen.getByTestId('button')).toHaveAttribute('data-size', 'lg')
  })

  it('forwards additional className', () => {
    render(<Button className="w-full">Full width</Button>)
    expect(screen.getByTestId('button').className).toContain('w-full')
  })

  it('forwards arbitrary html attributes', () => {
    render(<Button type="submit">Submit</Button>)
    expect(screen.getByTestId('button')).toHaveAttribute('type', 'submit')
  })
})
