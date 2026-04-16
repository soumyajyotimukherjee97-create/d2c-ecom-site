'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCartStore } from '@/lib/store/cart'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
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
// Separate from CreateOrderSchema — includes name fields and maps to the API shape on submit.

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

const FREE_SHIPPING_THRESHOLD = 99900
const SHIPPING_COST           = 9900

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(paise: number) {
  return `₹${Math.round(paise / 100).toLocaleString()}`
}

function computeShipping(subtotal: number) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepHeader({ n, title, subtitle }: { n: number; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-50">
      <div
        aria-hidden="true"
        className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center font-mono text-2xs flex-shrink-0"
      >
        {n}
      </div>
      <div>
        <p className="font-body text-sm font-medium text-gray-900">{title}</p>
        <p className="font-mono text-xs text-gray-400">{subtitle}</p>
      </div>
    </div>
  )
}

function OrderSummaryItem({ item }: { item: CartItem }) {
  return (
    <div
      data-testid="checkout-summary-item"
      className="flex gap-2 items-start py-2 border-b border-gray-100 last:border-0"
    >
      {/* Product thumbnail */}
      <div className="w-10 h-10 flex-shrink-0 bg-gray-50 border border-gray-100 rounded-sm relative overflow-hidden">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" sizes="40px" />
        ) : (
          <span className="sr-only">{item.productName}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-body text-xs font-medium text-gray-900 truncate">{item.productName}</p>
        <p className="font-mono text-2xs text-gray-400 uppercase">
          {item.size_ml}ml · Qty {item.quantity}
        </p>
      </div>

      <p className="font-body text-xs font-medium text-gray-900 flex-shrink-0">
        {fmt(item.price * item.quantity)}
      </p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router   = useRouter()
  const items    = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)

  const [mounted, setMounted]     = useState(false)
  const [apiError, setApiError]   = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Redirect to products if cart is empty (after hydration).
  // Skip once an order has been submitted — clearCart() empties items and would
  // otherwise race with router.push('/order/[id]').
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
      const res  = await fetch('/api/orders', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      const json = await res.json()

      if (!res.ok) {
        const msg = json?.error?.message ?? 'Something went wrong. Please try again.'
        setApiError(msg)
        return
      }

      setSubmitted(true)
      clearCart()
      router.push(`/order/${json.id}`)
    } catch {
      setApiError('Network error. Please check your connection and try again.')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── Minimal checkout navbar ─────────────────────────────────────────── */}
      <header
        data-testid="checkout-navbar"
        className="border-b border-gray-100 px-6 py-4 flex items-center justify-between"
      >
        <Link
          href="/"
          data-testid="checkout-brand"
          className="font-heading text-base tracking-tight text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2 rounded-sm"
        >
          Form.
        </Link>
        <span className="font-mono text-2xs uppercase tracking-widest text-gray-400">
          🔒 Secure checkout
        </span>
      </header>

      {/* ── Main layout ────────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-6 py-8 flex gap-8 items-start">

        {/* ── LEFT: Checkout form ─────────────────────────────────────────── */}
        <form
          data-testid="checkout-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex-1 min-w-0"
        >
          {apiError && (
            <div className="mb-6" data-testid="checkout-api-error">
              <Alert variant="error" message={apiError} />
            </div>
          )}

          {/* ── STEP 1: Contact ─────────────────────────────────────────── */}
          <section aria-labelledby="step-contact" className="mb-6">
            <StepHeader n={1} title="Contact" subtitle="Email for order updates" />

            <div className="mb-3">
              <Input
                id="contact_email"
                label="Email address *"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                data-testid="input-email"
                error={errors.contact_email?.message}
                {...register('contact_email')}
              />
            </div>

            <p className="font-mono text-xs text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="underline hover:text-gray-600 transition-colors">
                Sign in →
              </Link>
            </p>
          </section>

          {/* ── STEP 2: Shipping address ────────────────────────────────── */}
          <section aria-labelledby="step-shipping" className="mb-6">
            <StepHeader n={2} title="Shipping address" subtitle="Where should we send it?" />

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Input
                id="first_name"
                label="First name *"
                placeholder="Priya"
                autoComplete="given-name"
                data-testid="input-first-name"
                error={errors.first_name?.message}
                {...register('first_name')}
              />
              <Input
                id="last_name"
                label="Last name *"
                placeholder="Mehta"
                autoComplete="family-name"
                data-testid="input-last-name"
                error={errors.last_name?.message}
                {...register('last_name')}
              />
            </div>

            {/* Address line 1 */}
            <div className="mb-3">
              <Input
                id="address_line1"
                label="Address line 1 *"
                placeholder="Flat / Building / Street"
                autoComplete="address-line1"
                data-testid="input-address-line1"
                error={errors.address_line1?.message}
                {...register('address_line1')}
              />
            </div>

            {/* Address line 2 */}
            <div className="mb-3">
              <Input
                id="address_line2"
                label="Address line 2 (optional)"
                placeholder="Area / Landmark"
                autoComplete="address-line2"
                data-testid="input-address-line2"
                {...register('address_line2')}
              />
            </div>

            {/* City + PIN */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Input
                id="city"
                label="City *"
                placeholder="Bengaluru"
                autoComplete="address-level2"
                data-testid="input-city"
                error={errors.city?.message}
                {...register('city')}
              />
              <Input
                id="pin"
                label="PIN code *"
                placeholder="560001"
                autoComplete="postal-code"
                inputMode="numeric"
                maxLength={6}
                data-testid="input-pin"
                error={errors.pin?.message}
                {...register('pin')}
              />
            </div>

            {/* State + Country */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="state" className="font-body text-sm font-medium text-gray-900">
                  State *
                </label>
                <select
                  id="state"
                  data-testid="input-state"
                  aria-invalid={errors.state ? true : undefined}
                  aria-describedby={errors.state ? 'state-error' : undefined}
                  className={[
                    'w-full border rounded-sm',
                    'px-3 py-2 font-body text-base text-gray-900 bg-white',
                    'transition-colors duration-150',
                    'focus:outline-none focus-visible:outline focus-visible:outline-2',
                    'focus-visible:outline-gray-900 focus-visible:outline-offset-1',
                    errors.state ? 'border-error' : 'border-gray-200 hover:border-gray-400',
                  ].join(' ')}
                  {...register('state')}
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.state && (
                  <p id="state-error" role="alert" className="font-body text-sm text-error">
                    {errors.state.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-body text-sm font-medium text-gray-900">Country</label>
                <input
                  value="India"
                  disabled
                  aria-label="Country: India (fixed)"
                  className="w-full border border-gray-100 rounded-sm px-3 py-2 font-body text-base text-gray-400 bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone */}
            <Input
              id="contact_phone"
              label="Phone (for delivery updates)"
              type="tel"
              placeholder="+91 98765 43210"
              autoComplete="tel"
              data-testid="input-phone"
              {...register('contact_phone')}
            />
          </section>

          {/* ── STEP 3: Review and place ────────────────────────────────── */}
          <section aria-labelledby="step-review">
            <StepHeader n={3} title="Review and place order" subtitle="Confirm your details above" />

            {/* Payment callout */}
            <div
              className="bg-offwhite border-l-2 border-gray-900 px-3 py-2 mb-4"
              data-testid="payment-callout"
            >
              <p className="font-mono text-2xs uppercase tracking-widest text-gray-400 mb-1">
                COD
              </p>
              <p className="font-body text-xs text-gray-600">
                Payment to be done at the time of delivery
              </p>
            </div>

            {/* Submit CTA */}
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
              data-testid="checkout-submit"
              className="w-full mb-2"
            >
              Place order →
            </Button>

            <p className="font-mono text-2xs text-gray-400 text-center">
              No account needed · Guest checkout
            </p>
          </section>
        </form>

        {/* ── RIGHT: Order summary (sticky) ───────────────────────────────── */}
        <aside
          data-testid="order-summary"
          className="w-[280px] flex-shrink-0 bg-offwhite border border-gray-100 rounded-sm p-4 sticky top-6"
          aria-label="Order summary"
        >
          <p className="font-mono text-2xs uppercase tracking-widest text-gray-400 mb-3">
            Order summary
          </p>

          {/* Items */}
          <div className="mb-3" data-testid="checkout-summary-items">
            {mounted && items.map((item) => (
              <OrderSummaryItem key={item.variantId} item={item} />
            ))}
            {!mounted && (
              <div className="h-16 bg-gray-100 rounded-sm animate-pulse" />
            )}
          </div>

          {/* Totals */}
          <div className="border-t border-gray-100 pt-3 space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs uppercase text-gray-400">Subtotal</span>
              <span className="font-body text-sm text-gray-900" data-testid="checkout-subtotal">
                {mounted ? fmt(subtotal) : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs uppercase text-gray-400">Shipping</span>
              <span
                className="font-mono text-xs text-mist-text uppercase"
                data-testid="checkout-shipping"
              >
                {mounted
                  ? shipping === 0 ? 'Free' : fmt(shipping)
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-100 pt-2 mt-2">
              <span className="font-body text-sm font-medium text-gray-900">Total</span>
              <span
                className="font-heading text-base text-gray-900"
                data-testid="checkout-total"
              >
                {mounted ? fmt(total) : '—'}
              </span>
            </div>
          </div>

          {/* Promo code (Phase 2 — UI only) */}
          <div className="border-t border-gray-100 pt-3 mt-3">
            <label
              htmlFor="promo-code"
              className="font-mono text-2xs uppercase tracking-widest text-gray-400 mb-1 block"
            >
              Promo code
            </label>
            <div className="flex gap-2">
              <input
                id="promo-code"
                type="text"
                placeholder="Enter code"
                disabled
                aria-label="Promo code (coming soon)"
                className="flex-1 border border-gray-200 rounded-sm px-3 py-2 font-body text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
              />
              <button
                type="button"
                disabled
                className="border border-gray-200 rounded-sm px-3 py-2 font-mono text-xs text-gray-400 bg-gray-50 cursor-not-allowed"
              >
                Apply
              </button>
            </div>
            <p className="font-mono text-2xs text-gray-400 mt-1">Coming soon.</p>
          </div>
        </aside>
      </main>
    </div>
  )
}
