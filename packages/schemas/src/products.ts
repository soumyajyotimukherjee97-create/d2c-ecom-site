import { z } from 'zod'

export const CategoryEnum = z.enum(['serum', 'moisturiser', 'toner', 'spf'])
export const SkinTypeEnum = z.enum(['dry', 'oily', 'combination', 'sensitive', 'all'])
export const ConcernEnum = z.enum(['acne', 'dullness', 'aging', 'pores', 'redness'])

export type ProductCategory = z.infer<typeof CategoryEnum>
export type SkinType = z.infer<typeof SkinTypeEnum>
export type Concern = z.infer<typeof ConcernEnum>
