import { describe, it, expect } from 'vitest'
import { LoginSchema, SignupSchema } from '@/lib/api/schemas/auth'

describe('LoginSchema', () => {
  it('accepts a valid email and password', () => {
    const result = LoginSchema.safeParse({ email: 'buyer@example.com', password: 'pw' })
    expect(result.success).toBe(true)
  })

  it('lowercases and trims the email', () => {
    const result = LoginSchema.parse({ email: '  BUYER@Example.COM  ', password: 'pw' })
    expect(result.email).toBe('buyer@example.com')
  })

  it('rejects an invalid email', () => {
    const result = LoginSchema.safeParse({ email: 'not-an-email', password: 'pw' })
    expect(result.success).toBe(false)
  })

  it('rejects an empty password', () => {
    const result = LoginSchema.safeParse({ email: 'buyer@example.com', password: '' })
    expect(result.success).toBe(false)
  })
})

describe('SignupSchema', () => {
  const valid = {
    email: 'buyer@example.com',
    password: 'correcthorse',
    confirm_password: 'correcthorse',
  }

  it('accepts a matching password pair', () => {
    expect(SignupSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects a password shorter than 8 characters', () => {
    const result = SignupSchema.safeParse({ ...valid, password: 'short', confirm_password: 'short' })
    expect(result.success).toBe(false)
  })

  it('rejects a password longer than 72 characters', () => {
    const long = 'a'.repeat(73)
    const result = SignupSchema.safeParse({ ...valid, password: long, confirm_password: long })
    expect(result.success).toBe(false)
  })

  it('rejects when passwords do not match', () => {
    const result = SignupSchema.safeParse({ ...valid, confirm_password: 'different1' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['confirm_password'])
    }
  })

  it('rejects an invalid email', () => {
    const result = SignupSchema.safeParse({ ...valid, email: 'nope' })
    expect(result.success).toBe(false)
  })
})
