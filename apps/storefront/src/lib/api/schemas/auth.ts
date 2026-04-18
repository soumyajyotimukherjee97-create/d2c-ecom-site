import { z } from 'zod'

export const LoginSchema = z.object({
  email:    z.string().trim().toLowerCase().email('A valid email address is required'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof LoginSchema>

export const SignupSchema = z.object({
  first_name: z.string().trim().min(1, 'First name is required'),
  last_name:  z.string().trim().min(1, 'Last name is required'),
  email:      z.string().trim().toLowerCase().email('A valid email address is required'),
  password:   z
    .string()
    .min(8,  'Password must be at least 8 characters')
    .max(72, 'Password must be 72 characters or fewer'),
  // Checkbox must be checked — rendered as the Terms + Privacy opt-in in the signup form.
  terms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the terms and privacy policy' }),
  }),
})

export type SignupInput = z.infer<typeof SignupSchema>
