# CLAUDE.md — D2C Skincare Platform

## Read first, every session

Before starting any task, read all documents relevant to it:

1. `DESIGN_SYSTEM.md` — all UI decisions
2. `TDD.md` — API contracts, schema, workflows, constraints
3. `tailwind.config.ts` — available design tokens
4. `wireframes/[page].html` — layout spec for the page being built

If a file required for the current task is missing, stop and report:
- the missing file path
- why it is required for this task
- what decision is blocked

Do not stop for files that are irrelevant to the current task.

---

## Source of truth and conflict resolution

When sources conflict, this order of authority applies:

1. `TDD.md` — product behaviour, data rules, API contracts, schema constraints
2. `DESIGN_SYSTEM.md` — visual system, UI patterns, interaction rules
3. `wireframes/[page].html` — page-specific layout, hierarchy, hard constraints
4. `tailwind.config.ts` — allowed design tokens

If any two sources conflict, **stop and report the conflict before implementing**. Do not guess. Do not pick one silently.

---

## Wireframes

Every customer-facing page has an annotated HTML wireframe in `wireframes/`.

| File | Page | Route |
|---|---|---|
| `wireframes/home.html` | Homepage | `/` |
| `wireframes/plp.html` | Product listing | `/products` |
| `wireframes/pdp.html` | Product detail | `/products/[slug]` |
| `wireframes/cart.html` | Cart drawer | overlay component |
| `wireframes/checkout.html` | Checkout + order confirmation | `/checkout` · `/order/[id]` |
| `wireframes/account.html` | Account + support form | `/account` · `/support/new` |

**How to use them:**
- Read the wireframe for the page being built before writing any JSX
- The top comment block contains: component path, auth requirement, data fetched, and hard constraints
- Yellow `wf-note` blocks are instructions — implement them, do not copy them into production code
- Every `data-testid` mentioned in a wireframe must appear in the final implementation
- Wireframe constraints (e.g. "no carousel", "max 3 items", "never a modal") are binding product decisions, not suggestions

---

## Stack

Next.js 14 (App Router) · TypeScript strict · Tailwind CSS · Supabase · Zustand · React Hook Form + Zod · Resend · Vercel

---

## Commands

```bash
# Workspace layout: apps/storefront (port 3000) · apps/internal (port 3001)
# Shared: supabase/ migrations at repo root (one DB for both apps)

pnpm dev                                         # start storefront (port 3000)
pnpm dev:internal                                # start internal console (port 3001)
pnpm build                                       # build all workspaces
pnpm typecheck                                   # typecheck all workspaces
pnpm lint                                        # lint all workspaces
pnpm test                                        # unit + component tests across workspaces
pnpm test:integration                            # storefront integration tests (requires local Supabase)
pnpm e2e                                         # storefront Playwright E2E

# Scope a command to one app:
pnpm -F storefront <script>
pnpm -F internal <script>

supabase start                                   # spin up local Supabase
supabase db reset                                # apply migrations + seed test data
```

**CI order (all steps must pass before merge):**
`typecheck` → `lint` → `vitest run` → `supabase start + db reset` → `vitest run --integration` → `playwright test`

---

## Hard rules

**Design**
- No hardcoded hex values — Tailwind tokens from `tailwind.config.ts` only
- No `box-shadow` anywhere — borders communicate elevation; this includes no shadow utilities on cards, inputs, or overlays
- Default radius is `rounded-sm` (2px) — exceptions are defined in `DESIGN_SYSTEM.md`; when in doubt use `rounded-sm`
- Font weights: `font-normal` (400) and `font-medium` (500) for body/UI; `font-bold` (700) only for `font-heading` elements
- Prices display as `₹${Math.round(paise / 100).toLocaleString()}`

**TypeScript**
- `strict: true` — no `any`, no `// @ts-ignore`

**Zustand persist + SSR hydration**
- Any component that reads from a `persist`-ed Zustand store and renders it into the DOM **must** use a `mounted` guard to avoid a hydration mismatch.
- Pattern (use in every component that renders persisted store values):
  ```tsx
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const valueRaw = useStore((s) => s.someValue)
  const value = mounted ? valueRaw : defaultValue   // 0, null, [], etc.
  ```
- Root cause: Zustand's `persist` middleware rehydrates from `localStorage` synchronously on the client's first render. The server has no `localStorage`, so it renders the default. The client renders the real persisted value — mismatch.
- Affected so far: `Navbar` cart badge (`cartCount`).

**Components**
- Server components by default — `"use client"` only for state, event handlers, or browser APIs
- Shared UI components live in `components/ui/` — domain components in `components/shop/` and `components/layout/`
- Before creating a new component: search for an existing one, extend if possible, only create new if nothing fits, place it in the correct shared location
- Never recreate a component that already exists in the shared library

**Page states — every data-fetching page must handle all four:**
- **Loading** — render `SkeletonCard` components, never a spinner
- **Error** — render an inline alert with a retry button; never a full-page error for partial failures
- **Empty** — render a meaningful empty state with a next action; never a blank page
- **Unauthenticated** — middleware redirects to `/login`; do not handle in component

**Database**
- Prices are integers in paise — never floats
- Never hard-delete — use `is_active = false` or `status = 'cancelled'`
- Snapshot `product_name`, `variant_sku`, `unit_price` into `order_items` at order time
- Order creation + stock decrement must be one atomic Postgres transaction
- Critical invariants must be enforced at the database boundary — use constraints, foreign keys, CHECK clauses, RLS, and SQL/RPCs over client-orchestrated multi-step writes

**API routes**
- Validate with Zod before any DB call
- Always return the standard error envelope: `{ error: { code, message, details } }`
- Never return raw Postgres errors to the client — map to error codes

**Security**
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, never in `NEXT_PUBLIC_*`, never logged, never in client bundles
- Admin client (`lib/supabase/admin.ts`) — internal platform API routes only; never import in any file reachable by the browser
- RLS is active on all user-facing tables — never rely on application-layer checks alone

---

## Commerce invariants — never trust client values

This is the most critical rule for this codebase.

- **Never trust client-submitted price, subtotal, discount, shipping, tax, stock, or order total**
- All money values must be computed server-side from trusted database records
- The client may send only identifiers (`variant_id`, `product_id`) and `quantity` — nothing else
- Never trust client-submitted `user_id`; always derive identity from the authenticated session
- Stock validation and decrement must happen atomically in a single server-side transaction
- Order total sent to the client is for display only — the server recomputes it on every write

Violation of these rules creates exploitable vulnerabilities. There are no exceptions.

---

## Supabase clients

Three clients — use the correct one. Never mix them.

```typescript
// Browser — client components, hooks, Zustand
import { createBrowserClient } from '@supabase/ssr'

// Server — server components, API routes, server actions
import { createServerClient } from '@supabase/ssr'

// Admin — bypasses RLS entirely — internal platform API routes ONLY
import { createClient } from '@supabase/supabase-js' // uses SERVICE_ROLE_KEY
// Never import this in any file that could be bundled for the browser
```

---

## Accessibility

- Use semantic HTML — `<button>` not `<div onClick>`, `<nav>` not `<div>`, `<main>` not `<div>`
- All interactive elements must be keyboard accessible (focusable, operable with Enter/Space)
- Every `<input>` must have an associated `<label>` and linked error message (`aria-describedby`)
- Use visible focus styles from design tokens — do not suppress `:focus-visible`
- Drawers, modals, and overlays must trap focus and restore it on close
- Do not use clickable `div` or `span` — use `<button>` or `<a>` with correct semantics
- Images must have descriptive `alt` text; decorative images use `alt=""`

---

## Testing

| Layer | Tool | What to cover |
|---|---|---|
| Unit | Vitest | Zod schemas, cart store, utils, status transitions |
| Component | Vitest + RTL | Render, interact, assert on text/roles/`data-testid` |
| Integration | Vitest + local Supabase | API routes — request → DB → response |
| E2E | Playwright | 6 critical flows (see `TESTING.md`) |

**For every new API route, write:**
1. Unit test for the Zod schema — valid input and each rejection case
2. Integration test — success case
3. Integration test — validation failure (400)
4. Integration test — auth failure if the route is protected (401/403)
5. Integration test — domain error case (409, 404, etc.)

**Rules:**
- Write tests alongside the implementation — never after
- Assert on `data-testid` and roles, not Tailwind class names
- Never use `test.skip` — fix or delete
- Add `data-testid` to every interactive element as you build

Full setup, examples, and CI pipeline in `TESTING.md`.

---

## Definition of done

A task is not complete unless all of the following are true:

- [ ] Implementation matches the relevant wireframe and all documented constraints
- [ ] No hardcoded visual values — design tokens only
- [ ] All four page states handled where applicable: loading, error, empty, unauthenticated
- [ ] All external inputs validated with Zod at the API boundary
- [ ] Commerce values (price, total, stock) computed server-side only
- [ ] Required tests written and passing at the correct layer
- [ ] No TypeScript errors (`pnpm typecheck` passes)
- [ ] No lint errors (`pnpm lint` passes)
- [ ] No placeholder or mock data in production code unless explicitly requested
- [ ] Accessibility requirements met: semantic HTML, keyboard access, labels, focus states
- [ ] `data-testid` added to all interactive elements

---

## Build progress

| Task | Status | Notes |
|---|---|---|
| 1.1 Project scaffold | `[x]` done | Next.js 14, Tailwind, ESLint, Prettier, Vitest, Playwright all configured. `pnpm typecheck`, `lint`, `vitest run` all pass. |
| 1.2 Supabase schema, RLS, typed client | `[x]` done | Migrations in `supabase/migrations/`. Run `pnpm db:start && pnpm db:reset` (requires Docker). Types hand-authored; regenerate with `pnpm db:types` after first `db:start`. |
| 1.3 Design system atoms | `[x]` done | Button, Badge, Input, SkeletonCard, Alert, ScienceTag, IngredientTag, ScienceCallout in `components/ui/`. Error color token added to tailwind.config.ts. 62 tests passing. |
| 1.4 Navbar + Footer | `[x]` done | Navbar (sticky, scroll-aware, mobile hamburger, cart badge stub) + Footer (4-col grid) in `components/layout/`. Shop layout in `app/(shop)/layout.tsx`. 94 tests passing. |
| 2.1 Inventory API | `[x]` done | GET/POST /api/products, GET/PATCH/DELETE /api/products/[id], GET /api/products/[id]/stock, PATCH /api/products/[id]/variants/[variantId]. Zod schemas in lib/api/schemas/products.ts. 34 schema unit tests + integration test suite. |
| 2.2 Homepage | `[x]` done | Hero, philosophy strip, featured products (ISR 60s, server component), ingredient spotlight, press strip, newsletter. ProductCard + AddToCartButton stub + NewsletterForm (React state + Zod). 151 tests passing. |
| 2.3 PLP | `[x]` done | FilterBar (URL-driven, single-select skin_type + concern, sort select), product grid (4-col), pagination, empty state, quiz CTA. EmptyState UI atom added. 174 tests passing. |
| 2.4 PDP | `[x]` done | Two-column layout, image gallery, PDPPurchasePanel (variant pills, qty, add-to-cart stub), ReviewsSection (load more), full ingredients list, related products. QuantitySelector + ReviewBar atoms added. generateMetadata + JSON-LD breadcrumb. 212 tests passing. |
| 3.1 Cart store + CartDrawer | `[x]` done | Zustand store (persist items, not isOpen). CartDrawer: focus trap, backdrop, upsell (Night Repair Cream hardcoded), sticky footer, free shipping ≥ ₹999. AddToCartButton fetches variant on click. PDPPurchasePanel + Navbar wired. 253 tests passing. |
| 3.2 Order API | `[x]` done | POST/GET /api/orders, GET /api/orders/[id], PATCH /api/orders/[id]/status. Atomic order creation via SECURITY DEFINER RPC (migration 004). Zod schemas in lib/api/schemas/orders.ts. Free shipping ≥ ₹999. Status machine enforced. 285 tests passing. |
| 3.3 Checkout page | `[x]` done | /checkout: React Hook Form + Zod, minimal navbar, two-col layout (form + sticky summary), state dropdown, promo UI (Phase 2). /order/[id]: server component, hero, info strip, account incentive UI, order items, related products, Footer. `(checkout)` route group with bare layout. Input updated to forwardRef for RHF compatibility. 303 tests passing. |
| 3.4 Order confirmation | `[x]` done | Covered in 3.3 — /order/[id] page. |
| 4.1 Auth (login/signup/middleware) | `[x]` done | `(auth)` route group with `/login` + `/signup` (RHF + Zod). `src/middleware.ts` protects `/account/*` via `updateSession` helper; redirects to `/login?next=…`. Navbar account icon shows initials when authed, `/login` when not. useAuthUser hook subscribes to session. 324 tests passing. |
| 4.2 Account page | `[x]` done | `/account` server component with sidebar (initials, email, Orders, Support, Sign out) + content (order history, restock reminder, skin profile). Orders joined with `order_items`; live variants fetched for reorder. Client islands: `SignOutButton`, `ReorderButton` (uses new `cart.addItems`), editable `SkinProfileForm` → PATCH `/api/account/profile` (admin client update, session-derived id). `StatusBadge` ui atom added. 342 tests passing. |
| 5.1 Support ticket API | `[x]` done | POST `/api/support` (public — auth or guest; server-derived identity), GET `/api/support` (internal, service-role), PATCH `/api/support/[id]` (internal, stamps/clears `resolved_at`, accepts `notes`). Zod schemas in `lib/api/schemas/support.ts`. Migration 005 adds `support_tickets.notes` (staff-only, never surfaced publicly). Unit + integration test suite covers guest/auth create, service-role gates, status transitions, 404, notes update. |
| 5.2 Support form | `[x]` done | `/support/new` — server component fetches session + user's orders for dropdown. `SupportForm` client island: RHF + Zod; email readonly when authed, input for guests; order dropdown (authed, sends `order_id` UUID) or text input (guest, prepended as "Order reference:" to body since API rejects guest `order_id`); 5000-char counter; inline success state (no redirect) showing first 8 chars of ticket id. 371 tests passing. |
| 6.1 Internal platform scaffold | `[x]` done | **Repo is now a pnpm workspace.** Storefront moved to `apps/storefront/`; new `apps/internal/` (Next.js 14, port 3001) with staff auth. Shared `supabase/` migrations stay at repo root (one DB). Internal has its own Supabase client helpers (browser/server/admin/middleware) — untyped for now; extract to `packages/db` when 6.2 needs typed writes. Role gate = `app_metadata.role === 'staff'` OR `user_metadata.role === 'staff'` (per TDD §8.3). `src/middleware.ts` protects every path except `/login`; non-staff → `/login?error=unauthorized`; no session → `/login?next=…`. `/dashboard` placeholder with email display + sign-out + nav cards to Products/Orders/Support. 15 new tests (LoginSchema, `isStaff` helper, `LoginForm`). Root scripts delegate: `pnpm dev` → storefront, `pnpm dev:internal` → internal, `pnpm typecheck`/`lint`/`test` run across the workspace. **Internal needs its own `apps/internal/.env.local`** with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. |
| 6.2 Internal product management | `[x]` done | Internal writes go through **local server actions using the admin client** (no HTTP coupling to storefront). Zod schemas in `apps/internal/src/lib/api/schemas/products.ts` mirror storefront; will extract to `packages/schemas` when a second domain needs them. Server actions (`apps/internal/src/app/products/actions.ts`): `createProductAction`, `updateProductAction`, `toggleProductActiveAction`, `addVariantAction`, `updateVariantAction` — each guarded by `requireStaff()` (defence-in-depth over middleware). SKU uniqueness conflicts map to `CONFLICT`; product creation rolls back on variant-insert failure. Pages: `/products` (server-rendered table · search by name/slug · category + visibility filters · pagination · inline Deactivate/Activate), `/products/new` (RHF + `useFieldArray` for variants, auto-slug on name blur), `/products/[id]/edit` (details form + variants table with inline price/stock/active edits + add-variant form). Shared `ConsoleHeader` extracted; dashboard refactored to use it. 23 new Zod schema tests — total internal 38, storefront 371. |
| 6.3 Internal order management | `[x]` done | Same pattern as 6.2 — local server action + admin client. `OrderStatusEnum` + `VALID_TRANSITIONS` machine duplicated in `apps/internal/src/lib/api/schemas/orders.ts`; `UpdateOrderStatusSchema` enforces tracking_id + carrier when `status=shipped`. `updateOrderStatusAction` validates the transition server-side before updating; returns `INVALID_TRANSITION` if blocked. Pages: `/orders` (server-rendered table · search by `order_number` or `contact_email` · status filter · pagination · 25/page), `/orders/[id]` (items table with subtotal/shipping/total, customer + shipping-address + fulfilment panels, `StatusTransitionForm` client island that shows only allowed next states from the current status and reveals carrier+tracking inputs when the target is `shipped` or current is shipped). `OrderStatusBadge` + `formatInr(paise)` helpers added. 13 new schema/machine tests — internal 51 total, storefront 371. |
| 6.4 Internal ticket management | `[x]` done | Local server actions + admin client, same pattern as 6.2/6.3. `apps/internal/src/lib/api/schemas/support.ts` ports `TicketStatusEnum`, `TicketPriorityEnum`, `UpdateTicketSchema` (refine: at least one field), `ListTicketsQuerySchema`. Actions: `updateTicketAction` (stamps `resolved_at` when moving to `resolved`, clears it when reopening to non-closed states — `closed` preserves the last timestamp), `assignToMeAction` (derives staff id from session — never trusts the client), `unassignAction`. Pages: `/support` (server-rendered table · status + priority filters · search on subject / guest_email · pagination · 25/page), `/support/[id]` (message panel with preserved whitespace, linked-order panel that deep-links to `/orders/[id]`, assignment panel, update form with status/priority/notes + counter + Assign-to-me/Unassign). `TicketStatusBadge` + `TicketPriorityBadge` added. 14 new schema tests — internal 65 total, storefront 371. **Phase 6 complete.** |
| 7.1 Email (Resend + templates) | `[x]` done | New workspace package **`packages/email`** (`@d2c/email`) — first shared package, consumed via `transpilePackages: ['@d2c/email']` in both apps' `next.config.mjs`. `sendEmail()` wraps the Resend SDK: when `RESEND_API_KEY` is unset it logs a one-line dev preview to stdout and no-ops (keeps local dev unblocked); when set, sends via Resend and swallows errors so callers can safely `void` the call. Five HTML templates (inline styles, email-client safe) + `layout()` shared shell: `order-confirmation`, `order-shipped`, `order-delivered`, `ticket-opened`, `ticket-resolved`. All user-supplied strings pass through `escape()`. Wiring: storefront `POST /api/orders` → order-confirmation (fire-and-forget, non-blocking); storefront `POST /api/support` → ticket-opened (uses `user.email` for authed, `guest_email` for guests); internal `updateOrderStatusAction` fires `order-shipped` on transition to `shipped` (requires tracking + carrier from the refined schema) and `order-delivered` on `delivered`; internal `updateTicketAction` fires `ticket-resolved` on transition to `resolved` (looks up user email via admin client when the ticket belongs to a registered user). **New env vars**: `RESEND_API_KEY` (server-only, both apps) and `EMAIL_FROM` (defaults to `D2C <onboarding@resend.dev>`) — optionally `NEXT_PUBLIC_BASE_URL` for the order-confirmation CTA. 15 new email tests (template renders + `sendEmail` dev no-op). Total: 451 tests across the workspace (371 storefront, 65 internal, 15 email). |
| 8.1 Playwright E2E (6 flows) | `[x]` done | Playwright config in `apps/storefront/playwright.config.ts` orchestrates **both apps as webServers** (storefront :3000, internal :3001). `src/e2e/global-setup.ts` upserts two deterministic Supabase auth users via admin client and saves signed-in `storageState` files to `src/e2e/.auth/{customer,staff}.json` (gitignored): customer (`e2e-customer@d2c.test`) and staff (`e2e-staff@d2c.test`, `app_metadata.role = 'staff'`). **6 specs** matching TESTING.md table: `browse-and-add-to-cart` (PLP → PDP → variant pill → Add → drawer), `place-order` (pre-loads `cart-storage` Zustand key in localStorage → fills checkout form → asserts `/order/[id]` + `confirmation-hero`), `account-order-history` (uses customer storageState → asserts sidebar + either `order-row` or empty state), `support-ticket` (guest ticket → `support-success` + 8-char ticket id), `internal-add-product` (staff storageState → `/products/new` on :3001 → create with unique slug → asserts storefront PLP lists it), `internal-process-order` (creates order via storefront API → staff walks it confirmed→processing→shipped on :3001, filling carrier + tracking when required). **Prereqs**: `supabase start && supabase db reset`, both apps' `.env.local` symlinked to the root env (already done in 6.1). Typecheck + lint clean; 451 vitest tests still passing. |
| 8.2 Sentry | `[x]` done | `@sentry/nextjs` added to both apps. Three config files per app at root (`sentry.{client,server,edge}.config.ts`) — each guards `Sentry.init()` on `NEXT_PUBLIC_SENTRY_DSN`, so local dev without a DSN stays entirely quiet (no init, no plugin overhead). `src/instrumentation.ts` in each app wires the server + edge configs via Next 14's `register()` hook. `next.config.mjs` is wrapped with `withSentryConfig` only when a DSN is present; source-map upload is gated on all three of `SENTRY_AUTH_TOKEN` + `SENTRY_ORG` + `SENTRY_PROJECT` so missing upload creds don't break the build. Sentry's auto-instrumentation captures unhandled exceptions, API-route 5xxs, client errors, and — via the Node integration — the `console.error` calls already emitted by `@d2c/email` on Resend failures (per TDD §10). **New env vars (all optional)**: `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_ENV`, `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` (default 0.1), `NEXT_PUBLIC_SENTRY_REPLAY_ON_ERROR`; for source maps in CI: `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`. Typecheck + lint clean; 451 vitest tests still passing. |
| 8.3 Final checklist + deploy | `[x]` done | `pnpm build` now passes for both apps end-to-end. Fixed a prod-only bug: `/login` and `/signup` used `useSearchParams()` at the page root, which Next rejected during static prerender — split each into a server-component `page.tsx` that wraps the original client body (`LoginView`/`SignupView`) in `<Suspense>`. Storefront compiles to 21 routes (login/signup now static-shell prerender), internal to 10. Full deployment runbook written to `DEPLOY.md`: Supabase prod setup, Vercel two-project layout (one repo, different `Root Directory`), complete env-var matrix (required / email / Sentry), pre-flight gate order, post-deploy smoke checklist (11 customer-site + 8 internal + 4 infra items), rollback procedure. **Phase 8 complete — shippable.** Final numbers: 451 vitest tests, 6 Playwright specs, typecheck + lint + build all clean. |

---

## Out of scope (Phase 2 — do not build)

Razorpay · AI chatbot · SMS · Loyalty points · Shiprocket/Delhivery API

If asked: *"This is Phase 2. Not in TDD.md. Confirm before I proceed."*

---

## When stuck

- Ambiguous task → ask one high-leverage question before starting
- If still unresolved after one exchange → stop and state the exact blocked decision; do not invent product behaviour
- Something not in `TDD.md`, `DESIGN_SYSTEM.md`, or the wireframes → flag it explicitly before building