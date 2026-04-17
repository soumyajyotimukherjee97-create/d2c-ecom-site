import { z } from 'zod'

export const OrderStatusEnum = z.enum([
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
])

export type OrderStatus = z.infer<typeof OrderStatusEnum>
