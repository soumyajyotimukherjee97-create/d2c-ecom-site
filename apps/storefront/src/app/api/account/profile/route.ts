import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Errors } from '@/lib/api/errors'
import { UpdateProfileSchema } from '@/lib/api/schemas/profile'

// ─── PATCH /api/account/profile ──────────────────────────────────────────────
// Authenticated customer updates own skin profile. RLS enforces the identity
// check at the DB — we also derive user_id from the session server-side.

export async function PATCH(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Errors.validation({ _: ['Invalid JSON body.'] })
  }

  const parsed = UpdateProfileSchema.safeParse(body)
  if (!parsed.success) {
    return Errors.validation(parsed.error.flatten().fieldErrors)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Errors.unauthorized()
  }

  // Admin client for the UPDATE — the SSR-client Update generic degrades to `never`.
  // Security: user.id comes from the validated session above, never from the client.
  const admin = createAdminClient()
  const { error } = await admin
    .from('users')
    .update({
      skin_type: parsed.data.skin_type,
      concerns:  parsed.data.concerns,
    })
    .eq('id', user.id)

  if (error) {
    console.error('[PATCH /api/account/profile]', error.message)
    return Errors.internal()
  }

  return NextResponse.json({
    skin_type: parsed.data.skin_type,
    concerns:  parsed.data.concerns,
  })
}
