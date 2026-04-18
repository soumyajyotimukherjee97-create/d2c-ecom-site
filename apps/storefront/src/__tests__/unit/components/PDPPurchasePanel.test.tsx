import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PDPPurchasePanel } from '@/components/shop/PDPPurchasePanel'
import type { Product } from '@/types'

const mockProduct: Product = {
  id:             'prod-1',
  name:           'Brightening Serum',
  slug:           'brightening-serum',
  description:    'A great serum.',
  category:       'serum',
  skin_types:     ['dry', 'combination'],
  concerns:       ['dullness'],
  image_url:      null,
  is_active:      true,
  starting_price: 129900,
  variants: [
    { id: 'v1', size_ml: 30, price: 129900, sku: 'BS-30', stock: 10, is_active: true },
    { id: 'v2', size_ml: 60, price: 229900, sku: 'BS-60', stock: 5,  is_active: true },
    { id: 'v3', size_ml: 100, price: 329900, sku: 'BS-100', stock: 0, is_active: true },
  ],
  ingredients: [
    { id: 'i1', name: 'L-ASCORBIC ACID', concentration: 10, benefit: 'Brightening', science_note: 'At pH 3.5.', display_order: 0 },
    { id: 'i2', name: 'HYALURONIC ACID', concentration: 1.5, benefit: 'Hydration', science_note: null, display_order: 1 },
  ],
  reviews_summary: {
    average: 4.2, count: 12,
    distribution: { '1': 0, '2': 0, '3': 1, '4': 4, '5': 7 },
  },
  reviews: [],
}

describe('PDPPurchasePanel', () => {
  it('renders the product name in an h1', () => {
    render(<PDPPurchasePanel product={mockProduct} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Brightening Serum' })).toBeDefined()
  })

  it('renders variant size pills for each active variant', () => {
    render(<PDPPurchasePanel product={mockProduct} />)
    expect(screen.getByTestId('variant-pill-v1')).toBeDefined()
    expect(screen.getByTestId('variant-pill-v2')).toBeDefined()
    expect(screen.getByTestId('variant-pill-v3')).toBeDefined()
  })

  it('selects the first in-stock variant by default', () => {
    render(<PDPPurchasePanel product={mockProduct} />)
    const pill = screen.getByTestId('variant-pill-v1')
    expect(pill.getAttribute('aria-pressed')).toBe('true')
  })

  it('marks out-of-stock variant pill with line-through styling + data-oos', () => {
    render(<PDPPurchasePanel product={mockProduct} />)
    const oosBtn = screen.getByTestId('variant-pill-v3')
    expect(oosBtn.className).toContain('line-through')
    expect(oosBtn.getAttribute('data-oos')).toBe('true')
    expect((oosBtn as HTMLButtonElement).disabled).toBe(true)
  })

  it('switches selected variant when a pill is clicked', () => {
    render(<PDPPurchasePanel product={mockProduct} />)
    fireEvent.click(screen.getByTestId('variant-pill-v2'))
    expect(screen.getByTestId('variant-pill-v2').getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByTestId('variant-pill-v1').getAttribute('aria-pressed')).toBe('false')
  })

  it('shows the price for the selected variant', () => {
    render(<PDPPurchasePanel product={mockProduct} />)
    expect(screen.getByTestId('pdp-price')).toHaveTextContent('₹1,299')
  })

  it('updates the price when a different variant is selected', () => {
    render(<PDPPurchasePanel product={mockProduct} />)
    fireEvent.click(screen.getByTestId('variant-pill-v2'))
    expect(screen.getByTestId('pdp-price')).toHaveTextContent('₹2,299')
  })

  it('renders the add-to-cart button', () => {
    render(<PDPPurchasePanel product={mockProduct} />)
    expect(screen.getByTestId('add-to-cart')).toBeDefined()
  })

  it('disables add-to-cart and shows "Out of lot" when the selected variant has no stock', () => {
    const oos: Product = {
      ...mockProduct,
      variants: [{ id: 'v1', size_ml: 30, price: 129900, sku: 'BS-30', stock: 0, is_active: true }],
    }
    render(<PDPPurchasePanel product={oos} />)
    const btn = screen.getByTestId('add-to-cart') as HTMLButtonElement
    expect(btn.disabled).toBe(true)
    expect(btn.textContent).toContain('Out of lot')
  })

  it('renders the quantity selector for in-stock products', () => {
    render(<PDPPurchasePanel product={mockProduct} />)
    expect(screen.getByTestId('quantity-selector')).toBeDefined()
  })

  it('renders key ingredients', () => {
    render(<PDPPurchasePanel product={mockProduct} />)
    expect(screen.getAllByTestId('ingredient-tag').length).toBeGreaterThan(0)
  })

  it('renders the CATEGORY eyebrow in matter caps', () => {
    render(<PDPPurchasePanel product={mockProduct} />)
    expect(screen.getByText('SERUM')).toBeDefined()
  })

  it('renders skin_type and concern chips in the IDEAL FOR row', () => {
    render(<PDPPurchasePanel product={mockProduct} />)
    expect(screen.getByTestId('pdp-chip-skin-dry')).toHaveTextContent(/Dry/)
    expect(screen.getByTestId('pdp-chip-concern-dullness')).toHaveTextContent(/Dullness/)
  })

  it('renders the clinical-insight callout when a science_note is present', () => {
    render(<PDPPurchasePanel product={mockProduct} />)
    const callout = screen.getByTestId('pdp-clinical-insight')
    expect(callout).toHaveTextContent(/clinical insight/i)
    expect(callout).toHaveTextContent(/At pH 3\.5/)
  })
})
