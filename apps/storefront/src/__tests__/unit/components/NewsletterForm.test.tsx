import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NewsletterForm } from '@/components/shop/NewsletterForm'

function fillEmail(value: string) {
  const input = screen.getByTestId('newsletter-email')
  fireEvent.change(input, { target: { value } })
}

function submit() {
  fireEvent.submit(screen.getByTestId('newsletter-form'))
}

describe('NewsletterForm', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders the email input and submit button', () => {
    render(<NewsletterForm />)
    expect(screen.getByTestId('newsletter-email')).toBeDefined()
    expect(screen.getByTestId('newsletter-submit')).toBeDefined()
  })

  it('shows a validation error for an invalid email without making a network request', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    render(<NewsletterForm />)

    fillEmail('notanemail')
    submit()

    await waitFor(() => {
      expect(screen.getByTestId('newsletter-error')).toBeDefined()
    })

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('shows a validation error for an empty email', async () => {
    render(<NewsletterForm />)
    submit()

    await waitFor(() => {
      expect(screen.getByTestId('newsletter-error')).toBeDefined()
    })
  })

  it('shows the success message after a successful submission', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    )

    render(<NewsletterForm />)
    fillEmail('user@example.com')
    submit()

    await waitFor(() => {
      expect(screen.getByTestId('newsletter-success')).toBeDefined()
      expect(screen.getByTestId('newsletter-success').textContent).toMatch(/you're in/i)
    })
  })

  it('shows an error message when the API returns a non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Invalid email.' } }),
        { status: 400 },
      ),
    )

    render(<NewsletterForm />)
    fillEmail('user@example.com')
    submit()

    await waitFor(() => {
      expect(screen.getByTestId('newsletter-error')).toBeDefined()
    })
  })

  it('shows a generic error message on network failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'))

    render(<NewsletterForm />)
    fillEmail('user@example.com')
    submit()

    await waitFor(() => {
      const err = screen.getByTestId('newsletter-error')
      expect(err.textContent).toMatch(/network error/i)
    })
  })

  it('sends the email to /api/newsletter', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    )

    render(<NewsletterForm />)
    fillEmail('hello@skincare.com')
    submit()

    await waitFor(() => {
      expect(screen.getByTestId('newsletter-success')).toBeDefined()
    })

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/newsletter',
      expect.objectContaining({
        method: 'POST',
        body:   JSON.stringify({ email: 'hello@skincare.com' }),
      }),
    )
  })
})
