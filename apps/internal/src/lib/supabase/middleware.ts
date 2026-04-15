import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { User } from '@supabase/supabase-js'

export interface SessionResult {
  response: NextResponse
  user: User | null
}

/**
 * Refreshes the Supabase session cookie on the response and returns the
 * current user (if any). The internal middleware then decides whether to
 * allow the request based on role.
 */
export async function updateSession(request: NextRequest): Promise<SessionResult> {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { response, user }
}

/** A user is considered staff when their app_metadata.role is 'staff'. */
export function isStaff(user: User | null): boolean {
  if (!user) return false
  const appMetaRole = (user.app_metadata as { role?: string } | undefined)?.role
  const userMetaRole = (user.user_metadata as { role?: string } | undefined)?.role
  return appMetaRole === 'staff' || userMetaRole === 'staff'
}
