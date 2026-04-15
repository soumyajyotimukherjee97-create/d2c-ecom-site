import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isStaff } from '@/lib/supabase/middleware'
import { LoginForm } from './LoginForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Staff sign in · Internal',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user && isStaff(user)) {
    redirect(next && next.startsWith('/') ? next : '/dashboard')
  }

  const errorMessage =
    error === 'unauthorized'
      ? 'Your account does not have staff access. Contact an administrator.'
      : null

  return (
    <main className="min-h-screen flex items-center justify-center bg-offwhite px-6">
      <div className="w-full max-w-sm border border-gray-200 rounded-sm bg-white p-8">
        <h1 className="font-heading text-2xl text-gray-900 mb-1">Staff sign in</h1>
        <p className="font-body text-sm text-gray-600 mb-6">
          Internal console. Authorised personnel only.
        </p>
        <LoginForm initialError={errorMessage} redirectTo={next} />
      </div>
    </main>
  )
}
