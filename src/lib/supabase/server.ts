import { createServerClient as _createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

/**
 * Server Supabase client — for use in server components, API routes, and server actions.
 * Reads the Supabase session from the request cookie jar, so the user's JWT is respected.
 * Never import this in files that run in the browser.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return _createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // setAll is called from server components where cookies cannot be mutated.
            // This is expected when reading sessions in non-middleware contexts.
          }
        },
      },
    },
  )
}
