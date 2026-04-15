'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/browser'

/**
 * Client-side auth subscription. Returns the current Supabase user (or null).
 * `loading` is true until the first `getUser` resolves, so consumers can avoid
 * flashing a signed-out state before hydration completes.
 */
export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return
      setUser(data.user ?? null)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}

export function getInitials(user: User | null): string {
  if (!user) return ''
  const name = (user.user_metadata?.full_name as string | undefined) || user.email || ''
  const parts = name.replace(/@.*$/, '').split(/[\s._-]+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase()
}
