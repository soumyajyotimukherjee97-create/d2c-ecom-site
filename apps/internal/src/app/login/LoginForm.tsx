'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/browser'
import { LoginSchema, type LoginInput } from '@/lib/api/schemas/auth'

interface Props {
  initialError: string | null
  redirectTo?: string
}

export function LoginForm({ initialError, redirectTo }: Props) {
  const router = useRouter()
  const [apiError, setApiError] = useState<string | null>(initialError)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: LoginInput) {
    setApiError(null)
    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email:    values.email,
      password: values.password,
    })

    if (error || !data.user) {
      setApiError(error?.message ?? 'Unable to sign in. Check your credentials.')
      return
    }

    const role =
      (data.user.app_metadata as { role?: string } | undefined)?.role ??
      (data.user.user_metadata as { role?: string } | undefined)?.role

    if (role !== 'staff') {
      await supabase.auth.signOut()
      setApiError('Your account does not have staff access.')
      return
    }

    const target = redirectTo && redirectTo.startsWith('/') ? redirectTo : '/dashboard'
    router.push(target)
    router.refresh()
  }

  return (
    <form
      data-testid="staff-login-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      {apiError && (
        <p
          role="alert"
          data-testid="staff-login-error"
          className="border border-error rounded-sm px-3 py-2 font-body text-sm text-error"
        >
          {apiError}
        </p>
      )}

      <label className="flex flex-col gap-1">
        <span className="font-body text-sm font-medium text-gray-900">Email</span>
        <input
          type="email"
          autoComplete="email"
          data-testid="staff-login-email"
          aria-invalid={errors.email ? true : undefined}
          className="w-full border border-gray-200 rounded-sm px-3 py-2 font-body text-base text-gray-900 bg-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-1"
          {...register('email')}
        />
        {errors.email && (
          <span role="alert" className="font-body text-sm text-error">
            {errors.email.message}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-body text-sm font-medium text-gray-900">Password</span>
        <input
          type="password"
          autoComplete="current-password"
          data-testid="staff-login-password"
          aria-invalid={errors.password ? true : undefined}
          className="w-full border border-gray-200 rounded-sm px-3 py-2 font-body text-base text-gray-900 bg-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-1"
          {...register('password')}
        />
        {errors.password && (
          <span role="alert" className="font-body text-sm text-error">
            {errors.password.message}
          </span>
        )}
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        data-testid="staff-login-submit"
        className="w-full bg-gray-900 text-white font-mono text-2xs uppercase tracking-wider py-3 rounded-sm transition-colors hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
      >
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
