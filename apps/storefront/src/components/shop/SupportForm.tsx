'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { extractApiError, NETWORK_MESSAGE } from '@/lib/api/client'

const BODY_MAX = 5000
const SUBJECT_MAX = 200

// ─── Form schema (client-side — API has its own Zod) ─────────────────────────

const baseSchema = z.object({
  email:      z.string().trim().toLowerCase().email('A valid email address is required'),
  subject:    z.string().trim().min(1, 'Subject is required').max(SUBJECT_MAX, `Subject must be ${SUBJECT_MAX} characters or fewer`),
  body:       z.string().trim().min(1, 'Message is required').max(BODY_MAX, `Message must be ${BODY_MAX} characters or fewer`),
  // For authed users: UUID order_id from dropdown (or empty string for "no order")
  // For guests: free-text order number (or empty) — prepended to body
  order_ref:  z.string().optional(),
})

type FormValues = z.infer<typeof baseSchema>

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SupportFormOrder {
  id: string
  order_number: string
}

interface SupportFormProps {
  /** Authenticated user's email, or null for guests. */
  userEmail: string | null
  /** Authenticated user's orders (id + order_number). Empty for guests. */
  orders: SupportFormOrder[]
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SupportForm({ userEmail, orders }: SupportFormProps) {
  const isAuthed = userEmail !== null
  const [apiError, setApiError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ id: string; email: string } | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      email:     userEmail ?? '',
      subject:   '',
      body:      '',
      order_ref: '',
    },
  })

  const bodyValue = watch('body') ?? ''

  async function onSubmit(values: FormValues) {
    setApiError(null)

    const payload: {
      subject: string
      body: string
      order_id?: string
      guest_email?: string
    } = {
      subject: values.subject,
      body:    values.body,
    }

    if (isAuthed) {
      // Only send order_id when the user picked a real UUID from the dropdown.
      if (values.order_ref) {
        payload.order_id = values.order_ref
      }
    } else {
      payload.guest_email = values.email
      // Guests can't link an order_id via the API — prepend the reference to the body.
      if (values.order_ref?.trim()) {
        payload.body = `Order reference: ${values.order_ref.trim()}\n\n${values.body}`
      }
    }

    try {
      const res = await fetch('/api/support', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      if (!res.ok) {
        setApiError(await extractApiError(res))
        return
      }

      const json = await res.json()
      setSuccess({
        id:    json.id,
        email: isAuthed ? (userEmail as string) : values.email,
      })
    } catch {
      setApiError(NETWORK_MESSAGE)
    }
  }

  if (success) {
    return (
      <div data-testid="support-success" className="text-center py-8">
        <div
          aria-hidden="true"
          className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center mx-auto mb-4 font-body text-base"
        >
          ✓
        </div>
        <h2 className="font-heading text-xl text-gray-900 mb-2">Ticket submitted.</h2>
        <p className="font-body text-sm text-gray-600 mb-1">
          Ticket <span className="font-mono text-xs" data-testid="support-ticket-id">#{success.id.slice(0, 8)}</span> · We&apos;ll respond to{' '}
          <span className="font-mono text-xs">{success.email}</span> within 1 business day.
        </p>
        <Link
          href="/products"
          className="inline-block mt-6 border border-gray-200 rounded-sm px-4 py-2 font-mono text-2xs uppercase tracking-wider text-gray-900 hover:border-gray-900 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
        >
          Back to shop
        </Link>
      </div>
    )
  }

  return (
    <form
      data-testid="support-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      {apiError && (
        <div data-testid="support-api-error">
          <Alert variant="error" message={apiError} />
        </div>
      )}

      {/* Email */}
      {isAuthed ? (
        <div data-testid="support-email-readonly">
          <p className="font-mono text-2xs uppercase tracking-widest text-gray-400 mb-1">
            Email address
          </p>
          <p className="font-body text-sm text-gray-900">{userEmail}</p>
        </div>
      ) : (
        <Input
          id="email"
          label="Email address *"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          data-testid="input-email"
          error={errors.email?.message}
          {...register('email')}
        />
      )}

      {/* Order link */}
      {isAuthed ? (
        <div className="flex flex-col gap-1">
          <label
            htmlFor="order_ref"
            className="font-body text-sm font-medium text-gray-900"
          >
            Related order (optional)
          </label>
          <select
            id="order_ref"
            data-testid="input-order-select"
            className="w-full border border-gray-200 rounded-sm px-3 py-2 font-body text-base text-gray-900 bg-white transition-colors duration-150 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-1 hover:border-gray-400"
            {...register('order_ref')}
          >
            <option value="">No specific order</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.order_number}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <Input
          id="order_ref"
          label="Related order (optional)"
          type="text"
          placeholder="Order number e.g. ORD-2026-0001"
          data-testid="input-order-number"
          hint="If you already have an order number, include it here."
          {...register('order_ref')}
        />
      )}

      {/* Subject */}
      <Input
        id="subject"
        label={`Subject * (max ${SUBJECT_MAX} chars)`}
        type="text"
        placeholder="Briefly describe your issue"
        maxLength={SUBJECT_MAX}
        data-testid="input-subject"
        error={errors.subject?.message}
        {...register('subject')}
      />

      {/* Body */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="body"
          className="font-body text-sm font-medium text-gray-900"
        >
          Message * (max {BODY_MAX.toLocaleString()} chars)
        </label>
        <textarea
          id="body"
          rows={6}
          maxLength={BODY_MAX}
          placeholder="Please describe your issue in detail. Include any relevant order details."
          data-testid="input-body"
          aria-invalid={errors.body ? true : undefined}
          aria-describedby={errors.body ? 'body-error' : undefined}
          className={[
            'w-full border rounded-sm px-3 py-2 font-body text-base text-gray-900 bg-white',
            'placeholder:text-gray-400 resize-y transition-colors duration-150',
            'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-1',
            errors.body ? 'border-error' : 'border-gray-200 hover:border-gray-400',
          ].join(' ')}
          {...register('body')}
        />
        <div className="flex justify-between items-start">
          {errors.body ? (
            <p
              id="body-error"
              role="alert"
              data-testid="body-error"
              className="font-body text-sm text-error"
            >
              {errors.body.message}
            </p>
          ) : (
            <span />
          )}
          <span
            data-testid="body-counter"
            className="font-mono text-2xs text-gray-400"
          >
            {bodyValue.length.toLocaleString()} / {BODY_MAX.toLocaleString()}
          </span>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        loading={isSubmitting}
        disabled={isSubmitting}
        data-testid="support-submit"
        className="w-full mt-2"
      >
        Submit ticket
      </Button>
    </form>
  )
}
