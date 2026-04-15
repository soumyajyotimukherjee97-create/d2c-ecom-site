import { describe, it, expect } from 'vitest'
import { isStaff } from '@/lib/supabase/middleware'
import type { User } from '@supabase/supabase-js'

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id:          '00000000-0000-0000-0000-000000000001',
    aud:         'authenticated',
    role:        'authenticated',
    email:       'u@example.com',
    app_metadata: {},
    user_metadata: {},
    created_at:  '2026-01-01T00:00:00Z',
    ...overrides,
  } as User
}

describe('isStaff', () => {
  it('returns false for null', () => {
    expect(isStaff(null)).toBe(false)
  })

  it('returns false when no role claim is present', () => {
    expect(isStaff(makeUser())).toBe(false)
  })

  it('returns true when app_metadata.role is "staff"', () => {
    expect(isStaff(makeUser({ app_metadata: { role: 'staff' } }))).toBe(true)
  })

  it('returns true when user_metadata.role is "staff"', () => {
    expect(isStaff(makeUser({ user_metadata: { role: 'staff' } }))).toBe(true)
  })

  it('returns false for other roles', () => {
    expect(isStaff(makeUser({ app_metadata: { role: 'customer' } }))).toBe(false)
  })
})
