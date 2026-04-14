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

## Hard rules

**Design**
- No hardcoded hex values — Tailwind tokens from `tailwind.config.ts` only
- No `box-shadow` anywhere — borders communicate elevation; this includes no shadow utilities on cards, inputs, or overlays
- Default radius is `rounded-sm` (2px) — exceptions are defined in `DESIGN_SYSTEM.md`; when in doubt use `rounded-sm`
- Font weights: `font-normal` (400) and `font-medium` (500) for body/UI; `font-bold` (700) only for `font-heading` elements
- Prices display as `₹${Math.round(paise / 100).toLocaleString()}`

**TypeScript**
- `strict: true` — no `any`, no `// @ts-ignore`

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

## Out of scope (Phase 2 — do not build)

Razorpay · AI chatbot · SMS · Loyalty points · Shiprocket/Delhivery API

If asked: *"This is Phase 2. Not in TDD.md. Confirm before I proceed."*

---

## When stuck

- Ambiguous task → ask one high-leverage question before starting
- If still unresolved after one exchange → stop and state the exact blocked decision; do not invent product behaviour
- Something not in `TDD.md`, `DESIGN_SYSTEM.md`, or the wireframes → flag it explicitly before building