'use client'

import { useState } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { extractApiError, NETWORK_MESSAGE } from '@/lib/api/client'

const EmailSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
})

export function NewsletterForm() {
  const [email, setEmail]     = useState('')
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const parsed = EmailSchema.safeParse({ email })
    if (!parsed.success) {
      setError(parsed.error.errors[0].message)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/newsletter', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      })

      if (!res.ok) {
        setError(await extractApiError(res))
        return
      }

      setSuccess(true)
    } catch {
      setError(NETWORK_MESSAGE)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <p
        role="status"
        data-testid="newsletter-success"
        className="font-body text-sm text-gray-900"
      >
        You&apos;re in.
      </p>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      data-testid="newsletter-form"
      className="flex flex-col items-center gap-2"
    >
      <div className="flex gap-2 w-full max-w-xs">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          aria-invalid={error != null}
          aria-describedby={error ? 'newsletter-error' : undefined}
          data-testid="newsletter-email"
          className="flex-1 min-w-0 border border-gray-200 rounded-sm px-3 py-2 font-body text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          loading={loading}
          data-testid="newsletter-submit"
        >
          Subscribe
        </Button>
      </div>
      {error && (
        <p
          id="newsletter-error"
          role="alert"
          data-testid="newsletter-error"
          className="font-body text-2xs text-error"
        >
          {error}
        </p>
      )}
    </form>
  )
}
