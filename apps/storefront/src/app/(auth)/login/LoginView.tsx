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
import { LoginSchema, type LoginInput } from '@/lib/api/schemas/auth'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next') || '/account'

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
      email: values.email,
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Minimal header */}
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
          🔒 Secure sign in
        </span>
      </header>

      {/* Form */}
      <main className="flex-1 flex items-start justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="font-heading text-2xl text-gray-900 mb-1">Welcome back</h1>
          <p className="font-body text-sm text-gray-600 mb-8">
            Sign in to view your orders and skin profile.
          </p>

          <form
            data-testid="login-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-4"
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
              placeholder="you@example.com"
              data-testid="input-email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              data-testid="input-password"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
              data-testid="login-submit"
              className="w-full mt-2"
            >
              Sign in
            </Button>
          </form>

          <p className="font-body text-sm text-gray-600 mt-8 text-center">
            New here?{' '}
            <Link
              href="/signup"
              data-testid="link-signup"
              className="text-gray-900 underline hover:text-gray-600 transition-colors"
            >
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
