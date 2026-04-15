import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

/**
 * Browser Supabase client — for use in client components, hooks, and Zustand stores.
 * Call once per component; do not instantiate at module scope in server files.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
