import { z } from 'zod'
import { TicketStatusEnum, TicketPriorityEnum } from '@d2c/schemas'

export { TicketStatusEnum, TicketPriorityEnum }
export type { TicketStatus, TicketPriority } from '@d2c/schemas'

export const UpdateTicketSchema = z
  .object({
    status:      TicketStatusEnum.optional(),
    priority:    TicketPriorityEnum.optional(),
    assigned_to: z.string().uuid().nullable().optional(),
    notes:       z.string().max(5000, 'Notes must be 5000 characters or fewer').nullable().optional(),
  })
  .refine(
    (d) =>
      d.status      !== undefined ||
      d.priority    !== undefined ||
      d.assigned_to !== undefined ||
      d.notes       !== undefined,
    { message: 'At least one field is required' },
  )
export type UpdateTicketInput = z.infer<typeof UpdateTicketSchema>

export const ListTicketsQuerySchema = z.object({
  q:        z.string().trim().optional(),
  status:   TicketStatusEnum.optional(),
  priority: TicketPriorityEnum.optional(),
  page:     z.coerce.number().int().min(1).optional().default(1),
})
export type ListTicketsQuery = z.infer<typeof ListTicketsQuerySchema>

export const PAGE_SIZE = 25
