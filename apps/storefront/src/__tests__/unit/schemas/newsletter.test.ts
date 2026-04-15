import { describe, it, expect } from 'vitest'
import { NewsletterSchema } from '@/lib/api/schemas/newsletter'

describe('NewsletterSchema', () => {
  it('accepts a valid email', () => {
    const result = NewsletterSchema.safeParse({ email: 'user@example.com' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.email).toBe('user@example.com')
  })

  it('accepts email with subdomain', () => {
    const result = NewsletterSchema.safeParse({ email: 'user@mail.example.co.in' })
    expect(result.success).toBe(true)
  })

  it('rejects an empty string', () => {
    const result = NewsletterSchema.safeParse({ email: '' })
    expect(result.success).toBe(false)
  })

  it('rejects a string without @', () => {
    const result = NewsletterSchema.safeParse({ email: 'notanemail' })
    expect(result.success).toBe(false)
  })

  it('rejects a string without a domain', () => {
    const result = NewsletterSchema.safeParse({ email: 'user@' })
    expect(result.success).toBe(false)
  })

  it('rejects a missing email field', () => {
    const result = NewsletterSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('provides a descriptive error message', () => {
    const result = NewsletterSchema.safeParse({ email: 'bad' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Please enter a valid email address.')
    }
  })
})
