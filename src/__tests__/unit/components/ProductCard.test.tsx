import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProductCard } from '@/components/shop/ProductCard'
import type { ProductSummary } from '@/types'

const baseProduct: ProductSummary = {
  id:             'prod-1',
  name:           'Brightening Serum',
  slug:           'brightening-serum',
  category:       'serum',
  skin_types:     ['dry', 'combination'],
  concerns:       ['dullness', 'aging'],
  image_url:      null,
  is_active:      true,
  starting_price: 129900,
}

describe('ProductCard', () => {
  it('renders the product name', () => {
    render(<ProductCard product={baseProduct} />)
    expect(screen.getByRole('heading', { name: 'Brightening Serum' })).toBeDefined()
  })

  it('renders formatted price in paise as rupees', () => {
    render(<ProductCard product={baseProduct} />)
    // 129900 paise → ₹1,299
    expect(screen.getByText('₹1,299')).toBeDefined()
  })

  it('renders category as uppercase mono overline', () => {
    render(<ProductCard product={baseProduct} />)
    expect(screen.getByText('serum')).toBeDefined()
  })

  it('renders concerns as mono text', () => {
    render(<ProductCard product={baseProduct} />)
    expect(screen.getByText('DULLNESS · AGING')).toBeDefined()
  })

  it('renders links to the product detail page', () => {
    render(<ProductCard product={baseProduct} />)
    const links = screen.getAllByRole('link')
    links.forEach((link) =>
      expect(link.getAttribute('href')).toBe('/products/brightening-serum'),
    )
  })

  it('renders the add to cart button', () => {
    render(<ProductCard product={baseProduct} />)
    expect(screen.getByTestId('add-to-cart-button')).toBeDefined()
  })

  it('has data-testid="product-card"', () => {
    render(<ProductCard product={baseProduct} />)
    expect(screen.getByTestId('product-card')).toBeDefined()
  })

  it('omits the concerns line when concerns is empty', () => {
    const product = { ...baseProduct, concerns: [] }
    render(<ProductCard product={product} />)
    // Should not find concern text — the element shouldn't be rendered
    expect(screen.queryByText(/DULLNESS|AGING/)).toBeNull()
  })

  it('renders correct price for zero-paise product', () => {
    const product = { ...baseProduct, starting_price: 0 }
    render(<ProductCard product={product} />)
    expect(screen.getByText('₹0')).toBeDefined()
  })
})
