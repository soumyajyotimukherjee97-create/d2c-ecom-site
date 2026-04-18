import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import NotFound from '@/app/not-found'

describe('NotFound', () => {
  it('renders the § 404 — OUT OF CATALOGUE eyebrow', () => {
    render(<NotFound />)
    expect(screen.getByTestId('not-found-eyebrow')).toHaveTextContent(
      /§ 404 — Out of catalogue/i,
    )
  })

  it('renders the matter-voiced headline as an h1', () => {
    render(<NotFound />)
    const h1 = screen.getByTestId('not-found-title')
    expect(h1.tagName).toBe('H1')
    expect(h1).toHaveTextContent(/not on file/i)
  })

  it('exposes return-home and browse-formulary CTAs', () => {
    render(<NotFound />)
    const home = screen.getByTestId('not-found-home') as HTMLAnchorElement
    const formulary = screen.getByTestId('not-found-formulary') as HTMLAnchorElement
    expect(home.getAttribute('href')).toBe('/')
    expect(formulary.getAttribute('href')).toBe('/products')
  })

  it('brand link points to /', () => {
    render(<NotFound />)
    const brand = screen.getByTestId('not-found-brand') as HTMLAnchorElement
    expect(brand.getAttribute('href')).toBe('/')
  })
})
