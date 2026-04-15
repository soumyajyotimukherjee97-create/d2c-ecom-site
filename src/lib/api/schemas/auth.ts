import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('A valid email address is required'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof LoginSchema>

export const SignupSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('A valid email address is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be 72 characters or fewer'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((v) => v.password === v.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

export type SignupInput = z.infer<typeof SignupSchema>
