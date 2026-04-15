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

  it('applies primary variant classes by default', () => {
    render(<Button>Primary</Button>)
    const btn = screen.getByTestId('button')
    expect(btn.className).toContain('bg-gray-900')
    expect(btn.className).toContain('text-white')
  })

  it('applies secondary variant classes', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const btn = screen.getByTestId('button')
    expect(btn.className).toContain('bg-transparent')
    expect(btn.className).toContain('border-gray-900')
  })

  it('applies ghost variant classes', () => {
    render(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByTestId('button').className).toContain('text-gray-600')
  })

  it('applies sm size classes', () => {
    render(<Button size="sm">Small</Button>)
    expect(screen.getByTestId('button').className).toContain('px-3')
  })

  it('applies lg size classes', () => {
    render(<Button size="lg">Large</Button>)
    expect(screen.getByTestId('button').className).toContain('px-6')
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
