import { createClient as _createClient } from '@supabase/supabase-js'
import type { Database } from './types'

/**
 * Admin Supabase client — uses the SERVICE_ROLE_KEY which bypasses RLS entirely.
 *
 * ⚠️  INTERNAL PLATFORM API ROUTES ONLY.
 * Never import this file in any code path reachable by the browser.
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the client bundle.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Admin client can only be used in server-side internal API routes.',
    )
  }

  return _createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
