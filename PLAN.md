# PLAN.md — D2C Skincare Platform

Implementation plan for Phase 1. Tasks are ordered so that each is fully buildable and testable before the next begins. No task should be started until all its dependencies are marked done.

**Status key:** `[ ]` todo · `[~]` in progress · `[x]` done

---

## Phase 1 — Foundation

Everything in this phase has no external dependencies. Complete it in order before writing any feature code.

---

### Task 1.1 — Project scaffold

**Depends on:** nothing

**What to build:**
- Initialise Next.js 14 with App Router and TypeScript `strict: true`
- Install and configure: Tailwind CSS (import `tailwind.config.ts` from repo), ESLint, Prettier
- Install runtime deps: `@supabase/ssr`, `zustand`, `react-hook-form`, `zod`, `lucide-react`, `resend`
- Install dev deps: `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `@playwright/test`
- Create `vitest.config.ts` and `src/__tests__/setup.ts` (mock `next/navigation` and `@/lib/supabase/browser` per `TESTING.md`)
- Create `playwright.config.ts` (per `TESTING.md`)
- Create `.env.local` stub with all required keys (see `TDD.md` §8.4) — values are placeholders only
- Create `src/styles/globals.css` with Tailwind directives and import Libre Baskerville + Inter from Google Fonts
- Create `src/types/index.ts` with shared TypeScript types derived from `TDD.md` §3 and §6:
  - `Product`, `ProductSummary`, `Variant`, `Ingredient`, `Review`, `ReviewsSummary`
  - `Order`, `OrderSummary`, `OrderItem`, `OrderStatus`, `ShippingAddress`
  - `SupportTicket`, `TicketStatus`, `TicketPriority`
  - `CartItem`
- Create `tsconfig.json` path alias: `@/*` → `./src/*`
- Add `pnpm` scripts: `dev`, `build`, `typecheck`, `lint`

**Tests to write:**
- None for scaffold itself — verify `pnpm typecheck` and `pnpm lint` pass with zero errors on an empty `src/app/page.tsx`

**Done when:** `pnpm dev` starts, `pnpm typecheck` exits 0, `pnpm lint` exits 0, `pnpm vitest run` reports "no tests found" without error.

---

### Task 1.2 — Supabase schema, RLS, and typed client

**Depends on:** 1.1

**What to build:**
- `supabase/migrations/001_initial_schema.sql` — create all tables per `TDD.md` §3.1:
  - `products`, `product_variants`, `product_ingredients`, `orders`, `order_items`, `reviews`, `support_tickets`
  - All constraints: CHECK clauses, UNIQUE indexes, FK relationships, `is_active` defaults
  - All critical indexes from `TDD.md` §3.3
- `supabase/migrations/002_rls.sql` — enable RLS on all tables and define policies per `TDD.md` §3.2
- `supabase/seed.sql` — insert 4 products (one per category: serum, moisturiser, toner, spf) each with 2 variants and 3–5 ingredients. Enough stock for checkout testing.
- `src/lib/supabase/browser.ts` — `createBrowserClient` wrapper (for client components)
- `src/lib/supabase/server.ts` — `createServerClient` wrapper reading cookies (for server components and API routes)
- `src/lib/supabase/admin.ts` — `createClient` with `SUPABASE_SERVICE_ROLE_KEY` (for internal API routes only)
- `src/lib/supabase/types.ts` — Supabase-generated `Database` type (run `supabase gen types typescript` after migration)

**Tests to write:**
- Verify migration applies cleanly: `supabase db reset` exits 0 with no errors
- Verify seed inserts: after reset, query `products` count = 4, `product_variants` count ≥ 8

**Done when:** `supabase start && supabase db reset` succeeds, seed data is present, typed client files exist and typecheck passes.

---

### Task 1.3 — Design system atom components

**Depends on:** 1.1

**What to build:**

All components live in `src/components/ui/`. Server components by default unless noted.

| Component | File | Notes |
|---|---|---|
| `Button` | `Button.tsx` | Props: `variant: "primary" \| "outline"`, `size?: "sm" \| "md"`, `asChild?`. Rounded-sm. No shadow. |
| `Badge` | `Badge.tsx` | Props: `label: string`. Monospace, uppercase, tracking-wide, rounded-sm. |
| `Input` | `Input.tsx` | Props: `id`, `label`, `error?`. Must render associated `<label>` and `aria-describedby` error. Client component. |
| `IngredientTag` | `IngredientTag.tsx` | Props: `name`, `concentration?`, `benefit?`. 2px left border, no radius, monospace. `data-testid="ingredient-tag"` |
| `ScienceCallout` | `ScienceCallout.tsx` | Props: `label`, `text`, `variant?: "mist" \| "blush"`. 2px left border, no radius. `data-testid="science-callout"` |
| `StatusBadge` | `StatusBadge.tsx` | Props: `status: OrderStatus`. Maps status → label and colour token. `data-testid="status-badge"` |
| `SkeletonCard` | `SkeletonCard.tsx` | Props: `count?: number`. Renders `count` skeleton placeholders. `data-testid="skeleton-card"` |
| `QuantitySelector` | `QuantitySelector.tsx` | Props: `value`, `onChange`, `min?`, `max?`. Client component. `data-testid="quantity-selector"` |

**Tests to write** (`src/__tests__/components/`):
- `Button` — renders primary and outline variants, keyboard accessible
- `Input` — renders label and links error via `aria-describedby`
- `IngredientTag` — renders name, concentration, benefit; has correct `data-testid`
- `StatusBadge` — maps each `OrderStatus` value to correct label
- `SkeletonCard` — renders `count` items, each with `data-testid="skeleton-card"`
- `QuantitySelector` — increments, decrements, respects `min`/`max`, does not fire onChange below min

**Done when:** All component tests pass. `pnpm typecheck` exits 0.

---

### Task 1.4 — Shared layout: Navbar and Footer

**Depends on:** 1.3

**What to build:**
- `src/components/layout/Navbar.tsx` — per `wireframes/Home.html` §Navbar:
  - Three zones: brand wordmark (left), nav links (center), icon cluster (right)
  - Icons: Search, User, ShoppingBag from `lucide-react`
  - Cart icon reads `useCartStore().itemCount()` and shows badge — this means Navbar wraps a client component for the cart/icon cluster
  - Sticky top; transparent at scroll-top, white background on scroll-down
  - Mobile: hamburger collapses nav links, icons always visible
  - `<nav>` semantic element with keyboard-accessible links
- `src/components/layout/Footer.tsx` — per `wireframes/Home.html` §Footer:
  - 4-column grid: brand/tagline, Shop links, Learn links, Help links
  - Bottom bar: copyright, Privacy, Terms links
  - Static server component (no interactivity)
- `src/app/layout.tsx` — root layout importing Navbar + Footer, setting `<html lang="en">`, and applying `globals.css`
- `src/components/layout/NavIconCluster.tsx` — `"use client"` component used inside Navbar for cart count badge and CartDrawer trigger (CartDrawer built in Task 3.1 — stub the onClick for now)

**Tests to write** (`src/__tests__/components/`):
- `Navbar` — renders brand link, nav links, icon buttons; cart badge hidden when count = 0; cart badge shows count when itemCount > 0
- `Footer` — renders all four column headings and expected links

**Done when:** `pnpm dev` shows Navbar + Footer on `localhost:3000`. All tests pass.

---

## Phase 2 — Inventory API + Storefront

---

### Task 2.1 — Inventory API routes

**Depends on:** 1.2

**What to build:**
- `src/app/api/products/route.ts` — `GET /api/products`:
  - Query params: `category`, `skin_type`, `concern`, `is_active`, `limit` (default 20, max 100), `offset`, `sort`
  - Validate params with Zod before DB call
  - Return `{ data, total, limit, offset }` per `TDD.md` §4.1
  - Uses server Supabase client
- `src/app/api/products/[slug]/route.ts` — `GET /api/products/[slug]`:
  - Returns full product detail including variants, ingredients, reviews_summary, reviews (approved only)
  - Returns `404 PRODUCT_NOT_FOUND` or `404 PRODUCT_INACTIVE` per `TDD.md` §4.2
- `src/app/api/products/[id]/stock/route.ts` — `GET /api/products/[id]/stock`:
  - Returns `{ variants: [{ id, sku, stock, is_active }] }` per `TDD.md` §4.3
- `src/lib/schemas/product.ts` — Zod schemas for all inventory query params and request bodies

**Tests to write** (`src/__tests__/unit/` and `src/__tests__/integration/`):
- Unit: `productQuerySchema` — accepts valid params, rejects invalid category/sort values
- Integration (`supabase start` required):
  - `GET /api/products` returns seeded products with correct shape
  - `GET /api/products?category=serum` returns only serum products
  - `GET /api/products/brightening-serum` returns full detail object including variants and ingredients
  - `GET /api/products/nonexistent` returns 404 with `PRODUCT_NOT_FOUND`
  - `GET /api/products/[id]/stock` returns variant stock array

**Done when:** All integration tests pass. Calling the API from curl/Thunder Client returns correct JSON.

---

### Task 2.2 — Homepage

**Depends on:** 2.1, 1.4

**What to build:**

`src/app/(shop)/page.tsx` — server component, ISR `revalidate: 60` per `wireframes/Home.html`:

- **Section 1 (Navbar):** inherited from layout
- **Section 2 (Hero):** text-only, no image. Overline, two-line headline (line 2 italic), subline, two CTA buttons. Static — no data fetch.
- **Section 3 (Philosophy strip):** 4 equal columns with border-top/bottom. Hardcoded content.
- **Section 4 (Featured products):** fetches `GET /api/products?limit=3&sort=created_at_desc`. Renders `ProductCard` × 3 in a 3-col grid. Header row with "View all →" link. Loading state: 3× `SkeletonCard`.
- **Section 5 (Ingredient spotlight):** hardcoded for MVP. Renders 1× `IngredientTag`. Static.
- **Section 6 (Press strip):** up to 4 logo placeholders from `/public/press/`. Grayscale filter. Static.
- **Section 7 (Newsletter capture):** inline form — never a modal. React Hook Form + Zod (`z.string().email()`). On success shows "You're in." inline. On error shows inline error. Stub the POST endpoint for now.
- **Section 8 (Footer):** inherited from layout

`src/components/shop/ProductCard.tsx` — per `TDD.md` §6.4 and `wireframes/Home.html` §Featured products:
- Props: `{ product: ProductSummary, showBadge?: boolean }`
- Square image with `next/image`, aspect-ratio 1/1
- Category overline (mono), product name, top ingredients (mono), starting price formatted as `₹${Math.round(paise/100).toLocaleString()}`
- Add-to-cart `+` button: calls `useCartStore().addItem()` — requires `"use client"` wrapper
- `data-testid="product-card"` on the card, `data-testid="add-to-cart"` on the button

**Constraints (from wireframe):**
- No carousel, no video, no hero image
- Exactly 3 featured products
- Newsletter is always inline

**Tests to write:**
- Unit: `ProductCard` — renders product name, formatted price, `data-testid="product-card"`, `data-testid="add-to-cart"`
- Unit: Price formatter util — `₹1,299` for 129900 paise
- Component: Newsletter form — submits only with valid email, shows error for invalid

**Done when:** Homepage renders with real seeded products. All four page states handled (loading/error/empty/data). Tests pass.

---

### Task 2.3 — Product Listing Page (PLP)

**Depends on:** 2.1, 1.4

**What to build:**

`src/app/(shop)/products/page.tsx` — server component per `wireframes/Plp.html`:
- Reads `searchParams` from URL: `category`, `skin_type`, `concern`, `sort`, `limit`, `offset`
- Fetches `GET /api/products` with those params
- Heading: "All products" with product count in muted mono text next to it
- Filter bar (always visible at top, not a sidebar)
- 4-col desktop / 2-col tablet / 1-col mobile product grid
- Empty state inline if filters return zero results (meaningful message + "Clear filters" CTA)
- Loading state: grid of `SkeletonCard`
- "Not sure?" CTA section at the bottom of every page

`src/components/shop/FilterBar.tsx` — `"use client"` component per `TDD.md` §6.4:
- Props: `{ filters: FilterConfig[], value: Record<string, string>, onChange: (key, val) => void }`
- Filter buttons: skin_type, concern, category — each toggleable
- Sort select: right-aligned in the same bar
- Active filter: black fill, white text
- Each filter button: `data-testid="filter-btn-{value}"`
- Updating a filter pushes new params to `router` (URL-driven state)

**Tests to write:**
- Component: `FilterBar` — clicking a filter updates URL params (mock `useRouter`), active filter shows correct styling
- Integration: `GET /api/products?skin_type=dry` returns only matching products
- Integration: `GET /api/products?offset=20` paginates correctly

**Done when:** PLP renders, filters update the URL and re-fetch, empty state shows when no results. All tests pass.

---

### Task 2.4 — Product Detail Page (PDP)

**Depends on:** 2.1, 1.4

**What to build:**

`src/app/(shop)/products/[slug]/page.tsx` — server component per `wireframes/Pdp.html`:
- Fetches `GET /api/products/[slug]`
- 404 page if `PRODUCT_NOT_FOUND` or `PRODUCT_INACTIVE`
- Breadcrumb: Home > Shop > [product name]
- **Above fold (2-col):**
  - Left: image gallery (square crop, white/offwhite bg, no lifestyle shots). `next/image`.
  - Right: category overline, product name, reviews summary bar, variant size pills (not dropdown), price for selected variant, add-to-cart button (sticky on mobile), "Add to wishlist" stub.
- **Below fold:**
  - "How to use" section (from product description)
  - Full ingredient list: ALL ingredients visible by default (not collapsed). Each rendered as `IngredientTag`. Science notes rendered as `ScienceCallout`.
  - Reviews section: 3 shown by default, "Load more" button (client component) appends remaining. `data-testid="review-row"` on each.
  - Related products: exactly 3 `ProductCard`s — same category, different slug.

`src/components/shop/ReviewBar.tsx` — per `TDD.md` §6.4:
- Props: `{ summary: ReviewsSummary }`
- Shows average rating, count, and distribution bars

Variant selection is client-side state — wrap the purchase panel in a `"use client"` component (`src/components/shop/PdpPurchasePanel.tsx`):
- Manages selected variant ID
- Shows price for selected variant
- Add-to-cart calls `useCartStore().addItem(selectedVariant, product, qty)`

**Constraints (from wireframe):**
- Variant selector: size pills, not dropdown
- Add-to-cart always visible — sticky on mobile
- Ingredient list: never collapsed by default
- Reviews: show 3, load more on click (no pagination)
- Related products: exactly 3, hard limit

**Tests to write:**
- Component: `ReviewBar` — renders average, count, and all 5 distribution entries
- Integration: `GET /api/products/[slug]` with known seeded slug returns 200 with ingredients and variants
- Integration: `GET /api/products/unknown-slug` returns 404

**Done when:** PDP renders with variants, ingredients, and reviews. Variant switching updates the displayed price. Add-to-cart works. All tests pass.

---

## Phase 3 — Cart + Orders

---

### Task 3.1 — Zustand cart store + CartDrawer

**Depends on:** 1.3

**What to build:**

`src/lib/store/cart.ts` — Zustand store with `persist` middleware to `localStorage` per `TDD.md` §6.3:
- Shape: `items: CartItem[]`, `addItem`, `removeItem`, `updateQty`, `clearCart`, `subtotal()`, `itemCount()`
- `addItem`: if `variantId` already in cart → increment quantity; else append
- `subtotal()`: sum of `price × quantity` across all items (paise)
- `itemCount()`: sum of all quantities

`src/components/shop/CartDrawer.tsx` — `"use client"` per `wireframes/Cart.html`:
- Slides in from right. Fixed 340px on desktop, full-width on mobile.
- Backdrop dims page content (not hidden behind drawer)
- On open: calls `GET /api/products/[id]/stock` for all items in cart; shows inline warning per item if that variant is now out of stock
- Items: image, product name, variant size, price, `QuantitySelector`, remove button
- `data-testid="cart-drawer"`, `data-testid="cart-item"` on each item row, `data-testid="cart-subtotal"` on subtotal
- Subtotal always visible at bottom (sticky)
- Upsell slot: 1 hardcoded product max — not dynamic
- Empty state when cart is empty: "Continue shopping" button that closes drawer (does not navigate)
- Closes on: X button, backdrop click, navigation to `/checkout`
- Focus trap when open; restore focus on close

Wire `NavIconCluster.tsx` (Task 1.4 stub) to open CartDrawer.

**Tests to write** (`src/__tests__/unit/cart.test.ts`):
- `addItem` adds new item with correct shape
- `addItem` with duplicate `variantId` increments quantity
- `removeItem` removes the correct item
- `updateQty` updates quantity for correct item
- `clearCart` empties items array
- `subtotal()` returns correct paise sum for multiple items
- `itemCount()` returns total unit count

Component tests (`src/__tests__/components/CartDrawer.test.tsx`):
- Renders empty state when cart is empty
- Renders cart items with correct `data-testid` values
- Close button calls `onClose`
- Remove item triggers `removeItem` on store

**Done when:** Cart store unit tests all pass. CartDrawer opens from Navbar icon and shows live cart state. Out-of-stock items flagged inline.

---

### Task 3.2 — Order API routes

**Depends on:** 1.2

**What to build:**
- `src/lib/schemas/order.ts` — Zod schemas:
  - `orderItemInputSchema`: `{ variant_id: uuid, quantity: int > 0 }`
  - `shippingAddressSchema`: `{ line1, line2?, city, state, pin, country: "IN" }`
  - `createOrderSchema`: `{ items: min(1), shipping_address, contact_email, contact_phone? }`
  - `orderStatusPatchSchema`: `{ status, tracking_id?, carrier?, notes? }` — tracking_id required when status = "shipped"
- `src/app/api/orders/route.ts`:
  - `POST /api/orders` — full server-side implementation per `TDD.md` §5.1:
    1. Zod validate body
    2. Resolve all `variant_id`s — 404 if any missing/inactive
    3. Stock check — 409 `INSUFFICIENT_STOCK` with affected `variant_ids` if any = 0
    4. Compute subtotal (from DB prices, not client), shipping_total (free above ₹99900 paise = ₹999), total
    5. Postgres transaction via `supabase.rpc`: insert order + order_items, decrement stock atomically
    6. Generate `order_number` in format `ORD-2026-XXXX` (zero-padded, sequential)
    7. Fire-and-forget Resend email (see Task 7.1 — stub for now, log to console)
    8. Return 201 with order object
  - `GET /api/orders` — returns own orders for authenticated user (uses session from cookie); filters by `status`, `limit`, `offset`
- `src/app/api/orders/[id]/route.ts`:
  - `GET /api/orders/[id]` — returns full order for authenticated user (own) or 401
- `src/app/api/orders/[id]/status/route.ts`:
  - `PATCH /api/orders/[id]/status` — enforces valid transitions per `TDD.md` §5.4. Returns 400 `INVALID_TRANSITION` for invalid moves. Internal platform only (admin client).

**Tests to write** (`src/__tests__/unit/` and `src/__tests__/integration/`):
- Unit: `createOrderSchema` — accepts valid payload, rejects empty items, rejects missing email, rejects invalid address
- Unit: `orderStatusPatchSchema` — rejects "shipped" without tracking_id
- Unit: Status transition validator function — valid and invalid transitions for each state
- Integration: `POST /api/orders` — creates order and decrements stock (use seeded variant)
- Integration: `POST /api/orders` — returns 409 when variant stock = 0
- Integration: `POST /api/orders` — returns 404 when variant_id does not exist
- Integration: `GET /api/orders/[id]` — returns 401 when unauthenticated

**Done when:** All integration tests pass. Order is created in DB with correct snapshots, stock is decremented.

---

### Task 3.3 — Checkout page

**Depends on:** 3.1, 3.2

**What to build:**

`src/app/(shop)/checkout/page.tsx` — `"use client"` per `wireframes/Checkout.html`:
- Two columns: form left (flex:1), order summary right (sticky 280px)
- **Left — three numbered form sections:**
  1. Contact info: email, phone (optional)
  2. Shipping address: line1, line2 (optional), city, state, pin, country (hardcoded "IN")
  3. Payment placeholder: "Payment will be handled at the next step" note (Razorpay is Phase 2)
- React Hook Form + Zod (`createOrderSchema`) for all form validation
- Show field-level errors inline under each input
- Submit button: "Place order" — disabled while submitting
- On submit: calls `POST /api/orders` with `items` from cart store + form values
- On success: calls `clearCart()`, redirects to `/order/[id]`
- On error: shows inline error message above submit button (never a toast for critical flow errors)
- Shipping cost shown before submit button: "Free" if subtotal ≥ ₹999, else ₹XX

- **Right — order summary:**
  - Lists cart items with image, name, size, qty, line total
  - Subtotal, shipping, total rows
  - Sticky on desktop

**Constraint (from wireframe):** Guest checkout is default. Never require login. Login is offered after purchase (on confirmation page).

**Tests to write:**
- Component: form renders all fields with correct labels and `aria-*` attributes
- Component: submitting empty form shows validation errors on required fields
- Component: shipping cost shows "Free" when subtotal ≥ ₹999, shows shipping cost otherwise

**Done when:** Checkout page renders cart contents, validates inputs, submits to API, redirects on success. Tests pass.

---

### Task 3.4 — Order confirmation page

**Depends on:** 3.2

**What to build:**

`src/app/(shop)/order/[id]/page.tsx` — server component:
- Fetches `GET /api/orders/[id]`
- Shows: "Order confirmed" heading, order number, summary of items + totals, shipping address, estimated delivery note
- Account creation prompt (inline, below order summary): "Save your details for faster checkout" — links to `/login?mode=signup`
- `StatusBadge` with current status ("confirmed")
- Returns 404 page if order ID does not exist or does not belong to the current user

**Tests to write:**
- Integration: `GET /api/orders/[id]` returns correct order shape for a known seeded order

**Done when:** After a successful checkout, browser redirects to this page and shows the full order summary.

---

## Phase 4 — Auth + Account

---

### Task 4.1 — Supabase Auth: login, signup, middleware

**Depends on:** 1.2

**What to build:**
- `src/app/(shop)/login/page.tsx` — `"use client"`:
  - Email + password form
  - "Sign in" button and "Create account" toggle
  - Uses `createBrowserClient` from `@supabase/ssr` for `signInWithPassword` / `signUp`
  - On success: redirects to `?redirect` param or `/account`
  - Error: inline message below form
- `src/middleware.ts` (customer website):
  - Matcher: `['/account/:path*']`
  - Reads session cookie via server client
  - Redirects unauthenticated users to `/login?redirect=<original_path>`
- `src/app/(shop)/login/actions.ts` (optional server actions for sign-out)

**Tests to write:**
- Middleware unit test: unauthenticated request to `/account` redirects to `/login`
- Middleware unit test: authenticated request passes through

**Done when:** Visiting `/account` without a session redirects to `/login`. Logging in redirects back to account. `pnpm typecheck` passes.

---

### Task 4.2 — Account page

**Depends on:** 4.1, 3.2

**What to build:**

`src/app/(shop)/account/page.tsx` — server component (auth enforced by middleware) per `wireframes/Account.html`:
- Two-column: sidebar nav left (180px), content area right
- **Sidebar tabs:** Orders (default), Skin profile, Addresses, Settings, Sign out
- **Orders tab (default view):**
  - Fetches `GET /api/orders` for authenticated user — newest first
  - Each order row: order number, date, status (`StatusBadge`), total, "View details" link
  - `data-testid="order-row"` on each
  - Restock reminder inline on orders placed > 40 days ago: "Time to restock?"
  - Reorder button on each row
  - Empty state: "No orders yet" with "Shop now" CTA
- **Skin profile tab:**
  - Shows `skin_type` and `concerns` from user record
  - Edit mode inline (not a modal) — form with dropdowns
  - Save calls Supabase `update` on `users` table
- `src/app/(shop)/account/orders/[id]/page.tsx` — full order detail for authenticated user (re-uses `GET /api/orders/[id]`, shows all order fields including tracking info)

**Tests to write:**
- Component: `order-row` renders with `StatusBadge`, shows restock reminder for old orders

**Done when:** Logged-in user sees their order history. Skin profile is editable inline. Order detail page shows full order with status.

---

## Phase 5 — Support

---

### Task 5.1 — Support ticket API

**Depends on:** 1.2

**What to build:**
- `src/lib/schemas/support.ts`:
  - `createTicketSchema`: `{ order_id?: uuid, guest_email?: email, subject: string max(200), body: string max(5000) }` — `guest_email` required if not authenticated
- `src/app/api/support/route.ts`:
  - `POST /api/support` — validates with Zod, inserts into `support_tickets`, returns `201 { id, status: "open", created_at }`
  - `GET /api/support` — internal only (admin client), filterable by status/priority with pagination

**Tests to write:**
- Unit: `createTicketSchema` — accepts valid payload, rejects missing subject, rejects body > 5000 chars
- Integration: `POST /api/support` creates ticket with `status = "open"`
- Integration: `POST /api/support` without `guest_email` when unauthenticated returns 400

**Done when:** All tests pass. Ticket appears in Supabase `support_tickets` table after POST.

---

### Task 5.2 — Support form page (customer)

**Depends on:** 5.1, 4.1

**What to build:**

`src/app/(shop)/support/new/page.tsx` — `"use client"` per `wireframes/Account.html` §Support:
- `data-testid="support-form"` on the form element
- Fields: subject (text input), body (textarea), order reference (optional dropdown of user's orders if authenticated)
- Guest: email field required
- React Hook Form + Zod (`createTicketSchema`)
- On success: inline confirmation message with ticket ID; no redirect
- On error: inline error below submit button

**Tests to write:**
- Component: form renders with correct fields and labels
- Component: submitting without subject shows validation error
- Component: guest email field appears when user is not authenticated, hidden when authenticated

**Done when:** Support form submits successfully. Ticket created in DB. Confirmation shown inline. Tests pass.

---

## Phase 6 — Internal Platform

---

### Task 6.1 — Internal platform scaffold + staff auth

**Depends on:** 1.2

**What to build:**

A second Next.js app (or a separate route group, depending on deployment strategy — see `TDD.md` §1 for rationale on separate deployments):
- Scaffold mirrors customer website structure but at `src/app/(internal)/`
- `src/app/(internal)/login/page.tsx` — email/password form using Supabase Auth
- `src/middleware.ts` (internal platform):
  - Protects all routes except `/login`
  - Checks `user.user_metadata.role === 'staff'`
  - Redirects non-staff to `/login?error=unauthorized`
- `src/app/(internal)/dashboard/page.tsx`:
  - Overview metrics: order counts by status, recent open tickets, last 5 orders
  - Server component fetching with admin client

**Tests to write:**
- Middleware: non-staff user redirected to `/login?error=unauthorized`
- Middleware: staff user passes through

**Done when:** Staff can log in, non-staff are rejected. Dashboard renders live metrics.

---

### Task 6.2 — Internal: Product management

**Depends on:** 6.1, 2.1

**What to build:**

- `src/app/(internal)/products/page.tsx` — product list with search, filter by `is_active`, paginate. Toggle active/inactive inline.
- `src/app/(internal)/products/new/page.tsx` — add product form:
  - Fields: name, slug (auto-generated from name, editable), description, category, skin_types (multi-select), concerns (multi-select)
  - Dynamic variant rows: size_ml, price (in ₹ — convert to paise server-side), sku, initial stock. At least 1 required.
  - Dynamic ingredient rows: name, concentration, benefit, science_note, display_order
  - React Hook Form + Zod
  - On submit: calls `POST /api/products` (internal API route using admin client)
  - On success: redirects to `/products/[id]/edit`
- `src/app/(internal)/products/[id]/edit/page.tsx` — edit product:
  - Pre-fills form with existing data
  - Calls `PATCH /api/products/[id]` and `PATCH /api/products/[id]/variants/[variantId]`
  - Soft-delete button: calls `DELETE /api/products/[id]` (sets `is_active = false`)
- `src/app/api/products/route.ts` — add `POST` handler (internal only, admin client)
- `src/app/api/products/[id]/route.ts` — add `PATCH` and `DELETE` handlers (internal only)
- `src/app/api/products/[id]/variants/[variantId]/route.ts` — `PATCH` for variant stock/price

**Tests to write:**
- Integration: `POST /api/products` creates product with variants and ingredients
- Integration: `POST /api/products` returns 409 on duplicate slug
- Integration: `PATCH /api/products/[id]` updates only supplied fields
- Integration: `DELETE /api/products/[id]` sets `is_active = false` (does not hard-delete)
- Integration: `PATCH /api/products/[id]/variants/[variantId]` updates stock

**Done when:** Staff can add a new product from the internal UI and see it appear immediately on the storefront. Edit and soft-delete work. All tests pass.

---

### Task 6.3 — Internal: Order management

**Depends on:** 6.1, 3.2

**What to build:**

- `src/app/(internal)/orders/page.tsx` — order queue:
  - Table of all orders, newest first
  - Filter by status (tab bar or select)
  - Search by order number or email
  - Paginate (50 per page)
  - `StatusBadge` on each row
- `src/app/(internal)/orders/[id]/page.tsx` — order detail:
  - Full order: items, address, contact, current status, notes, tracking info
  - Status update form: dropdown of valid next states (enforced per `TDD.md` §5.4 transition table)
  - "Mark shipped" shows tracking_id and carrier inputs (required)
  - Cancel button available from `confirmed` or `processing`
  - On update: calls `PATCH /api/orders/[id]/status` (admin client)
  - Notes field: append-only staff notes

**Tests to write:**
- Integration: `PATCH /api/orders/[id]/status` with valid transition returns 200
- Integration: `PATCH /api/orders/[id]/status` with invalid transition returns 400 `INVALID_TRANSITION`
- Integration: `PATCH /api/orders/[id]/status { status: "shipped" }` without `tracking_id` returns 400

**Done when:** Staff can view the order queue, open an order, and advance its status through valid transitions. Invalid transitions are rejected. All tests pass.

---

### Task 6.4 — Internal: Support ticket management

**Depends on:** 6.1, 5.1

**What to build:**

- `src/app/(internal)/support/page.tsx` — ticket queue:
  - List all tickets, sorted by priority then created_at
  - Filter by status and priority
  - Assign-to selector (staff list)
- `src/app/(internal)/support/[id]/page.tsx` — ticket detail:
  - Read subject, body, linked order (with link to order detail if present), customer email
  - Status/priority update form
  - Assign to staff member
  - On update: calls `PATCH /api/support/[id]` (admin client)
- `src/app/api/support/[id]/route.ts`:
  - `PATCH /api/support/[id]` — updates `status`, `priority`, `assigned_to`, `notes`; sets `resolved_at` when status = "resolved"

**Tests to write:**
- Integration: `PATCH /api/support/[id] { status: "resolved" }` sets `resolved_at`
- Integration: `GET /api/support?status=open` returns only open tickets

**Done when:** Staff can view the ticket queue, open a ticket, update its status/priority/assignee, and resolve it. All tests pass.

---

## Phase 7 — Email Notifications

---

### Task 7.1 — Resend integration + email templates

**Depends on:** 3.2 (order API stubs), 5.1 (support API)

**What to build:**
- `src/lib/email/resend.ts` — initialise Resend client with `RESEND_API_KEY`
- `src/lib/email/templates/order-confirmation.tsx` — React Email template: order number, items table, total, shipping address
- `src/lib/email/templates/order-shipped.tsx` — order number, carrier, tracking ID
- `src/lib/email/templates/order-delivered.tsx` — order number, review invite
- `src/lib/email/templates/ticket-opened.tsx` — ticket ID, subject, expected response time
- `src/lib/email/templates/ticket-resolved.tsx` — ticket ID, resolution note
- `src/lib/email/send.ts` — `sendEmail(template, to, data)` wrapper — fire-and-forget, logs failures to `console.error`
- Wire `sendEmail` into:
  - `POST /api/orders` → `order-confirmation` after successful transaction
  - `PATCH /api/orders/[id]/status { status: "shipped" }` → `order-shipped`
  - `PATCH /api/orders/[id]/status { status: "delivered" }` → `order-delivered`
  - `POST /api/support` → `ticket-opened`
  - `PATCH /api/support/[id] { status: "resolved" }` → `ticket-resolved`

**Tests to write:**
- Unit: `sendEmail` calls Resend SDK with correct `to`, `subject`, and template; mock Resend client
- Unit: email send failure does not throw or affect caller (fire-and-forget verified)

**Done when:** Placing a test order triggers an order confirmation email (verified via Resend dashboard in test mode). All unit tests pass.

---

## Phase 8 — E2E Tests + Hardening

---

### Task 8.1 — Playwright E2E: 6 critical flows

**Depends on:** all previous phases

**What to build** (`src/e2e/`):

| File | Flow | Key assertions |
|---|---|---|
| `browse-and-add-to-cart.spec.ts` | PLP → PDP → add to cart → drawer opens | Cart item count increments; CartDrawer renders with item |
| `place-order.spec.ts` | Cart → checkout → order confirmation | POST /api/orders called once; redirected to `/order/[id]`; order number visible |
| `account-order-history.spec.ts` | Login → /account → order list | `data-testid="order-row"` elements visible; status badge present |
| `support-ticket.spec.ts` | /support/new → submit → confirmation | Ticket ID shown inline after submit |
| `internal-add-product.spec.ts` | Staff login → /products/new → submit → visible on storefront | New product slug appears on PLP |
| `internal-process-order.spec.ts` | Staff login → order detail → confirm → ship | Status changes from `confirmed` → `processing` → `shipped`; tracking ID saved |

All tests must use `data-testid` selectors (not CSS class selectors). Run on Chromium and mobile (iPhone 13) per `playwright.config.ts`.

**Done when:** `pnpm playwright test` exits 0 with all 6 flows passing on both Chromium and mobile viewports.

---

### Task 8.2 — Error monitoring setup

**Depends on:** 8.1

**What to build:**
- Install and configure Sentry for both Next.js apps
- `sentry.client.config.ts` and `sentry.server.config.ts`
- Wrap all API route `catch` blocks to call `Sentry.captureException(err)` before returning 500
- Add `SENTRY_DSN` to environment variables list

**Done when:** A deliberate thrown error in a test API route appears in the Sentry dashboard.

---

### Task 8.3 — Final checklist before deployment

**Depends on:** 8.2

**Checklist:**
- [ ] `pnpm typecheck` exits 0 across all source files
- [ ] `pnpm lint` exits 0 with zero warnings
- [ ] `pnpm vitest run --coverage` — unit ≥ 90%, component ≥ 80%
- [ ] `pnpm vitest run --integration` — API route coverage ≥ 80%
- [ ] `pnpm playwright test` — all 6 E2E flows pass
- [ ] No `any` types, no `// @ts-ignore`, no `test.skip`
- [ ] No hardcoded hex colours — only Tailwind tokens
- [ ] No `box-shadow` utilities used anywhere
- [ ] All prices formatted as `₹${Math.round(paise/100).toLocaleString()}`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` not present in any `NEXT_PUBLIC_*` variable or client-importable file
- [ ] All `data-testid` attributes present on every interactive element per `TESTING.md` reference table
- [ ] All 4 page states handled (loading, error, empty, unauthenticated) on every data-fetching page
- [ ] Vercel environment variables set for production (both deployments)
- [ ] Supabase production project created with same migrations applied

**Done when:** All checklist items are ticked. Deploy to Vercel.

---

## Dependency graph (summary)

```
1.1 ──┬──► 1.2 ──┬──► 2.1 ──┬──► 2.2
      │          │           ├──► 2.3
      ├──► 1.3   │           └──► 2.4
      │     └──► 1.4              │
      │           │               ▼
      │           └──► 3.1 ──► (wired in 2.2/2.3/2.4)
      │
      └──► 1.2 ──► 3.2 ──┬──► 3.3 ──► 3.4
                          └──► 4.2
                          └──► 7.1

      1.2 ──► 4.1 ──► 4.2
      1.2 ──► 5.1 ──► 5.2
      1.2 ──► 6.1 ──┬──► 6.2 (needs 2.1)
                    ├──► 6.3 (needs 3.2)
                    └──► 6.4 (needs 5.1)

      All phases ──► 8.1 ──► 8.2 ──► 8.3
```
