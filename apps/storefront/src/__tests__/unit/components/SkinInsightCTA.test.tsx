import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SkinInsightCTA } from '@/components/shop/SkinInsightCTA'

describe('SkinInsightCTA', () => {
  it('renders the SkinInsight CTA section with skininsight anchor', () => {
    const { container } = render(<SkinInsightCTA />)
    const section = container.querySelector('section#skininsight')
    expect(section).not.toBeNull()
    expect(screen.getByTestId('skin-insight-cta')).toBeDefined()
  })

  it('renders the heatmap figure with fig/subject metadata', () => {
    render(<SkinInsightCTA />)
    const fig = screen.getByTestId('skin-insight-heatmap')
    expect(fig.tagName).toBe('FIGURE')
    expect(fig).toHaveTextContent(/Fig\. 026/)
    expect(fig).toHaveTextContent(/Subject 026/)
    expect(fig).toHaveTextContent(/Confidence — 96\.4%/)
  })

  it('renders the headline "SkinInsights."', () => {
    render(<SkinInsightCTA />)
    const h = screen.getByRole('heading', { level: 2 })
    expect(h).toHaveTextContent(/SkinInsights/)
  })

  it('"Try now →" CTA links to /skin-insight', () => {
    render(<SkinInsightCTA />)
    const link = screen.getByTestId('skin-insight-cta-link') as HTMLAnchorElement
    expect(link.getAttribute('href')).toBe('/skin-insight')
    expect(link).toHaveTextContent(/try now/i)
  })

  it('renders the trust-data strip (accuracy / trial n / markers)', () => {
    render(<SkinInsightCTA />)
    expect(screen.getByText('96.4%')).toBeDefined()
    expect(screen.getByText('4,812')).toBeDefined()
    expect(screen.getByText('11 indexed')).toBeDefined()
  })

  it('heatmap plots 4 concern markers', () => {
    render(<SkinInsightCTA />)
    const fig = screen.getByTestId('skin-insight-heatmap')
    expect(fig).toHaveTextContent(/Pigmentation/)
    expect(fig).toHaveTextContent(/Pores/)
    expect(fig).toHaveTextContent(/Fine lines/)
    expect(fig).toHaveTextContent(/Acne/)
  })
})
