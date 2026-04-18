'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert } from '@/components/ui/Alert'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/browser'
import { SignupSchema, type SignupInput } from '@/lib/api/schemas/auth'

export default function SignupView() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const nextPath     = searchParams.get('next') || '/account'
  const prefillEmail = searchParams.get('prefill') ?? ''
  // `?order=<id>` is carried from the guest-confirmation page's "Create account"
  // link. Claim-on-signup is not yet wired server-side; flagged as a follow-up.

  const [apiError, setApiError] = useState<string | null>(null)
  const [needsVerification, setNeedsVerification] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      first_name: '',
      last_name:  '',
      email:      prefillEmail,
      password:   '',
      terms:      false as unknown as true,
    },
  })

  async function onSubmit(values: SignupInput) {
    setApiError(null)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email:    values.email,
      password: values.password,
      options: {
        data: {
          first_name: values.first_name,
          last_name:  values.last_name,
        },
      },
    })

    if (error) {
      setApiError(error.message)
      return
    }

    // Supabase returns a user but no session when email confirmation is required.
    if (data.session) {
      router.push(nextPath)
      router.refresh()
      return
    }

    setNeedsVerification(true)
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Minimal chrome — wordmark only */}
      <header
        data-testid="auth-navbar"
        className="bg-paper border-b border-hairline px-8 py-6"
      >
        <div className="max-w-container mx-auto flex items-center justify-between gap-4">
          <Link
            href="/"
            data-testid="auth-brand"
            aria-label="matter — home"
            className="font-display text-[22px] leading-none tracking-tight text-ink focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
          >
            matter<em className="not-italic" style={{ fontStyle: 'italic', letterSpacing: '-0.04em', marginLeft: 1 }}>.</em>
          </Link>
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-graphite">
            § Access · Verified
          </span>
        </div>
      </header>

      <main className="flex-1 bg-paper-2 px-8 py-24">
        <div className="max-w-[480px] mx-auto">
          {needsVerification ? (
            <div data-testid="signup-verify" className="text-center">
              <p className="inline-block font-mono text-[10px] tracking-ultra uppercase text-graphite">
                § Pending verification
              </p>
              <h1 className="font-display font-normal text-[clamp(40px,5vw,72px)] leading-[0.98] tracking-tightest mt-5">
                Check your <em className="italic">inbox</em>.
              </h1>
              <p className="font-body text-sm text-ink-2 mt-5 leading-[1.6]">
                A verification link has been dispatched. Follow it to finish
                creating your dossier.
              </p>
              <Link
                href="/login"
                className="inline-block mt-8 font-mono text-[11px] tracking-widest uppercase text-ink border-b border-ink pb-0.5 hover:text-graphite hover:border-graphite transition-colors"
              >
                Back to sign in →
              </Link>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-12">
                <p
                  data-testid="signup-eyebrow"
                  className="inline-block font-mono text-[10px] tracking-ultra uppercase text-graphite"
                >
                  § New subject — Enroll
                </p>
                <h1
                  data-testid="signup-heading"
                  className="font-display font-normal text-[clamp(40px,5vw,72px)] leading-[0.98] tracking-tightest mt-5"
                >
                  Create your <em className="italic">dossier</em>.
                </h1>
                <p className="font-body text-sm text-ink-2 mt-5 leading-[1.6]">
                  30 seconds. Email and a password. No loyalty scheme, no
                  marketing drip.
                </p>
              </div>

              {/* Form */}
              <form
                data-testid="signup-form"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="border-t-2 border-ink pt-6 flex flex-col gap-5"
              >
                {apiError && (
                  <div data-testid="signup-api-error">
                    <Alert variant="error" message={apiError} />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
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

                <Input
                  id="password"
                  label="Password · 8+ characters"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  data-testid="input-password"
                  error={errors.password?.message}
                  {...register('password')}
                />

                <div className="mt-2">
                  <label
                    htmlFor="terms"
                    data-testid="signup-terms-label"
                    className="flex items-start gap-2.5 font-body text-[13px] text-ink-2 cursor-pointer"
                  >
                    <input
                      id="terms"
                      type="checkbox"
                      data-testid="input-terms"
                      aria-invalid={errors.terms ? true : undefined}
                      aria-describedby={errors.terms ? 'terms-error' : undefined}
                      className="mt-1 w-4 h-4 accent-ink flex-shrink-0"
                      {...register('terms')}
                    />
                    <span>
                      I agree to the{' '}
                      <Link
                        href="/terms"
                        className="font-mono text-[11px] uppercase tracking-wide border-b border-ink pb-[1px] text-ink hover:text-graphite hover:border-graphite transition-colors"
                      >
                        Terms
                      </Link>{' '}
                      and{' '}
                      <Link
                        href="/privacy"
                        className="font-mono text-[11px] uppercase tracking-wide border-b border-ink pb-[1px] text-ink hover:text-graphite hover:border-graphite transition-colors"
                      >
                        Privacy policy
                      </Link>
                      .
                    </span>
                  </label>
                  {errors.terms && (
                    <p
                      id="terms-error"
                      role="alert"
                      className="mt-2 font-mono text-2xs uppercase tracking-wide text-oxblood"
                    >
                      — {errors.terms.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  data-testid="signup-submit"
                  className="bg-ink text-paper py-4 font-mono text-xs tracking-ultra uppercase hover:bg-ink-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
                >
                  {isSubmitting ? 'Creating dossier…' : 'Create dossier →'}
                </button>
              </form>

              {/* Switch to login */}
              <div className="text-center mt-10 pt-6 border-t border-hairline/60">
                <span className="font-mono text-[10px] tracking-widest uppercase text-graphite">
                  Returning?
                </span>
                <Link
                  href="/login"
                  data-testid="link-login"
                  className="ml-2.5 font-mono text-[11px] tracking-widest uppercase text-ink border-b border-ink pb-0.5 hover:text-graphite hover:border-graphite transition-colors"
                >
                  Sign in →
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
