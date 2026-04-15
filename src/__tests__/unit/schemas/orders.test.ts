import { describe, it, expect } from 'vitest'
import {
  CreateOrderSchema,
  AddressSchema,
  OrderItemInputSchema,
  UpdateOrderStatusSchema,
  ListOrdersSchema,
} from '@/lib/api/schemas/orders'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const validAddress = {
  line1:   '12 MG Road',
  line2:   null,
  city:    'Bengaluru',
  state:   'Karnataka',
  pin:     '560001',
  country: 'IN' as const,
}

const validItem = {
  variant_id: '00000000-0000-0000-0000-000000000001',
  quantity:   2,
}

const validOrder = {
  items:            [validItem],
  shipping_address: validAddress,
  contact_email:    'buyer@example.com',
  contact_phone:    '+919876543210',
}

// ─── AddressSchema ────────────────────────────────────────────────────────────

describe('AddressSchema', () => {
  it('accepts a valid Indian address', () => {
    expect(AddressSchema.safeParse(validAddress).success).toBe(true)
  })

  it('rejects a non-IN country', () => {
    expect(AddressSchema.safeParse({ ...validAddress, country: 'US' }).success).toBe(false)
  })

  it('rejects a PIN with fewer than 6 digits', () => {
    expect(AddressSchema.safeParse({ ...validAddress, pin: '56000' }).success).toBe(false)
  })

  it('rejects a PIN with more than 6 digits', () => {
    expect(AddressSchema.safeParse({ ...validAddress, pin: '5600011' }).success).toBe(false)
  })

  it('rejects a PIN with non-digit characters', () => {
    expect(AddressSchema.safeParse({ ...validAddress, pin: 'ABC001' }).success).toBe(false)
  })

  it('rejects an empty city', () => {
    expect(AddressSchema.safeParse({ ...validAddress, city: '' }).success).toBe(false)
  })

  it('allows line2 to be omitted', () => {
    const { line2: _, ...noLine2 } = validAddress
    expect(AddressSchema.safeParse(noLine2).success).toBe(true)
  })
})

// ─── OrderItemInputSchema ─────────────────────────────────────────────────────

describe('OrderItemInputSchema', () => {
  it('accepts valid item', () => {
    expect(OrderItemInputSchema.safeParse(validItem).success).toBe(true)
  })

  it('rejects non-UUID variant_id', () => {
    expect(OrderItemInputSchema.safeParse({ ...validItem, variant_id: 'not-a-uuid' }).success).toBe(false)
  })

  it('rejects quantity of 0', () => {
    expect(OrderItemInputSchema.safeParse({ ...validItem, quantity: 0 }).success).toBe(false)
  })

  it('rejects negative quantity', () => {
    expect(OrderItemInputSchema.safeParse({ ...validItem, quantity: -1 }).success).toBe(false)
  })

  it('rejects fractional quantity', () => {
    expect(OrderItemInputSchema.safeParse({ ...validItem, quantity: 1.5 }).success).toBe(false)
  })
})

// ─── CreateOrderSchema ────────────────────────────────────────────────────────

describe('CreateOrderSchema', () => {
  it('accepts a valid order body', () => {
    expect(CreateOrderSchema.safeParse(validOrder).success).toBe(true)
  })

  it('rejects empty items array', () => {
    expect(CreateOrderSchema.safeParse({ ...validOrder, items: [] }).success).toBe(false)
  })

  it('rejects missing items field', () => {
    const { items: _, ...noItems } = validOrder
    expect(CreateOrderSchema.safeParse(noItems).success).toBe(false)
  })

  it('rejects missing shipping_address', () => {
    const { shipping_address: _, ...noAddr } = validOrder
    expect(CreateOrderSchema.safeParse(noAddr).success).toBe(false)
  })

  it('rejects invalid contact_email', () => {
    expect(CreateOrderSchema.safeParse({ ...validOrder, contact_email: 'not-an-email' }).success).toBe(false)
  })

  it('rejects missing contact_email', () => {
    const { contact_email: _, ...noEmail } = validOrder
    expect(CreateOrderSchema.safeParse(noEmail).success).toBe(false)
  })

  it('allows contact_phone to be omitted', () => {
    const { contact_phone: _, ...noPhone } = validOrder
    expect(CreateOrderSchema.safeParse(noPhone).success).toBe(true)
  })

  it('allows multiple items', () => {
    const twoItems = {
      ...validOrder,
      items: [validItem, { ...validItem, variant_id: '00000000-0000-0000-0000-000000000002' }],
    }
    expect(CreateOrderSchema.safeParse(twoItems).success).toBe(true)
  })
})

// ─── UpdateOrderStatusSchema ──────────────────────────────────────────────────

describe('UpdateOrderStatusSchema', () => {
  it('accepts a simple status update', () => {
    expect(UpdateOrderStatusSchema.safeParse({ status: 'processing' }).success).toBe(true)
  })

  it('accepts shipped with tracking_id and carrier', () => {
    expect(
      UpdateOrderStatusSchema.safeParse({
        status:      'shipped',
        tracking_id: 'TRACK123',
        carrier:     'BlueDart',
      }).success,
    ).toBe(true)
  })

  it('rejects shipped without tracking_id', () => {
    expect(
      UpdateOrderStatusSchema.safeParse({ status: 'shipped', carrier: 'BlueDart' }).success,
    ).toBe(false)
  })

  it('rejects shipped without carrier', () => {
    expect(
      UpdateOrderStatusSchema.safeParse({ status: 'shipped', tracking_id: 'TRACK123' }).success,
    ).toBe(false)
  })

  it('rejects an invalid status value', () => {
    expect(UpdateOrderStatusSchema.safeParse({ status: 'refunded' }).success).toBe(false)
  })

  it('rejects missing status field', () => {
    expect(UpdateOrderStatusSchema.safeParse({ tracking_id: 'TRACK123' }).success).toBe(false)
  })

  it('accepts optional notes on any status', () => {
    expect(
      UpdateOrderStatusSchema.safeParse({ status: 'cancelled', notes: 'Customer requested.' }).success,
    ).toBe(true)
  })
})

// ─── ListOrdersSchema ─────────────────────────────────────────────────────────

describe('ListOrdersSchema', () => {
  it('applies defaults for empty params', () => {
    const result = ListOrdersSchema.parse({})
    expect(result.limit).toBe(50)
    expect(result.offset).toBe(0)
  })

  it('coerces string limit to number', () => {
    expect(ListOrdersSchema.parse({ limit: '10' }).limit).toBe(10)
  })

  it('rejects limit above 200', () => {
    expect(ListOrdersSchema.safeParse({ limit: '201' }).success).toBe(false)
  })

  it('accepts a valid status filter', () => {
    expect(ListOrdersSchema.parse({ status: 'confirmed' }).status).toBe('confirmed')
  })

  it('rejects an invalid status filter', () => {
    expect(ListOrdersSchema.safeParse({ status: 'pending' }).success).toBe(false)
  })
})
