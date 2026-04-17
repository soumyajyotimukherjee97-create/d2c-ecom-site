// ─── Product ─────────────────────────────────────────────────────────────────

export type { ProductCategory, SkinType, Concern } from '@d2c/schemas'
import type { ProductCategory, SkinType, Concern } from '@d2c/schemas'

/** Lightweight shape returned by GET /api/products (list view) */
export type ProductSummary = {
  id: string
  name: string
  slug: string
  category: ProductCategory
  skin_types: SkinType[]
  concerns: Concern[]
  /** Lowest variant price in paise */
  starting_price: number
  image_url: string | null
  is_active: boolean
}

/** Full shape returned by GET /api/products/[slug] */
export type Product = ProductSummary & {
  description: string | null
  variants: Variant[]
  ingredients: Ingredient[]
  reviews_summary: ReviewsSummary
  reviews: Review[]
}

export type Variant = {
  id: string
  size_ml: number
  /** Price in paise. ₹1 = 100 paise. */
  price: number
  sku: string
  stock: number
  is_active: boolean
}

export type Ingredient = {
  id: string
  name: string
  /** Percentage e.g. 2.00 */
  concentration: number | null
  benefit: string | null
  science_note: string | null
  display_order: number
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export type Review = {
  id: string
  rating: number
  title: string | null
  body: string | null
  created_at: string
  user_initials: string
}

export type ReviewsSummary = {
  average: number
  count: number
  distribution: {
    '1': number
    '2': number
    '3': number
    '4': number
    '5': number
  }
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export type { OrderStatus } from '@d2c/schemas'
import type { OrderStatus } from '@d2c/schemas'

export type ShippingAddress = {
  line1: string
  line2: string | null
  city: string
  state: string
  pin: string
  country: 'IN'
}

export type OrderItem = {
  id: string
  variant_id: string
  /** Snapshotted at order creation time */
  product_name: string
  /** Snapshotted at order creation time */
  variant_sku: string
  quantity: number
  /** Snapshotted in paise at order creation time */
  unit_price: number
  line_total: number
}

export type Order = {
  id: string
  order_number: string
  user_id: string | null
  status: OrderStatus
  /** Paise */
  subtotal: number
  /** Paise */
  shipping_total: number
  /** Paise */
  total: number
  shipping_address: ShippingAddress
  contact_email: string
  contact_phone: string | null
  tracking_id: string | null
  carrier: string | null
  notes: string | null
  items: OrderItem[]
  created_at: string
  updated_at: string
}

/** Lightweight shape used in order list views */
export type OrderSummary = {
  id: string
  order_number: string
  status: OrderStatus
  subtotal: number
  shipping_total: number
  total: number
  contact_email: string
  created_at: string
  updated_at: string
}

// ─── Support tickets ─────────────────────────────────────────────────────────

export type { TicketStatus, TicketPriority } from '@d2c/schemas'
import type { TicketStatus, TicketPriority } from '@d2c/schemas'

export type SupportTicket = {
  id: string
  order_id: string | null
  user_id: string | null
  guest_email: string | null
  subject: string
  body: string
  status: TicketStatus
  priority: TicketPriority
  assigned_to: string | null
  notes: string | null
  resolved_at: string | null
  created_at: string
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export type CartItem = {
  variantId: string
  sku: string
  productName: string
  size_ml: number
  /** Price in paise */
  price: number
  quantity: number
  imageUrl: string | null
}

// ─── API helpers ─────────────────────────────────────────────────────────────

export type ApiError = {
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  limit: number
  offset: number
}
