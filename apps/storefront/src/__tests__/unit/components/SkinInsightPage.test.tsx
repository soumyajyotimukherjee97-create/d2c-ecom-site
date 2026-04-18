import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SkinInsightPage from '@/app/(shop)/skin-insight/page'

describe('SkinInsightPage', () => {
  it('renders the broadsheet masthead with a matter title', () => {
    render(<SkinInsightPage />)
    const mast = screen.getByTestId('skin-insight-masthead')
    expect(mast).toBeInTheDocument()
    expect(mast).toHaveTextContent(/Vol\. I · No\. 01/)
    expect(mast).toHaveTextContent(/Skin Insight · Pending Dispatch/)
    expect(mast).toHaveTextContent(/Phase 2/)
  })

  it('hero carries the § COMING SOON — PHASE 2 eyebrow', () => {
    render(<SkinInsightPage />)
    expect(screen.getByTestId('skin-insight-eyebrow')).toHaveTextContent(
      /§ Coming soon — Phase 2/i,
    )
  })

  it('renders the display headline as an h1', () => {
    render(<SkinInsightPage />)
    const h1 = screen.getByTestId('skin-insight-title')
    expect(h1.tagName).toBe('H1')
    expect(h1).toHaveTextContent(/a skin report/i)
    expect(h1).toHaveTextContent(/your/i)
  })

  it('reuses the heatmap figure from the PLP CTA', () => {
    render(<SkinInsightPage />)
    const fig = screen.getByTestId('skin-insight-heatmap')
    expect(fig.tagName).toBe('FIGURE')
    expect(fig).toHaveTextContent(/Fig\. 026/)
  })

  it('renders a 3-item manifest (01 Scan · 02 Diagnose · 03 Prescribe)', () => {
    render(<SkinInsightPage />)
    const items = screen.getAllByTestId('skin-insight-manifest-item')
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveTextContent(/01 Scan/i)
    expect(items[1]).toHaveTextContent(/02 Diagnose/i)
    expect(items[2]).toHaveTextContent(/03 Prescribe/i)
  })

  it('renders the waitlist block with the reused newsletter form', () => {
    render(<SkinInsightPage />)
    const waitlist = screen.getByTestId('skin-insight-waitlist')
    expect(waitlist).toHaveTextContent(/notify me/i)
    expect(waitlist).toHaveTextContent(/be the first subject/i)
    // NewsletterForm exposes input-email + submit testids
    expect(screen.getByTestId('newsletter-email')).toBeInTheDocument()
    expect(screen.getByTestId('newsletter-submit')).toBeInTheDocument()
  })

  it('renders the back-to-formulary CTA linking to /products', () => {
    render(<SkinInsightPage />)
    const link = screen.getByTestId('skin-insight-back-to-shop') as HTMLAnchorElement
    expect(link.getAttribute('href')).toBe('/products')
    expect(link).toHaveTextContent(/back to the formulary/i)
  })

  it('does not include a "Try now" CTA — the page is the destination', () => {
    render(<SkinInsightPage />)
    expect(screen.queryByText(/try now/i)).toBeNull()
  })
})
