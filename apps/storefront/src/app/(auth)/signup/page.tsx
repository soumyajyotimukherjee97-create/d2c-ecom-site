'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { createClient } from '@/lib/supabase/browser'
import { SignupSchema, type SignupInput } from '@/lib/api/schemas/auth'

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next') || '/account'

  const [apiError, setApiError] = useState<string | null>(null)
  const [needsVerification, setNeedsVerification] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(SignupSchema) })

  async function onSubmit(values: SignupInput) {
    setApiError(null)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    })

    if (error) {
      setApiError(error.message)
      return
    }

    // If email confirmation is required, Supabase returns a user but no session.
    if (data.session) {
      router.push(nextPath)
      router.refresh()
      return
    }

    setNeedsVerification(true)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header
        data-testid="auth-navbar"
        className="border-b border-gray-100 px-6 py-4 flex items-center justify-between"
      >
        <Link
          href="/"
          data-testid="auth-brand"
          className="font-heading text-base tracking-tight text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2 rounded-sm"
        >
          Form.
        </Link>
        <span className="font-mono text-2xs uppercase tracking-widest text-gray-400">
          Create account
        </span>
      </header>

      <main className="flex-1 flex items-start justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {needsVerification ? (
            <div data-testid="signup-verify">
              <h1 className="font-heading text-2xl text-gray-900 mb-2">Check your email</h1>
              <p className="font-body text-sm text-gray-600 mb-6">
                We&apos;ve sent a verification link. Click it to finish creating your account.
              </p>
              <Link
                href="/login"
                className="font-body text-sm text-gray-900 underline hover:text-gray-600 transition-colors"
              >
                Back to sign in →
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-heading text-2xl text-gray-900 mb-1">Create account</h1>
              <p className="font-body text-sm text-gray-600 mb-8">
                Track orders, save your skin profile, and reorder in one tap.
              </p>

              <form
                data-testid="signup-form"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="flex flex-col gap-4"
              >
                {apiError && (
                  <div data-testid="signup-api-error">
                    <Alert variant="error" message={apiError} />
                  </div>
                )}

                <Input
                  id="email"
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  data-testid="input-email"
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Input
                  id="password"
                  label="Password"
                  type="password"
                  autoComplete="new-password"
                  hint="At least 8 characters"
                  data-testid="input-password"
                  error={errors.password?.message}
                  {...register('password')}
                />

                <Input
                  id="confirm_password"
                  label="Confirm password"
                  type="password"
                  autoComplete="new-password"
                  data-testid="input-confirm-password"
                  error={errors.confirm_password?.message}
                  {...register('confirm_password')}
                />

                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  data-testid="signup-submit"
                  className="w-full mt-2"
                >
                  Create account
                </Button>
              </form>

              <p className="font-body text-sm text-gray-600 mt-8 text-center">
                Already have an account?{' '}
                <Link
                  href="/login"
                  data-testid="link-login"
                  className="text-gray-900 underline hover:text-gray-600 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
