import { z } from 'zod'

// ─── Shared enums (must stay in sync with apps/storefront) ───────────────────
// TODO(packages/schemas): extract once a second internal domain needs these.

export const CategoryEnum = z.enum(['serum', 'moisturiser', 'toner', 'spf'])
export const SkinTypeEnum = z.enum(['dry', 'oily', 'combination', 'sensitive', 'all'])
export const ConcernEnum  = z.enum(['acne', 'dullness', 'aging', 'pores', 'redness'])

const SlugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// ─── Variant input ───────────────────────────────────────────────────────────

export const VariantInputSchema = z.object({
  size_ml: z.number().int().positive(),
  price:   z.number().int().positive(),
  sku:     z.string().trim().min(1).max(100),
  stock:   z.number().int().min(0).default(0),
})
export type VariantInput = z.infer<typeof VariantInputSchema>

// ─── Create product ──────────────────────────────────────────────────────────

export const CreateProductSchema = z.object({
  name:        z.string().trim().min(1),
  slug:        z.string().trim().min(1).max(100).regex(SlugRegex, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().nullable().optional(),
  category:    CategoryEnum,
  skin_types:  z.array(SkinTypeEnum).min(1, 'Select at least one skin type'),
  concerns:    z.array(ConcernEnum).optional().default([]),
  image_url:   z.string().url().nullable().optional(),
  variants:    z.array(VariantInputSchema).min(1, 'Add at least one variant'),
})
export type CreateProductInput = z.infer<typeof CreateProductSchema>

// ─── Update product ──────────────────────────────────────────────────────────

export const UpdateProductSchema = z
  .object({
    name:        z.string().trim().min(1).optional(),
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

// ─── Update variant ──────────────────────────────────────────────────────────

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

// ─── Product list query ──────────────────────────────────────────────────────

export const ListProductsQuerySchema = z.object({
  q:          z.string().trim().optional(),
  category:   CategoryEnum.optional(),
  // 'all' shows both active and inactive; defaults to 'all' for the admin list
  visibility: z.enum(['active', 'inactive', 'all']).optional().default('all'),
  page:       z.coerce.number().int().min(1).optional().default(1),
})
export type ListProductsQuery = z.infer<typeof ListProductsQuerySchema>

export const PAGE_SIZE = 25
