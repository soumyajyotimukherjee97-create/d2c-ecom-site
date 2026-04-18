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
    first_name: 'Aarti',
    last_name:  'Kapoor',
    email:      'buyer@example.com',
    password:   'correcthorse',
    terms:      true as const,
  }

  it('accepts a valid payload', () => {
    expect(SignupSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects a password shorter than 8 characters', () => {
    const result = SignupSchema.safeParse({ ...valid, password: 'short' })
    expect(result.success).toBe(false)
  })

  it('rejects a password longer than 72 characters', () => {
    const long = 'a'.repeat(73)
    const result = SignupSchema.safeParse({ ...valid, password: long })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid email', () => {
    const result = SignupSchema.safeParse({ ...valid, email: 'nope' })
    expect(result.success).toBe(false)
  })

  it('requires a first name', () => {
    const result = SignupSchema.safeParse({ ...valid, first_name: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['first_name'])
    }
  })

  it('requires a last name', () => {
    const result = SignupSchema.safeParse({ ...valid, last_name: '   ' })
    expect(result.success).toBe(false)
  })

  it('rejects when terms is unchecked', () => {
    const result = SignupSchema.safeParse({ ...valid, terms: false })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['terms'])
    }
  })

  it('trims and lowercases the email', () => {
    const parsed = SignupSchema.parse({ ...valid, email: '  AARTI@Example.COM  ' })
    expect(parsed.email).toBe('aarti@example.com')
  })

  it('trims name fields', () => {
    const parsed = SignupSchema.parse({ ...valid, first_name: '  Aarti ', last_name: 'Kapoor ' })
    expect(parsed.first_name).toBe('Aarti')
    expect(parsed.last_name).toBe('Kapoor')
  })
})
