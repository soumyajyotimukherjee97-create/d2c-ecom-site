import { describe, it, expect } from 'vitest'
import {
  UpdateOrderStatusSchema,
  ListOrdersQuerySchema,
  VALID_TRANSITIONS,
  OrderStatusEnum,
} from '@/lib/api/schemas/orders'

// ─── UpdateOrderStatusSchema ─────────────────────────────────────────────────

describe('UpdateOrderStatusSchema', () => {
  it('accepts a minimal status update', () => {
    expect(UpdateOrderStatusSchema.safeParse({ status: 'processing' }).success).toBe(true)
  })

  it('accepts shipped with tracking + carrier', () => {
    expect(
      UpdateOrderStatusSchema.safeParse({
        status:      'shipped',
        tracking_id: '1Z999',
        carrier:     'Bluedart',
      }).success,
    ).toBe(true)
  })

  it('rejects shipped without tracking + carrier', () => {
    expect(UpdateOrderStatusSchema.safeParse({ status: 'shipped' }).success).toBe(false)
    expect(
      UpdateOrderStatusSchema.safeParse({ status: 'shipped', tracking_id: 'x' }).success,
    ).toBe(false)
    expect(
      UpdateOrderStatusSchema.safeParse({ status: 'shipped', carrier: 'x' }).success,
    ).toBe(false)
  })

  it('rejects unknown status values', () => {
    expect(UpdateOrderStatusSchema.safeParse({ status: 'refunded' }).success).toBe(false)
  })

  it('trims tracking_id + carrier', () => {
    const parsed = UpdateOrderStatusSchema.parse({
      status: 'shipped',
      tracking_id: '  1Z999  ',
      carrier:     '  Bluedart  ',
    })
    expect(parsed.tracking_id).toBe('1Z999')
    expect(parsed.carrier).toBe('Bluedart')
  })
})

// ─── VALID_TRANSITIONS machine ───────────────────────────────────────────────

describe('VALID_TRANSITIONS', () => {
  it('has an entry for every status', () => {
    for (const s of OrderStatusEnum.options) {
      expect(VALID_TRANSITIONS).toHaveProperty(s)
    }
  })

  it('delivered and cancelled are terminal', () => {
    expect(VALID_TRANSITIONS.delivered).toEqual([])
    expect(VALID_TRANSITIONS.cancelled).toEqual([])
  })

  it('shipped can only move to delivered', () => {
    expect(VALID_TRANSITIONS.shipped).toEqual(['delivered'])
  })

  it('confirmed can move to processing or cancelled', () => {
    expect(VALID_TRANSITIONS.confirmed.sort()).toEqual(['cancelled', 'processing'])
  })
})

// ─── ListOrdersQuerySchema ───────────────────────────────────────────────────

describe('ListOrdersQuerySchema', () => {
  it('applies default page=1', () => {
    expect(ListOrdersQuerySchema.parse({}).page).toBe(1)
  })

  it('coerces page from string', () => {
    expect(ListOrdersQuerySchema.parse({ page: '5' }).page).toBe(5)
  })

  it('rejects an unknown status', () => {
    expect(ListOrdersQuerySchema.safeParse({ status: 'refunded' }).success).toBe(false)
  })

  it('accepts status + q together', () => {
    const parsed = ListOrdersQuerySchema.parse({ status: 'processing', q: 'ORD-2026' })
    expect(parsed.status).toBe('processing')
    expect(parsed.q).toBe('ORD-2026')
  })
})
