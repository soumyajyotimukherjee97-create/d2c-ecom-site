# Design System — matter (V2, storefront only)

> Applies to `apps/storefront/` only. The internal console (`apps/internal/`) keeps the original `DESIGN_SYSTEM.md`.
> Source of the visual language: `design_agent_handoff/project/` — treat `assets/matter.css` as authoritative for tokens when this file is silent.

## Philosophy
Scientific-modernist luxury skincare. Editorial, restrained, lab-documentation aesthetic.
"The science of less" — every element justified, every number disclosed.
Warm bone paper, ink-black type, a single clinical-green accent. 1px hairlines carry all the weight — no shadows, no radii, no gradients. Typography does the work.

## Fonts
- Display: **Instrument Serif** (400, italic available) — all `m-display`, editorial headlines, product names. Italics (`<em>`) carry emphasis, never bold.
- Body/UI: **Inter Tight** (300, 400, 500, 600) — body copy, labels, form inputs. Base size 14px, line-height 1.5. Feature settings `ss01, cv11`.
- Monospace: **JetBrains Mono** (300, 400, 500) — eyebrows, specs, CTAs, data cells, prices-adjacent metadata. Tracking 0.02em default; 0.14–0.22em for uppercase eyebrow/label use.

## Colors

**"Warm bone & ink" — the default palette:**
- `--paper` #F4F1EB (page background)
- `--paper-2` #EDE9E1 (alternating sections, sidecars)
- `--paper-3` #E4E0D6 (deeper recess, avatar chips)
- `--mineral` #D6D2C6 (muted surface)
- `--hairline` #BFBAAD (all borders, default)
- `--graphite` #55534C (secondary text, eyebrow captions)
- `--ink-2` #26251F (body prose)
- `--ink` #121210 (primary text, buttons, strong rules)

**Single accent — clinical green (actives, in-stock, concentrations):**
- `--assay` `oklch(0.56 0.08 148)`
- `--assay-ink` `oklch(0.34 0.06 148)` (on light surfaces)

**Alarm (used sparingly — "Avoid" tolerance, errors):**
- `--oxblood` `oklch(0.46 0.12 30)`

**Hairline rules:**
- `--rule` `1px solid var(--hairline)` — default border
- `--rule-soft` `1px solid color-mix(in oklab, var(--hairline) 50%, transparent)` — internal dividers inside already-bordered blocks

Alternate palettes (bone, ivory, mineral, oxide, ash, sage, rose, slate, noir) are defined in `design_agent_handoff/project/assets/tweaks.jsx` and wired into Tailwind as themed token sets. Bone ships; others are retained for seasonal/editorial exploration only — never mix within a single page.

## Spacing
4px base grid. Use only: 4, 8, 12, 14, 16, 20, 24, 28, 32, 40, 48, 56, 64, 72, 80, 96, 120, 128px.
Section vertical padding lives in the 72–128px band (standard is 96px). Avoid arbitrary values.

## Layout grid
- Container: `max-width: 1440px`, horizontal padding `32px`, centered
- Columns: 12-col with 24px column-gap
- Desktop-first (design was authored at 1440px). Breakpoints: `lg` 1024px (collapse to 8-col), `md` 768px (collapse to 4-col, stack hero), `sm` 640px (single column). Responsive rules must be added — the handoff is desktop-only.
- Decorative "lab ruler" (numbered 01–12 mono captions top/bottom of container) is optional page-top ornament, not load-bearing.

## Border Radius
**Zero. Everything is square.** No `rounded-*` on any surface, input, button, chip, card, or image. The single exception is the `m-dot` status indicator and small circular badges used for dot-pagination and avatars (`border-radius: 50%` for those only).

## Elevation
**No box shadows. No translateY on hover.** Depth comes from:
- 1px hairline borders (`--hairline` resting, `--ink` on focus/active/hover-intent)
- Surface tone shifts (`--paper` ↔ `--paper-2` ↔ `--paper-3` ↔ inverted `--ink`)
- Border thickness: hairline for ambient structure, `2px solid var(--ink)` for chapter heads, `3px double var(--ink)` for editorial mastheads

## Typography rules
- **Display XXL** (hero titles, manifesto, chapter titles): Instrument Serif, `clamp(56px, 7vw, 160px)`, line-height 0.92–0.98, letter-spacing -0.025em to -0.03em. Italic `<em>` carries the key word.
- **Display L** (section h2): Instrument Serif, 40–68px, line-height 1.0–1.05
- **Display M** (product name, card title): Instrument Serif, 22–34px, line-height 1.0–1.15
- **Display S** (tile name): Instrument Serif, 22–26px
- **Body L** (standfirst, hero subcopy): Inter Tight 16–17px, line-height 1.6–1.7, color `--ink-2`, max-width ~560px
- **Body** (prose, reviews, blurbs): Inter Tight 13–15px, line-height 1.6–1.7, color `--ink-2`
- **Eyebrow** (section kicker, `§ II — Title`): JetBrains Mono 10px, letter-spacing 0.14em, uppercase, color `--graphite`
- **Mono caption** (specs, pH, MW, verified, dates): JetBrains Mono 9–11px, letter-spacing 0.08–0.18em, uppercase when used as label
- **Num** (prices, percentages, n-values): JetBrains Mono, `font-variant-numeric: tabular-nums`, letter-spacing 0.01em. Prices display as `₹{Math.round(paise / 100).toLocaleString()}` per commerce rule (see `CLAUDE.md`).

## Components

### Buttons
Square corners, mono-caps label, 10–11px, letter-spacing 0.14–0.2em, uppercase.
- **Primary (`m-btn`):** `--ink` fill, `--paper` text, 1px `--ink` border. Hover → `--ink-2`.
- **Ghost (`m-btn--ghost`):** transparent fill, `--ink` text/border. Hover → inverts to primary.
- **Hair (`m-btn--hair`):** transparent fill, `--ink` text, `--hairline` border. Hover → border darkens to `--ink`.
- Padding 13px 20px (default) or `14px 24px` (inline hero CTAs). Gap 10px for icon+label.
- On dark/inverted sections, borders and text flip to `--paper`.

### Chips / tags (`m-chip`)
Mono-caps 10px, letter-spacing 0.12em, 1px hairline, padding 6–7px x 10–12px.
Variants: default (graphite-on-transparent), `--ink` (inverted), `--assay` (green-on-paper), `--filled` (paper-2 background). No radius.

### Inputs (`m-input`)
Mono 12px, 1px hairline, padding 12–14px. Transparent background. Focus border → `--ink`. Placeholder is uppercase mono caption (10px, graphite, letter-spacing 0.12em). No radius.

### Product card
- Square or 4/5 aspect image area (striped tonal placeholder until real art)
- 1px hairline bordering the info block underneath; top border becomes the image's bottom if the image is borderless
- Class eyebrow (mono caption), name (body 500, 14–15px), concerns (mono 9px), price (num 15px), inline `+` add-to-cart button (28px ink square, no radius)
- Hover: borders darken to `--ink`; no shift, no shadow

### "Assay" row (`m-assay`)
Ingredient listing: `[40px index] [name + small sub-label] [percentage]` grid, soft rule divider between rows.
Used for PDP key ingredients, ingredient data sheets.

### Data table (`m-table`)
Full-width, collapsed borders, mono 11px. Header is mono 10px uppercase with 0.12em tracking in `--graphite`. Numeric columns use `tabular-nums` and right-align via `.num`. Row rule is `--rule-soft`.

### Specimen placeholder (`m-ph`)
Striped 135° gradient over `--paper-2` (default), `--mineral`, or `--ink` (inverted). 1px hairline. Used as image stand-in; carries a mono caption pair at bottom-left / bottom-right (`SPECIMEN · 01` + descriptor). Replace with real photography in production.

### Eyebrow pattern
Every section opens with a mono eyebrow in the format `§ II — Featured formulas` (roman numeral + em-dash + title). Use `§` for structural sections, `Fig. 026` for data figures, `Vol. I · No. 01` for editorial mastheads.

### Ticker (`m-ticker`)
Horizontal scrolling mono caption strip, 60s linear loop, separators = middle dot `·`. Reserve for press strip, sustainability claims, or lot-level rotating copy.

### Carousels
Arrow-only navigation (40×40px square, 1px `--ink` border, hover inverts). Page counter `01 / 02` in mono 10px. No dots except on small product-card image pagers (5px circles). Reviews use 3-up pages; featured uses static 3-up grid.

### Inverted sections (`.m-inverted`)
When a section sets `background: var(--ink)`, add the `m-inverted` class. Text flips to `--paper`, borders to `color-mix(in oklab, var(--paper) 25%, transparent)`, buttons gain `--paper` borders that invert on hover. Used sparingly (hero-variant, press-spotlight pattern, footer masthead).

## Surface rhythm
Sections alternate between `--paper`, `--paper-2`, and occasionally `--paper-3` or full ink. Never place two identical-tone sections adjacent without an explicit border rule. The default rhythm across the homepage is:
`paper (hero) → paper (featured) → paper-2 (spotlight) → paper (press) → paper-2 (newsletter)`.

## Iconography
**No decorative icons.** Line SVGs only, 1px stroke, square linecaps, 48×48 viewbox, monochrome `currentColor`. Used in the Principles grid and as functional glyphs (chevrons, arrows). The lab-plotting visuals (crosshairs, rings, grids) are data ornaments, not icons — keep them inside figures.

## Motion
- Transitions 0.12–0.2s on color/background/border
- Arrows/carousels: `transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)`
- Marquee/ticker: 60s linear infinite
- No parallax, no auto-play video, no bounce, no spring
- `prefers-reduced-motion`: stop the ticker, cut transition durations to 0

## Page states (every data-fetching page)
Inherit the rules from `CLAUDE.md`:
- **Loading** → skeleton that matches the grid and rule structure, never spinners; striped `m-ph` works as a placeholder while its metadata caption holds layout
- **Error** → inline alert with retry — use a hairline-bordered block with `--oxblood` eyebrow, never a full-page takeover
- **Empty** → mono caption block with em-dash lead (`— No entries match. Adjust your filters.`), centered, 80–120px vertical padding
- **Unauthenticated** → middleware redirects to `/login` (unchanged from V1)

## Accessibility
Unchanged from `CLAUDE.md`, plus:
- Italic emphasis (`<em>`) is decorative only — never carry meaning in italics alone
- Mono-caps labels must be `<span>`/`<p>` with `text-transform` CSS, not hand-typed uppercase, so screen readers read them correctly
- The clinical-green accent on paper passes WCAG AA for body text; for caption-size (<12px) mono text pair it with ink-2 or graphite instead
- Arrow-only carousels must expose prev/next as buttons with `aria-label`, plus a visible page counter

## What to never do
- No box-shadow, no elevation tricks, no translateY on hover
- No border-radius anywhere except circular dots/badges
- No gradients (striped placeholders excepted — they're ornament, not UI state)
- No color outside this palette (or a listed alternate theme set)
- No font-weight 700+ on body; bold emphasis uses italic display instead
- No sentence-case monospace labels — mono is always uppercase with tracking
- No decorative icons, no illustration, no emoji
- No mixing palettes within a page — one theme per render
- No carousels with auto-play; no modal product quick-view (PDP is the destination)
- No rounded product images, no cropped avatars other than 28–32px square swatches
