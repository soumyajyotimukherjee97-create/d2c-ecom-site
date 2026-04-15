'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

export function SignOutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function handleClick() {
    setPending(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      data-testid="account-sign-out"
      className="text-left font-body text-xs text-gray-400 hover:text-gray-900 transition-colors px-3 py-2 rounded-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2 disabled:opacity-50"
    >
      {pending ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
