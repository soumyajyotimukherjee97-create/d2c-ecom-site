import { z } from 'zod'

export const NewsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
})

export type NewsletterInput = z.infer<typeof NewsletterSchema>
