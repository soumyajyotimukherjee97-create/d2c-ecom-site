import { Resend } from 'resend'

export interface EmailPayload {
  to:      string
  subject: string
  html:    string
}

export type EmailResult =
  | { ok: true;  id:    string | null }
  | { ok: false; error: string }

let cached: Resend | null = null
function client(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  if (!cached) cached = new Resend(key)
  return cached
}

function from(): string {
  return process.env.EMAIL_FROM ?? 'D2C <onboarding@resend.dev>'
}

/**
 * Fire-and-forget email sender. Safe to call without awaiting — errors are
 * caught and logged so they can never crash the caller.
 *
 * When `RESEND_API_KEY` is not set (local dev), logs a dev-safe preview to
 * stdout and returns `{ ok: true, id: null }`. This keeps dev flows unblocked.
 */
export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  const c = client()

  if (!c) {
    console.info('[email:dev]', {
      to:      payload.to,
      subject: payload.subject,
      bytes:   payload.html.length,
    })
    return { ok: true, id: null }
  }

  try {
    const res = await c.emails.send({
      from:    from(),
      to:      payload.to,
      subject: payload.subject,
      html:    payload.html,
    })
    if (res.error) {
      console.error('[email] Resend error', res.error)
      return { ok: false, error: res.error.message ?? 'Resend error' }
    }
    return { ok: true, id: res.data?.id ?? null }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[email] send failed', msg)
    return { ok: false, error: msg }
  }
}
