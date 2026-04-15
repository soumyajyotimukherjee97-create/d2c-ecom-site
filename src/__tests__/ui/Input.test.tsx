import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Input } from '@/components/ui/Input'

describe('Input', () => {
  it('renders with a label', () => {
    render(<Input id="email" label="Email address" />)
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
  })

  it('label is linked to input via htmlFor', () => {
    render(<Input id="name" label="Full name" />)
    const label = screen.getByText('Full name')
    expect(label).toHaveAttribute('for', 'name')
  })

  it('renders the input element with data-testid', () => {
    render(<Input id="test" label="Test" />)
    expect(screen.getByTestId('input')).toBeInTheDocument()
  })

  it('accepts user input', async () => {
    const onChange = vi.fn()
    render(<Input id="search" label="Search" onChange={onChange} />)
    await userEvent.type(screen.getByTestId('input'), 'hello')
    expect(onChange).toHaveBeenCalled()
  })

  it('displays error message', () => {
    render(<Input id="email" label="Email" error="Invalid email address" />)
    expect(screen.getByTestId('input-error')).toHaveTextContent('Invalid email address')
  })

  it('sets aria-invalid when error is present', () => {
    render(<Input id="email" label="Email" error="Required" />)
    expect(screen.getByTestId('input')).toHaveAttribute('aria-invalid', 'true')
  })

  it('sets aria-describedby to error id when error is present', () => {
    render(<Input id="email" label="Email" error="Required" />)
    expect(screen.getByTestId('input')).toHaveAttribute('aria-describedby', 'email-error')
  })

  it('error message has role="alert"', () => {
    render(<Input id="email" label="Email" error="Required" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Required')
  })

  it('displays hint when provided and no error', () => {
    render(<Input id="pass" label="Password" hint="Must be at least 8 characters" />)
    expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument()
  })

  it('hides hint when error is also present', () => {
    render(
      <Input id="pass" label="Password" hint="8 chars minimum" error="Too short" />,
    )
    expect(screen.queryByText('8 chars minimum')).not.toBeInTheDocument()
    expect(screen.getByTestId('input-error')).toBeInTheDocument()
  })

  it('sets aria-describedby to hint id when only hint is present', () => {
    render(<Input id="pass" label="Password" hint="Hint text" />)
    expect(screen.getByTestId('input')).toHaveAttribute('aria-describedby', 'pass-hint')
  })

  it('does not set aria-invalid when no error', () => {
    render(<Input id="email" label="Email" />)
    expect(screen.getByTestId('input')).not.toHaveAttribute('aria-invalid')
  })

  it('applies border-error class when error is present', () => {
    render(<Input id="email" label="Email" error="Required" />)
    expect(screen.getByTestId('input').className).toContain('border-error')
  })

  it('forwards type and placeholder props', () => {
    render(<Input id="email" label="Email" type="email" placeholder="you@example.com" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('placeholder', 'you@example.com')
  })
})
