import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AboutPage from '@/app/(shop)/about/page'

describe('AboutPage', () => {
  describe('hero', () => {
    it('renders the hero section', () => {
      render(<AboutPage />)
      expect(screen.getByTestId('about-hero')).toBeInTheDocument()
    })

    it('renders the kicker "§ The matter manifesto"', () => {
      render(<AboutPage />)
      expect(screen.getByTestId('about-hero-kicker')).toHaveTextContent(
        '§ The matter manifesto',
      )
    })

    it('renders the headline "What we stand for."', () => {
      render(<AboutPage />)
      const title = screen.getByTestId('about-hero-title')
      expect(title.tagName).toBe('H1')
      expect(title).toHaveTextContent('What')
      expect(title).toHaveTextContent('we')
      expect(title).toHaveTextContent('stand for.')
    })

    it('headline emphasises "we" in italics via <em>', () => {
      render(<AboutPage />)
      const em = screen.getByTestId('about-hero-title').querySelector('em')
      expect(em).not.toBeNull()
      expect(em!.textContent).toBe('we')
    })

    it('renders the standfirst paragraph', () => {
      render(<AboutPage />)
      expect(screen.getByTestId('about-hero-standfirst')).toHaveTextContent(
        /first day of the company/i,
      )
    })
  })

  describe('manifesto', () => {
    it('renders the manifesto section', () => {
      render(<AboutPage />)
      expect(screen.getByTestId('about-manifesto')).toBeInTheDocument()
    })

    it('renders the masthead with broadsheet title and date', () => {
      render(<AboutPage />)
      const mast = screen.getByTestId('about-manifesto-masthead')
      expect(mast).toHaveTextContent('Vol. I · No. 01')
      expect(mast).toHaveTextContent('The Matter Broadsheet')
      expect(mast).toHaveTextContent('14 March 2024')
    })

    it('renders the leader headline as an <h2>', () => {
      render(<AboutPage />)
      const h = screen.getByTestId('about-manifesto-headline')
      expect(h.tagName).toBe('H2')
      expect(h).toHaveTextContent(/Nine/)
      expect(h).toHaveTextContent(/clauses/)
      expect(h).toHaveTextContent(/since founding/)
    })

    it('renders all 9 clauses in order, each with its § counter', () => {
      render(<AboutPage />)
      for (let i = 1; i <= 9; i++) {
        const p = screen.getByTestId(`about-clause-${i}`)
        expect(p).toBeInTheDocument()
        expect(p).toHaveTextContent(`§${String(i).padStart(2, '0')}`)
      }
    })

    it('clause 1 contains the dropcap A separated from the rest', () => {
      render(<AboutPage />)
      const p = screen.getByTestId('about-clause-1')
      // Full clause text present across spans
      expect(p).toHaveTextContent(/A\s*§01\s*formula is a claim/)
    })

    it('renders exact clause text for every clause', () => {
      render(<AboutPage />)
      const expected: Record<number, RegExp> = {
        1: /formula is a claim/,
        2: /trial evidence/,
        3: /exact concentration/,
        4: /marketing position/,
        5: /liability for reactive skin/,
        6: /does not ship/,
        7: /didn\u2019t work/,
        8: /Clinical scores cannot/,
        9: /confidence in what remains/,
      }
      for (const [i, re] of Object.entries(expected)) {
        expect(screen.getByTestId(`about-clause-${i}`)).toHaveTextContent(re)
      }
    })
  })

  describe('sign-off', () => {
    it('renders the founders block with italic signature', () => {
      render(<AboutPage />)
      const founders = screen.getByTestId('about-signoff-founders')
      expect(founders).toHaveTextContent('Signed, the founders')
      expect(founders).toHaveTextContent('A. Rao · K. Mendelsohn')
    })

    it('renders the filing block with date and cities', () => {
      render(<AboutPage />)
      const filed = screen.getByTestId('about-signoff-filed')
      expect(filed).toHaveTextContent('Filed 14 March 2024')
      expect(filed).toHaveTextContent('London · Mumbai · New York')
    })
  })

  describe('structure', () => {
    it('exposes exactly one <h1> and one <h2>', () => {
      render(<AboutPage />)
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1)
    })
  })
})
