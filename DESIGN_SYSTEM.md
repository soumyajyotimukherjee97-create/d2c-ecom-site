# Design System — Form

## Philosophy
Radical minimalism. Subtract until it breaks, then add one thing back.
No shadows. No gradients. No decorative elements.
Let whitespace and typography do all the work.

## Fonts
- Headlines/Display: Libre Baskerville (serif, weight 400/700, italic available)
- Body/UI: Inter (weight 300, 400, 500 only — never 600 or 700)
- Monospace: system monospace (ingredient labels, science callouts, overlines)

## Colors
- Page background: #FAFAFA (offwhite)
- Surface/cards: #FFFFFF (white)
- Primary text: #141414 (gray-900)
- Secondary text: #6B6B6B (gray-600)
- Muted text: #A3A3A3 (gray-400)
- Borders: #EBEBEB (gray-100) default, #D6D6D6 (gray-200) hover, #141414 on focus/selected
- CTA/accent: #141414 (black) — monochrome only
- Mist tint: bg #EFF2F0 / border #D8DED9 / text #4A5E4E (ingredient/science contexts)
- Blush tint: bg #F5F0EF / border #E0D4D2 / text #6B4A47 (warm/editorial contexts)
- Error: #B04040

## Spacing
4px base grid. Use only: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px.
Never use arbitrary values like margin: 13px or gap: 18px.

## Border Radius
Default: 2px (sm) — nearly square.
Cards/containers: 4px (md).
Pills/tags only: 9999px (full).
Never use rounded-lg (8px) or higher except on modals.

## Elevation
NO box shadows anywhere. Depth = border weight only.
- Resting: 1px solid #EBEBEB
- Hover: 1px solid #D6D6D6 + translateY(-1px)
- Focus/selected: 1px solid #141414

## Typography rules
- Display: font-heading, text-4xl, font-normal, tracking-tight
- H1: font-heading, text-3xl, font-normal
- H2: font-heading, text-2xl, font-normal
- H3: font-heading, text-xl, font-normal
- H4: font-body, text-sm, font-medium, uppercase, tracking-wider
- Body: font-body, text-base, font-normal, text-gray-600
- Label: font-body, text-sm, font-medium
- Overline: font-mono, text-2xs, uppercase, tracking-widest, text-gray-400
- Science/ingredient: font-mono, text-2xs, uppercase, tracking-wide

## Component rules
- Buttons: square corners (rounded-sm), black fill primary, border-secondary outlined
- Badges: rounded-sm, monospace font, uppercase, tracking-wide
- Inputs: rounded-sm, border-gray-200, focus:border-gray-900
- Product cards: rounded-md, border-gray-100, hover:border-gray-400
- Ingredient tags: NO border-radius, 2px left border in black
- Science callouts: NO border-radius, 2px left border

## What to never do
- No box-shadow anywhere
- No border-radius above 4px except pills
- No font-weight 600 or 700 except heading bold
- No color outside the palette above
- No gradients
- No decorative icons or illustrations
- No rounded product card images — square crop only