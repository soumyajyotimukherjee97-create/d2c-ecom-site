import type { NextRequest } from 'next/server'

/**
 * Checks that the request carries the SUPABASE_SERVICE_ROLE_KEY as a Bearer token.
 * Internal-platform-only routes call this before any DB mutation.
 *
 * ⚠️  The service role key must never be logged or returned in responses.
 */
export function isServiceRole(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return false
  const token = authHeader.slice(7)
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return false
  return token === serviceKey
}
