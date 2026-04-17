import { createClient as _createClient } from '@supabase/supabase-js'
import type { Database } from './types'

/**
 * Admin Supabase client — uses SERVICE_ROLE_KEY which bypasses RLS entirely.
 * Internal platform API routes only. Never import from browser-reachable code.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set.')
  }

  return _createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
