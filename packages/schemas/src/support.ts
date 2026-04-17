import { z } from 'zod'

export const TicketStatusEnum = z.enum(['open', 'in_progress', 'resolved', 'closed'])
export const TicketPriorityEnum = z.enum(['low', 'normal', 'high', 'urgent'])

export type TicketStatus = z.infer<typeof TicketStatusEnum>
export type TicketPriority = z.infer<typeof TicketPriorityEnum>
