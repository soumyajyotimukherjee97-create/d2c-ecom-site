import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProductCard } from '@/components/shop/ProductCard'
import type { ProductSummary, Variant } from '@/types'

type VariantData = Pick<Variant, 'id' | 'size_ml' | 'price' | 'sku' | 'stock' | 'is_active'>

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

const inStockVariant: VariantData = {
  id:        'v1',
  size_ml:   30,
  price:     129900,
  sku:       'BS-30',
  stock:     12,
  is_active: true,
}

describe('ProductCard', () => {
  it('renders the product name as an h3', () => {
    render(<ProductCard product={baseProduct} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Brightening Serum' })).toBeDefined()
  })

  it('renders formatted price in paise as rupees', () => {
    render(<ProductCard product={baseProduct} />)
    expect(screen.getByTestId('product-card-price')).toHaveTextContent('₹1,299')
  })

  it('renders category as uppercase mono eyebrow (fallback when no index)', () => {
    render(<ProductCard product={baseProduct} />)
    expect(screen.getByTestId('product-card-index')).toHaveTextContent('SERUM')
  })

  it('renders the zero-padded index when provided', () => {
    render(<ProductCard product={baseProduct} index={2} />)
    expect(screen.getByTestId('product-card-index')).toHaveTextContent('02')
  })

  it('renders "IN LOT" assay status when stock is available', () => {
    render(<ProductCard product={baseProduct} defaultVariant={inStockVariant} />)
    const stock = screen.getByTestId('product-card-stock')
    expect(stock).toHaveAttribute('data-stock', 'in')
    expect(stock).toHaveTextContent(/in lot/i)
  })

  it('renders "OUT OF LOT" status when no default variant is in stock', () => {
    render(<ProductCard product={baseProduct} />)
    const stock = screen.getByTestId('product-card-stock')
    expect(stock).toHaveAttribute('data-stock', 'out')
    expect(stock).toHaveTextContent(/out of lot/i)
  })

  it('appends size_ml to the category eyebrow when variant has size', () => {
    render(<ProductCard product={baseProduct} defaultVariant={inStockVariant} />)
    expect(screen.getByText('SERUM · 30 ML')).toBeDefined()
  })

  it('links the card to the product detail page', () => {
    render(<ProductCard product={baseProduct} />)
    const link = screen.getByTestId('product-card-link') as HTMLAnchorElement
    expect(link.getAttribute('href')).toBe('/products/brightening-serum')
  })

  it('renders the add to cart button by default', () => {
    render(<ProductCard product={baseProduct} defaultVariant={inStockVariant} />)
    expect(screen.getByTestId('add-to-cart-button')).toBeDefined()
  })

  it('omits the add to cart button when showAddButton is false', () => {
    render(<ProductCard product={baseProduct} defaultVariant={inStockVariant} showAddButton={false} />)
    expect(screen.queryByTestId('add-to-cart-button')).toBeNull()
  })

  it('shows the "View assay →" footer CTA when add button is hidden', () => {
    render(<ProductCard product={baseProduct} showAddButton={false} />)
    expect(screen.getByText(/view assay/i)).toBeDefined()
  })

  it('has data-testid="product-card"', () => {
    render(<ProductCard product={baseProduct} />)
    expect(screen.getByTestId('product-card')).toBeDefined()
  })

  it('renders correct price for zero-paise product', () => {
    const product = { ...baseProduct, starting_price: 0 }
    render(<ProductCard product={product} />)
    expect(screen.getByTestId('product-card-price')).toHaveTextContent('₹0')
  })
})
