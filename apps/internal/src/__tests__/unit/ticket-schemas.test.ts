import { describe, it, expect } from 'vitest'
import {
  UpdateTicketSchema,
  ListTicketsQuerySchema,
} from '@/lib/api/schemas/support'

describe('UpdateTicketSchema', () => {
  it('accepts a status-only update', () => {
    expect(UpdateTicketSchema.safeParse({ status: 'resolved' }).success).toBe(true)
  })

  it('accepts a priority-only update', () => {
    expect(UpdateTicketSchema.safeParse({ priority: 'high' }).success).toBe(true)
  })

  it('accepts assigned_to = null (unassign)', () => {
    expect(UpdateTicketSchema.safeParse({ assigned_to: null }).success).toBe(true)
  })

  it('accepts notes = null (clear)', () => {
    expect(UpdateTicketSchema.safeParse({ notes: null }).success).toBe(true)
  })

  it('rejects an empty payload', () => {
    expect(UpdateTicketSchema.safeParse({}).success).toBe(false)
  })

  it('rejects an unknown status', () => {
    expect(UpdateTicketSchema.safeParse({ status: 'archived' }).success).toBe(false)
  })

  it('rejects an unknown priority', () => {
    expect(UpdateTicketSchema.safeParse({ priority: 'blocker' }).success).toBe(false)
  })

  it('rejects notes > 5000 chars', () => {
    expect(UpdateTicketSchema.safeParse({ notes: 'x'.repeat(5001) }).success).toBe(false)
  })

  it('rejects a non-UUID assigned_to', () => {
    expect(UpdateTicketSchema.safeParse({ assigned_to: 'abc' }).success).toBe(false)
  })
})

describe('ListTicketsQuerySchema', () => {
  it('defaults page to 1', () => {
    expect(ListTicketsQuerySchema.parse({}).page).toBe(1)
  })

  it('coerces page from string', () => {
    expect(ListTicketsQuerySchema.parse({ page: '2' }).page).toBe(2)
  })

  it('rejects unknown status', () => {
    expect(ListTicketsQuerySchema.safeParse({ status: 'archived' }).success).toBe(false)
  })

  it('rejects unknown priority', () => {
    expect(ListTicketsQuerySchema.safeParse({ priority: 'blocker' }).success).toBe(false)
  })

  it('accepts status + priority + q together', () => {
    const parsed = ListTicketsQuerySchema.parse({ status: 'open', priority: 'high', q: 'damaged' })
    expect(parsed.status).toBe('open')
    expect(parsed.priority).toBe('high')
    expect(parsed.q).toBe('damaged')
  })
})
