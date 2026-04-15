import { z } from 'zod'

// ─── Shared enums ─────────────────────────────────────────────────────────────

export const TicketStatusEnum = z.enum(['open', 'in_progress', 'resolved', 'closed'])
export const TicketPriorityEnum = z.enum(['low', 'normal', 'high', 'urgent'])

export type TicketStatus = z.infer<typeof TicketStatusEnum>
export type TicketPriority = z.infer<typeof TicketPriorityEnum>

// ─── POST /api/support — request body ────────────────────────────────────────
// Public — both authenticated users and guests can submit.
// `guest_email` is required if the request is not authenticated; the route
// enforces that at runtime since the schema does not know the session state.

export const CreateTicketSchema = z.object({
  order_id:    z.string().uuid('order_id must be a valid UUID').nullable().optional(),
  guest_email: z.string().email('A valid email address is required').nullable().optional(),
  subject:     z.string().trim().min(1, 'Subject is required').max(200, 'Subject must be 200 characters or fewer'),
  body:        z.string().trim().min(1, 'Message is required').max(5000, 'Message must be 5000 characters or fewer'),
})

export type CreateTicketInput = z.infer<typeof CreateTicketSchema>

// ─── GET /api/support — query params (internal only) ─────────────────────────

export const ListTicketsSchema = z.object({
  status:   TicketStatusEnum.optional(),
  priority: TicketPriorityEnum.optional(),
  limit:    z.coerce.number().int().min(1).max(200).optional().default(50),
  offset:   z.coerce.number().int().min(0).optional().default(0),
})

export type ListTicketsInput = z.infer<typeof ListTicketsSchema>

// ─── PATCH /api/support/[id] — request body (internal only) ──────────────────
// `notes` is an internal staff field (migration 005). Never surfaced publicly.

export const UpdateTicketSchema = z
  .object({
    status:      TicketStatusEnum.optional(),
    priority:    TicketPriorityEnum.optional(),
    assigned_to: z.string().uuid().nullable().optional(),
    notes:       z.string().max(5000, 'Notes must be 5000 characters or fewer').nullable().optional(),
  })
  .refine(
    (d) =>
      d.status !== undefined ||
      d.priority !== undefined ||
      d.assigned_to !== undefined ||
      d.notes !== undefined,
    { message: 'At least one field is required' },
  )

export type UpdateTicketInput = z.infer<typeof UpdateTicketSchema>
