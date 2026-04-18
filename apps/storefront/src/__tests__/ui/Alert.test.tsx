import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Alert } from '@/components/ui/Alert'

describe('Alert', () => {
  it('renders the message', () => {
    render(<Alert message="Something went wrong" />)
    expect(screen.getByTestId('alert')).toHaveTextContent('Something went wrong')
  })

  it('has role="alert" for screen readers', () => {
    render(<Alert message="Error" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('does not render retry button when onRetry is not provided', () => {
    render(<Alert message="Error" />)
    expect(screen.queryByTestId('alert-retry')).not.toBeInTheDocument()
  })

  it('renders retry button when onRetry is provided', () => {
    render(<Alert message="Error" onRetry={vi.fn()} />)
    expect(screen.getByTestId('alert-retry')).toHaveTextContent('Try again')
  })

  it('calls onRetry when retry button is clicked', async () => {
    const onRetry = vi.fn()
    render(<Alert message="Failed to load" onRetry={onRetry} />)
    await userEvent.click(screen.getByTestId('alert-retry'))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('defaults to the error variant', () => {
    render(<Alert message="Error" />)
    expect(screen.getByTestId('alert')).toHaveAttribute('data-variant', 'error')
  })

  it('exposes the info variant via data-variant', () => {
    render(<Alert variant="info" message="Info" />)
    expect(screen.getByTestId('alert')).toHaveAttribute('data-variant', 'info')
  })

  it('exposes the success variant via data-variant', () => {
    render(<Alert variant="success" message="Saved" />)
    expect(screen.getByTestId('alert')).toHaveAttribute('data-variant', 'success')
  })

  it('forwards additional className', () => {
    render(<Alert message="Error" className="mt-4" />)
    expect(screen.getByTestId('alert').className).toContain('mt-4')
  })
})
