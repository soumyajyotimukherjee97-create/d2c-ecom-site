// tailwind.config.ts
// Storefront V2 — matter tokens. See DESIGN_SYSTEM_V2.md.
// V1 token names (gray/mist/blush/offwhite/error) are kept as aliases so
// existing components keep building while atoms are re-skinned in Chunk 2.
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ─── matter palette — warm bone & ink ─────────────────────────
        paper:     '#F4F1EB',
        'paper-2': '#EDE9E1',
        'paper-3': '#E4E0D6',
        mineral:   '#D6D2C6',
        hairline:  '#BFBAAD',
        graphite:  '#55534C',
        'ink-2':   '#26251F',
        ink:       '#121210',

        // single accent — clinical green (actives / in-stock / concentrations)
        assay:     'oklch(0.56 0.08 148)',
        'assay-ink': 'oklch(0.34 0.06 148)',

        // alarm — sparingly
        oxblood:   'oklch(0.46 0.12 30)',

        // ─── V1 backward-compat aliases ───────────────────────────────
        // Keep V1 class names resolving during the transition. V1 pages
        // will automatically pick up matter values through these aliases
        // until atoms are re-skinned in Chunk 2.
        offwhite: '#F4F1EB',             // → paper
        error:    'oklch(0.46 0.12 30)', // → oxblood
        gray: {
          50:  '#F4F1EB',  // → paper
          100: '#BFBAAD',  // → hairline (V1 border default)
          200: '#BFBAAD',  // → hairline (V1 border hover)
          400: '#55534C',  // → graphite (V1 muted text)
          600: '#55534C',  // → graphite (V1 secondary text)
          800: '#26251F',  // → ink-2
          900: '#121210',  // → ink
        },
        mist: {
          DEFAULT: '#EDE9E1',  // → paper-2
          border:  '#BFBAAD',  // → hairline
          text:    '#55534C',  // → graphite
        },
        blush: {
          DEFAULT: '#EDE9E1',  // → paper-2
          border:  '#BFBAAD',  // → hairline
          text:    '#55534C',  // → graphite
        },
      },

      fontFamily: {
        display: ['var(--font-instrument-serif)', 'Instrument Serif', 'Times New Roman', 'serif'],
        body:    ['var(--font-inter-tight)',      'Inter Tight',      '-apple-system', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-jetbrains-mono)',   'JetBrains Mono',   'ui-monospace', 'monospace'],
        // V1 compat — `font-heading` kept but now renders Instrument Serif
        heading: ['var(--font-instrument-serif)', 'Instrument Serif', 'Times New Roman', 'serif'],
      },

      fontSize: {
        // V1 scale retained — matter's huge hero titles use inline clamp()
        // at the call-site, not predefined sizes.
        '2xs': ['0.5625rem', { lineHeight: '1.4' }],
        xs:    ['0.625rem',  { lineHeight: '1.4' }],
        sm:    ['0.75rem',   { lineHeight: '1.5' }],
        base:  ['0.875rem',  { lineHeight: '1.5' }],   // 14px — matter body base
        lg:    ['1rem',      { lineHeight: '1.6' }],
        xl:    ['1.125rem',  { lineHeight: '1.3' }],
        '2xl': ['1.375rem',  { lineHeight: '1.25' }],
        '3xl': ['1.75rem',   { lineHeight: '1.2' }],
        '4xl': ['2.5rem',    { lineHeight: '1.1' }],
        '5xl': ['3.5rem',    { lineHeight: '1.0' }],
        '6xl': ['4.5rem',    { lineHeight: '0.98' }],
      },

      letterSpacing: {
        // matter's mono-caps need specific tracking values
        tightest: '-0.03em',
        tighter:  '-0.025em',
        tight:    '-0.01em',
        normal:   '0',
        wide:     '0.02em',
        wider:    '0.08em',
        widest:   '0.14em',
        mono:     '0.18em',   // matter mono-caption default
        ultra:    '0.22em',   // masthead-grade
      },

      borderRadius: {
        // matter rule: zero radius on everything except circular dots/avatars.
        // Override every Tailwind key to 0; keep `full` for circles.
        none: '0',
        sm:   '0',
        DEFAULT: '0',
        md:   '0',
        lg:   '0',
        xl:   '0',
        '2xl': '0',
        '3xl': '0',
        full: '9999px',
      },

      spacing: {
        // V1 scale kept; add matter-specific keys not in Tailwind defaults.
        1:  '4px',
        2:  '8px',
        3:  '12px',
        '3.5': '14px',
        4:  '16px',
        5:  '20px',
        6:  '24px',
        7:  '28px',
        8:  '32px',
        10: '40px',
        12: '48px',
        14: '56px',
        16: '64px',
        18: '72px',   // not in Tailwind defaults
        20: '80px',
        24: '96px',
        30: '120px',  // not in Tailwind defaults
        32: '128px',
      },

      maxWidth: {
        container: '1440px',
      },
    },
  },
}
export default config
