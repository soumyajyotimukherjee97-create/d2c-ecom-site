# Storefront V2 — Pre-cutover QA log

> Chunk 15 of the V2 redesign. This file captures what was checked
> before the `storefront-v2` → `main` merge, what passed
> automatically, what needs the founder's eyeballs, and the known
> deferrals that land on `main` as-is.
>
> **Snapshot taken at commit:** `4d9cbdf` (storefront-v2)
> **Date:** 2026-04-19

---

## Machine-verified — green

| Gate | Status | Notes |
|---|---|---|
| `pnpm typecheck` | ✅ | Storefront + Internal + Email, zero errors |
| `pnpm lint` | ✅ | Zero ESLint warnings/errors |
| `pnpm -F storefront test` (vitest) | ✅ | **528 / 528** after removing dead `ReviewsSection` |
| `pnpm -F internal test` | ✅ | 65 / 65 |
| `pnpm -F @d2c/email test` | ✅ | 15 / 15 |
| `pnpm -F storefront build` | ✅ | 19 routes; static ○: `/about`, `/ingredients`, `/login`, `/signup`, `/skin-insight`, `/checkout` |
| Drift vs `origin/main` | ✅ | Zero commits on main that storefront-v2 doesn't have; no rebase needed |
| V1 token audit | ✅ | Zero `bg-gray-*`, `text-gray-*`, `border-gray-*`, `Form.`, `bg-blush`, `bg-mist`, `bg-offwhite`, or explicit `shadow-*` in source |
| `rounded-*` usage | ✅ | Only `rounded-full` for circular dots / radio buttons (explicit matter exception) |
| `font-heading` legacy token | ✅ | Zero occurrences (migrated to `font-display`) |
| Dead code purge | ✅ | Removed `components/shop/ReviewsSection.tsx` (replaced by `PDPReviews` + `HomeReviewsCarousel`) |
| data-testid parity vs V1 E2E | ✅ | All 24 storefront-facing testids from the E2E suite present. `confirmation-order-meta` renamed back (was `confirmation-ack` in Chunk 10) |

---

## Integration tests — pre-existing failure, not a V2 blocker

**Result:** 36 passed / 23 failed on `storefront-v2`.

**Baseline check:** **identical** 36 / 23 on `main`. The failures are caused by
Next 14's `request-async-storage` requiring a real request context that
the current vitest runner doesn't simulate. This predates the V2 branch.

**Implication for cutover:** not a merge blocker. Address as a standalone
test-infra fix on `main` whenever convenient.

---

## E2E tests — 5 storefront-facing flows green

**Result on storefront-v2:** 5 passed, 1 failed. The failure is pre-existing on `main`.

| Spec | Status | Notes |
|---|---|---|
| `browse-and-add-to-cart.spec.ts` | ✅ | Needed `product-card` → `product-tile` testid update (V2 split the tile) + explicit link click (the `+` button overlays the tile) |
| `place-order.spec.ts` | ✅ | Guest checkout end-to-end — the money flow verified live |
| `account-order-history.spec.ts` | ✅ | Needed empty-state copy regex update (V2: "no consignments yet") |
| `support-ticket.spec.ts` | ✅ | Needed ticket ref regex update (V2: `TKT-XXXXXXXX`) |
| `internal-process-order.spec.ts` | ✅ | Staff walks order confirmed → processing → shipped |
| `internal-add-product.spec.ts` | ❌ pre-existing | Times out on new-product submit on :3001. **Identical failure on `main`** — verified by checkout + rerun. Filed as a post-cutover internal-console follow-up. Internal console is out of V2 scope per CLAUDE.md. |

**All 5 storefront-facing flows exercise the real stack — Next dev
servers, Supabase, the atomic order RPC, status transitions, and the
email side-effects (Resend logs show templates firing as expected; the
401 responses in logs are just the missing local Resend key — not a
test failure).**

---

## Needs your eyes — manual checklist

These items cannot be auto-verified. Work through them in a browser
before Chunk 16 (cutover).

### Visual review — every page

Compare to `wireframes-storefront-v2/*.html` for each.

- [ ] `/` (Home) — hero, featured 3-up, spotlight tabs, principles 4-up, reviews carousel, press 6-cell, newsletter
- [ ] `/products` (PLP) — filter bar chips, 4-up tile grid, pagination bar, SkinInsight CTA at bottom
- [ ] `/products/[slug]` (PDP) — breadcrumb, gallery + purchase panel, formulation/assay split, reviews carousel, related 4-up
- [ ] `/about` — hero ornaments, manifesto 9-clause broadsheet body, founder sign-off
- [ ] `/ingredients` — hero + chapter rail + essay (dropcap) + sticky sidecar + prev/next
- [ ] `/cart` (drawer, not a route) — opened via Navbar Bag button
- [ ] `/checkout` — bare chrome, 12-col grid, three § sections, sticky summary, ink CTA with total
- [ ] `/order/[id]` — broadsheet masthead, confirmation hero, info strip, manifest table, related
- [ ] `/login` — § RETURNING SUBJECT + "Welcome back."
- [ ] `/signup` — § NEW SUBJECT — ENROLL + "Create your dossier." (names + terms checkbox)
- [ ] `/account` — subject header, two-col dossier (sidebar + orders/restock/skin-profile)
- [ ] `/support/new` — broadsheet masthead + "How can we help?" + form with live char counter
- [ ] `/skin-insight` — § COMING SOON — PHASE 2 + "A skin report, by your skin." + waitlist
- [ ] `/404` (hit a bogus URL) — § 404 — OUT OF CATALOGUE + "This page is not on file."
- [ ] `/error` — can't hit directly; trigger a thrown error in any page to verify

### Responsive audit — every page at 5 widths

Widths: 1440 · 1280 · 1024 · 768 · 640.

- [ ] No horizontal scroll at any width
- [ ] No overlapping text / buttons
- [ ] Nav drawer + cart drawer work at 640
- [ ] Grids collapse sensibly: 4-up → 2-up on md → 1-up on sm
- [ ] Sticky PDP panel / ingredients sidecar / checkout summary behave correctly

### Accessibility (axe + keyboard)

- [ ] `axe` report clean on each route (no blocking issues)
- [ ] Keyboard-only walk-through: add to cart → cart drawer → checkout → place order
- [ ] Keyboard-only: /login → sign in → /account
- [ ] Keyboard-only: /support/new → fill form → submit
- [ ] Focus is visible on every interactive element (matter uses `focus-visible:outline`)
- [ ] Every input has a label; errors referenced via `aria-describedby`

### Commerce invariants

- [ ] Place one live test-mode order end-to-end (cart → checkout → confirmation)
- [ ] Confirmation page renders for both guest and authed orders (try both)
- [ ] Navigate to `/account` — order appears in history
- [ ] Click "Reorder" on an order — items land in drawer with correct variants
- [ ] Server always recomputes money (diff POST /api/orders payload between storefront-v2 and main — should be byte-identical; checkout tests still assert this)

### E2E + integration

- [x] `pnpm e2e` — 5 storefront flows green (see table above); 1 internal flow is a pre-existing main-branch failure
- [ ] (Optional, non-blocker) `pnpm test:integration` — the 23 pre-existing failures can be investigated as a separate task; do NOT gate cutover on them

---

## STOREFRONT_V2.md open items — resolution status

| Item | Status | Notes |
|---|---|---|
| Responsive breakpoints | ⚠ in-flight | V2 uses `md:` throughout (768px). Design debt — needs formal audit. Covered by the responsive manual checklist above. |
| Photography | 🔜 deferred | All `.m-ph` striped placeholders still in place. Real product art is post-cutover content work. |
| Press masthead | 🔜 deferred | Still typographic (Vogue Paris, Monocle, etc.). Swap to licensed art when negotiated. |
| Alternate palettes | 🔜 deferred | Only `bone` shipped. Seasonal theme switcher is post-MVP. |
| Newsletter backend | ✅ unchanged | POST `/api/newsletter` from V1 still the target. Behaviour untouched. |
| Write-review flow | 🔜 deferred | PDP reviews renders read-only. Write flow is Phase 2 per TDD. |
| Email templates (matter re-skin) | 🔜 deferred | `packages/email/` still V1 visual. Explicit non-blocker per STOREFRONT_V2.md. |

---

## Chunk-level deferrals (flagged during implementation, still open)

1. **Claim-on-signup server action** — Chunk 10's guest confirmation emits
   `/signup?prefill=&order=`; signup reads `?prefill=` but doesn't yet auto-
   attach `order.user_id`. ~10-line server action.
2. **PDP ingredient rows → `/ingredients#essay/[SYM]` deep link** — Chunk
   8's IngredientTag could open the right essay in Chunk 9's reader.
3. **Checkout route-group `error.tsx`** — the root error page covers
   checkout failures; a tailored "your cart is safe" message is optional polish.
4. **D1 deviation (Chunk 9)**: essays shipped as `.md` + `gray-matter`
   front-matter rather than full `.mdx`. Upgrade path is content-compatible.
5. **In-card image pager on PDP related cards** — wireframe shows it; we
   have single-image products today so it's dead weight. Revisit when
   multi-image products ship.
6. **Caps-lock detection on password fields** — wireframe note, nice-to-have.
7. **Priority chip selector on support form** — deliberately omitted:
   `support_tickets.priority` is staff-facing (internal console edits it).

None of these block cutover. All are documented in the chunk-level commit
messages and roadmap notes.

---

## Cutover risk summary

**Low-risk merge.** The redesign preserves every API contract:

- POST `/api/orders` payload shape — byte-identical (verified by test)
- POST `/api/support` payload shape — unchanged
- PATCH `/api/account/profile` — unchanged
- Supabase RLS, RPC signatures, status enums — untouched
- Auth flow (Supabase email+password, middleware session) — unchanged

The only mid-chunk bug was the `payment_method` column mis-select on the
confirmation page (Chunk 10, fixed in `bf63ba5`). Caught and shipped
within the same branch.

Recommended cutover sequence:

1. Founder runs the manual checklist above.
2. Founder runs `pnpm e2e` locally.
3. If either surfaces blockers, file targeted fixes on `storefront-v2`.
4. When clean, open the Chunk 16 PR: `storefront-v2` → `main`.
