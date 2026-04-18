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
| 0 | Branch + infra setup | ✅ | low |
| 1 | Design tokens + fonts | ✅ | low |
| 2 | UI atoms (re-skin + new primitives) | ✅ | low |
| 3 | Shared chrome — Navbar + Footer | ✅ | medium |
| 4 | Cart drawer (overlay re-skin) | ✅ | medium |
| 5 | **Pilot page: About** (new route) | ✅ | low |
| 6 | Home page | ✅ | medium |
| 7 | PLP (`/products`) | ✅ | medium |
| 8 | PDP (`/products/[slug]`) | ✅ | medium |
| 9 | Ingredients page (new route, MDX) | ✅ | medium |
| 10 | Checkout + Order confirmation | ✅ | high |
| 11 | Auth (`/login`, `/signup`) | ✅ | medium |
| 12 | Account + Support | ☐ | medium |
| 13 | SkinInsight coming-soon page | ☐ | low |
| 14 | Polish — 404, errors, loading, newsletter | ☐ | low |
| 15 | Pre-cutover QA sweep | ☐ | high |
| 16 | Cutover — merge `storefront-v2` → `main` | ☐ | high |

---

## Chunk 0 — Branch + infra setup ✅

- **Prereqs**: none
- **Scope**:
  - Cut `storefront-v2` from `main`. ✅
  - Add GitHub Actions CI workflow (none existed prior) — typecheck · lint · test on every push and PR to `main` and `storefront-v2`. ✅
  - Add the branch-guardrail section to `CLAUDE.md` so future sessions respect it. ✅
  - Land planning docs (`DESIGN_SYSTEM_V2.md`, `STOREFRONT_V2.md`, this file, `wireframes-storefront-v2/`, `design_agent_handoff/`) on `main` so they're visible to all contributors. ✅
- **Done when**:
  - Branch exists and is the default working branch. ✅
  - CI green on both `main` and `storefront-v2` HEAD. ✅
  - `CLAUDE.md` has a "While storefront-v2 is active" guardrail block. ✅
- **Tests**: no code tests touched; CI green verified on GitHub.
- **Risk**: low
- **Delivered commits**:
  - `bf61957` — docs: storefront-v2 redesign plan, wireframes, and matter design handoff
  - `092be5d` — ci: add GitHub Actions workflow (typecheck · lint · test)
- **CI coverage notes**:
  - Fast three only (typecheck, lint, vitest). Intentionally narrow to keep runtime under ~4 min.
  - **Deferred to a later pass (not blocking V2 work)**: integration tests (need Supabase in CI — service container + seed), Playwright E2E (needs browser install + both apps running). Revisit before Chunk 15 QA.

---

## Chunk 1 — Design tokens + fonts ✅

- **Prereqs**: Chunk 0 ✅
- **Scope**:
  - Rewrite `apps/storefront/tailwind.config.ts` with the matter palette. ✅
  - Wire `Instrument Serif`, `Inter Tight`, and `JetBrains Mono` via `next/font/google`. ✅
  - Add font-feature settings (`ss01, cv11`) globally. ✅
  - Update `globals.css` — body bg, base font, `.m-inverted` helper class. ✅
  - Alias V1-specific color tokens (gray/mist/blush/offwhite/error) to matter values rather than remove, so V1 component classes keep resolving. ✅
- **Done when**:
  - `pnpm -F storefront typecheck` passes. ✅
  - `pnpm -F storefront build` passes (16 routes). ✅
  - `pnpm -F storefront lint` clean. ✅ (added to self-check)
  - `pnpm -F storefront test` — 372/372 green. ✅ (added to self-check)
- **Tests**: no new tests. Existing tests continued to pass with no changes — class-based assertions had no regressions since V1 class names still resolve.
- **Risk**: low — purely additive/reconfigurative.
- **Delivered commits**:
  - `38096be` — feat(storefront-v2): Chunk 1 — matter design tokens + fonts
- **Notes**:
  - `font-heading` aliased to the Instrument Serif variable; V1 code using `font-heading` now renders in display font automatically.
  - Radius override is aggressive — every Tailwind radius key (`sm` … `3xl`) is 0. Only `rounded-full` remains (for circular dots/avatars). Any V1 component using `rounded-sm` or `rounded-md` is now square, which matches the V2 rule.
  - Spacing additions: keys `18` (72px) and `30` (120px) for matter's vertical rhythm.
  - Letter-spacing additions: `mono` (0.18em) and `ultra` (0.22em) — matter's mono-caption tracking.

---

## Chunk 2 — UI atoms (re-skin + new primitives) ✅

- **Prereqs**: Chunk 1 ✅
- **Scope**:
  - Re-skin 12 atoms (Button, Badge, Input, SkeletonCard, Alert, ScienceTag, IngredientTag, ScienceCallout, EmptyState, QuantitySelector, ReviewBar, StatusBadge). ✅
  - Add 4 new primitives (Placeholder, Eyebrow, MonoCaption, Ruler) + StatusChip alias. ✅
  - Replace class-based test assertions with semantic `data-variant` / `data-size` / `data-status` / `data-tone` attributes. ✅
  - Purge V1-specific Badge variants (`mist`, `blush`) — updated PDPPurchasePanel to use `filled`. ✅
- **Done when**:
  - Every atom renders per `DESIGN_SYSTEM_V2.md`. ✅
  - All existing vitest component tests pass. ✅
  - New atoms have component tests covering their props matrix. ✅
  - No V1 colour tokens remain in atom source. ✅
- **Tests**: 405/405 passing (was 372; +33 new).
- **Risk**: low — isolated to `components/ui/` and `components/shop/ReviewBar.tsx`.
- **Delivered commits**:
  - `846df2e` — feat(storefront-v2): Chunk 2 — UI atoms re-skin + new primitives
- **Notes**:
  - `StatusBadge` is re-skinned to the square mono-caps chip specified by V2 and re-exported as `StatusChip` for semantic clarity.
  - Added `.m-ph / .m-ph--ink / .m-ph--mineral` to `globals.css` — the striped tonal placeholder patterns from `matter.css`, consumed by `<Placeholder />` and `<SkeletonCard />`.
  - `QuantitySelector` gained a `size` prop: `sm` (32px, for cart drawer line items) or `md` (46px, for PDP).
  - `Alert` gained a `success` variant (assay-green) beyond the existing error / info.
  - `Eyebrow` and `MonoCaption` are polymorphic via `as` prop for proper heading semantics.
  - Consumers of atoms (PDPPurchasePanel, ProductCard, CartDrawer, CheckoutPage, etc.) build and test clean with no code changes — aliases in the tailwind config ensure class names still resolve and data-* attributes don't require re-plumbing.

---

## Chunk 3 — Shared chrome (Navbar + Footer) ✅

- **Prereqs**: Chunks 1, 2 ✅
- **Scope**:
  - Rewrite Navbar per `wireframes-storefront-v2/Home.html` (wordmark + text-only nav + Account + Bag). ✅
  - Rewrite Footer per same wireframe. ✅
  - Preserve sticky behaviour, Zustand persist mounted guard, `useAuthUser`, mobile hamburger collapse. ✅
  - Add nav entries: Ingredients → `/ingredients`, SkinInsight → `/skin-insight` (coming-soon per D2). Dropped `Journal` from top-level nav (remains in Footer). ✅
  - Remove the V1 search button (was never wired). ✅
- **Done when**:
  - Navbar matches wireframe on desktop; mobile drawer stacks all nav + Account + Bag. ✅
  - Cart bag label reflects `useCartStore.itemCount()` through a mounted guard (no hydration mismatch). ✅
  - Updated tests all pass; new tests cover Ingredients and SkinInsight link targets. ✅
- **Tests**: 407/407 (was 405; +2 new — SkinInsight and Ingredients link destinations).
- **Risk**: medium — every page consumes these components. Mitigated: behaviour preserved, test suite still green.
- **Delivered commits**:
  - `540e669` — feat(storefront-v2): Chunk 3 — Navbar + Footer re-skin (matter chrome)
- **Notes**:
  - Brand wordmark changed from "Form." to "matter." (Instrument Serif, italic period with tighter letter-spacing).
  - Navbar switched from scroll-based transparent/white toggle to always-sticky paper background. Simpler, matches matter spec, reduces state.
  - Signed-in Account: 28px paper-3 square with initials (per V2 avatar rule), replacing the V1 black circle.
  - Bag label is now text: `Bag (N)` with tabular-nums count — no icon badge. Mobile drawer adds Account + Bag rows for full functionality.
  - Search icon removed; V1 button had no handler.

---

## Chunk 4 — Cart drawer (overlay re-skin) ✅

- **Prereqs**: Chunks 2, 3 ✅
- **Scope**:
  - Rewrite `components/shop/CartDrawer.tsx` per `wireframes-storefront-v2/Cart.html` — header with § eyebrow + display count + square close button, free-ship progress bar, m-assay line items with sm qty stepper + mono REMOVE link, upsell block, sticky footer with subtotal + total + CHECKOUT → CTA, trust strip. ✅
  - Kept all state + logic unchanged (Zustand store, focus trap, backdrop click, Esc). ✅
  - Empty state rendered inline below header (drawer chrome stays put, only footer is hidden). ✅
- **Done when**:
  - Drawer renders per wireframe. ✅
  - All existing CartDrawer behavioural tests pass (subtotal, upsell, close handlers, remove). ✅
  - New tests cover free-ship progress bar, trust strip, empty-state CTAs, formulas/items count format. ✅
- **Tests**: 435/435 (was 421; +14 for the re-skinned CartDrawer).
- **Risk**: medium — overlay + commerce UI coupling.
- **Delivered commits**:
  - `8c1d5e0` — feat(storefront-v2): Chunk 4 — Cart drawer re-skin
- **Notes**:
  - Drawer width bumped from 340 → 480px desktop; full-width on mobile.
  - Backdrop is `bg-ink/35` (matter spec: `rgba(18,18,16,0.35)`) — never `bg-black/20` or a blur.
  - Close control is a 40×40 hairline-bordered square with an `×` glyph in mono — accessible name unchanged.
  - Header count format: `N formulas · M items` (singularised at 1), per wireframe. An `sr-only` `(N)` is also emitted so any legacy callers / analytics selectors keep working.
  - Free-ship progress block only appears when the cart has items (never in empty state). `role="progressbar"` + `aria-valuenow` = percentage of ₹999 threshold.
  - Under threshold: "₹X TO GO" in graphite; at/above: "✓ FREE SHIPPING UNLOCKED" in assay-green. Bar fill colour swaps ink → assay on unlock.
  - Shipping line copy updated to `Calculated at checkout` / `Free at checkout` (was `₹99` / `Free`) — this is the cart's display-only presentation; `/api/orders` still recomputes at order-create time.
  - Line items use `<Placeholder />`-style `.m-ph` stripes when `imageUrl` is missing, instead of a blank grey square.
  - Line items show unit-price × quantity breakdown only when qty > 1 — single items keep the panel clean.
  - Removed the "Continue shopping" button — backdrop, Esc, and × cover the same intent with less visual noise.
  - Empty state adds a second CTA: "Take the quiz" → `/products?quiz=true`, matching the wireframe's dual-CTA layout.
  - Upsell eyebrow changed from "Complete your routine" → "§ Frequently added". Upsell `+` button is a 32px ink square — a mini of the PLP `+` button to be designed in Chunk 7.

---

## Chunk 5 — Pilot: About page (new route) ✅

- **Prereqs**: Chunks 2, 3 ✅
- **Scope**:
  - New route `src/app/(shop)/about/page.tsx`. ✅
  - Implement `AboutHero` + `Manifesto` per `design_agent_handoff/project/About.html` — broadsheet masthead, 9-clause manifesto in 2-col justified body, broadsheet signatures. ✅
  - Content is static (no DB, no CMS). ✅
  - Nav link was wired in Chunk 3 (`/about` already in Navbar + Footer). ✅
  - Added `wireframes-storefront-v2/About.html` to match the V2 wireframe convention (was the only V2 page without one). ✅
- **Done when**:
  - `/about` renders per handoff mockup. ✅
  - Page is a server component (no client JS needed). ✅
  - Responsive at 1024 / 768 / 640 (md: breakpoint drops decorative SVGs + switches to single-column body). ✅
  - Test: basic render + presence of 9 clause numbers. ✅
- **Tests**: 421/421 (was 407; +14 for AboutPage).
- **Risk**: low — purely static, no commerce, no data fetching.
- **Delivered commits**:
  - `0122b35` — feat(storefront-v2): Chunk 5 — About page (pilot)
- **Notes**:
  - **Pilot outcome**: atoms + chrome + tokens + fonts render correctly end-to-end on a real page. Ready to proceed with larger re-skins.
  - Decorative SVGs (concentric arcs L, ruled grid R) are `aria-hidden`, pointer-events-none, and `hidden md:block` so they never clutter small screens.
  - Dropcap on clause §01: italic Instrument Serif, float-left, 72px, line-height 0.8 — first character only.
  - § counters use `tracking-ultra` (0.22em) per matter broadsheet spec.
  - Double rules (3px `border-double` border-ink) under masthead and above sign-off — matches broadsheet-cap typography.
  - CSS multi-column via arbitrary values: `[column-count:2]`, `[column-gap:56px]`, `[column-rule:1px_solid_theme(colors.hairline)]` — Tailwind arbitrary-value syntax lets us keep this token-driven without adding a plugin.
  - **Not yet verified in browser.** CLAUDE.md requires a dev-server check for frontend changes; I could not run a headed browser in this environment. Founder should open `/about` locally before Chunk 6 starts to confirm the visual matches handoff intent.

---

## Chunk 6 — Home page ✅

- **Prereqs**: Chunks 2, 3, 4, 5 ✅
- **Scope**: re-skinned `src/app/(shop)/page.tsx` per `wireframes-storefront-v2/Home.html`:
  - Hero (12-col split, specimen art R linking to top-ranked featured product). ✅
  - Featured formulas (3-up product grid, server-fetched, ISR 60s). ✅
  - Know-your-ingredient Spotlight (new client island `HomeSpotlight.tsx` — 4 hardcoded ingredients). ✅
  - Principles (4-up bordered grid, inline 1px SVG icons, no icon libraries). ✅
  - Reviews (new client island `HomeReviewsCarousel.tsx` — 3-up arrow-nav carousel, 6 hardcoded reviews across 2 pages). ✅
  - Press (6-cell typographic strip). ✅
  - Newsletter (2-col, inline form on paper-2). ✅
- **Done when**:
  - Every section matches wireframe and `DESIGN_SYSTEM_V2.md`. ✅
  - ISR still 60s on featured products (`export const revalidate = 60`). ✅
  - Newsletter submission still works (POST /api/newsletter behaviour preserved). ✅
  - All existing home-touching tests pass; new ones cover the two client islands. ✅
- **Tests**: 456/456 (was 435; +21).
- **Risk**: medium — many sections, lots of surface area. Retained all data-flow; only chrome and markup changed.
- **Delivered commits**:
  - `dbd90ce` — feat(storefront-v2): Chunk 6 — Home page re-skin + 2 new client islands
- **Notes**:
  - `ProductCard` re-skinned to matter tile and made context-aware (`showAddButton`, `index`, `placeholderTone`). Home uses `showAddButton={false}` + sequential `index` + rotating `mineral / default / ink` tones. PLP will keep `showAddButton={true}` (default) in Chunk 7.
  - `AddToCartButton` re-skinned to a 32px ink square (matches the Cart upsell button in Chunk 4). Added `e.preventDefault(); e.stopPropagation()` so the `+` click never bubbles to the full-card link.
  - Newsletter form swapped to matter markup: hairline ink-bordered input with `ELECTRONIC ADDRESS` uppercase placeholder, inline ink `ENROL →` button. Success and error states stay inline mono captions (no toast, no modal). Added a "Dispatched quarterly · 2,814 subscribers" footnote.
  - Principles SVG icons are hand-drawn per handoff: `currentColor`, `stroke-width: 1`, square linecaps — no icon libraries per wireframe constraint.
  - Reviews carousel uses arrow navigation only (no auto-advance, no dots) with wrap-around. Page counter in mono caps; assay-green verified dot on reviewer names.
  - Spotlight tab selector uses `role="tablist"` + `role="tab"` + `aria-selected`; `aria-selected={selected}` flips the ink/paper inversion. `2%`, `0.05%`, `largest`, `plants` rendered in italic `<em>` inside the display headline.
  - 4 new testids: `home-hero`, `home-featured`, `home-spotlight`, `home-principles`, `home-reviews`, `home-press`, `home-newsletter`, plus the per-element ones inside islands.

---

## Chunk 7 — PLP (`/products`) ✅

- **Prereqs**: Chunks 2, 3, 4 ✅
- **Scope**: re-skinned `src/app/(shop)/products/page.tsx` per `wireframes-storefront-v2/Plp.html`:
  - `FilterBar` re-skinned to matter mono-caps chips (hairline border, ink fill on active); 3-zone grid layout; sort select unchanged. URL-driven + optimistic UI preserved. ✅
  - New `ProductTile` component (1/1 square specimen, hairline-wrapped info block with `border-top: 0`, body-medium name, concerns eyebrow, `+` button). ✅
  - Pagination re-skinned to `← Prev · PAGE NN / NN · NEXT →` hairline bar; disabled states keep hairline border and render `text-graphite`. ✅
  - New `SkinInsightCTA` component extracted for reuse in Chunk 13 (coming-soon page). Heatmap figure with SVG grid + 8 ink-opacity clusters + 4 plotted markers + trust-data strip. ✅
  - Preserved `unstable_cache` + admin-client fetch (recent `4da9d9c`). ✅
- **Done when**:
  - FilterBar drives URL, server re-renders with filtered products. ✅
  - `+` button on tile triggers CartDrawer via existing `AddToCartButton`. ✅
  - Empty state handled with matter voice ("— No formulas match your filters."). ✅
  - Existing FilterBar tests still pass (aria-pressed contract preserved); new ProductTile + SkinInsightCTA tests added. ✅
- **Tests**: 471/471 (was 456; +15). FilterBar 18 tests still green without modification.
- **Risk**: medium — filter state + server fetch cache interaction.
- **Delivered commits**:
  - `73d68a7` — feat(storefront-v2): Chunk 7 — PLP re-skin + ProductTile + SkinInsightCTA
- **Notes**:
  - Home kept using `ProductCard` (4/5 aspect, display name, counter row, "View assay →" CTA). PLP now uses new `ProductTile` (1/1 aspect, body-medium name, concerns eyebrow, `+` button). Two components because the PLP tile's typography + border system is different enough that `ProductCard + props` would have become a mess.
  - `AddToCartButton` is shared across both tile variants, Cart upsell, and PDP. Click handler `preventDefault + stopPropagation` prevents the wrapping `<Link>` from navigating when the `+` is clicked.
  - The PLP tile puts the `+` button outside the `<Link>` via absolute positioning inside the info block (prevents invalid button-inside-anchor nesting).
  - Empty state lives inside the grid section (not a full-page takeover) and adds a secondary "Take the quiz" CTA.
  - `SkinInsightCTA` renders an `id="skininsight"` anchor on its `<section>`, so the nav's `/skin-insight` link can deep-scroll here (or navigate to `/skin-insight` once Chunk 13 ships) without breaking either behaviour.

---

## Chunk 8 — PDP (`/products/[slug]`) ✅

- **Prereqs**: Chunks 2, 3, 4, 7 ✅
- **Scope**: re-skinned `src/app/(shop)/products/[slug]/page.tsx` per `wireframes-storefront-v2/Pdp.html`:
  - Breadcrumb (mono trail, hairline-bordered bar). ✅
  - New `PDPGallery` client island (1/1 hero + 4 hairline thumbs with ink-border selected state; `role=tablist`). ✅
  - `PDPPurchasePanel` rewritten: category eyebrow, display h1 (clamped 40-52px), price (display + / size mono), SIZE variant pills (ink fill active, disabled + line-through + "— Out of lot" when OOS), IDEAL FOR chip list, 130px/1fr Qty+ATC grid, KEY INGREDIENTS rows (IngredientTag 3px ink left border), paper-2 CLINICAL INSIGHT callout. ✅
  - New `PDPReviews` client island — 3-up arrow-nav carousel matching Home reviews pattern, with empty state + dynamic page counter. ✅
  - New "The formulation. / The assay." split on paper-2 replaces V1's single description block + ingredients strip. ✅
  - Related products: "Complete the regimen" 4-up using existing ProductCard (home variant — no + button, full-card link). ✅
  - `generateMetadata` + JSON-LD breadcrumb retained; Site name updated from "Form." to "· matter". ✅
- **Done when**:
  - Every section matches wireframe. ✅
  - Variant switching updates price display only (never trusts client prices). ✅
  - ATC works end-to-end (triggers CartDrawer with correct variant+qty). ✅
  - All PDP-related tests pass. ✅
- **Tests**: 486/486 (was 471; +15). Updated PDPPurchasePanel tests to match new DOM; new PDPGallery (6 tests) + PDPReviews (8 tests) specs.
- **Risk**: medium.
- **Delivered commits**:
  - `f9f6ff7` — feat(storefront-v2): Chunk 8 — PDP re-skin + PDPGallery + PDPReviews
- **Notes**:
  - Removed `ReviewBar` from the purchase panel (wireframe doesn't include it — the aggregate lives on the PDPReviews header now as "n = N · avg X.X / 5"). `ReviewBar` atom kept for other surfaces.
  - Variant OOS state: `disabled={true}` + `data-oos="true"` + visible `— Out of lot` caption + line-through, so screen readers see the disabled state AND sighted users see it. Disabled variants can't be selected (matches wireframe intent that OOS is a display-only state, not a broken click target).
  - Description + ingredients moved to a shared paper-2 section (`The formulation. / The assay.`) below the purchase panel. Keeps the main 2-col dense above the fold and gives the full ingredient list a proper home that matches matter's editorial voice.
  - `PDPReviews` duplicates ~70% of `HomeReviewsCarousel` intentionally: data sources differ (hardcoded vs. fetched), empty-state handling differs, and refactoring to a shared primitive would delay shipping. If a third review carousel appears, extract then.
  - Related products limit bumped from 3 → 4 to match the wireframe.
  - In-card image pager on related cards (per wireframe) is deferred — we only have one image per product today, so a 1-of-1 pager is dead weight. Revisit when multi-image products ship.

---

## Chunk 9 — Ingredients page (new route, MDX pipeline) ✅

- **Prereqs**: Chunks 2, 3, 8 ✅
- **Scope**:
  - Pragmatic interpretation of D1 (MDX): structured reference data (formulas, tolerances, provenance) lives in `src/lib/ingredients/catalogue.ts` as typed TS; editorial essay content lives in `src/content/ingredients/*.md` with front-matter (`aside` pullquote) parsed by `gray-matter` at build time. Reads in a clean git workflow for copywriters while avoiding an `@next/mdx` pipeline that would only be used for prose paragraphs. Upgrade path to `.mdx` is trivial if we need embedded JSX later. ✅
  - Shipped 4 essay files: `NIA.md`, `RET.md`, `HYA.md`, `_default.md`. The other 14 ingredients surface catalogue data + fall back to the default essay until copy is written. ✅
  - New route `src/app/(shop)/ingredients/page.tsx` per `wireframes-storefront-v2/Ingredients.html`:
    `IngredientsHero` (2-col + 3-cell stat strip) + `IngredientsReader` (client island: ChapterRail with arrow scroll + hash sync + localStorage resume; EssayEntry with chapter head + clamped title + dropcap body + sticky data-sheet sidecar + "Appears in" chips; wrap-around Prev/Next links) + `Philosophy` 3-up strip. ✅
  - Deep-linking: `/ingredients#essay/[SYM]` resolves to the right chapter at mount. `localStorage('mt_essay_sym')` resumes the last-read chapter on cold load. `hashchange` listener keeps back/forward working. ✅
- **Done when**:
  - `/ingredients` renders with all 17 entries, rail navigates, hash resolves, localStorage resumes. ✅
  - Sticky sidecar behaves correctly at all scroll positions (`position: sticky; top: 96px`). ✅
  - `pnpm build` statically prerenders the page (`○`) with essay content baked in. ✅
- **Tests**: 509/509 (was 486; +23). Catalogue integrity (7 tests), essay loader + fallback (5 tests), IngredientsReader client behaviour (13 tests including hash + localStorage + wrap-around). Setup gained `ResizeObserver` + `scrollIntoView/scrollBy` polyfills for jsdom.
- **Risk**: medium — new content pipeline + client state + URL sync.
- **Delivered commits**:
  - `72fb121` — feat(storefront-v2): Chunk 9 — Ingredients page + md content pipeline
- **Notes**:
  - **D1 deviation flag**: D1 said "MDX". We shipped `.md` + front-matter instead of `.mdx`. Practical reasoning: our content is straight prose paragraphs plus a single aside per ingredient — no embedded components. Adding `@next/mdx` would pay build-time setup cost for nothing. If future essays want inline `<Aside>`, `<Figure>`, or `<Citation>` JSX, we swap `gray-matter` for `@next/mdx` with no content changes (front-matter and paragraph structure are compatible). Flagging so we can revisit if copywriters need richer formatting.
  - The existing PDP ingredient rows (IngredientTag) are NOT yet wired to deep-link into `/ingredients#essay/[SYM]` — this was listed as a side-effect in the original scope but isn't load-bearing. Deferring to a small follow-up PR inside Chunk 8's surface area if we want it before cutover.
  - `ChapterRail` arrow affordance toggles based on scroll position via `ResizeObserver`. Arrow buttons disable (hairline border, graphite text) when at scroll edge. Added `scrollbar-none` + `scrollbar-width: none` inline for the horizontal chip scroller — no visible scrollbar, functional drag + arrow buttons.
  - `EssayEntry` alternates bg between `paper` and `paper-2` based on chapter index — gives a visible rhythm when skimming; sidecar bg inverts to maintain contrast with the essay column.
  - `_default.md` is the fallback for any ingredient without its own file. Means we can ship the page today with 14 placeholder fallbacks and add rich essays over time without code changes.

---

## Chunk 10 — Checkout + Order confirmation ✅

- **Prereqs**: Chunks 2, 3, 4, 8 ✅
- **Scope**:
  - Re-skinned `src/app/(checkout)/checkout/page.tsx` — matter editorial layout: bare chrome (wordmark · SSL caption · "Need help?" → /support/new), display headline "Finalising your consignment.", 12-col grid 8/4. Three sections with 2px ink top rule: § 01 Contact, § 02 Dispatch address, § 03 Payment. COD selected, UPI/Net banking disabled as "Coming soon". Ink `Place order · ₹XXXX` CTA with dynamic total. ✅
  - Sticky summary aside with `§ Order brief` header, formula count, compact line items, math strip (Subtotal / Shipping / Tax), display Total, "DISPLAYED TOTAL · RECOMPUTED ON SUBMIT" caption. ✅
  - Re-skinned `src/app/(checkout)/order/[id]/page.tsx` — broadsheet masthead (3px double-rule, "Vol. I · No. 01 · Order brief · Dispatch · [date]"), confirmation hero "Your consignment is underway." + ORD-MT-XXXX ack line + email caption, 4-cell info strip (Status · Estimated dispatch · Payment · Order ID), Manifest table with per-line idx/name/sku/qty/unit/line, right-aligned totals strip, Account incentive block (guest-only, paper-2, links to `/signup?prefill=[email]&order=[id]`), 4-up "You might also like" (ProductCard, no + button), Footer. ✅
  - Preserved every commerce invariant: server-side `/api/orders` RPC recomputes all money; client sends only `{ variant_id, quantity }` + shipping address; `user_id` derived from session server-side; `clearCart()` runs only after successful order id returned; mounted guard around `subtotal`/`total` prevents hydration mismatch. ✅
- **Done when**:
  - Checkout form validates per the existing Zod schema (no schema changes). ✅
  - Order created via the existing atomic RPC (untouched), redirect to `/order/[id]`. ✅
  - Confirmation page renders for both authed and guest orders (account incentive toggles on `order.user_id === null`). ✅
  - All existing checkout tests pass. ✅
- **Tests**: 512/512 (was 509; +3 net). Updated 9 CheckoutPage tests to match new DOM (brand "matter" + testids for secure/help/sections/formula-count + new CTA copy). No behaviour assertions removed — validation, submission, and empty-cart redirect tests still green.
- **Risk**: **high** — money flow. Only presentational changes; request/response shapes unchanged.
- **Delivered commits**:
  - `72372e6` — feat(storefront-v2): Chunk 10 — Checkout + Order confirmation
- **Notes**:
  - Checkout page now sends its data to `/api/orders` in the **exact same shape** as before (verified by the unchanged payload-shape test). Commerce reviewer should diff `payload` between main and storefront-v2 to confirm; it's a line-for-line preservation.
  - Order number formatting is left to the DB's `order_number` column — we render it verbatim. The wireframe's `ORD-MT-XXXX` example matches what the DB currently emits; if that ever changes, the page picks it up automatically.
  - Account incentive dropped the V1 "Set a password + Create account" inline form in favour of a `/signup?prefill=…&order=…` link. Reason: V1 form was unwired ("Auth is Phase 2 — this will be wired up in Task 4.1."); the link to `/signup` is cleaner and will work the moment Chunk 11 lands. The `prefill` + `order` query params are a convention — `/signup` doesn't read them yet (out of scope for Chunk 10). Flagged as follow-up for Chunk 11.
  - "Estimated dispatch" is derived from `created_at + 2…4 days` client-side of the render (server component, UTC-safe). No new DB column.
  - Info strip `Status` reads the actual `order.status` value; currently only `confirmed` gets a green dot treatment. If order transitions to `shipped`/`delivered`/`cancelled` on re-visit, the lowercase raw status shows. Acceptable today; can expand when `/account/orders/[id]` (Chunk 12) needs the same pattern.
  - Related-products block now includes an "explicit exclude" pass: products whose variants are all in the current order are filtered out (was a no-op in V1 — just called `getRelatedProducts([])`).

---

## Chunk 11 — Auth (`/login` + `/signup`) ✅

- **Prereqs**: Chunks 2, 3 ✅
- **Scope**:
  - Re-skinned `LoginView` per wireframe — typographic-only, minimal chrome (wordmark + `§ ACCESS · VERIFIED`), paper-2 body, centered 480px column, `§ RETURNING SUBJECT` eyebrow, "Welcome back." display heading, 2px ink top-rule form with matter Input fields, ink `SIGN IN →` CTA, switch-to-signup link. Preserved `next=` redirect behaviour. ✅
  - Re-skinned `SignupView` — same chrome; `§ NEW SUBJECT — ENROLL` eyebrow, "Create your dossier." display heading. Form gained **first_name** + **last_name** + **terms** checkbox to match the wireframe; names passed to Supabase as `user_metadata`. Dropped `confirm_password` (not in wireframe — show/hide toggle is a future addition). `?prefill=<email>` from Chunk 10's guest confirmation link pre-fills the email input. "Check your inbox" verification screen matter-voiced. ✅
  - `SignupSchema` updated: `first_name`, `last_name`, `email`, `password`, `terms: z.literal(true)`. 10 schema tests (was 9) covering names, terms, trim/lowercase. ✅
  - Suspense wrappers at page level preserved (both pages use `useSearchParams`). Both routes still static-prerender (`○`). ✅
- **Done when**:
  - Both routes build statically. ✅
  - Forms submit; `next=` preserved; `prefill=` pre-fills email. ✅
  - Inline errors follow V2 rules (oxblood mono caption). ✅
  - All auth tests pass, including schema tests for the new fields. ✅
- **Tests**: 518/518 (was 512; +6). Schema: 10 (+6). LoginPage: 5 unchanged. SignupPage rewritten to cover names, terms, prefill, next-param.
- **Risk**: medium. Auth request shapes unchanged beyond the additive `options.data.{first_name,last_name}`.
- **Delivered commits**:
  - `1ce6189` — feat(storefront-v2): Chunk 11 — Auth re-skin
- **Notes**:
  - **D3 followed**: zero imagery on both pages. Typographic-only editorial layout matches the About-page restraint.
  - **Schema breaking change (additive)**: `SignupSchema` now requires `first_name`, `last_name`, `terms`. Anything else that imports it would break — grep confirms only `SignupView` and the schema test consume it, so there is no hidden caller.
  - **Deferred (noted in SignupView comments)**: `?order=<id>` claim-on-signup server action. Chunk 10 emits this link, but auto-attaching the guest order to the new user's id isn't yet wired server-side. Plumbing needs: server action that (a) verifies session, (b) checks `order.contact_email === auth.email`, (c) updates `orders.user_id` when currently null. 10-line change; punts to Chunk 12 (Account) or a dedicated follow-up before cutover.
  - **Deferred**: Show/hide password toggle, forgot-password flow, social login, magic link — all marked as Phase 2 in the wireframe notes and TDD. Not in scope for MVP.
  - Caps-lock detection on the password field (wireframe aside) is a nice-to-have but not load-bearing; skipped.

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
- `2026-04-18` — **Chunk 0 complete.** `storefront-v2` cut from `main` at `4da9d9c`. GitHub Actions CI added (was missing entirely). Planning docs + handoff landed on `main` at `bf61957`; CI workflow at `092be5d`. Both branches green.
- `2026-04-18` — **Chunk 1 complete** at `38096be`. Matter tokens + fonts (`next/font/google`) applied. V1 class names back-compat-aliased to matter values; 372/372 tests still pass. V1 pages now render in V1 layouts with matter palette/typography as expected.
- `2026-04-18` — **Chunk 2 complete** at `846df2e`. 12 atoms re-skinned, 4 new primitives added (Placeholder, Eyebrow, MonoCaption, Ruler), StatusChip alias in barrel. Class-name test assertions refactored to `data-variant` / `data-size` / `data-status` / `data-tone`. 405/405 tests green (+33).
- `2026-04-18` — **Chunk 3 complete** at `540e669`. Navbar + Footer re-skinned to matter chrome. Wordmark "Form." → "matter." Nav: Shop · Ingredients · SkinInsight · About. Search button removed (unwired). 407/407 tests green (+2).
- `2026-04-18` — **Chunk 5 complete** (Chunk 4 deferred — pilot page prioritised to validate atoms + chrome + tokens end-to-end on a real page before touching the cart overlay). `/about` shipped as a server component with `AboutHero` + `Manifesto` per handoff. `wireframes-storefront-v2/About.html` added for V2 consistency. 421/421 tests (+14). 17 routes build (was 16; `/about` is static `○`).
- `2026-04-18` — **Chunk 4 complete** at `8c1d5e0`. CartDrawer re-skinned to matter. Drawer widened to 480px. New free-ship progress block with assay-green unlock state; new trust strip; new formulas/items header format; new empty-state quiz CTA. Upsell eyebrow renamed to § FREQUENTLY ADDED. `Continue shopping` button removed (redundant with Esc/×/backdrop). 435/435 tests (+14).
- `2026-04-18` — **Chunk 6 complete** at `dbd90ce`. Home page rebuilt for matter — hero, featured, spotlight (new client island), principles (hand-drawn 1px SVGs), reviews carousel (new client island), press 6-cell, newsletter. ProductCard re-skinned and made home/PLP-aware via props (`showAddButton`, `index`, `placeholderTone`). NewsletterForm re-skinned to matter inline (ELECTRONIC ADDRESS + ENROL →, assay-green success, oxblood errors). 456/456 tests (+21).
- `2026-04-18` — **Chunk 7 complete** at `73d68a7`. PLP rebuilt for matter — FilterBar chips, new ProductTile (1/1 square + hairline-wrapped info block), matter pagination, SkinInsightCTA block with heatmap figure extracted for reuse in Chunk 13. Home keeps ProductCard; PLP uses ProductTile — two components because typography differs. 471/471 tests (+15).
- `2026-04-18` — **Chunk 8 complete** at `f9f6ff7`. PDP rebuilt — mono breadcrumb, 2-col PDPMain, PDPGallery (new client island with tablist thumbs), PDPPurchasePanel re-skin (display h1, ink variant pills with OOS states, IDEAL FOR chips, matter ATC, clinical-insight callout), paper-2 "formulation + assay" section, PDPReviews carousel (new client island), 4-up related products. ReviewBar removed from panel — aggregate moved to PDPReviews header. 486/486 tests (+15).
- `2026-04-18` — **Chunk 9 complete** at `72fb121`. `/ingredients` ships with IngredientsHero + IngredientsReader (17-chip ChapterRail + dropcap EssayEntry + sticky data-sheet sidecar + wrap-around Prev/Next + hash sync + localStorage resume) + Philosophy. Content pipeline: `src/lib/ingredients/catalogue.ts` (typed) + `src/content/ingredients/*.md` (gray-matter front-matter). D1 deviation flagged: plain .md vs .mdx — upgrade path clean. 509/509 tests (+23). Setup polyfills: ResizeObserver + scrollIntoView/scrollBy.
- `2026-04-18` — **Chunk 10 complete** at `72372e6`. `/checkout` and `/order/[id]` both re-skinned to matter editorial layout. Commerce invariants preserved — the POST /api/orders payload shape is byte-identical to main. Checkout: 12-col grid, three § sections, COD-only payment, ink CTA with dynamic total, sticky summary with "Displayed total · Recomputed on submit" caption. Confirmation: broadsheet masthead, "Your consignment is underway." hero, 4-cell info strip, manifest table, guest-only account incentive → /signup?prefill=…&order=…, 4-up related. 512/512 tests (+3 net). Two follow-up fixes: `bf63ba5` dropped non-existent `payment_method` column from getOrder select (was causing 404 on every successful checkout); `43259b5` restored top nav on the confirmation page (dropped in Chunk 10, added back inline so /checkout stays minimal).
- `2026-04-18` — **Chunk 11 complete** at `1ce6189`. `/login` and `/signup` re-skinned per D3 (typographic-only, no imagery). SignupSchema expanded: first/last name + terms literal; prefill email from `?prefill=`; next-param preserved. Order claim-on-signup flagged as deferred follow-up. 518/518 tests (+6).
