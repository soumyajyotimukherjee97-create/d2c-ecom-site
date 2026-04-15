import { describe, it, expect } from 'vitest'
import { UpdateProfileSchema } from '@/lib/api/schemas/profile'

describe('UpdateProfileSchema', () => {
  it('accepts a valid skin_type and concerns list', () => {
    const result = UpdateProfileSchema.safeParse({
      skin_type: 'combination',
      concerns: ['dullness', 'pores'],
    })
    expect(result.success).toBe(true)
  })

  it('accepts null skin_type', () => {
    const result = UpdateProfileSchema.safeParse({ skin_type: null, concerns: [] })
    expect(result.success).toBe(true)
  })

  it('rejects an unknown skin_type', () => {
    const result = UpdateProfileSchema.safeParse({
      skin_type: 'scaly',
      concerns: [],
    })
    expect(result.success).toBe(false)
  })

  it('rejects an unknown concern', () => {
    const result = UpdateProfileSchema.safeParse({
      skin_type: null,
      concerns: ['wrinkles'],
    })
    expect(result.success).toBe(false)
  })

  it('deduplicates concerns', () => {
    const parsed = UpdateProfileSchema.parse({
      skin_type: null,
      concerns: ['acne', 'acne', 'pores'],
    })
    expect(parsed.concerns).toEqual(['acne', 'pores'])
  })

  it('rejects more than 5 concerns', () => {
    const result = UpdateProfileSchema.safeParse({
      skin_type: null,
      concerns: ['acne', 'dullness', 'aging', 'pores', 'redness', 'acne'],
    })
    expect(result.success).toBe(false)
  })
})
