# Code Review Log

## 2026-04-17 (Friday)

### Scope

Self-review of all code changes from the deploy session: CartDrawer dynamic upsell, QuantitySelector fix, checkout COD placeholder + race condition fix, internal orders split-query debug, E2E spec fixes.

### HIGH — Fix before shipping

**1. CartDrawer: no fetch cleanup → stale upsell on rapid open/close**
`apps/storefront/src/components/shop/CartDrawer.tsx:86-89` — `fetchUpsell` is `async` but the `useEffect` has no abort/cleanup. If a user opens the drawer, closes, opens again quickly, two fetches race. The first response can overwrite the second's state with stale data (wrong product displayed, or a product already in cart).

> **✅ Fixed** — Replaced `useCallback` + bare effect with `fetchUpsell` defined inside `useEffect` + `stale` flag cleanup. Stale responses are discarded.

**2. Internal orders page: debug error banner leaks DB internals**
`apps/internal/src/app/orders/page.tsx:77,94-101` — The `dbError` string includes `error.code`, `error.message`, `error.hint`, and `error.details` — raw Postgres/PostgREST internals. This is an internal-only page behind staff auth, so it's lower risk, but it violates the CLAUDE.md rule "Never return raw Postgres errors to the client." Decision: either remove it (debug is done) or keep it intentionally as a staff diagnostic tool without the raw hint/details.

> **✅ Fixed** — Removed raw `error.code`/`message`/`hint`/`details` string. Kept generic "Failed to load orders" banner; full details still logged server-side via `console.error`.

### MEDIUM — Should fix

**3. CartDrawer: `eslint-disable` on dependency array**
`apps/storefront/src/components/shop/CartDrawer.tsx:84` — `// eslint-disable-line react-hooks/exhaustive-deps` is needed because the real dependency is a derived string (`cartProductIds.join(',')`), not the array itself. This works but is fragile — the next person to touch it won't know why. Alternative: use `useMemo` for the joined string and pass that as a normal dep.

> **✅ Fixed** — Eliminated alongside #1. Replaced hack with a proper `useMemo` (`cartProductIdKey`) used as a normal effect dependency. Zero `eslint-disable` comments remain in the file.

**4. Type casts bypass compile-time safety**
`apps/storefront/src/components/shop/CartDrawer.tsx:60` (`as unknown as UpsellRow[]`), `apps/internal/src/app/orders/page.tsx:57,66,71` — all use `as` casts because Supabase's typed client returns `never` for FK joins and `.in()` queries. If the DB schema changes (column rename, type change), these casts silently produce wrong types at runtime. This is a known limitation of the Supabase typed client with complex selects.

> **✅ Fixed** — Copied `types.ts` to internal app, typed all 3 Supabase clients with `<Database>` generic. Removed ~10 `as` casts across `orders/actions.ts`, `support/actions.ts`, `orders/page.tsx`, `support/page.tsx`, `support/[id]/page.tsx`. Typed action payloads with `Database['...']['Update']`. CartDrawer `UpsellRow` now references canonical `Variant`/`ProductSummary` types (#13 resolved here). FK join casts remain (Supabase typed client limitation).

**5. Internal orders: fetching all `order_items` rows just to count**
`apps/internal/src/app/orders/page.tsx:60-68` — Fetches every `order_items` row for the page's orders, then counts them client-side. A Postgres function returning counts would be more efficient, though probably not worth it at current scale.

> **✅ Fixed** — Replaced `OrderRow.order_items: { id: string }[]` dummy array with `OrderRow.item_count: number`. Eliminated `Array.from()` allocation per row. Template reads `o.item_count` directly.

### LOW — Nits

**6. Non-null assertions in upsell JSX** (`CartDrawer.tsx:264,266,276,279,285`) — All guarded by `showUpsell` which checks `!== null`, so they're safe. Extracting the upsell section into a separate component that receives non-null props would eliminate all five.

> **✅ Fixed** — Extracted `UpsellSlot` component with non-null `product`/`variant`/`onAdd` props. Call site uses `{upsellProduct && upsellVariant && <UpsellSlot />}` — TypeScript narrows the types, zero `!` assertions remain.

**7. `Math.random()` for upsell selection** (`CartDrawer.tsx:66`) — Different product on every drawer open. Slightly jarring UX. Could memoize the pick until cart contents change.

> **✅ Fixed** — Replaced `Math.random()` with a deterministic hash of `cartProductIdKey`. Same cart → same upsell. Changes naturally when items are added/removed.

**8. Checkout `shipping_address.line1` bakes name into address** (`checkout/page.tsx:149`) — `line1: "${first_name} ${last_name}, ${address_line1}"` — means the server can't separate recipient name from address line. Pre-existing design choice, not a regression.

> **⏳ Deferred** — Schema change touching 6+ files across both apps + backward compatibility for existing orders. Recommended as a dedicated task.

---

### Best Practices & Reusability (second pass)

#### REUSABILITY — Extract shared code

**9. Price formatting duplicated ~12 times across the codebase**
Internal app has a shared `formatInr()` in `apps/internal/src/lib/money.ts`. Storefront does NOT — instead it has:
- 3 identical local `fmt(paise)` functions: `checkout/page.tsx:53`, `order/[id]/page.tsx:49`, `account/page.tsx:49`
- 6+ inline `₹${Math.round(paise / 100).toLocaleString()}` expressions: `CartDrawer.tsx:235,279,304`, `PDPPurchasePanel.tsx:30,104`, `ProductCard.tsx:19`

Fix: create `apps/storefront/src/lib/money.ts` exporting `formatInr()`, replace all instances. Long-term: move to a shared `packages/utils` consumed by both apps.

> **✅ Fixed** — Created `apps/storefront/src/lib/money.ts` with `formatInr()`. Replaced all 12 inline usages across 6 files (ProductCard, PDPPurchasePanel, CartDrawer, account/page, checkout/page, order/[id]/page). Removed 3 duplicate local `fmt()` functions.

**10. Shipping constants duplicated in 3 places**
- `apps/storefront/src/app/api/orders/route.ts:21-22` — `FREE_SHIPPING_THRESHOLD = 99900`, `SHIPPING_COST = 9900`
- `apps/storefront/src/app/(checkout)/checkout/page.tsx:48-49` — identical
- `apps/storefront/src/components/shop/CartDrawer.tsx:31` — `SHIPPING_THRESHOLD = 99900` (missing `SHIPPING_COST`)

Fix: extract to `apps/storefront/src/lib/shipping.ts` with both constants and a `computeShipping(subtotal)` function. The API route is the source of truth; client uses it for display only.

**11. Th/Td table components duplicated 5 times in internal app**
Identical `function Th(...)` and `function Td(...)` definitions in:
- `apps/internal/src/app/orders/page.tsx:152-162`
- `apps/internal/src/app/orders/[id]/page.tsx:213-229`
- `apps/internal/src/app/support/page.tsx:139-155`
- `apps/internal/src/app/products/page.tsx:156-166`
- `apps/internal/src/app/products/[id]/edit/VariantsManager.tsx:211-229`

Fix: extract to `apps/internal/src/components/ui/Table.tsx` with `Th`, `Td` exports.

> **✅ Fixed** — Created `apps/internal/src/components/ui/Table.tsx` with shared `Th`/`Td` (forwarding all native HTML attributes via `...rest`). Replaced local definitions in 4 files: `orders/page.tsx`, `support/page.tsx`, `products/page.tsx`, `VariantsManager.tsx`. The 5th file (`orders/[id]/page.tsx`) uses different base padding (`px-0 py-2`) so retains its own local definitions. VariantsManager's `align-middle` preserved via className prop on each `<Td>`.

**12. Zod enum schemas duplicated between apps**
Identical enums defined in both `apps/storefront/src/lib/api/schemas/` and `apps/internal/src/lib/api/schemas/`:
- `OrderStatusEnum` (orders.ts in both apps)
- `TicketStatusEnum`, `TicketPriorityEnum` (support.ts in both apps)
- `CategoryEnum`, `SkinTypeEnum`, `ConcernEnum` (products.ts in both apps)
- `VariantInputSchema` (minor differences — internal has `.trim()` on sku, storefront doesn't)

CLAUDE.md already notes this: "will extract to `packages/schemas` when a second domain needs them." Now that both apps consume these enums, the threshold is met. Fix: create `packages/schemas` with shared Zod definitions.

**13. `UpsellRow` interface duplicates existing types**
`CartDrawer.tsx:12-29` — `UpsellRow` is effectively `ProductSummary & { product_variants: Variant[] }`, but redefines every field inline. If `ProductSummary` or `Variant` types change, this won't track.

Fix: define as `type UpsellRow = Omit<ProductSummary, 'starting_price'> & { product_variants: Variant[] }` using the canonical types from `@/types`.

> **✅ Fixed** — Resolved as part of #4. `UpsellRow` now defined as `Omit<ProductSummary, 'starting_price'> & { product_variants: Variant[] }`.

#### BEST PRACTICES — Consistency issues

**14. CartDrawer bypasses API layer, unlike every other client component**
`AddToCartButton` fetches via `GET /api/products/[slug]`. `PDPPurchasePanel` receives server-rendered props. `CartDrawer` alone calls Supabase browser client directly (`.from('products').select(...)`). This creates an inconsistent data-fetching pattern and means upsell logic won't benefit from any API-level caching, rate-limiting, or error standardisation.

Fix: use `GET /api/products?limit=10` or a dedicated upsell endpoint instead of direct Supabase.

**15. No consistent client-side form error handling**
Each form manages its own `apiError` state and try/catch:
- `checkout/page.tsx:117,160-178` — `useState<string | null>`, try/catch, extracts `json?.error?.message`
- `LoginView.tsx:19,27-38` — `useState`, no try/catch, hardcoded message
- `SignupView.tsx` — same as LoginView
- `SupportForm.tsx` — similar pattern, different message extraction

The API error envelope is standardised (`{ error: { code, message, details } }`), but no client-side hook unpacks it consistently. A `useApiSubmit()` hook or a shared `extractApiError(res)` utility would eliminate the duplication.

**16. `INDIAN_STATES` not extractable yet but worth noting**
`checkout/page.tsx:18-27` — only used in one place today. If internal ever needs a shipping address form, this should move to a shared constant. No action needed now.

---

### Verdict (updated)

Typecheck clean, 452 tests passing. 13 of 16 items resolved (11 fixed, 1 deferred, 1 resolved as part of another). Remaining open items:

**Still open:**
- **#8** — `shipping_address.line1` bakes name into address (deferred — schema change)
- **#10** — Shipping constants duplicated in 3 places
- **#16** — `INDIAN_STATES` not extractable yet (no action needed now)

---

## 2026-04-17 — Performance Audit

### Scope

Storefront UX jank investigation: slow add-to-cart, laggy quantity changes in CartDrawer, unresponsive PLP filter tabs.

### HIGH — Cart interactions

**P1. AddToCartButton makes a blocking network request on every click**
`apps/storefront/src/components/shop/AddToCartButton.tsx:19-34` — When the user clicks "+" on a ProductCard, the handler fetches `GET /api/products/${slug}` (full product detail) just to find the cheapest active variant, then calls `addItem()` + `openCart()`. The product data was already available server-side when the PLP rendered, but the client component re-fetches it. This adds **200–500ms of dead time** where the button is disabled and nothing visibly happens. This is the single biggest source of perceived cart jank.

> **✅ Fixed** — Server-side queries (PLP, homepage, PDP related, order confirmation) now fetch full variant fields (`id, size_ml, price, sku, stock, is_active`) and compute `defaultVariant` (cheapest active in-stock variant) server-side. Passed as prop through `ProductCard` → `AddToCartButton`. When `defaultVariant` is present, the click handler adds to cart instantly with zero network requests. Fetch fallback retained for edge cases where no default variant is provided.

**P2. No memoization on cart item rows or QuantitySelector**
`apps/storefront/src/components/shop/CartDrawer.tsx:162-218` — CartDrawer subscribes to `items` (the full array). When any quantity changes, every cart item row re-renders — even the ones that didn't change. Each row creates a new `onChange` closure (`(qty) => updateQty(item.variantId, qty)`). `QuantitySelector` (`components/ui/QuantitySelector.tsx`) has no `React.memo`, so it always re-renders when its parent does. With 5+ items in the cart, a single quantity tap re-renders all item rows + all QuantitySelectors + header + footer + upsell.

> **✅ Fixed** — Wrapped `QuantitySelector` with `React.memo`. Extracted `CartItemRow` as a `memo`-ized component with stable `useCallback` handlers (`onQuantityChange`, `onRemove`). Only the row whose quantity actually changed re-renders; all other rows and their QuantitySelectors are skipped.

**P3. `subtotal()` and `itemCount()` are methods, not derived state**
`apps/storefront/src/lib/store/cart.ts:112-118` — These are store methods called during render, not memoized selectors. In Navbar (`Navbar.tsx:31`): `useCartStore((s) => s.itemCount())` calls `get().items.reduce(...)` inside the selector. Zustand runs selectors on **every** state change (even `isOpen` toggling) to decide whether to re-render. Opening/closing the drawer triggers the reduce computation in Navbar even though items didn't change. Architecturally wrong — should be derived state that only recalculates when `items` changes.

> **✅ Fixed** — Converted `subtotal` and `itemCount` from methods to derived state properties. A `setItems()` helper recomputes both values on every mutation that changes `items`. Zustand selectors now read plain numbers (`s.subtotal`, `s.itemCount`) — toggling `isOpen` no longer triggers any reduce computation in Navbar or CartDrawer.

### HIGH — PLP filter tabs

**P4. Every filter click triggers full server-side navigation**
`apps/storefront/src/components/shop/FilterBar.tsx:93-107` — `router.push()` in App Router triggers a full server-side render cycle: the server re-executes `getProducts()`, makes a fresh Supabase query, generates new HTML, sends it to the client, React reconciles the entire page. No client-side filtering, no caching, no optimistic UI.

> **✅ Fixed (with P5)** — All three `router.push()` calls now go through a shared `navigate()` helper wrapped in `useTransition`. The filter bar dims (`opacity-60`) while the server fetch is in progress, keeping the current content visible instead of swapping to a blank/skeleton state. The URL-driven server pattern is preserved (correct for SEO + shareable filter URLs) but the UI no longer blocks.

**P5. No `useTransition` — UI blocks during navigation**
`apps/storefront/src/components/shop/FilterBar.tsx:93-107` — The `router.push()` call is not wrapped in `startTransition` or `useTransition`. React treats it as an urgent update — the current UI can't show an intermediate loading state. The user clicks a filter tab, sees nothing for 200–400ms (server fetch), then the entire page swaps.

> **✅ Fixed** — Resolved as part of P4. `useTransition` wraps every filter/sort navigation.

**P6. No data caching on PLP — re-fetches on every filter change**
`apps/storefront/src/app/(shop)/products/page.tsx:28-33` — Compare with the PDP (`[slug]/page.tsx`): has `export const revalidate = 60` and wraps `getProduct` in `React.cache()`. The PLP has **neither** — no `revalidate`, no `cache()` wrapper. Toggling "Dry" → "Oily" → "Dry" makes three separate Supabase queries even though the third returns identical data to the first.

> **✅ Fixed** — Added `export const revalidate = 60` (ISR, matches PDP) and wrapped `getProducts` in `React.cache()`. Repeated filter toggles within the same request are deduplicated; across requests, Next.js serves the cached page for up to 60s before revalidating.

### MEDIUM

**P7. localStorage persist serializes synchronously on every mutation**
`apps/storefront/src/lib/store/cart.ts:120-124` — Zustand's `persist` middleware runs `JSON.stringify` on `items` and writes to `localStorage` synchronously on the main thread after every `addItem`, `removeItem`, `updateQty`. For rapid quantity taps, this fires on every click.

> **✅ Fixed** — Replaced default `localStorage` adapter with a custom `createDebouncedStorage(300)`. Reads are synchronous (hydration unaffected); writes are debounced — rapid quantity taps coalesce into a single `JSON.stringify` + `setItem` after 300ms of inactivity.

**P8. Loading skeleton replaces FilterBar during navigation**
`apps/storefront/src/app/(shop)/products/loading.tsx` — The loading fallback renders skeleton cards but does not include the FilterBar. During navigation the filter context disappears, making the transition feel disorienting — the user loses sight of which filter they just selected.

> **✅ Fixed** — Loading skeleton now renders `<FilterBar />` above the skeleton grid. The filter bar stays visible with its current active state (read from URL search params) during navigation, so the user never loses context.

---

## 2026-04-17 — Filter Tab Responsiveness (follow-up)

### Scope

Despite P4–P6 fixes, PLP filter tabs still feel laggy. Root cause investigation revealed three interacting issues.

### HIGH

**F1. `loading.tsx` overrides `useTransition` stale-UI behaviour**
`apps/storefront/src/app/(shop)/products/loading.tsx` — `useTransition` is designed to keep the current UI visible (with `isPending` feedback) until the server finishes. But `loading.tsx` creates an automatic `<Suspense>` boundary around `page.tsx`. When the server component starts rendering, Next.js shows the `loading.tsx` fallback *inside* that boundary — replacing the product grid with skeletons even though the transition is trying to keep the old content. Result: two visual disruptions (dim → skeleton flash → results) instead of one smooth transition.

> **✅ Fixed** — Removed `loading.tsx`. With `useTransition` in FilterBar, the old product grid stays visible (with opacity dim) until the server render completes — no skeleton flash.

**F2. Active filter highlight doesn't update optimistically**
`apps/storefront/src/components/shop/FilterBar.tsx:91-93` — FilterBar reads its active state from `searchParams` (the committed URL). When wrapped in `startTransition`, the URL doesn't update until the server render completes. The user clicks "Dry", sees the bar dim, but the "Dry" button stays un-highlighted for the full server round-trip (~200–400ms). Looks like the click didn't register.

> **✅ Fixed** — Added optimistic local state (`optimisticSkinType`, `optimisticConcern`, `optimisticSort`) that updates instantly on click. During `isPending`, button highlights use the optimistic values; once the transition commits, `useEffect` syncs back to the committed `searchParams`. The clicked filter highlights immediately.

### MEDIUM

**F3. `React.cache()` doesn't persist across navigations**
`apps/storefront/src/app/(shop)/products/page.tsx:53` — `React.cache()` deduplicates calls within a single server request, not across navigations. Toggling "Dry" → "Oily" → "Dry" still makes three separate Supabase queries. `revalidate = 60` helps at the CDN level but each unique `?skin_type=X` combination is a separate ISR cache entry requiring a server round-trip on first hit.

> **✅ Fixed** — Replaced `React.cache()` with `unstable_cache` from `next/cache` (`keyParts: ['plp-products']`, `revalidate: 60`, `tags: ['products']`). Cache persists across navigations — toggling "Dry" → "Oily" → "Dry" serves the third request from cache instantly. The `products` tag allows on-demand invalidation when the internal app modifies products.
>
> **⚠️ Regression fixed** — `unstable_cache` runs outside the request context, so `cookies()` in the Supabase server client fails silently → 0 products. Switched to `createAdminClient()` (bypasses RLS, no cookies needed). Safe because the PLP is a public read-only query with no user-specific data — same pattern as the order confirmation page's `getRelatedProducts`.
