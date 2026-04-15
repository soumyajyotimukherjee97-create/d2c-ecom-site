import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('sendEmail — no RESEND_API_KEY (dev mode)', () => {
  const originalKey = process.env.RESEND_API_KEY
  const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

  beforeEach(() => {
    delete process.env.RESEND_API_KEY
    vi.resetModules()
    infoSpy.mockClear()
  })

  afterEach(() => {
    if (originalKey !== undefined) process.env.RESEND_API_KEY = originalKey
  })

  it('no-ops and returns ok: true when the API key is not set', async () => {
    const { sendEmail } = await import('../send')
    const result = await sendEmail({
      to:      'user@example.com',
      subject: 'Hello',
      html:    '<p>Body</p>',
    })
    expect(result).toEqual({ ok: true, id: null })
    expect(infoSpy).toHaveBeenCalledWith(
      '[email:dev]',
      expect.objectContaining({ to: 'user@example.com', subject: 'Hello' }),
    )
  })
})
