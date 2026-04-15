# Technical Design Document
## D2C Skincare E-Commerce Platform

**Version:** 1.0 · April 2026 · **Status:** Draft

| Property | Value |
|---|---|
| Document owner | Engineering Lead |
| Intended readers | Engineers, AI coding agents, product team |
| Scope | Customer website · Inventory service · Order service · Internal platform |
| Out of scope | Payment integration · AI chatbot (Phase 2) |
| Stack | Next.js 14 · Supabase · Tailwind CSS · TypeScript |
| Target env | Vercel (frontends) · Supabase cloud (backend) |

---

## Table of contents

1. [System overview](#1-system-overview)
2. [Architecture principles](#2-architecture-principles)
3. [Database schema](#3-database-schema)
4. [Inventory service — API contracts](#4-inventory-service--api-contracts)
5. [Order service — API contracts](#5-order-service--api-contracts)
6. [Frontend implementation](#6-frontend-implementation)
7. [Error handling](#7-error-handling)
8. [Auth and security](#8-auth-and-security)
9. [Key workflows](#9-key-workflows)
10. [Email notifications](#10-email-notifications)
11. [Non-functional requirements](#11-non-functional-requirements)
12. [Instructions for AI coding agents](#12-instructions-for-ai-coding-agents)
13. [Recommended implementation sequence](#13-recommended-implementation-sequence)

---

## 1. System overview

This document is the authoritative technical reference for the D2C skincare platform. It is written to be consumed directly by AI coding agents (Claude Code) and human engineers. Every section follows a machine-readable structure: **context → decision → contract → constraints.**

The platform comprises four deployable components sharing a single Supabase instance:

- **Customer website** — Next.js 14 (App Router). Public-facing storefront, product discovery, cart, checkout, order tracking, support ticket submission.
- **Inventory service** — Next.js API routes. Manages product catalogue, variants, stock levels. Consumed by both frontends.
- **Order service** — Next.js API routes. Manages order lifecycle, fulfilment status, and support tickets. Consumed by both frontends.
- **Internal platform** — Next.js 14 (App Router). Staff-only admin UI for product management, order operations, and support resolution.

> **Note:** Phase 2 will add a Razorpay payment integration and Claude-powered product recommendation chatbot. Neither is in scope for this document.

---

## 2. Architecture principles

### 2.1 Guiding decisions

| Principle | Decision | Rationale |
|---|---|---|
| Single database | One Supabase Postgres instance | Inventory and orders are transactionally coupled. Split DBs require distributed transactions — unnecessary complexity at this stage. |
| Co-located API | Next.js API routes (no separate Node server) | Reduces infrastructure surface. Vercel handles scaling. Extract to standalone service when traffic demands it. |
| Auth everywhere | Supabase Auth with JWT + RLS policies | Row-level security enforced at DB layer — not just application layer. Customer data is isolated by `user_id` automatically. |
| TypeScript strict | `strict: true` across all projects | AI agents generate more reliable code with strict types. Catches contract violations at compile time. |
| Design system first | `DESIGN_SYSTEM.md` governs all UI output | Claude Code must read `DESIGN_SYSTEM.md` before writing any component. No inline style drift. |
| Separation of risk | Customer site and internal platform are separate deployments | Admin bug cannot take down storefront. Independent rollback, separate env vars. |

### 2.2 Folder structure — customer website

```
src/
  app/                        # App Router pages
    (shop)/                   # Public route group
      page.tsx                # Homepage
      products/               # Product listing
      products/[slug]/        # Product detail
      checkout/               # Checkout
      account/                # Protected account pages
    api/                      # API routes
      products/               # Inventory endpoints
      orders/                 # Order endpoints
      support/                # Support ticket endpoints
  components/
    ui/                       # Design system atoms
    shop/                     # Domain components
  lib/
    supabase/                 # Client, server, types
    store/                    # Zustand stores
    hooks/                    # Shared hooks
  types/                      # Shared TypeScript types
  styles/                     # globals.css
DESIGN_SYSTEM.md              # AI agent style guide
tailwind.config.ts            # Design tokens
```

### 2.3 Folder structure — internal platform

```
src/
  app/
    (auth)/login/             # Staff login
    dashboard/                # Overview metrics
    products/                 # Product management
    orders/                   # Order management
    support/                  # Ticket management
    api/                      # Internal-only API routes
```

---

## 3. Database schema

All tables live in a single Supabase Postgres database. UUID primary keys throughout. Timestamps are `timestamptz`. RLS policies enforced on every table.

### 3.1 Tables

#### `products`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK · default `gen_random_uuid()` | Unique product identifier |
| `name` | `text` | NOT NULL | Display name |
| `slug` | `text` | NOT NULL · UNIQUE | URL-safe identifier e.g. `brightening-serum` |
| `description` | `text` | | Long-form description (markdown) |
| `category` | `text` | NOT NULL | `serum \| moisturiser \| toner \| spf` |
| `skin_types` | `text[]` | | Array: `dry \| oily \| combination \| sensitive \| all` |
| `concerns` | `text[]` | | Array: `acne \| dullness \| aging \| pores \| redness` |
| `image_url` | `text` | nullable | Public URL of the product's primary image (Supabase Storage) |
| `is_active` | `boolean` | default `true` | Controls listing visibility |
| `created_at` | `timestamptz` | default `now()` | Creation timestamp |
| `updated_at` | `timestamptz` | default `now()` | Last modified timestamp |

#### `product_variants`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK | Variant identifier |
| `product_id` | `uuid` | FK → `products.id` · NOT NULL | Parent product |
| `size_ml` | `integer` | NOT NULL | Volume in ml e.g. 30, 60, 100 |
| `price` | `integer` | NOT NULL | Price in paise (₹1 = 100 paise) |
| `sku` | `text` | NOT NULL · UNIQUE | Stock-keeping unit code |
| `stock` | `integer` | NOT NULL · default `0` · CHECK ≥ 0 | Current stock count |
| `is_active` | `boolean` | default `true` | Variant availability |

#### `product_ingredients`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK | |
| `product_id` | `uuid` | FK → `products.id` | |
| `name` | `text` | NOT NULL | INCI name e.g. `Niacinamide` |
| `concentration` | `decimal` | | Percentage e.g. `2.00` |
| `benefit` | `text` | | Short benefit label |
| `science_note` | `text` | | Clinical insight shown on PDP |
| `display_order` | `integer` | default `0` | Render order on PDP |

#### `users` (Supabase Auth extension)

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK · managed by Supabase Auth | |
| `email` | `text` | UNIQUE | |
| `skin_type` | `text` | | `dry \| oily \| combination \| sensitive` |
| `concerns` | `text[]` | | User-selected concerns |
| `created_at` | `timestamptz` | | |

#### `orders`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK | |
| `order_number` | `text` | UNIQUE · NOT NULL | Human-readable e.g. `ORD-2026-0001` |
| `user_id` | `uuid` | FK → `auth.users` · nullable | Null for guest orders |
| `guest_email` | `text` | | Email for guest orders |
| `status` | `text` | NOT NULL | `confirmed \| processing \| shipped \| delivered \| cancelled` |
| `subtotal` | `integer` | NOT NULL | Paise |
| `shipping_total` | `integer` | NOT NULL · default `0` | Paise |
| `total` | `integer` | NOT NULL | Paise |
| `shipping_address` | `jsonb` | NOT NULL | JSON object (see schema below) |
| `contact_email` | `text` | NOT NULL | |
| `contact_phone` | `text` | | |
| `notes` | `text` | | Internal ops notes |
| `created_at` | `timestamptz` | default `now()` | |
| `updated_at` | `timestamptz` | default `now()` | |

**`shipping_address` JSON schema:**

```json
{
  "line1": "string",
  "line2": "string | null",
  "city": "string",
  "state": "string",
  "pin": "string",
  "country": "IN"
}
```

#### `order_items`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK | |
| `order_id` | `uuid` | FK → `orders.id` · NOT NULL | |
| `variant_id` | `uuid` | FK → `product_variants.id` | |
| `product_name` | `text` | NOT NULL | Snapshot at order time |
| `variant_sku` | `text` | NOT NULL | Snapshot at order time |
| `quantity` | `integer` | NOT NULL · CHECK > 0 | |
| `unit_price` | `integer` | NOT NULL | Paise — snapshot at order time |
| `line_total` | `integer` | NOT NULL | Paise |

#### `reviews`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK | |
| `product_id` | `uuid` | FK → `products.id` | |
| `user_id` | `uuid` | FK → `auth.users` | |
| `rating` | `integer` | NOT NULL · CHECK 1–5 | |
| `title` | `text` | | |
| `body` | `text` | | |
| `is_approved` | `boolean` | default `false` | Ops must approve before display |
| `created_at` | `timestamptz` | default `now()` | |

#### `support_tickets`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK | |
| `order_id` | `uuid` | FK → `orders.id` · nullable | |
| `user_id` | `uuid` | FK → `auth.users` · nullable | |
| `guest_email` | `text` | | For non-logged-in customers |
| `subject` | `text` | NOT NULL | |
| `body` | `text` | NOT NULL | |
| `status` | `text` | NOT NULL · default `open` | `open \| in_progress \| resolved \| closed` |
| `priority` | `text` | default `normal` | `low \| normal \| high \| urgent` |
| `assigned_to` | `uuid` | FK → `auth.users` (staff) | Internal assignee |
| `resolved_at` | `timestamptz` | | |
| `created_at` | `timestamptz` | default `now()` | |

### 3.2 RLS policies (summary)

| Table | Policy | Rule |
|---|---|---|
| `products` | SELECT | Public — anyone can read active products |
| `products` | INSERT/UPDATE | `service_role` only (internal platform calls with service key) |
| `product_variants` | SELECT | Public — anyone can read active variants |
| `orders` | SELECT | `auth.uid() = user_id` OR guest_email match via session token |
| `orders` | INSERT | Authenticated users and anonymous (guest) — validated server-side |
| `orders` | UPDATE | `service_role` only |
| `order_items` | SELECT | Via orders RLS |
| `reviews` | SELECT | `is_approved = true` OR `auth.uid() = user_id` (own unapproved) |
| `reviews` | INSERT | Authenticated users only |
| `support_tickets` | SELECT | `auth.uid() = user_id` — customers see own tickets only |
| `support_tickets` | INSERT | Authenticated + anonymous (guest) with email |
| `support_tickets` | UPDATE | `service_role` only (staff resolution) |

### 3.3 Critical indexes

```sql
CREATE INDEX idx_products_slug         ON products(slug);
CREATE INDEX idx_products_category     ON products(category) WHERE is_active = true;
CREATE INDEX idx_products_skin_types   ON products USING GIN(skin_types);
CREATE INDEX idx_variants_product_id   ON product_variants(product_id);
CREATE INDEX idx_variants_sku          ON product_variants(sku);
CREATE INDEX idx_orders_user_id        ON orders(user_id);
CREATE INDEX idx_orders_status         ON orders(status);
CREATE INDEX idx_orders_created_at     ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id  ON order_items(order_id);
CREATE INDEX idx_support_status        ON support_tickets(status, priority);
```

---

## 4. Inventory service — API contracts

Base path: `/api/products`. All endpoints return `application/json`. Errors follow the standard error envelope (Section 7).

### 4.1 `GET /api/products`

**Purpose:** List products with optional filtering. Used by the PLP and internal product grid.

**Query parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `category` | string | No | `serum \| moisturiser \| toner \| spf` |
| `skin_type` | string | No | `dry \| oily \| combination \| sensitive \| all` |
| `concern` | string | No | `acne \| dullness \| aging \| pores \| redness` |
| `is_active` | boolean | No | Default `true`. Internal platform passes `false` to see archived products. |
| `limit` | integer | No | Default `20`. Max `100`. |
| `offset` | integer | No | Default `0`. Pagination offset. |
| `sort` | string | No | `created_at_desc` (default) \| `price_asc` \| `price_desc` \| `name_asc` |

**Response `200`:**

```json
{
  "data": [ Product ],
  "total": "integer",
  "limit": "integer",
  "offset": "integer"
}
```

**Product object (list view):**

```json
{
  "id": "uuid",
  "name": "string",
  "slug": "string",
  "category": "string",
  "skin_types": ["string"],
  "concerns": ["string"],
  "starting_price": "integer",
  "image_url": "string | null",
  "is_active": "boolean"
}
```

### 4.2 `GET /api/products/[slug]`

**Purpose:** Full product detail for PDP. Includes variants, ingredients, and reviews summary.

**Path parameter:**

| Parameter | Type | Description |
|---|---|---|
| `slug` | string | URL-safe product slug e.g. `brightening-serum` |

**Response `200` — Product detail object:**

```json
{
  "id": "uuid",
  "name": "string",
  "slug": "string",
  "description": "string",
  "category": "string",
  "skin_types": ["string"],
  "concerns": ["string"],
  "is_active": "boolean",
  "variants": [ Variant ],
  "ingredients": [ Ingredient ],
  "reviews_summary": {
    "average": "float",
    "count": "integer",
    "distribution": { "1": "int", "2": "int", "3": "int", "4": "int", "5": "int" }
  },
  "reviews": [ Review ]
}
```

**Variant object:**

```json
{
  "id": "uuid",
  "size_ml": "integer",
  "price": "integer",
  "sku": "string",
  "stock": "integer",
  "is_active": "boolean"
}
```

**Ingredient object:**

```json
{
  "id": "uuid",
  "name": "string",
  "concentration": "decimal | null",
  "benefit": "string | null",
  "science_note": "string | null",
  "display_order": "integer"
}
```

**Review object:**

```json
{
  "id": "uuid",
  "rating": "integer",
  "title": "string | null",
  "body": "string | null",
  "created_at": "ISO8601",
  "user_initials": "string"
}
```

**Error cases:**

| Status | Code | Condition |
|---|---|---|
| `404` | `PRODUCT_NOT_FOUND` | No product with given slug |
| `404` | `PRODUCT_INACTIVE` | Product exists but `is_active = false` (public route) |

### 4.3 `GET /api/products/[id]/stock`

**Purpose:** Real-time stock check before checkout. Called client-side when cart is opened.

**Response `200`:**

```json
{
  "variants": [
    { "id": "uuid", "sku": "string", "stock": "integer", "is_active": "boolean" }
  ]
}
```

### 4.4 `POST /api/products` *(Internal only)*

**Auth:** Requires `service_role` key. Only callable from internal platform server-side.

**Request body:**

```json
{
  "name": "string",               // required
  "slug": "string",               // required · must be unique
  "description": "string",        // optional
  "category": "string",           // required
  "skin_types": ["string"],       // required · min 1
  "concerns": ["string"],         // optional
  "variants": [ VariantInput ],   // required · min 1
  "ingredients": [ IngredientInput ] // optional
}
```

**`VariantInput`:**

```json
{ "size_ml": "integer", "price": "integer", "sku": "string", "stock": "integer" }
```

**Response `201`:**

```json
{ "id": "uuid", "slug": "string" }
```

**Error cases:**

| Status | Code | Condition |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Missing required field or invalid value |
| `409` | `SLUG_CONFLICT` | Product with slug already exists |
| `403` | `FORBIDDEN` | Caller is not `service_role` |

### 4.5 `PATCH /api/products/[id]` *(Internal only)*

**Auth:** `service_role`. Partial update — only fields present in body are modified.

**Patchable fields:**

```json
{ "name"?, "description"?, "category"?, "skin_types"?, "concerns"?, "is_active"? }
```

**Response `200`:**

```json
{ "id": "uuid", "updated_at": "ISO8601" }
```

### 4.6 `PATCH /api/products/[id]/variants/[variantId]` *(Internal only)*

**Purpose:** Update stock, price, or active state of a specific variant.

**Patchable fields:**

```json
{ "price"?, "stock"?, "is_active"? }
```

**Response `200`:**

```json
{ "id": "uuid", "stock": "integer", "updated_at": "ISO8601" }
```

### 4.7 `DELETE /api/products/[id]` *(Internal only)*

**Behaviour:** Soft delete only — sets `is_active = false`. No hard deletes. Products are never permanently removed to preserve order history references.

**Response `200`:**

```json
{ "id": "uuid", "is_active": false }
```

---

## 5. Order service — API contracts

Base path: `/api/orders` and `/api/support`. Prices always in paise. Status transitions are strictly enforced.

### 5.1 `POST /api/orders`

**Purpose:** Create a new order. Called from checkout page after address collection. Payment integration is Phase 2 — this endpoint currently creates orders in `confirmed` status directly.

**Request body:**

```json
{
  "items": [ OrderItemInput ],   // required · min 1
  "shipping_address": Address,   // required
  "contact_email": "string",     // required
  "contact_phone": "string",     // optional
  "promo_code": "string",        // optional · Phase 2
  "user_id": "uuid"              // optional · null for guest
}
```

**`OrderItemInput`:**

```json
{ "variant_id": "uuid", "quantity": "integer" }
```

**Server-side actions on `POST /api/orders`:**

1. Validate all `variant_id`s exist and are active.
2. Check stock for each variant — return `409` if any variant is out of stock.
3. Compute `subtotal`, `shipping_total` (free above ₹999), `total`.
4. Begin Postgres transaction:
   - Insert `order` row.
   - Insert `order_items` rows (snapshot name, sku, price).
   - Decrement stock for each variant atomically.
5. Commit transaction.
6. Send confirmation email via Resend (fire-and-forget, non-blocking).
7. Return order object.

**Response `201` — Order object:**

```json
{
  "id": "uuid",
  "order_number": "string",
  "status": "confirmed",
  "subtotal": "integer",
  "shipping_total": "integer",
  "total": "integer",
  "items": [ OrderItem ],
  "created_at": "ISO8601"
}
```

**Error cases:**

| Status | Code | Condition |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Missing required field |
| `409` | `INSUFFICIENT_STOCK` | One or more variants have `stock = 0`. Response includes affected `variant_ids`. |
| `404` | `VARIANT_NOT_FOUND` | `variant_id` does not exist or is inactive |
| `500` | `ORDER_FAILED` | DB transaction failed — client should retry |

### 5.2 `GET /api/orders/[id]`

**Auth:** Authenticated user (own orders) or `service_role`. Guest order access via signed token in confirmation email (Phase 2).

**Response `200` — Full order object:**

```json
{
  "id": "uuid",
  "order_number": "string",
  "status": "string",
  "subtotal": "integer",
  "shipping_total": "integer",
  "total": "integer",
  "shipping_address": "Address",
  "contact_email": "string",
  "tracking_id": "string | null",
  "carrier": "string | null",
  "items": [ OrderItem ],
  "notes": "string | null",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

### 5.3 `GET /api/orders`

**Auth:** Authenticated user — returns own orders only. `service_role` — returns all orders (internal platform).

**Query parameters (internal platform):**

| Parameter | Type | Description |
|---|---|---|
| `status` | string | Filter by status |
| `limit` | integer | Default `50`. Max `200`. |
| `offset` | integer | Pagination offset |
| `search` | string | Search by `order_number` or `contact_email` |
| `date_from` | string | ISO8601 date |
| `date_to` | string | ISO8601 date |

**Response `200`:**

```json
{ "data": [ OrderSummary ], "total": "integer", "limit": "integer", "offset": "integer" }
```

### 5.4 `PATCH /api/orders/[id]/status` *(Internal only)*

**Purpose:** Advance order through its lifecycle. Status transitions are strictly enforced.

**Valid status transitions:**

| From | To (allowed) | Notes |
|---|---|---|
| `confirmed` | `processing \| cancelled` | Ops reviews and begins processing |
| `processing` | `shipped \| cancelled` | Ops assigns carrier and AWB |
| `shipped` | `delivered` | Carrier confirms delivery |
| `delivered` | — | Terminal state |
| `cancelled` | — | Terminal state |

**Request body:**

```json
{
  "status": "string",            // required
  "tracking_id": "string",       // required when status = shipped
  "carrier": "string",           // required when status = shipped
  "notes": "string"              // optional internal note
}
```

**Response `200`:**

```json
{ "id": "uuid", "status": "string", "updated_at": "ISO8601" }
```

**Error cases:**

| Status | Code | Condition |
|---|---|---|
| `400` | `INVALID_TRANSITION` | Requested status transition is not permitted |
| `400` | `TRACKING_REQUIRED` | `tracking_id` missing when `status = shipped` |
| `404` | `ORDER_NOT_FOUND` | Order `id` does not exist |

### 5.5 `POST /api/orders/[id]/reviews`

**Auth:** Authenticated user who has a `delivered` order containing the product being reviewed.

**Request body:**

```json
{
  "product_id": "uuid",
  "rating": "integer",
  "title": "string",   // optional
  "body": "string"     // optional
}
```

**Response `201`:**

```json
{ "id": "uuid", "is_approved": false }
```

> **Note:** Reviews require ops approval before appearing publicly. `is_approved` defaults to `false`.

### 5.6 `POST /api/support`

**Purpose:** Customer raises a support issue. Linked to an order if provided.

**Request body:**

```json
{
  "order_id": "uuid",        // optional
  "guest_email": "string",   // required if not authenticated
  "subject": "string",       // required · max 200 chars
  "body": "string"           // required · max 5000 chars
}
```

**Response `201`:**

```json
{ "id": "uuid", "status": "open", "created_at": "ISO8601" }
```

### 5.7 `GET /api/support` *(Internal only)*

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `status` | string | `open \| in_progress \| resolved \| closed` |
| `priority` | string | `low \| normal \| high \| urgent` |
| `limit` | integer | Default `50` |
| `offset` | integer | Pagination |

### 5.8 `PATCH /api/support/[id]` *(Internal only)*

**Request body:**

```json
{ "status"?: "string", "priority"?: "string", "assigned_to"?: "uuid", "notes"?: "string" }
```

**Response `200`:**

```json
{ "id": "uuid", "status": "string", "updated_at": "ISO8601" }
```

---

## 6. Frontend implementation

### 6.1 Customer website — page map

| Route | Component file | Auth | Data fetched |
|---|---|---|---|
| `/` | `app/(shop)/page.tsx` | Public | `GET /api/products?limit=3&sort=created_at_desc` |
| `/products` | `app/(shop)/products/page.tsx` | Public | `GET /api/products` (with filter params) |
| `/products/[slug]` | `app/(shop)/products/[slug]/page.tsx` | Public | `GET /api/products/[slug]` |
| `/checkout` | `app/(shop)/checkout/page.tsx` | Public | `POST /api/orders` on submit |
| `/order/[id]` | `app/(shop)/order/[id]/page.tsx` | Public + token | `GET /api/orders/[id]` |
| `/account` | `app/(shop)/account/page.tsx` | Auth required | `GET /api/orders` |
| `/account/orders/[id]` | `app/(shop)/account/orders/[id]/page.tsx` | Auth required | `GET /api/orders/[id]` |
| `/support/new` | `app/(shop)/support/new/page.tsx` | Public | `POST /api/support` |

### 6.2 Internal platform — page map

| Route | Purpose | Key actions |
|---|---|---|
| `/dashboard` | Overview metrics | Order counts by status, recent tickets |
| `/products` | Product list | Filter, search, toggle active state |
| `/products/new` | Add product | `POST /api/products` |
| `/products/[id]/edit` | Edit product | `PATCH /api/products/[id]` |
| `/orders` | Order queue | Filter by status, search, paginate |
| `/orders/[id]` | Order detail | `PATCH /api/orders/[id]/status` |
| `/support` | Ticket queue | Filter, assign, update status |
| `/support/[id]` | Ticket detail | Read body, `PATCH` status/priority |

### 6.3 Zustand cart store

The cart is client-side state only. It is not persisted to the database until checkout completes. Persisted to `localStorage` via `zustand/middleware`.

**Store shape:**

```typescript
type CartStore = {
  items: CartItem[]
  addItem:    (variant: Variant, product: ProductSummary, qty: number) => void
  removeItem: (variantId: string) => void
  updateQty:  (variantId: string, qty: number) => void
  clearCart:  () => void
  subtotal:   () => number   // computed · paise
  itemCount:  () => number   // computed
}

type CartItem = {
  variantId:   string
  sku:         string
  productName: string
  size_ml:     number
  price:       number
  quantity:    number
  imageUrl:    string | null
}
```

### 6.4 Component architecture

All components must import design tokens from `tailwind.config.ts` and follow rules in `DESIGN_SYSTEM.md`. Never hardcode hex values in components.

| Component | Path | Props summary |
|---|---|---|
| `ProductCard` | `components/shop/ProductCard.tsx` | `{ product: ProductSummary, showBadge?: boolean }` |
| `IngredientTag` | `components/ui/IngredientTag.tsx` | `{ name, concentration?, benefit? }` |
| `ScienceCallout` | `components/ui/ScienceCallout.tsx` | `{ label, text, variant?: "mist" \| "blush" }` |
| `CartDrawer` | `components/shop/CartDrawer.tsx` | `{ open, onClose }` |
| `QuantitySelector` | `components/ui/QuantitySelector.tsx` | `{ value, onChange, min?, max? }` |
| `FilterBar` | `components/shop/FilterBar.tsx` | `{ filters, value, onChange }` |
| `ReviewBar` | `components/shop/ReviewBar.tsx` | `{ summary: ReviewsSummary }` |
| `StatusBadge` | `components/ui/StatusBadge.tsx` | `{ status: OrderStatus }` |
| `SkeletonCard` | `components/ui/SkeletonCard.tsx` | `{ count?: number }` |

### 6.5 Supabase client pattern

Three distinct client instantiations are required — never mix them:

**Browser client** (client components):

```typescript
import { createBrowserClient } from '@supabase/ssr'
// Used in: hooks, client components, Zustand store
```

**Server client** (server components and API routes):

```typescript
import { createServerClient } from '@supabase/ssr'
// Used in: page.tsx, route.ts, server actions
// Reads cookies — respects user session
```

**Admin client** (internal platform API routes only):

```typescript
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY)
// Bypasses RLS — only on server, NEVER expose to browser
```

---

## 7. Error handling

### 7.1 Standard error envelope

All API errors return a consistent JSON structure. Clients must handle this shape.

```json
{
  "error": {
    "code":    "string",     // machine-readable e.g. PRODUCT_NOT_FOUND
    "message": "string",     // human-readable
    "details": "any | null"  // optional extra context
  }
}
```

### 7.2 HTTP status code convention

| Status | Meaning | When to use |
|---|---|---|
| `200` | OK | Successful GET or PATCH |
| `201` | Created | Successful POST that creates a resource |
| `400` | Bad Request | Validation error, missing field, invalid enum value |
| `401` | Unauthorized | Missing or expired JWT |
| `403` | Forbidden | Valid JWT but insufficient role |
| `404` | Not Found | Resource does not exist or is not accessible to caller |
| `409` | Conflict | Duplicate slug, insufficient stock, invalid status transition |
| `500` | Internal Server Error | Unhandled exception — always log to Sentry |

### 7.3 Client-side error states

Every data-fetching page must implement all three states:

- **Loading** — render `SkeletonCard` components, not spinners.
- **Error** — render an inline error message with a retry button. Never a full-page error for partial failures.
- **Empty** — render a meaningful empty state. Never a blank page.

---

## 8. Auth and security

### 8.1 Auth strategy

| Actor | Auth method | Session | Scope |
|---|---|---|---|
| Customer (logged in) | Supabase Auth email + password / magic link | JWT in HttpOnly cookie | Own orders, own reviews, own tickets |
| Customer (guest) | No auth — email address as identity | None | Place order, view confirmation by `order_number` |
| Staff (internal) | Supabase Auth email + password | JWT in HttpOnly cookie | All resources — role checked in middleware |
| Service (API-to-API) | `SUPABASE_SERVICE_ROLE_KEY` | N/A (server-only) | Bypasses RLS — full access |

### 8.2 Middleware — customer website

```typescript
// middleware.ts — protects /account/* routes
export const config = { matcher: ['/account/:path*'] }
// Reads Supabase session cookie → redirects to /login if not authenticated
```

### 8.3 Middleware — internal platform

```typescript
// middleware.ts — protects all routes except /login
// Reads Supabase session cookie
// Checks user metadata for role === 'staff'
// Redirects non-staff to /login with error=unauthorized
```

### 8.4 Environment variables

| Variable | Used in | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Both frontends (browser) | Safe to expose — public URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Both frontends (browser) | Safe to expose — anon key with RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Internal platform server only | **NEVER** in `NEXT_PUBLIC_*` or client bundle |
| `RESEND_API_KEY` | Order service (server only) | Email sending |
| `NEXTAUTH_SECRET` | Both frontends (server only) | Session signing |

---

## 9. Key workflows

### 9.1 Place order workflow

1. Customer opens cart drawer → client calls `GET /api/products/[id]/stock` to validate current stock.
2. Customer proceeds to checkout page — address form rendered.
3. Customer submits form → client-side validation (Zod schema) before API call.
4. Client calls `POST /api/orders` with items, address, contact details.
5. Server validates input, checks stock, opens Postgres transaction.
6. Transaction: inserts order + items, decrements stock. Commit.
7. Server triggers Resend email (fire-and-forget — does not block response).
8. `201` response returned → client clears cart, redirects to `/order/[id]`.
9. Order confirmation page renders with order summary and account creation prompt.

### 9.2 Order fulfilment workflow (ops)

1. Staff logs into internal platform → sees order queue filtered to `status=confirmed`.
2. Staff opens order detail → reviews items, address, contact.
3. Staff clicks "Begin processing" → `PATCH /api/orders/[id]/status { status: "processing" }`.
4. Staff arranges shipping → enters `tracking_id` and `carrier`.
5. Staff clicks "Mark shipped" → `PATCH /api/orders/[id]/status { status: "shipped", tracking_id, carrier }`.
6. Customer receives automated shipping notification email.
7. On delivery confirmation: `PATCH /api/orders/[id]/status { status: "delivered" }`.

### 9.3 Support ticket workflow

1. Customer navigates to `/support/new` → fills subject and body, optionally links an order.
2. Client calls `POST /api/support` → ticket created with `status=open`.
3. Internal platform shows new ticket in support queue.
4. Staff opens ticket → reads body, views linked order if present.
5. Staff updates status to `in_progress` and assigns to themselves.
6. Staff resolves issue → `PATCH /api/support/[id] { status: "resolved" }`.

### 9.4 Add product workflow (ops)

1. Staff navigates to `/products/new` on internal platform.
2. Staff fills product form: name, slug, description, category, skin types, concerns.
3. Staff adds variants (size + price + initial stock) and ingredients.
4. Staff submits → internal platform calls `POST /api/products` with `service_role` key.
5. Product created with `is_active=true` → immediately visible on storefront.
6. Staff can return to `/products/[id]/edit` to modify or soft-delete.

---

## 10. Email notifications

Email is sent via Resend. All sends are fire-and-forget — order placement is not blocked on email delivery. Failures are logged to Sentry and retried by Resend internally.

| Trigger | Template | Recipient | Key content |
|---|---|---|---|
| Order confirmed | `order-confirmation` | `contact_email` | Order number, items, total, shipping address, tracking instructions |
| Order shipped | `order-shipped` | `contact_email` | Order number, carrier, tracking ID, estimated delivery |
| Order delivered | `order-delivered` | `contact_email` | Order number, review invite, reorder CTA |
| Ticket opened | `ticket-opened` | Customer email | Ticket ID, subject, expected response time |
| Ticket resolved | `ticket-resolved` | Customer email | Ticket ID, resolution summary |

---

## 11. Non-functional requirements

### 11.1 Performance targets

| Metric | Target | How achieved |
|---|---|---|
| Homepage LCP | < 2.5s | Static generation (ISR 60s), optimised images via `next/image` |
| PLP load | < 1.5s | Server component with streaming, skeleton loading |
| PDP load | < 1.5s | Server component, image CDN via Supabase storage |
| API response p95 | < 300ms | Indexed queries, connection pooling via Supabase |
| Cart open | < 200ms | Local Zustand state — no API call to open |
| Stock check | < 500ms | Single indexed query on `product_variants` |

### 11.2 Security rules

- All API routes validate and sanitise input before DB operations.
- Slug is sanitised server-side: lowercase, hyphens only, max 100 chars.
- Price is always an integer (paise) — no float arithmetic.
- Stock decrement uses Postgres `UPDATE` with `CHECK` constraint — cannot go below 0.
- `service_role` key is never logged, never returned in API responses.
- CORS: customer website API routes allow same-origin only.
- Internal platform hosted on separate subdomain with staff-only access.

### 11.3 Observability

| Concern | Tool | What is tracked |
|---|---|---|
| Errors | Sentry | All unhandled exceptions, API `5xx` responses, failed email sends |
| Performance | Vercel Analytics | Web Vitals (LCP, CLS, FID) per page |
| Logs | Vercel log drain | API route request logs, structured JSON |
| Uptime | Vercel | Automatic — alerting on deploy failures |

---

## 12. Instructions for AI coding agents

> This section is addressed directly to Claude Code and any other AI agent building this system.

### 12.1 Before writing any code

1. Read `DESIGN_SYSTEM.md` in the project root. Every UI decision flows from it.
2. Read `tailwind.config.ts` to understand available tokens. Never hardcode colours or spacing.
3. Check that TypeScript `strict` mode is enabled in `tsconfig.json`.
4. Confirm which Supabase client to use (browser / server / admin) based on the file you are in.

### 12.2 API route conventions

- File: `app/api/[resource]/route.ts` for collections. `app/api/[resource]/[id]/route.ts` for single items.
- Always return the standard error envelope on failures (see Section 7.1).
- Never return raw Postgres errors to the client — map them to error codes.
- Validate request body with Zod before touching the database.
- Use `try/catch` on every DB operation and log errors to `console.error` (Sentry picks these up).

### 12.3 Component conventions

- Server components are the default. Add `"use client"` only when you need `useState`, `useEffect`, or browser APIs.
- Every page that fetches data must handle loading, error, and empty states.
- `ProductCard`, `IngredientTag`, `ScienceCallout`, `StatusBadge` are shared components — import, do not recreate.
- Cart state lives in Zustand only. Do not use `useState` for cart.
- Forms use React Hook Form + Zod. No uncontrolled inputs.

### 12.4 Database conventions

- All prices are integers in paise. ₹1 = 100 paise. Never store floats for money.
- Use Postgres transactions (`supabase.rpc` or raw SQL) when writing to multiple tables atomically.
- Never hard-delete records — use `is_active = false` or `status = cancelled`.
- Always snapshot product name, SKU, and price into `order_items` at order creation time.

### 12.5 What NOT to build (out of scope for Phase 1)

- Payment integration (Razorpay) — Phase 2.
- AI chatbot — Phase 2.
- SMS notifications — Phase 2.
- Loyalty / points system — Phase 2.
- Shipping aggregator API (Shiprocket / Delhivery) — Phase 2. Use manual AWB entry for now.
- Analytics dashboard — use Vercel Analytics for now.

---

## 13. Recommended implementation sequence

Build in this order to avoid rework. Each step produces something testable before moving on.

| Phase | Step | Deliverable | Depends on |
|---|---|---|---|
| 1 · Foundation | 1.1 | Project scaffold — Next.js, Tailwind, design tokens, `DESIGN_SYSTEM.md` | — |
| 1 · Foundation | 1.2 | Supabase setup — schema migration, seed data, RLS policies, typed client | 1.1 |
| 1 · Foundation | 1.3 | Design system components — Button, Badge, Input, Card, IngredientTag | 1.1 |
| 1 · Foundation | 1.4 | Navbar + Footer shell | 1.3 |
| 2 · Storefront | 2.1 | Inventory API — `GET /api/products`, `GET /api/products/[slug]` | 1.2 |
| 2 · Storefront | 2.2 | Homepage | 2.1 + 1.4 |
| 2 · Storefront | 2.3 | Product listing page (PLP) | 2.1 |
| 2 · Storefront | 2.4 | Product detail page (PDP) | 2.1 |
| 3 · Cart + Orders | 3.1 | Zustand cart store + CartDrawer | 1.3 |
| 3 · Cart + Orders | 3.2 | Order API — `POST /api/orders`, `GET /api/orders/[id]` | 1.2 |
| 3 · Cart + Orders | 3.3 | Checkout page + order confirmation | 3.1 + 3.2 |
| 4 · Auth | 4.1 | Supabase Auth — login, signup, session middleware | 1.2 |
| 4 · Auth | 4.2 | Account page — order history, skin profile | 4.1 + 3.2 |
| 5 · Support | 5.1 | Support ticket API — `POST` + `GET /api/support` | 1.2 |
| 5 · Support | 5.2 | Support form page (customer) | 5.1 |
| 6 · Internal | 6.1 | Internal platform scaffold + staff auth | 1.2 |
| 6 · Internal | 6.2 | Product management — list, add, edit, soft-delete | 6.1 + inventory API |
| 6 · Internal | 6.3 | Order management — queue, detail, status update | 6.1 + order API |
| 6 · Internal | 6.4 | Support ticket management — queue, detail, resolve | 6.1 + 5.1 |

---

*This document should be kept in the repository root as `TDD.md` and updated as implementation decisions evolve.*