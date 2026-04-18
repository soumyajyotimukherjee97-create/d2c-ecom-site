'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { createClient } from '@/lib/supabase/browser'
import { LoginSchema, type LoginInput } from '@/lib/api/schemas/auth'

export default function LoginView() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const nextPath     = searchParams.get('next') || '/account'

  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(LoginSchema) })

  async function onSubmit(values: LoginInput) {
    setApiError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email:    values.email,
      password: values.password,
    })

    if (error) {
      setApiError('Invalid email or password.')
      return
    }

    router.push(nextPath)
    router.refresh()
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

      {/* Form panel on paper-2 */}
      <main className="flex-1 bg-paper-2 px-8 py-24">
        <div className="max-w-[480px] mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <p
              data-testid="login-eyebrow"
              className="inline-block font-mono text-[10px] tracking-ultra uppercase text-graphite"
            >
              § Returning subject
            </p>
            <h1
              data-testid="login-heading"
              className="font-display font-normal text-[clamp(40px,5vw,72px)] leading-[0.98] tracking-tightest mt-5"
            >
              Welcome <em className="italic">back</em>.
            </h1>
            <p className="font-body text-sm text-ink-2 mt-5 leading-[1.6]">
              Access your dossier to track consignments and reorder.
            </p>
          </div>

          {/* Form */}
          <form
            data-testid="login-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="border-t-2 border-ink pt-6 flex flex-col gap-5"
          >
            {apiError && (
              <div data-testid="login-api-error">
                <Alert variant="error" message={apiError} />
              </div>
            )}

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
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              data-testid="input-password"
              error={errors.password?.message}
              {...register('password')}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              data-testid="login-submit"
              className="bg-ink text-paper py-4 font-mono text-xs tracking-ultra uppercase hover:bg-ink-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          {/* Switch to signup */}
          <div className="text-center mt-10 pt-6 border-t border-hairline/60">
            <span className="font-mono text-[10px] tracking-widest uppercase text-graphite">
              New here?
            </span>
            <Link
              href="/signup"
              data-testid="link-signup"
              className="ml-2.5 font-mono text-[11px] tracking-widest uppercase text-ink border-b border-ink pb-0.5 hover:text-graphite hover:border-graphite transition-colors"
            >
              Create a dossier →
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
