'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

export function SignOutButton() {
  const router = useRouter()

  async function onClick() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={onClick}
      data-testid="staff-signout"
      className="border border-gray-200 rounded-sm px-3 py-1.5 font-mono text-2xs uppercase tracking-wider text-gray-900 hover:border-gray-900 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
    >
      Sign out
    </button>
  )
}
