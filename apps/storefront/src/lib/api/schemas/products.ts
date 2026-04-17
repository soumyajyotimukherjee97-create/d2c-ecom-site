import { z } from 'zod'
import { CategoryEnum, SkinTypeEnum, ConcernEnum } from '@d2c/schemas'

export { CategoryEnum, SkinTypeEnum, ConcernEnum }
export const SortEnum = z.enum(['created_at_desc', 'price_asc', 'price_desc', 'name_asc'])

// ─── GET /api/products — query params ─────────────────────────────────────────

export const ListProductsSchema = z.object({
  category:  CategoryEnum.optional(),
  skin_type: SkinTypeEnum.optional(),
  concern:   ConcernEnum.optional(),
  // z.coerce.boolean() converts any non-empty string (including 'false') to true.
  // Use a string transform so ?is_active=false correctly becomes false.
  is_active: z
    .string()
    .optional()
    .default('true')
    .transform((v) => v !== 'false' && v !== '0'),
  limit:     z.coerce.number().int().min(1).max(100).optional().default(20),
  offset:    z.coerce.number().int().min(0).optional().default(0),
  sort:      SortEnum.optional().default('created_at_desc'),
})

export type ListProductsInput = z.infer<typeof ListProductsSchema>

// ─── POST /api/products — request body ────────────────────────────────────────

export const VariantInputSchema = z.object({
  size_ml: z.number().int().positive(),
  price:   z.number().int().positive(),
  sku:     z.string().min(1).max(100),
  stock:   z.number().int().min(0).default(0),
})

export const IngredientInputSchema = z.object({
  name:          z.string().min(1),
  concentration: z.number().positive().nullable().optional(),
  benefit:       z.string().nullable().optional(),
  science_note:  z.string().nullable().optional(),
  display_order: z.number().int().min(0).default(0),
})

const SlugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const CreateProductSchema = z.object({
  name:        z.string().min(1),
  slug:        z.string().min(1).max(100).regex(SlugRegex, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().nullable().optional(),
  category:    CategoryEnum,
  skin_types:  z.array(SkinTypeEnum).min(1),
  concerns:    z.array(ConcernEnum).optional().default([]),
  image_url:   z.string().url().nullable().optional(),
  variants:    z.array(VariantInputSchema).min(1),
  ingredients: z.array(IngredientInputSchema).optional().default([]),
})

export type CreateProductInput = z.infer<typeof CreateProductSchema>

// ─── PATCH /api/products/[id] — request body ──────────────────────────────────

export const UpdateProductSchema = z
  .object({
    name:        z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    category:    CategoryEnum.optional(),
    skin_types:  z.array(SkinTypeEnum).min(1).optional(),
    concerns:    z.array(ConcernEnum).optional(),
    image_url:   z.string().url().nullable().optional(),
    is_active:   z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update.',
  })

export type UpdateProductInput = z.infer<typeof UpdateProductSchema>

// ─── PATCH /api/products/[id]/variants/[variantId] — request body ─────────────

export const UpdateVariantSchema = z
  .object({
    price:     z.number().int().positive().optional(),
    stock:     z.number().int().min(0).optional(),
    is_active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update.',
  })

export type UpdateVariantInput = z.infer<typeof UpdateVariantSchema>
