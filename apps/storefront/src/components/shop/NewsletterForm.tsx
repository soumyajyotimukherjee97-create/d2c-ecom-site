'use client'

import { useState } from 'react'
import { z } from 'zod'
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
      <div data-testid="newsletter-success-wrap">
        <p
          role="status"
          data-testid="newsletter-success"
          className="font-mono text-xs tracking-widest uppercase text-assay"
        >
          ✓ You&apos;re in. Check your inbox.
        </p>
        <p className="font-mono text-2xs tracking-widest uppercase text-graphite mt-3.5">
          Dispatched quarterly · 2,814 subscribers
        </p>
      </div>
    )
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        noValidate
        data-testid="newsletter-form"
        className="flex w-full"
      >
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ELECTRONIC ADDRESS"
          aria-invalid={error != null}
          aria-describedby={error ? 'newsletter-error' : undefined}
          data-testid="newsletter-email"
          className="flex-1 min-w-0 border border-ink border-r-0 bg-paper px-4 py-3.5 font-mono text-xs tracking-widest uppercase text-ink placeholder:text-graphite focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
        />
        <button
          type="submit"
          disabled={loading}
          data-testid="newsletter-submit"
          className="inline-flex items-center justify-center bg-ink text-paper border border-ink px-6 font-mono text-xs tracking-widest uppercase hover:bg-ink-2 disabled:opacity-50 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
        >
          {loading ? '…' : 'Enrol →'}
        </button>
      </form>
      {error && (
        <p
          id="newsletter-error"
          role="alert"
          data-testid="newsletter-error"
          className="mt-3.5 font-mono text-2xs tracking-widest uppercase text-oxblood"
        >
          — {error}
        </p>
      )}
      {!error && (
        <p className="font-mono text-2xs tracking-widest uppercase text-graphite mt-3.5">
          Dispatched quarterly · 2,814 subscribers
        </p>
      )}
    </div>
  )
}
