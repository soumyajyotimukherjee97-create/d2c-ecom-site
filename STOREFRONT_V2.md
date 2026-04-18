# Storefront V2 — Migration Plan & Decisions

> Single source of truth for the customer storefront redesign (V1 → matter design language).
> Internal console (`apps/internal/`) is **out of scope** and untouched throughout.

## Status

- **Phase**: pre-code — decisions locked, wireframes drafted, no code changes yet
- **Target**: `apps/storefront/` only
- **Scope**: visual-only redesign. No commerce-logic, schema, RLS, API-contract, or TDD-invariant changes.

## Authoritative references

| Area | Source |
|---|---|
| Visual tokens | `DESIGN_SYSTEM_V2.md` · `design_agent_handoff/project/assets/matter.css` |
| Layouts per page | `wireframes-storefront-v2/*.html` |
| Commerce rules | `TDD.md` (unchanged) + `CLAUDE.md` (Commerce invariants section) |
| V1 (for what we are leaving) | `DESIGN_SYSTEM.md` · `wireframes/*.html` |

Wireframes in `wireframes-storefront-v2/`:
`Home.html` · `Plp.html` · `Pdp.html` · `Pdp.html` · `Cart.html` · `Checkout.html` · `Account.html` · `Auth.html` · `Ingredients.html`

---

## Decisions locked

### D1 — Ingredients content source: **MDX**
- **Chosen**: static MDX in `src/content/ingredients/*.mdx`, one file per molecule.
- **Rejected**: Postgres `ingredients` table + admin editor.
- **Why**: Content changes rarely, every edit benefits from PR review (these are scientific claims), zero schema/admin work. Migration to DB later is a straightforward script if cadence ever demands it.
- **Implication**: Copywriters need a git workflow (or a teammate to paste).
- **New surface**: `/ingredients` route, plus content directory and MDX compiler wiring.

### D2 — SkinInsight in nav: **Keep link, retarget to "Coming soon" page**
- **Chosen**: Nav link stays; destination becomes a new `/skin-insight` coming-soon page.
- **Rejected**: (i) link to scroll anchor on PLP (promissory), (ii) drop from nav entirely.
- **Why**: Preserves brand bet that matter is moving toward AI-led skincare without promising delivery today. Honest about status.
- **Implication**: PLP heatmap block's "Try now" CTA also retargets to `/skin-insight`. Optional: waitlist capture on that page. Phase 2 flips the destination to the real product.
- **New surface**: `/skin-insight` route (coming-soon shell — wireframe TBD).

### D3 — Auth + Account visual tone: **Typographic-only**
- **Chosen**: No imagery, no specimen art on `/login`, `/signup`, `/account`. Broadsheet masthead + centered editorial form (auth) / two-column dossier (account).
- **Rejected**: Left-column specimen art + right-column form.
- **Why**: Auth is high-intent, utilitarian; imagery is noise. Matches the About/Manifesto restraint. Cheaper to build and maintain (no asset pipeline for pages nobody looks at twice).
- **Implication**: Some users will read the page as austere. Acceptable — matches matter's "science of less" positioning.

### D4 — Order confirmation tone: **Dispatch-brief**
- **Chosen**: `/order/[id]` presents as an editorial dispatch brief — "§ ACKNOWLEDGED — ORD-MT-0026 · Your consignment is underway." Broadsheet masthead. Info strip with status / ETA / payment / order id. No confetti.
- **Rejected**: Ceremonial "Thank you" treatment with product imagery.
- **Why**: Post-purchase trust is thinnest — users want facts fast. Ceremony breaks voice. Establishes a consistent lab vocabulary (`ORD-MT-XXXX`, "consignment") the customer will see again in shipping emails, account orders list, support replies.
- **Implication**: Info strip + assay-green ● CONFIRMED does the emotional work. Account-incentive block (guest-only) provides the soft conversion.

### D5 — Rollout: **Long-lived `storefront-v2` branch**
- **Chosen**: All V2 work on a `storefront-v2` branch cut from `main`. One cutover PR at the end.
- **Rejected**: (i) In-place page-by-page on `main`, (ii) feature flag.
- **Why**: `tailwind.config.ts` is per-app — token flip is all-or-nothing per page. In-place would force scoped variables (real complexity) or lockstep shipping anyway. Feature flag duplicates every atom for weeks; classically never flips.
- **Implication**: One big deploy; no partial-rollout feedback. Wireframes + internal review substitute for that feedback loop.

#### Branch guardrails (for duration)

- `storefront-v2` is cut once, from `main`.
- **All V2 commits land on `storefront-v2`. Not on `main`.**
- During V2: `main` accepts **critical fixes only** — bug reports, security patches, internal-console changes. No V1 polish.
- Rebase `storefront-v2` on `main` **weekly** to avoid drift.
- CI must run on the branch from day 1. Broken typecheck / lint / tests block commits.
- Tests evolve alongside code — no merging red tests.
- Cutover = one PR `storefront-v2` → `main`, reviewed end-to-end, smoke-tested against fresh `supabase db reset`, then merged.
- Rollback = Vercel "promote previous deployment" button. Database unchanged, so no data risk.

---

## Migration sequence

1. **Tokens** — rewrite `apps/storefront/tailwind.config.ts` with matter palette, fonts, spacing. Add `Instrument Serif`, `Inter Tight`, `JetBrains Mono` via `next/font`.
2. **Atoms** (`components/ui/`) — re-skin Button, Input, Chip, Badge, SkeletonCard, Alert; add new primitives: Placeholder (striped), Eyebrow, MonoCaption, Ruler, StatusChip. Existing tests survive since they assert on `data-testid` and roles.
3. **Chrome** — Navbar, Footer (shared across every page).
4. **Pilot: About page** (new route, static, no commerce). Proves the atom set end-to-end.
5. **Home** — many sections, zero writes.
6. **PLP + PDP** — commerce-visible but read-only.
7. **Ingredients** — new route, MDX pipeline, chapter rail + essay + sidecar.
8. **Cart drawer** — overlay + commerce logic. Highest coupling.
9. **Checkout + Order confirmation** — payments-critical. Last because atoms are proven.
10. **Auth + Account + Support** — lower traffic, reuses everything above.
11. **SkinInsight coming-soon page** — small, can slot in anywhere after step 3.

---

## Primitives not yet specified in V2

Need design decisions before they're used in any page build:

- Overlay / backdrop — color, opacity, no blur
- Drawer — width, animation, close chrome (spec'd in `Cart.html`; generalise)
- Modal — V1 didn't use modals; confirm V2 continues that rule
- Form-field group — label placement, required marker, error slot (drafted in wireframes)
- Select dropdown — generalise the sort pill from `Plp.html`
- Stepper / quantity control — reconcile PDP vs Cart versions
- Progress bar — free-shipping pattern in Cart
- Avatar / initials — 28px paper-3 square confirmed; add font rule
- Toast / flash — spec or confirm "no toasts, inline alerts only"

Will append to `DESIGN_SYSTEM_V2.md` as each is resolved.

---

## Open items (not yet decided)

- **Responsive breakpoints** — matter was authored at 1440px only. Breakpoint strategy for `lg` / `md` / `sm` still needs design.
- **Photography** — every `m-ph` striped placeholder in the wireframes must be replaced by real product art before launch. Asset plan, naming, hosting (Supabase storage?) to confirm.
- **Press masthead** — typographic "Vogue Paris" etc. is a placeholder. Replace with licensed art or keep typographic?
- **Alternate palettes** (`ivory`, `sage`, `noir`, etc. from `tweaks.jsx`) — ship just `bone`, or expose a seasonal theme switch?
- **Newsletter backend** — POST target (`/api/newsletter` vs. direct Resend audience) is Phase 2 per TDD. Confirm MVP behaviour (no-op? email capture in DB?).
- **Write-review flow** — referenced in PDP wireframe but flow/route not specified.
- **Email templates** — `packages/email` currently uses V1 visual language. Re-skin to matter vocabulary at some point (not blocker for storefront cutover).

---

## Test impact (expected)

- **Vitest unit/component**: 371 storefront tests assert on `data-testid` and roles per `CLAUDE.md` — should largely survive. Class-based assertions (if any) will need updates.
- **Playwright E2E**: 6 flows all drive via `data-testid`. Should survive unchanged.
- **Integration**: API-layer, unaffected by visual redesign.
- **New tests required**: `/ingredients` routing + MDX render; `/skin-insight` routing; any new atom (Placeholder, Eyebrow, MonoCaption, Ruler, StatusChip).
