import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProductTile } from '@/components/shop/ProductTile'
import type { ProductSummary, Variant } from '@/types'

type VariantData = Pick<Variant, 'id' | 'size_ml' | 'price' | 'sku' | 'stock' | 'is_active'>

const baseProduct: ProductSummary = {
  id:             'prod-1',
  name:           'Brightening Serum',
  slug:           'brightening-serum',
  category:       'serum',
  skin_types:     ['dry', 'combination'],
  concerns:       ['dullness', 'acne', 'pores'],
  image_url:      null,
  is_active:      true,
  starting_price: 129900,
}

const inStockVariant: VariantData = {
  id:        'v1',
  size_ml:   30,
  price:     129900,
  sku:       'BS-30',
  stock:     12,
  is_active: true,
}

describe('ProductTile', () => {
  it('renders the product name as an h3', () => {
    render(<ProductTile product={baseProduct} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Brightening Serum' })).toBeDefined()
  })

  it('renders formatted price as rupees', () => {
    render(<ProductTile product={baseProduct} />)
    expect(screen.getByTestId('product-tile-price')).toHaveTextContent('₹1,299')
  })

  it('renders concerns as mono-caps separator list', () => {
    render(<ProductTile product={baseProduct} />)
    expect(screen.getByTestId('product-tile-concerns')).toHaveTextContent('DULLNESS · ACNE · PORES')
  })

  it('omits concerns row when concerns is empty', () => {
    const product = { ...baseProduct, concerns: [] }
    render(<ProductTile product={product} />)
    expect(screen.queryByTestId('product-tile-concerns')).toBeNull()
  })

  it('links the tile to the product detail page', () => {
    render(<ProductTile product={baseProduct} />)
    const link = screen.getByTestId('product-tile-link') as HTMLAnchorElement
    expect(link.getAttribute('href')).toBe('/products/brightening-serum')
  })

  it('always renders the add to cart button (PLP always has +)', () => {
    render(<ProductTile product={baseProduct} defaultVariant={inStockVariant} />)
    expect(screen.getByTestId('add-to-cart-button')).toBeDefined()
  })

  it('the + button is not nested inside the card link (valid HTML)', () => {
    render(<ProductTile product={baseProduct} defaultVariant={inStockVariant} />)
    const link = screen.getByTestId('product-tile-link')
    const button = screen.getByTestId('add-to-cart-button')
    expect(link.contains(button)).toBe(false)
  })

  it('shows the specimen caption (category + ml) when no image is supplied', () => {
    render(<ProductTile product={baseProduct} defaultVariant={inStockVariant} />)
    // specimen row contains category + ml
    expect(screen.getByText(/SERUM\s*30ML/)).toBeDefined()
  })

  it('has data-testid="product-tile"', () => {
    render(<ProductTile product={baseProduct} />)
    expect(screen.getByTestId('product-tile')).toBeDefined()
  })
})
