import { z } from 'zod'
import { OrderStatusEnum, type OrderStatus } from '@d2c/schemas'

export { OrderStatusEnum }
export type { OrderStatus }

export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  confirmed:  ['processing', 'cancelled'],
  processing: ['shipped',    'cancelled'],
  shipped:    ['delivered'],
  delivered:  [],
  cancelled:  [],
}

// ─── Update order status / operational fields ────────────────────────────────

export const UpdateOrderStatusSchema = z
  .object({
    status:      OrderStatusEnum,
    tracking_id: z.string().trim().min(1).optional(),
    carrier:     z.string().trim().min(1).optional(),
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

// ─── Orders queue query ──────────────────────────────────────────────────────

export const ListOrdersQuerySchema = z.object({
  q:      z.string().trim().optional(),
  status: OrderStatusEnum.optional(),
  page:   z.coerce.number().int().min(1).optional().default(1),
})
export type ListOrdersQuery = z.infer<typeof ListOrdersQuerySchema>

export const PAGE_SIZE = 25
