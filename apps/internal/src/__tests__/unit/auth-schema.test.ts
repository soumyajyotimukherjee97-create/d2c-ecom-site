import { describe, it, expect } from 'vitest'
import { LoginSchema } from '@/lib/api/schemas/auth'

describe('LoginSchema', () => {
  it('accepts a valid email and non-empty password', () => {
    expect(
      LoginSchema.safeParse({ email: 'ops@example.com', password: 'x' }).success,
    ).toBe(true)
  })

  it('lowercases and trims email', () => {
    const parsed = LoginSchema.parse({ email: '  OPS@Example.COM ', password: 'x' })
    expect(parsed.email).toBe('ops@example.com')
  })

  it('rejects an invalid email', () => {
    expect(
      LoginSchema.safeParse({ email: 'not-an-email', password: 'x' }).success,
    ).toBe(false)
  })

  it('rejects an empty password', () => {
    expect(
      LoginSchema.safeParse({ email: 'ops@example.com', password: '' }).success,
    ).toBe(false)
  })
})
