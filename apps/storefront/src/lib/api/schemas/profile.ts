import { z } from 'zod'

const SKIN_TYPES = ['dry', 'oily', 'combination', 'sensitive'] as const
const CONCERNS   = ['acne', 'dullness', 'aging', 'pores', 'redness'] as const

export const UpdateProfileSchema = z.object({
  skin_type: z.enum(SKIN_TYPES).nullable(),
  concerns: z
    .array(z.enum(CONCERNS))
    .max(5)
    .transform((arr) => Array.from(new Set(arr))),
})

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>

export const SKIN_TYPE_OPTIONS = SKIN_TYPES
export const CONCERN_OPTIONS = CONCERNS
