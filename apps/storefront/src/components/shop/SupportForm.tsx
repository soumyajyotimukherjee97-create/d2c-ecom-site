'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { extractApiError, NETWORK_MESSAGE } from '@/lib/api/client'

const BODY_MAX    = 5000
const SUBJECT_MAX = 200

// ─── Form schema (client-side — API has its own Zod) ─────────────────────────

const baseSchema = z.object({
  email:     z.string().trim().toLowerCase().email('A valid email address is required'),
  subject:   z.string().trim().min(1, 'Subject is required').max(SUBJECT_MAX, `Subject must be ${SUBJECT_MAX} characters or fewer`),
  body:      z.string().trim().min(1, 'Message is required').max(BODY_MAX, `Message must be ${BODY_MAX} characters or fewer`),
  order_ref: z.string().optional(),
})

type FormValues = z.infer<typeof baseSchema>

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SupportFormOrder {
  id:           string
  order_number: string
}

interface SupportFormProps {
  /** Authenticated user's email, or null for guests. */
  userEmail: string | null
  /** Authenticated user's orders (id + order_number). Empty for guests. */
  orders:    SupportFormOrder[]
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SupportForm({ userEmail, orders }: SupportFormProps) {
  const isAuthed = userEmail !== null
  const [apiError, setApiError] = useState<string | null>(null)
  const [success, setSuccess]   = useState<{ id: string; email: string } | null>(null)

  const {
    register,
    handleSubmit,
    reset,
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
  const bodyLen   = bodyValue.length
  const counterClass =
    bodyLen >= BODY_MAX
      ? 'text-oxblood'
      : bodyLen >= BODY_MAX - 200
        ? 'text-ink'
        : 'text-graphite'

  async function onSubmit(values: FormValues) {
    setApiError(null)

    const payload: {
      subject:      string
      body:         string
      order_id?:    string
      guest_email?: string
    } = {
      subject: values.subject,
      body:    values.body,
    }

    if (isAuthed) {
      if (values.order_ref) {
        payload.order_id = values.order_ref
      }
    } else {
      payload.guest_email = values.email
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

  // ─── Success state ──────────────────────────────────────────────────────────
  if (success) {
    const ticketRef = `TKT-${success.id.slice(0, 8).toUpperCase()}`
    return (
      <div
        data-testid="support-success"
        className="bg-paper-2 border border-hairline px-8 py-14 text-center"
      >
        <p className="inline-block font-mono text-2xs tracking-ultra uppercase text-assay">
          § Filed — <span data-testid="support-ticket-id">{ticketRef}</span>
        </p>
        <h2 className="font-display font-normal text-[clamp(40px,4.5vw,72px)] leading-[1.0] tracking-tightest mt-5 mx-auto max-w-[16ch]">
          Your note is <em className="italic">on file</em>.
        </h2>
        <p className="font-body text-[15px] leading-[1.6] text-ink-2 max-w-[480px] mx-auto mt-6">
          We&rsquo;ve acknowledged ticket{' '}
          <span className="font-mono text-[13px] text-ink tabular-nums">{ticketRef}</span>.
          Response within 24 hours to{' '}
          <span className="font-mono text-[13px] text-ink">{success.email}</span>.
        </p>
        <div className="flex flex-wrap gap-2 justify-center mt-8">
          <button
            type="button"
            onClick={() => {
              reset({
                email:     userEmail ?? '',
                subject:   '',
                body:      '',
                order_ref: '',
              })
              setSuccess(null)
            }}
            data-testid="support-file-another"
            className="inline-flex items-center font-mono text-[11px] tracking-widest uppercase px-5 py-3 border border-hairline text-ink hover:border-ink transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
          >
            File another
          </button>
          <Link
            href="/"
            data-testid="support-return-home"
            className="inline-flex items-center font-mono text-[11px] tracking-widest uppercase px-5 py-3 border border-hairline text-ink hover:border-ink transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
          >
            Return home
          </Link>
        </div>
      </div>
    )
  }

  // ─── Form ───────────────────────────────────────────────────────────────────
  return (
    <form
      data-testid="support-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-6"
    >
      {apiError && (
        <div data-testid="support-api-error">
          <Alert variant="error" message={apiError} />
        </div>
      )}

      {/* Email */}
      {isAuthed ? (
        <div data-testid="support-email-readonly">
          <p className="font-mono text-2xs tracking-widest uppercase text-graphite mb-2">
            Email address
          </p>
          <div className="border border-hairline px-4 py-3.5 bg-paper-2 flex items-center justify-between">
            <span className="font-mono text-sm text-ink">{userEmail}</span>
            <span className="font-mono text-2xs tracking-widest uppercase text-assay">
              ✓ Signed in
            </span>
          </div>
        </div>
      ) : (
        <Input
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@domain.com"
          data-testid="input-email"
          error={errors.email?.message}
          {...register('email')}
        />
      )}

      {/* Order link */}
      {isAuthed ? (
        <div className="flex flex-col gap-2">
          <label
            htmlFor="order_ref"
            className="font-mono text-2xs tracking-widest uppercase text-graphite"
          >
            Related order · Optional
          </label>
          <select
            id="order_ref"
            data-testid="input-order-select"
            className="w-full bg-transparent px-4 py-3.5 font-mono text-sm text-ink border border-hairline hover:border-ink focus:border-ink transition-colors focus:outline-none focus-visible:outline-none"
            {...register('order_ref')}
          >
            <option value="">None — general query</option>
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
          label="Related order · Optional"
          type="text"
          placeholder="Order number, e.g. ORD-2026-0001"
          data-testid="input-order-number"
          hint="If you already have an order number, include it here."
          {...register('order_ref')}
        />
      )}

      {/* Subject */}
      <Input
        id="subject"
        label={`Subject · max ${SUBJECT_MAX}`}
        type="text"
        placeholder="Briefly describe your issue"
        maxLength={SUBJECT_MAX}
        data-testid="input-subject"
        error={errors.subject?.message}
        {...register('subject')}
      />

      {/* Body */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <label
            htmlFor="body"
            className="font-mono text-2xs tracking-widest uppercase text-graphite"
          >
            Message
          </label>
          <span
            data-testid="body-counter"
            className={`font-mono text-2xs tabular-nums ${counterClass}`}
          >
            {bodyLen.toLocaleString()} / {BODY_MAX.toLocaleString()}
          </span>
        </div>
        <textarea
          id="body"
          rows={7}
          maxLength={BODY_MAX}
          placeholder="Describe the issue. What's happening, what you expected, any order or product references."
          data-testid="input-body"
          aria-invalid={errors.body ? true : undefined}
          aria-describedby={errors.body ? 'body-error' : undefined}
          className={[
            'w-full bg-transparent px-4 py-3.5 font-body text-sm text-ink',
            'placeholder:text-graphite resize-y transition-colors duration-150 border',
            'focus:outline-none focus-visible:outline-none',
            errors.body ? 'border-oxblood focus:border-oxblood' : 'border-hairline hover:border-ink focus:border-ink',
          ].join(' ')}
          {...register('body')}
        />
        {errors.body && (
          <p
            id="body-error"
            role="alert"
            data-testid="body-error"
            className="font-mono text-2xs uppercase tracking-wide text-oxblood"
          >
            — {errors.body.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <div className="flex flex-wrap gap-2 mt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          data-testid="support-submit"
          className="inline-flex items-center justify-center bg-ink text-paper px-7 py-4 font-mono text-[11px] tracking-ultra uppercase hover:bg-ink-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
        >
          {isSubmitting ? 'Dispatching…' : 'Dispatch note →'}
        </button>
        <Link
          href={isAuthed ? '/account' : '/'}
          data-testid="support-cancel"
          className="inline-flex items-center justify-center px-5 py-4 font-mono text-[11px] tracking-widest uppercase border border-hairline text-ink hover:border-ink transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
