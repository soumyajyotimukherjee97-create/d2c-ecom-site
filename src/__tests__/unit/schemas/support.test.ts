import { describe, it, expect } from 'vitest'
import {
  CreateTicketSchema,
  ListTicketsSchema,
  UpdateTicketSchema,
} from '@/lib/api/schemas/support'

const validUuid = 'a0000000-0000-0000-0000-000000000001'

describe('CreateTicketSchema', () => {
  it('accepts a minimal guest submission', () => {
    const result = CreateTicketSchema.safeParse({
      guest_email: 'buyer@example.com',
      subject: 'Order missing',
      body: 'My order never arrived.',
    })
    expect(result.success).toBe(true)
  })

  it('accepts an authenticated submission with only subject + body', () => {
    const result = CreateTicketSchema.safeParse({
      subject: 'Question',
      body: 'Is this suitable for sensitive skin?',
    })
    expect(result.success).toBe(true)
  })

  it('accepts an optional order_id', () => {
    const result = CreateTicketSchema.safeParse({
      order_id: validUuid,
      subject: 'Damaged item',
      body: 'The bottle arrived cracked.',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a non-UUID order_id', () => {
    const result = CreateTicketSchema.safeParse({
      order_id: 'not-a-uuid',
      subject: 'x',
      body: 'y',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a bad guest_email', () => {
    const result = CreateTicketSchema.safeParse({
      guest_email: 'not-an-email',
      subject: 'x',
      body: 'y',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty subject', () => {
    const result = CreateTicketSchema.safeParse({
      subject: '   ',
      body: 'something',
    })
    expect(result.success).toBe(false)
  })

  it('rejects subject > 200 chars', () => {
    const result = CreateTicketSchema.safeParse({
      subject: 'x'.repeat(201),
      body: 'y',
    })
    expect(result.success).toBe(false)
  })

  it('rejects body > 5000 chars', () => {
    const result = CreateTicketSchema.safeParse({
      subject: 'x',
      body: 'y'.repeat(5001),
    })
    expect(result.success).toBe(false)
  })

  it('trims subject and body', () => {
    const parsed = CreateTicketSchema.parse({
      subject: '  hello  ',
      body: '  world  ',
    })
    expect(parsed.subject).toBe('hello')
    expect(parsed.body).toBe('world')
  })
})

describe('ListTicketsSchema', () => {
  it('applies default limit/offset', () => {
    const parsed = ListTicketsSchema.parse({})
    expect(parsed.limit).toBe(50)
    expect(parsed.offset).toBe(0)
  })

  it('coerces string query params to numbers', () => {
    const parsed = ListTicketsSchema.parse({ limit: '25', offset: '10' })
    expect(parsed.limit).toBe(25)
    expect(parsed.offset).toBe(10)
  })

  it('rejects an unknown status', () => {
    const result = ListTicketsSchema.safeParse({ status: 'archived' })
    expect(result.success).toBe(false)
  })

  it('rejects limit > 200', () => {
    const result = ListTicketsSchema.safeParse({ limit: 500 })
    expect(result.success).toBe(false)
  })
})

describe('UpdateTicketSchema', () => {
  it('accepts a status-only update', () => {
    expect(UpdateTicketSchema.safeParse({ status: 'resolved' }).success).toBe(true)
  })

  it('accepts assigned_to = null (unassign)', () => {
    expect(UpdateTicketSchema.safeParse({ assigned_to: null }).success).toBe(true)
  })

  it('accepts a notes-only update', () => {
    expect(UpdateTicketSchema.safeParse({ notes: 'Followed up by phone.' }).success).toBe(true)
  })

  it('accepts notes = null (clear)', () => {
    expect(UpdateTicketSchema.safeParse({ notes: null }).success).toBe(true)
  })

  it('rejects notes > 5000 chars', () => {
    const result = UpdateTicketSchema.safeParse({ notes: 'x'.repeat(5001) })
    expect(result.success).toBe(false)
  })

  it('rejects an empty payload', () => {
    expect(UpdateTicketSchema.safeParse({}).success).toBe(false)
  })

  it('rejects an unknown priority', () => {
    expect(UpdateTicketSchema.safeParse({ priority: 'blocker' }).success).toBe(false)
  })
})
