'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCartStore } from '@/lib/store/cart'
import { formatInr } from '@/lib/money'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { extractApiError, NETWORK_MESSAGE } from '@/lib/api/client'
import type { CartItem } from '@/lib/store/cart'

// ─── Indian states ────────────────────────────────────────────────────────────

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep',
  'Andaman and Nicobar Islands',
]

// ─── Form schema ──────────────────────────────────────────────────────────────

const CheckoutSchema = z.object({
  contact_email: z.string().email('A valid email address is required'),
  contact_phone: z.string().optional(),
  first_name:    z.string().min(1, 'First name is required'),
  last_name:     z.string().min(1, 'Last name is required'),
  address_line1: z.string().min(1, 'Address is required'),
  address_line2: z.string().optional(),
  city:          z.string().min(1, 'City is required'),
  state:         z.string().min(1, 'State is required'),
  pin:           z.string().regex(/^\d{6}$/, 'PIN must be exactly 6 digits'),
})

type CheckoutFields = z.infer<typeof CheckoutSchema>

// ─── Constants ────────────────────────────────────────────────────────────────

const FREE_SHIPPING_THRESHOLD = 99900 // paise
const SHIPPING_COST           = 9900  // paise

function computeShipping(subtotal: number) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHead({
  n,
  label,
  title,
  aside,
}: {
  n:     string
  label: string
  title: string
  aside: string
}) {
  return (
    <div className="flex justify-between items-start gap-4 mb-6">
      <div>
        <p className="font-mono text-[10px] tracking-ultra uppercase text-ink">
          § {n} — {label}
        </p>
        <p className="font-display text-[clamp(24px,2.5vw,28px)] text-ink mt-2 leading-tight">
          {title}
        </p>
      </div>
      <span className="font-mono text-[10px] tracking-widest uppercase text-graphite whitespace-nowrap">
        {aside}
      </span>
    </div>
  )
}

function SummaryItem({ item }: { item: CartItem }) {
  return (
    <div
      data-testid="checkout-summary-item"
      className="flex items-start gap-3.5 py-2.5"
    >
      <div className="relative w-14 aspect-square flex-shrink-0 overflow-hidden border border-hairline">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.productName}
            fill
            className="object-cover"
            sizes="56px"
          />
        ) : (
          <div className="m-ph absolute inset-0" aria-hidden="true" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-body text-[13px] text-ink truncate">
          {item.productName}
        </p>
        <p className="font-mono text-[10px] tracking-widest uppercase text-graphite mt-1">
          {item.size_ml}ml · Qty {item.quantity}
        </p>
      </div>
      <span className="font-mono text-[13px] text-ink tabular-nums">
        {formatInr(item.price * item.quantity)}
      </span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router    = useRouter()
  const items     = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)

  const [mounted, setMounted]     = useState(false)
  const [apiError, setApiError]   = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Redirect to /products if cart is empty after hydration. Skip while a
  // submission is mid-flight — clearCart() empties items and would otherwise
  // race router.push('/order/[id]').
  useEffect(() => {
    if (mounted && !submitted && items.length === 0) {
      router.replace('/products')
    }
  }, [mounted, submitted, items.length, router])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFields>({
    resolver: zodResolver(CheckoutSchema),
  })

  const subtotal = mounted ? items.reduce((sum, i) => sum + i.price * i.quantity, 0) : 0
  const shipping = computeShipping(subtotal)
  const total    = subtotal + shipping
  const formulaCount = items.length

  async function onSubmit(data: CheckoutFields) {
    setApiError(null)

    const payload = {
      items: items.map((i) => ({ variant_id: i.variantId, quantity: i.quantity })),
      shipping_address: {
        line1:   `${data.first_name} ${data.last_name}, ${data.address_line1}`,
        line2:   data.address_line2 || null,
        city:    data.city,
        state:   data.state,
        pin:     data.pin,
        country: 'IN' as const,
      },
      contact_email: data.contact_email,
      contact_phone: data.contact_phone || null,
    }

    try {
      const res = await fetch('/api/orders', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      if (!res.ok) {
        setApiError(await extractApiError(res))
        return
      }

      const json = await res.json()
      setSubmitted(true)
      clearCart()
      router.push(`/order/${json.id}`)
    } catch {
      setApiError(NETWORK_MESSAGE)
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* ── Minimal chrome ─────────────────────────────────────────────────── */}
      <header
        data-testid="checkout-navbar"
        className="bg-paper border-b border-hairline px-8 py-5"
      >
        <div className="max-w-container mx-auto flex items-center justify-between gap-4">
          <Link
            href="/"
            data-testid="checkout-brand"
            aria-label="matter — home"
            className="font-display text-[22px] leading-none tracking-tight text-ink focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
          >
            matter<em className="not-italic" style={{ fontStyle: 'italic', letterSpacing: '-0.04em', marginLeft: 1 }}>.</em>
          </Link>
          <span
            data-testid="checkout-secure"
            className="font-mono text-[10px] tracking-[0.18em] uppercase text-graphite hidden sm:inline"
          >
            § Secure checkout · SSL
          </span>
          <Link
            href="/support/new"
            data-testid="checkout-help"
            className="font-mono text-[10px] tracking-widest uppercase text-ink hover:text-graphite transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
          >
            Need help? →
          </Link>
        </div>
      </header>

      {/* ── Main layout (paper-2 bg, 12-col) ──────────────────────────────── */}
      <main className="bg-paper-2 border-b border-hairline">
        <div className="max-w-container mx-auto px-8 pt-12 pb-24">

          {/* Headline */}
          <div className="mb-12">
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-graphite">
              § Checkout · Order brief
            </p>
            <h1
              data-testid="checkout-heading"
              className="font-display font-normal text-[clamp(48px,6vw,88px)] leading-[1.02] tracking-tightest mt-4"
            >
              Finalising your <em className="italic">consignment</em>.
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

            {/* ═══ LEFT: Form (cols 1-8) ═══ */}
            <form
              data-testid="checkout-form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="md:col-span-8 min-w-0"
            >
              {apiError && (
                <div className="mb-8" data-testid="checkout-api-error">
                  <Alert variant="error" message={apiError} />
                </div>
              )}

              {/* § 01 CONTACT */}
              <section
                aria-labelledby="step-contact"
                data-testid="checkout-section-contact"
                className="border-t-2 border-ink pt-5 mb-12"
              >
                <SectionHead n="01" label="Contact" title="Who are you?" aside="Required" />

                <Input
                  id="contact_email"
                  label="Email address"
                  type="email"
                  placeholder="you@domain.com"
                  autoComplete="email"
                  data-testid="input-email"
                  error={errors.contact_email?.message}
                  {...register('contact_email')}
                />

                <p className="font-mono text-[10px] tracking-widest uppercase text-graphite mt-4">
                  Already registered?{' '}
                  <Link
                    href="/login"
                    className="underline hover:text-ink transition-colors"
                  >
                    Sign in →
                  </Link>
                </p>
              </section>

              {/* § 02 DISPATCH ADDRESS */}
              <section
                aria-labelledby="step-address"
                data-testid="checkout-section-address"
                className="border-t-2 border-ink pt-5 mb-12"
              >
                <SectionHead
                  n="02"
                  label="Dispatch address"
                  title="Where shall we send it?"
                  aside="India only"
                />

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Input
                    id="first_name"
                    label="First name"
                    placeholder="Aarti"
                    autoComplete="given-name"
                    data-testid="input-first-name"
                    error={errors.first_name?.message}
                    {...register('first_name')}
                  />
                  <Input
                    id="last_name"
                    label="Last name"
                    placeholder="Kapoor"
                    autoComplete="family-name"
                    data-testid="input-last-name"
                    error={errors.last_name?.message}
                    {...register('last_name')}
                  />
                </div>

                <div className="mb-4">
                  <Input
                    id="address_line1"
                    label="Address line 1"
                    placeholder="Flat / Building / Street"
                    autoComplete="address-line1"
                    data-testid="input-address-line1"
                    error={errors.address_line1?.message}
                    {...register('address_line1')}
                  />
                </div>

                <div className="mb-4">
                  <Input
                    id="address_line2"
                    label="Address line 2 · Optional"
                    placeholder="Landmark, apt, etc"
                    autoComplete="address-line2"
                    data-testid="input-address-line2"
                    {...register('address_line2')}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-[1fr_180px_140px] gap-4 mb-4">
                  <Input
                    id="city"
                    label="City"
                    placeholder="Mumbai"
                    autoComplete="address-level2"
                    data-testid="input-city"
                    error={errors.city?.message}
                    {...register('city')}
                  />
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="state"
                      className="font-mono text-2xs uppercase tracking-widest text-graphite"
                    >
                      State
                    </label>
                    <select
                      id="state"
                      data-testid="input-state"
                      aria-invalid={errors.state ? true : undefined}
                      aria-describedby={errors.state ? 'state-error' : undefined}
                      className={[
                        'w-full bg-transparent px-3.5 py-3',
                        'font-mono text-sm text-ink',
                        'transition-colors duration-150 border',
                        'focus:outline-none focus-visible:outline-none',
                        errors.state
                          ? 'border-oxblood focus:border-oxblood'
                          : 'border-hairline hover:border-ink focus:border-ink',
                      ].join(' ')}
                      {...register('state')}
                    >
                      <option value="">Select state</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {errors.state && (
                      <p
                        id="state-error"
                        role="alert"
                        className="font-mono text-2xs uppercase tracking-wide text-oxblood"
                      >
                        — {errors.state.message}
                      </p>
                    )}
                  </div>
                  <Input
                    id="pin"
                    label="Pincode"
                    placeholder="400050"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    maxLength={6}
                    data-testid="input-pin"
                    error={errors.pin?.message}
                    {...register('pin')}
                  />
                </div>

                <Input
                  id="contact_phone"
                  label="Phone · 10 digits"
                  type="tel"
                  placeholder="+91 · 98234 12345"
                  autoComplete="tel"
                  data-testid="input-phone"
                  {...register('contact_phone')}
                />
              </section>

              {/* § 03 PAYMENT */}
              <section
                aria-labelledby="step-payment"
                data-testid="checkout-section-payment"
                className="border-t-2 border-ink pt-5"
              >
                <SectionHead
                  n="03"
                  label="Payment"
                  title="How would you like to pay?"
                  aside="COD only · MVP"
                />

                <div className="flex flex-col gap-2">
                  <div
                    data-testid="payment-callout"
                    className="border border-ink px-5 py-4 bg-paper"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-mono text-[10px] tracking-widest uppercase">
                          01 · Cash on delivery
                        </p>
                        <p className="font-body text-[13px] text-ink-2 mt-1">
                          Pay when your consignment arrives.
                        </p>
                      </div>
                      <span
                        aria-hidden="true"
                        className="w-4 h-4 rounded-full bg-ink flex-shrink-0"
                      />
                    </div>
                  </div>
                  <div className="border border-hairline px-5 py-4 bg-paper">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-mono text-[10px] tracking-widest uppercase text-graphite">
                          02 · UPI / Net banking · Coming soon
                        </p>
                        <p className="font-body text-[13px] text-graphite mt-1">
                          Razorpay integration — Phase 2.
                        </p>
                      </div>
                      <span
                        aria-hidden="true"
                        className="w-4 h-4 rounded-full border border-hairline flex-shrink-0"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Submit CTA */}
              <div className="mt-10">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  data-testid="checkout-submit"
                  className="block w-full bg-ink text-paper py-5 font-mono text-xs tracking-ultra uppercase hover:bg-ink-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
                >
                  {isSubmitting
                    ? 'Placing order…'
                    : `Place order${mounted && total > 0 ? ` · ${formatInr(total)}` : ''}`}
                </button>
                <p className="font-mono text-2xs tracking-widest uppercase text-graphite text-center mt-3">
                  No account needed · Guest checkout welcome
                </p>
              </div>
            </form>

            {/* ═══ RIGHT: Sticky summary (cols 9-12) ═══ */}
            <aside
              data-testid="order-summary"
              aria-label="Order summary"
              className="md:col-span-4 md:sticky md:top-6 bg-paper border border-ink p-6"
            >
              <div className="flex justify-between items-baseline pb-3.5 border-b-2 border-ink">
                <span className="font-mono text-[10px] tracking-ultra uppercase text-ink">
                  § Order brief
                </span>
                <span
                  data-testid="checkout-formula-count"
                  className="font-mono text-[10px] tracking-widest uppercase text-graphite"
                >
                  {formulaCount} {formulaCount === 1 ? 'formula' : 'formulas'}
                </span>
              </div>

              {/* Compact line items */}
              <div
                data-testid="checkout-summary-items"
                className="py-3 border-b border-hairline/60"
              >
                {mounted && items.map((item) => (
                  <SummaryItem key={item.variantId} item={item} />
                ))}
                {!mounted && (
                  <div className="h-16 m-ph" aria-hidden="true" />
                )}
              </div>

              {/* Math strip */}
              <div className="py-3 border-b border-hairline/60">
                <div className="flex items-center justify-between py-1">
                  <span className="font-mono text-[11px] tracking-widest uppercase text-graphite">
                    Subtotal
                  </span>
                  <span
                    className="font-mono text-xs text-ink tabular-nums"
                    data-testid="checkout-subtotal"
                  >
                    {mounted ? formatInr(subtotal) : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="font-mono text-[11px] tracking-widest uppercase text-graphite">
                    Shipping
                  </span>
                  <span
                    data-testid="checkout-shipping"
                    className={`font-mono text-xs tracking-widest uppercase ${mounted && shipping === 0 ? 'text-assay' : 'text-ink'}`}
                  >
                    {mounted
                      ? shipping === 0 ? 'Free' : formatInr(shipping)
                      : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="font-mono text-[11px] tracking-widest uppercase text-graphite">
                    Tax · Incl. GST
                  </span>
                  <span className="font-mono text-xs text-ink tabular-nums">₹0</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-baseline justify-between pt-4">
                <span className="font-display text-[22px] text-ink">Total</span>
                <span
                  data-testid="checkout-total"
                  className="font-display text-[28px] text-ink tabular-nums"
                >
                  {mounted ? formatInr(total) : '—'}
                </span>
              </div>
              <p className="font-mono text-[9px] tracking-widest uppercase text-graphite mt-1.5">
                Displayed total · Recomputed on submit
              </p>
            </aside>

          </div>
        </div>
      </main>
    </div>
  )
}
