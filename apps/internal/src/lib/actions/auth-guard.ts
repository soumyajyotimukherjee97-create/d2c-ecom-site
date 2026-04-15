import { createClient } from '@/lib/supabase/server'
import { isStaff } from '@/lib/supabase/middleware'

/**
 * Defence-in-depth guard for server actions. Middleware already blocks non-staff
 * before any page renders, but a server action is a cross-origin-callable endpoint
 * and must verify identity itself.
 */
export async function requireStaff(): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isStaff(user)) {
    throw new Error('Forbidden: staff access required.')
  }
}
