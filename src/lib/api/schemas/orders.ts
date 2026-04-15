import { z } from 'zod'

// ─── Shared ───────────────────────────────────────────────────────────────────

export const OrderStatusEnum = z.enum([
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
])

export type OrderStatus = z.infer<typeof OrderStatusEnum>

// ─── Shipping address ─────────────────────────────────────────────────────────

export const AddressSchema = z.object({
  line1:   z.string().min(1, 'Address line 1 is required'),
  line2:   z.string().nullable().optional(),
  city:    z.string().min(1, 'City is required'),
  state:   z.string().min(1, 'State is required'),
  pin:     z.string().regex(/^\d{6}$/, 'PIN must be exactly 6 digits'),
  country: z.literal('IN'),
})

export type AddressInput = z.infer<typeof AddressSchema>

// ─── POST /api/orders — request body ──────────────────────────────────────────

export const OrderItemInputSchema = z.object({
  variant_id: z.string().uuid('variant_id must be a valid UUID'),
  quantity:   z.number().int().min(1, 'Quantity must be at least 1'),
})

export type OrderItemInput = z.infer<typeof OrderItemInputSchema>

export const CreateOrderSchema = z.object({
  items:            z.array(OrderItemInputSchema).min(1, 'At least one item is required'),
  shipping_address: AddressSchema,
  contact_email:    z.string().email('A valid email address is required'),
  contact_phone:    z.string().nullable().optional(),
})

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>

// ─── PATCH /api/orders/[id]/status — request body ────────────────────────────

export const UpdateOrderStatusSchema = z
  .object({
    status:      OrderStatusEnum,
    tracking_id: z.string().min(1).optional(),
    carrier:     z.string().min(1).optional(),
    notes:       z.string().optional(),
  })
  .refine(
    (d) => d.status !== 'shipped' || (!!d.tracking_id && !!d.carrier),
    {
      message: 'tracking_id and carrier are required when status is "shipped"',
      path:    ['tracking_id'],
    },
  )

export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>

// ─── GET /api/orders — query params (internal platform) ──────────────────────

export const ListOrdersSchema = z.object({
  status:    OrderStatusEnum.optional(),
  limit:     z.coerce.number().int().min(1).max(200).optional().default(50),
  offset:    z.coerce.number().int().min(0).optional().default(0),
  search:    z.string().optional(),
  date_from: z.string().optional(),
  date_to:   z.string().optional(),
})

export type ListOrdersInput = z.infer<typeof ListOrdersSchema>
