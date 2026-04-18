import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import GlobalError from '@/app/error'

function makeError(overrides: Partial<Error & { digest?: string }> = {}): Error & { digest?: string } {
  const err = new Error(overrides.message ?? 'boom') as Error & { digest?: string }
  if (overrides.digest !== undefined) err.digest = overrides.digest
  return err
}

describe('GlobalError', () => {
  it('renders the § 500 — UNEXPECTED eyebrow', () => {
    render(<GlobalError error={makeError()} reset={vi.fn()} />)
    expect(screen.getByTestId('error-eyebrow')).toHaveTextContent(/§ 500 — Unexpected/i)
  })

  it('renders the matter-voiced headline as an h1', () => {
    render(<GlobalError error={makeError()} reset={vi.fn()} />)
    const h1 = screen.getByTestId('error-title')
    expect(h1.tagName).toBe('H1')
    expect(h1).toHaveTextContent(/something/i)
    expect(h1).toHaveTextContent(/gave/i)
    expect(h1).toHaveTextContent(/way/i)
  })

  it('renders the digest when provided', () => {
    render(<GlobalError error={makeError({ digest: 'abc123' })} reset={vi.fn()} />)
    expect(screen.getByTestId('error-digest')).toHaveTextContent('Ref · abc123')
  })

  it('omits the digest row when not provided', () => {
    render(<GlobalError error={makeError()} reset={vi.fn()} />)
    expect(screen.queryByTestId('error-digest')).toBeNull()
  })

  it('Try again button calls reset()', () => {
    const reset = vi.fn()
    render(<GlobalError error={makeError()} reset={reset} />)
    fireEvent.click(screen.getByTestId('error-retry'))
    expect(reset).toHaveBeenCalledTimes(1)
  })

  it('home and support links point at the right destinations', () => {
    render(<GlobalError error={makeError()} reset={vi.fn()} />)
    expect((screen.getByTestId('error-home') as HTMLAnchorElement).getAttribute('href')).toBe('/')
    expect((screen.getByTestId('error-support') as HTMLAnchorElement).getAttribute('href')).toBe('/support/new')
  })
})
