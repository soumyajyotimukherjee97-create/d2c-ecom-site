import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        white:    '#FFFFFF',
        offwhite: '#FAFAFA',
        error:    '#B04040',
        gray: {
          50:  '#F5F5F5',
          100: '#EBEBEB',
          200: '#D6D6D6',
          400: '#A3A3A3',
          600: '#6B6B6B',
          800: '#2E2E2E',
          900: '#141414',
        },
        mist: {
          DEFAULT: '#EFF2F0',
          border:  '#D8DED9',
          text:    '#4A5E4E',
        },
        blush: {
          DEFAULT: '#F5F0EF',
          border:  '#E0D4D2',
          text:    '#6B4A47',
        },
      },
      fontFamily: {
        heading: ['Libre Baskerville', 'serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['monospace'],
      },
      fontSize: {
        '2xs': ['0.5625rem', { lineHeight: '1.4' }],
        xs:    ['0.625rem',  { lineHeight: '1.4' }],
        sm:    ['0.75rem',   { lineHeight: '1.5' }],
        base:  ['0.9375rem', { lineHeight: '1.7' }],
        lg:    ['1rem',      { lineHeight: '1.75' }],
        xl:    ['1.125rem',  { lineHeight: '1.3' }],
        '2xl': ['1.375rem',  { lineHeight: '1.25' }],
        '3xl': ['1.75rem',   { lineHeight: '1.2' }],
        '4xl': ['2.5rem',    { lineHeight: '1.1' }],
      },
      borderRadius: {
        none: '0',
        sm:   '2px',
        md:   '4px',
        lg:   '8px',
        xl:   '16px',
        full: '9999px',
      },
      spacing: {
        1:  '4px',
        2:  '8px',
        3:  '12px',
        4:  '16px',
        6:  '24px',
        8:  '32px',
        12: '48px',
        16: '64px',
        24: '96px',
        32: '128px',
      },
    },
  },
}
export default config
