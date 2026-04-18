# Storefront V2 — Roadmap

> Execution tracker for the V1 → matter visual redesign.
> Decisions, rationale, and scope live in `STOREFRONT_V2.md`.
> This file breaks the goal into sequential, shippable chunks.

## How to use this document

- Each chunk is a **self-contained unit of work** — one or a small handful of PRs that can be reviewed, merged to `storefront-v2`, and left in a green state.
- **Prereqs** are hard dependencies. Respect them — skipping around will create rework.
- **Done when** is the acceptance contract. Do not mark a chunk complete unless every bullet is true.
- Update the status column as work moves. Status values: `☐ todo` · `🏗 in progress` · `✅ done` · `⏸ blocked`.

---

## Overview

| # | Chunk | Status | Risk |
|---|---|---|---|
| 0 | Branch + infra setup | ☐ | low |
| 1 | Design tokens + fonts | ☐ | low |
| 2 | UI atoms (re-skin + new primitives) | ☐ | low |
| 3 | Shared chrome — Navbar + Footer | ☐ | medium |
| 4 | Cart drawer (overlay re-skin) | ☐ | medium |
| 5 | **Pilot page: About** (new route) | ☐ | low |
| 6 | Home page | ☐ | medium |
| 7 | PLP (`/products`) | ☐ | medium |
| 8 | PDP (`/products/[slug]`) | ☐ | medium |
| 9 | Ingredients page (new route, MDX) | ☐ | medium |
| 10 | Checkout + Order confirmation | ☐ | high |
| 11 | Auth (`/login`, `/signup`) | ☐ | medium |
| 12 | Account + Support | ☐ | medium |
| 13 | SkinInsight coming-soon page | ☐ | low |
| 14 | Polish — 404, errors, loading, newsletter | ☐ | low |
| 15 | Pre-cutover QA sweep | ☐ | high |
| 16 | Cutover — merge `storefront-v2` → `main` | ☐ | high |

---

## Chunk 0 — Branch + infra setup

- **Prereqs**: none
- **Scope**:
  - Cut `storefront-v2` from `main`.
  - Confirm CI runs on the branch (typecheck, lint, vitest, playwright).
  - Verify `pnpm build` succeeds on a clean checkout of the branch.
  - Add the branch-guardrail section to `CLAUDE.md` so future sessions respect it.
- **Done when**:
  - Branch exists and is the default working branch.
  - CI green on `storefront-v2` HEAD.
  - `CLAUDE.md` has a "While storefront-v2 is active" guardrail block.
- **Tests**: no code tests touched; manual check of CI.
- **Risk**: low

---

## Chunk 1 — Design tokens + fonts

- **Prereqs**: Chunk 0
- **Scope**:
  - Rewrite `apps/storefront/tailwind.config.ts` with the matter palette (paper/ink/hairline family + accent + oxblood), spacing scale, and zero-radius rules.
  - Wire `Instrument Serif`, `Inter Tight`, and `JetBrains Mono` via `next/font/google` with CSS variable exports.
  - Add font-feature settings (`ss01, cv11`) globally.
  - Update `globals.css` — body bg, base font, link reset, `.m-inverted` helper class.
  - Remove V1-specific color tokens that no longer apply (blush, mist, etc.) or alias them temporarily if pages still reference them.
- **Done when**:
  - `pnpm -F storefront typecheck` passes.
  - `pnpm -F storefront build` passes.
  - Opening any V1 page in dev renders in V1 layout but with the new palette. Broken visual state is expected and fine at this stage.
- **Tests**: no new tests. Existing visual snapshots (if any) will drift — accept.
- **Risk**: low — purely additive/reconfigurative.

---

## Chunk 2 — UI atoms (re-skin + new primitives)

- **Prereqs**: Chunk 1
- **Scope**:
  - Re-skin existing `apps/storefront/src/components/ui/`: `Button`, `Badge`, `Input`, `SkeletonCard`, `Alert`, `ScienceTag`, `IngredientTag`, `ScienceCallout`, `EmptyState`, `QuantitySelector`, `ReviewBar`, `StatusBadge`.
  - Add new primitives: `Placeholder` (striped tonal art stand-in), `Eyebrow` (mono §-caption), `MonoCaption`, `Ruler` (12-col decorative), `StatusChip` (mono-caps square chip — replaces V1 StatusBadge shape).
  - Update existing component tests to match new markup where needed. Tests must continue to assert on `data-testid` and roles, never class names.
- **Done when**:
  - Every atom renders per `DESIGN_SYSTEM_V2.md`.
  - All existing vitest component tests pass.
  - New atoms have component tests covering their props matrix.
  - No V1 colour tokens remain in atom source.
- **Tests**: update ~12 existing component specs; add ~5 new.
- **Risk**: low — isolated to `components/ui/`.

---

## Chunk 3 — Shared chrome (Navbar + Footer)

- **Prereqs**: Chunks 1, 2
- **Scope**:
  - Rewrite `components/layout/Navbar.tsx` per `wireframes-storefront-v2/Home.html` (wordmark + text-only nav links + Account + Bag, mono-caps 10px, active link underline).
  - Rewrite `components/layout/Footer.tsx` per same wireframe.
  - Preserve: sticky behaviour, cart badge with mounted-guard (Zustand persist SSR rule), useAuthUser integration, mobile hamburger collapse.
  - Add nav entries: `Ingredients` (→ `/ingredients`), `SkinInsight` (→ `/skin-insight`).
- **Done when**:
  - Navbar matches wireframe on desktop; mobile stacks reasonably.
  - Cart badge still reflects `useCartStore.itemCount()` without hydration mismatch.
  - Existing Navbar/Footer tests pass; add data-testid for new nav items.
- **Tests**: update Navbar.test.tsx + Footer.test.tsx; add tests for new nav items and active state.
- **Risk**: medium — every page consumes these.

---

## Chunk 4 — Cart drawer (overlay re-skin)

- **Prereqs**: Chunks 2, 3
- **Scope**:
  - Rewrite `components/shop/CartDrawer.tsx` per `wireframes-storefront-v2/Cart.html`:
    header with count + close, free-ship progress bar, m-assay-style line items, qty stepper, REMOVE link, upsell block, sticky footer with subtotal/total, trust strip.
  - Keep all state + logic unchanged (Zustand store, focus trap, backdrop click, Esc).
  - Empty state inline inside drawer.
- **Done when**:
  - Drawer renders per wireframe.
  - All existing CartDrawer tests pass (behavioural tests should survive — they assert on roles/testids).
  - Add/update tests for new inner elements (progress bar text, upsell block).
- **Tests**: update CartDrawer.test.tsx; add tests for progress bar text + empty state.
- **Risk**: medium — overlay + commerce UI coupling.

---

## Chunk 5 — Pilot: About page (new route)

- **Prereqs**: Chunks 2, 3
- **Scope**:
  - New route `src/app/(shop)/about/page.tsx`.
  - Implement `AboutHero` + `Manifesto` per `design_agent_handoff/project/About.html` — broadsheet masthead, 9-clause manifesto in 2-col justified body, broadsheet signatures.
  - Content is static (no DB, no CMS).
  - Add nav link for About (already listed in Footer, confirm on Navbar).
- **Done when**:
  - `/about` renders pixel-close to the handoff mockup.
  - Page is a server component (no client JS needed).
  - Lighthouse/axe accessibility pass (headings, landmarks).
  - Responsive at 1024 / 768 / 640.
  - Test: basic render + presence of 9 clause numbers.
- **Tests**: new page test (vitest + RTL).
- **Risk**: low — no commerce, no data, purely static.
- **Notes**: This is the **pilot** — it proves tokens + atoms + chrome end-to-end. If the visual output surprises or breaks, fix it here before moving to Home.

---

## Chunk 6 — Home page

- **Prereqs**: Chunks 2, 3, 4, 5
- **Scope**: re-skin `src/app/(shop)/page.tsx` per `wireframes-storefront-v2/Home.html`:
  - Hero (12-col split, specimen art R)
  - Featured formulas (3-up product grid, server-fetched, ISR 60s)
  - Know-your-ingredient Spotlight (client tab selector, 4 hardcoded ingredients until Ingredients page content exists)
  - Principles (4-up bordered grid, inline SVG icons)
  - Reviews (3-up arrow carousel, client island)
  - Press (6-cell typographic strip)
  - Newsletter (2-col, inline form, RHF + Zod).
- **Done when**:
  - Every section matches wireframe and `DESIGN_SYSTEM_V2.md`.
  - ISR still 60s on featured products.
  - Newsletter submission works (retain existing backend behaviour).
  - All existing home tests pass or are updated.
- **Tests**: update home.test.tsx; add tests for Spotlight tabs and Reviews carousel (arrow nav only).
- **Risk**: medium — many sections, lots of surface area.

---

## Chunk 7 — PLP (`/products`)

- **Prereqs**: Chunks 2, 3, 4
- **Scope**: re-skin `src/app/(shop)/products/page.tsx` per `wireframes-storefront-v2/Plp.html`:
  - FilterBar (skin_type chips, concern chips, sort dropdown) — URL-driven, single-select.
  - ProductGrid (4-up, tile with class eyebrow, name, concerns, price, + button).
  - Pagination (URL-driven, prev/page-counter/next, no infinite scroll).
  - QuizCTA / SkinInsight marketing block (retargets "Try now" → `/skin-insight`).
  - Preserve `unstable_cache` + admin-client fix (recent commit `4da9d9c`).
- **Done when**:
  - FilterBar drives URL, server re-renders with filtered products.
  - `+` button on tile triggers CartDrawer.
  - Empty / loading / error states all handled per V2 rules.
  - Existing PLP tests + filter logic tests pass.
- **Tests**: update PLP tests; add tests for ProductTile + button and SkinInsight block CTA.
- **Risk**: medium — filter state + server fetch cache interaction.

---

## Chunk 8 — PDP (`/products/[slug]`)

- **Prereqs**: Chunks 2, 3, 4, 7
- **Scope**: re-skin `src/app/(shop)/products/[slug]/page.tsx` per `wireframes-storefront-v2/Pdp.html`:
  - Breadcrumb (mono trail).
  - Gallery (1:1 hero + 4 thumbs, client island for swap).
  - Purchase panel: category eyebrow, display name, price, size variant pills, Ideal For chip list, qty stepper + ATC, Key Ingredients with 3px ink left border, optional Clinical Insight callout.
  - ProductReviews carousel (reuses Home carousel primitive).
  - YouMightAlsoLike (4-up with in-card arrow+dot pager).
  - generateMetadata + JSON-LD breadcrumb (retain).
- **Done when**:
  - Every section matches wireframe.
  - Variant switching updates price/stock display only (not server-trusted).
  - ATC works end-to-end (triggers CartDrawer with correct variant+qty).
  - All PDP tests pass.
- **Tests**: update PDP tests; add tests for variant pill selection, ingredient rows, clinical insight visibility.
- **Risk**: medium.

---

## Chunk 9 — Ingredients page (new route, MDX pipeline)

- **Prereqs**: Chunks 2, 3, 8 (links back from PDP ingredient rows), and decision D1 (MDX)
- **Scope**:
  - Install + configure `@next/mdx` (or `next-mdx-remote`) for the storefront app.
  - Create `src/content/ingredients/*.mdx` — one file per ingredient (17 from handoff) with frontmatter: `sym, n, name, class, fn, formula, mw, conc, pH, origin, used[], tol{}, evidence`. Body = essay prose + `<Aside>` for the pullquote.
  - Build `src/app/(shop)/ingredients/page.tsx` per `wireframes-storefront-v2/Ingredients.html`:
    Hero + ChapterRail (client, hash sync + localStorage resume) + EssayEntry (chapter head + dropcap essay + sticky data-sheet sidecar + prev/next) + Philosophy.
  - PDP ingredient rows now link to `/ingredients#essay/[SYM]` if an entry exists; otherwise inert caption.
- **Done when**:
  - `/ingredients` renders with all 17 entries, rail navigates, hash resolves, localStorage resumes.
  - Sticky sidecar behaves correctly at all scroll positions.
  - `pnpm build` includes all MDX at build time.
- **Tests**: vitest for frontmatter parsing; RTL test for ChapterRail behaviour + hash update.
- **Risk**: medium — new content pipeline + client state + URL sync.

---

## Chunk 10 — Checkout + Order confirmation

- **Prereqs**: Chunks 2, 3, 4, 8
- **Scope**:
  - Re-skin `src/app/(checkout)/checkout/page.tsx` per wireframe:
    minimal chrome, 12-col grid (8/4), three form sections § 01 Contact · § 02 Dispatch Address · § 03 Payment (COD default, UPI disabled), sticky summary on the right, "PLACE ORDER · ₹XXXX" CTA.
  - Re-skin `src/app/(checkout)/order/[id]/page.tsx` per wireframe:
    broadsheet masthead, confirmation hero (dispatch-brief voice, ORD-MT-XXXX), 4-cell info strip, manifest table, account-incentive block (guest-only), related products, Footer.
  - Preserve all commerce invariants — server recomputes every price, atomic order RPC unchanged, status enum unchanged.
- **Done when**:
  - Checkout form validates per existing Zod schema.
  - Order created atomically (existing RPC), redirect to confirmation.
  - Confirmation page renders for both authed and guest orders.
  - All existing checkout + order tests pass.
- **Tests**: update existing checkout + order tests; add tests for account-incentive visibility and info-strip content.
- **Risk**: **high** — money flow. Make the PR reviewer walk through the full test-mode order end-to-end.

---

## Chunk 11 — Auth (`/login` + `/signup`)

- **Prereqs**: Chunks 2, 3
- **Scope**:
  - Re-skin `src/app/(auth)/login/page.tsx` + `LoginView` per `wireframes-storefront-v2/Auth.html`.
  - Re-skin `src/app/(auth)/signup/page.tsx` + `SignupView`.
  - Preserve Suspense-wrap pattern that fixes the useSearchParams prerender issue (from 8.3).
  - Typographic-only (per D3) — no imagery.
- **Done when**:
  - Both routes build statically (prerender OK).
  - Forms submit and route correctly with `next=...` preserved.
  - Inline errors display per V2 rules.
  - Existing auth tests pass.
- **Tests**: update LoginForm / SignupForm tests; confirm next-param preservation test still green.
- **Risk**: medium.

---

## Chunk 12 — Account + Support

- **Prereqs**: Chunks 2, 3, 11
- **Scope**:
  - Re-skin `src/app/(shop)/account/page.tsx` per wireframe:
    Page header (dossier + subject id), two-col layout (280px sidebar + content), orders table with mono-caps StatusChips, restock reminder, skin profile (subject-profile framing).
  - Re-skin `src/app/(shop)/support/new/page.tsx` per wireframe:
    broadsheet masthead, editorial hero, form (email / order dropdown / subject / priority / 5000-char body), inline success state (TKT-XXXXXXXX display).
  - Re-skin `StatusBadge` usages → `StatusChip`.
  - Preserve: SignOutButton, ReorderButton (cart.addItems), SkinProfileForm PATCH flow, SupportForm behaviour (authed vs guest).
- **Done when**:
  - `/account` and `/support/new` match wireframes.
  - All flows work — sign out, reorder, profile edit, ticket submission.
  - Existing account + support tests pass.
- **Tests**: update account.test + support.test; add tests for StatusChip variants and subject-profile rows.
- **Risk**: medium.

---

## Chunk 13 — SkinInsight coming-soon page

- **Prereqs**: Chunks 2, 3
- **Scope**:
  - New route `src/app/(shop)/skin-insight/page.tsx`.
  - Single-page coming-soon shell: broadsheet masthead, editorial hero with `§ COMING SOON — PHASE 2`, short copy about the feature, optional inline waitlist email form (or just a "Back to shop" CTA).
  - Include the heatmap figure from the shop CTA as the visual anchor (reusable between the two pages).
  - Draft a minimal wireframe at `wireframes-storefront-v2/SkinInsight.html` first if the shape is unclear.
- **Done when**:
  - Route exists, links from Navbar + PLP CTA resolve here.
  - Optional waitlist form stores email (or explicitly no-ops with a "thanks" state — confirm scope).
  - Responsive at 1024/768/640.
- **Tests**: basic render test.
- **Risk**: low.

---

## Chunk 14 — Polish (404, errors, loading, newsletter)

- **Prereqs**: Chunks 2, 3
- **Scope**:
  - `not-found.tsx` — matter-voiced 404, centered editorial block with CTAs.
  - `error.tsx` at route-group level — same treatment, with a retry action.
  - Loading skeletons — confirm every data-fetching page renders striped `m-ph` placeholders at the right grid slots.
  - Newsletter submission — confirm MVP behaviour (no-op? email capture?) and that success/error states use inline mono captions, never toasts.
  - Form-field error pattern — single shared inline-error primitive if not already factored.
- **Done when**:
  - 404 + error pages exist and render per V2 voice.
  - Every data-fetching page has loading skeletons matching layout.
  - Newsletter success/error behaviour confirmed and tested.
- **Tests**: add 404 + error page tests; update newsletter form test.
- **Risk**: low.

---

## Chunk 15 — Pre-cutover QA sweep

- **Prereqs**: Chunks 3–14
- **Scope**:
  - Responsive audit — every page at 1440 / 1280 / 1024 / 768 / 640. Fix breakages.
  - Accessibility pass — run axe on every route. Keyboard-only walk-through of: add-to-cart, checkout, login, support form.
  - Full `pnpm test` + `pnpm test:integration` + `pnpm e2e` green.
  - Visual review — open every page, compare to wireframes.
  - Check all `data-testid` from V1 still present on re-skinned elements.
  - Confirm all open items in `STOREFRONT_V2.md` are either resolved or explicitly deferred.
  - Final rebase of `storefront-v2` on `main`.
- **Done when**:
  - Checklist below all ✓ before merge.
  - All 6 Playwright flows green.
  - No visible V1 colour/font/radius anywhere in storefront (console, internal, and Supabase dashboards excluded).
- **Tests**: full suite runs once end-to-end on the branch's HEAD.
- **Risk**: **high** — this is the quality gate. Spend real time here.

**QA checklist**:
- [ ] Responsive — every page at 5 widths
- [ ] axe clean — no blocking issues
- [ ] Keyboard — cart + checkout + login + support all operable without mouse
- [ ] `pnpm typecheck` clean
- [ ] `pnpm lint` clean
- [ ] `pnpm test` all vitest green
- [ ] `pnpm test:integration` green
- [ ] `pnpm e2e` all 6 flows green
- [ ] All pages match wireframes (designer/founder review)
- [ ] All commerce invariants still enforced
- [ ] `STOREFRONT_V2.md` open items resolved or deferred

---

## Chunk 16 — Cutover

- **Prereqs**: Chunk 15
- **Scope**:
  - One final PR: `storefront-v2` → `main`.
  - End-to-end reviewer walk-through against a fresh `supabase db reset`.
  - Merge. Vercel deploys automatically.
  - Post-deploy smoke test on production (follow `DEPLOY.md` post-deploy checklist).
  - Tag release `v2.0.0` (or per repo convention).
  - Archive `storefront-v2` branch after 14 days of stability.
  - Move V1 wireframes folder to `wireframes-v1-archive/` (or similar) so there's no ambiguity which spec is authoritative.
- **Done when**:
  - Production URL shows V2.
  - All 11 customer-site smoke checks in `DEPLOY.md` pass on prod.
  - Sentry shows no new error spike.
  - Rollback procedure tested once post-deploy (promote-previous button; immediately re-promote V2).
- **Risk**: high. But reversible — Vercel rollback is instant and DB is unchanged.

---

## Not in this roadmap (deferred)

These are legitimately out of V2 scope per decisions or TDD:

- **Razorpay / UPI payments** — Phase 2.
- **Real SkinInsight AI feature** — Phase 2.
- **Social login** (Google/Apple) — Phase 2.
- **Magic-link auth** — Phase 2.
- **Shiprocket/Delhivery integration** — Phase 2.
- **Loyalty / referral** — Phase 2.
- **Email template re-skin** (`packages/email/`) — can ship post-V2; not blocking cutover.
- **Internal console re-skin** — out of scope, keeps V1 `DESIGN_SYSTEM.md`.

---

## Change log

_Update when chunks complete or scope shifts._

- `2026-04-18` — Roadmap drafted.
