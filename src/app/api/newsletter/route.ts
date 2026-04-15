import { NextRequest, NextResponse } from 'next/server'
import { Errors } from '@/lib/api/errors'
import { NewsletterSchema } from '@/lib/api/schemas/newsletter'

// ─── POST /api/newsletter ─────────────────────────────────────────────────────
// Public. Validates email and subscribes to newsletter.
// Resend audience integration is added in Task 7.1.

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Errors.validation({ _: ['Invalid JSON body.'] })
  }

  const parsed = NewsletterSchema.safeParse(body)
  if (!parsed.success) {
    return Errors.validation(parsed.error.flatten().fieldErrors)
  }

  // Task 7.1: add to Resend audience here using parsed.data.email
  return NextResponse.json({ success: true })
}
