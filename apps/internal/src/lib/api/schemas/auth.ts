import { z } from 'zod'

export const LoginSchema = z.object({
  email:    z.string().trim().toLowerCase().email('A valid email address is required'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof LoginSchema>
