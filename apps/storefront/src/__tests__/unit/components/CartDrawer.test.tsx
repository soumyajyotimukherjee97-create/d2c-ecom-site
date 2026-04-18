import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react'
import { CartDrawer } from '@/components/shop/CartDrawer'
import { useCartStore } from '@/lib/store/cart'
import type { CartItem } from '@/lib/store/cart'

const upsellApiResponse = {
  product: {
    id: 'upsell-prod-1',
    name: 'Upsell Product',
    slug: 'upsell-product',
    category: 'serum',
    skin_types: [],
    concerns: [],
    starting_price: 149900,
    image_url: null,
    is_active: true,
  },
  variant: {
    id: 'upsell-v1',
    size_ml: 30,
    price: 149900,
    sku: 'UP-30',
    stock: 10,
    is_active: true,
  },
}

const upsellNullResponse = { product: null, variant: null }

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(upsellApiResponse),
  })
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const item1: CartItem = {
  variantId:   'v1',
  productId:   'prod-1',
  sku:         'BS-30',
  productName: 'Brightening Serum',
  slug:        'brightening-serum',
  size_ml:     30,
  price:       129900,
  quantity:    1,
  imageUrl:    null,
}

const item2: CartItem = {
  variantId:   'v2',
  productId:   'prod-2',
  sku:         'PTONER-100',
  productName: 'Pore Refining Toner',
  slug:        'pore-refining-toner',
  size_ml:     100,
  price:       89900,
  quantity:    2,
  imageUrl:    null,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deriveFromItems(items: CartItem[]) {
  return {
    subtotal:  items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
  }
}

function openWithItems(items: CartItem[]) {
  useCartStore.setState({ items, isOpen: true, ...deriveFromItems(items) })
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CartDrawer', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false, subtotal: 0, itemCount: 0 })
    localStorage.clear()
  })

  // ── Visibility ─────────────────────────────────────────────────────────────

  it('renders nothing when isOpen is false', () => {
    render(<CartDrawer />)
    expect(screen.queryByTestId('cart-drawer')).toBeNull()
  })

  it('renders the drawer when isOpen is true', () => {
    useCartStore.setState({ isOpen: true })
    render(<CartDrawer />)
    expect(screen.getByTestId('cart-drawer')).toBeDefined()
  })

  it('renders the backdrop when open', () => {
    useCartStore.setState({ isOpen: true })
    render(<CartDrawer />)
    expect(screen.getByTestId('cart-backdrop')).toBeDefined()
  })

  // ── Header eyebrow + count ─────────────────────────────────────────────────

  it('renders the § YOUR BAG eyebrow in the header', () => {
    useCartStore.setState({ isOpen: true })
    render(<CartDrawer />)
    expect(screen.getByTestId('cart-header-eyebrow')).toHaveTextContent(/§\s*Your bag/i)
  })

  it('shows "Nothing yet." in header subtitle when cart is empty', () => {
    useCartStore.setState({ isOpen: true })
    render(<CartDrawer />)
    expect(screen.getByTestId('cart-header-count')).toHaveTextContent(/Nothing yet/i)
  })

  it('shows "N formulas · M items" when cart has multiple quantities', () => {
    openWithItems([item1, item2]) // 2 formulas · 3 items
    render(<CartDrawer />)
    expect(screen.getByTestId('cart-header-count')).toHaveTextContent('2 formulas · 3 items')
  })

  it('singularises formula / item when counts are 1', () => {
    openWithItems([item1]) // 1 formula · 1 item
    render(<CartDrawer />)
    expect(screen.getByTestId('cart-header-count')).toHaveTextContent('1 formula · 1 item')
  })

  // ── Empty state ────────────────────────────────────────────────────────────

  it('shows empty state heading "— Empty." when cart has no items', () => {
    useCartStore.setState({ isOpen: true, items: [] })
    render(<CartDrawer />)
    expect(screen.getByTestId('cart-empty-heading')).toHaveTextContent(/Empty\./)
  })

  it('renders browse formulary link in empty state', () => {
    useCartStore.setState({ isOpen: true, items: [] })
    render(<CartDrawer />)
    const link = screen.getByTestId('cart-browse-link') as HTMLAnchorElement
    expect(link.getAttribute('href')).toBe('/products')
    expect(link).toHaveTextContent(/browse formulary/i)
  })

  it('renders "Take the quiz" CTA in empty state pointing to /products?quiz=true', () => {
    useCartStore.setState({ isOpen: true, items: [] })
    render(<CartDrawer />)
    const link = screen.getByTestId('cart-quiz-link') as HTMLAnchorElement
    expect(link.getAttribute('href')).toBe('/products?quiz=true')
  })

  it('does not show browse link when cart has items', () => {
    openWithItems([item1])
    render(<CartDrawer />)
    expect(screen.queryByTestId('cart-browse-link')).toBeNull()
  })

  it('does not show the footer when cart is empty', () => {
    useCartStore.setState({ isOpen: true, items: [] })
    render(<CartDrawer />)
    expect(screen.queryByTestId('cart-checkout-link')).toBeNull()
  })

  // ── Cart items rendering ───────────────────────────────────────────────────

  it('renders a row for each cart item', () => {
    openWithItems([item1, item2])
    render(<CartDrawer />)
    expect(screen.getAllByTestId('cart-item')).toHaveLength(2)
  })

  it('renders product name in each cart item', () => {
    openWithItems([item1])
    render(<CartDrawer />)
    expect(screen.getByTestId('cart-item-name')).toHaveTextContent('Brightening Serum')
  })

  it('renders sku and size ml in each cart item', () => {
    openWithItems([item1])
    render(<CartDrawer />)
    const row = screen.getByTestId('cart-item')
    expect(within(row).getByText('BS-30')).toBeDefined()
    expect(within(row).getByText(/30ml/)).toBeDefined()
  })

  it('renders line price (price × quantity) for each item', () => {
    openWithItems([{ ...item1, quantity: 2 }]) // 129900 × 2 = 259800 → ₹2,598
    render(<CartDrawer />)
    const cartItem = screen.getByTestId('cart-item')
    expect(within(cartItem).getByText('₹2,598')).toBeDefined()
  })

  it('shows unit-price × qty breakdown when quantity > 1', () => {
    openWithItems([{ ...item1, quantity: 3 }])
    render(<CartDrawer />)
    const cartItem = screen.getByTestId('cart-item')
    expect(within(cartItem).getByText(/₹1,299\s*×\s*3/)).toBeDefined()
  })

  it('omits unit-price breakdown when quantity is 1', () => {
    openWithItems([item1])
    render(<CartDrawer />)
    const cartItem = screen.getByTestId('cart-item')
    expect(within(cartItem).queryByText(/×\s*1/)).toBeNull()
  })

  // ── Quantity stepper ───────────────────────────────────────────────────────

  it('uses the compact (sm) qty selector in cart rows', () => {
    openWithItems([item1])
    render(<CartDrawer />)
    expect(screen.getByTestId('quantity-selector')).toHaveAttribute('data-size', 'sm')
  })

  // ── Remove item ────────────────────────────────────────────────────────────

  it('renders remove buttons for each item', () => {
    openWithItems([item1, item2])
    render(<CartDrawer />)
    expect(screen.getAllByTestId('cart-item-remove')).toHaveLength(2)
  })

  it('calls removeItem when remove button is clicked', () => {
    openWithItems([item1])
    const removeItem = vi.spyOn(useCartStore.getState(), 'removeItem')
    render(<CartDrawer />)
    fireEvent.click(screen.getByTestId('cart-item-remove'))
    expect(removeItem).toHaveBeenCalledWith('v1')
  })

  // ── Free-ship progress ─────────────────────────────────────────────────────

  it('renders the free-ship progress block when cart has items', () => {
    openWithItems([{ ...item1, price: 50000, quantity: 1 }])
    render(<CartDrawer />)
    expect(screen.getByTestId('cart-freeship')).toBeDefined()
  })

  it('shows "₹X to go" when under the free-ship threshold', () => {
    // 50000 paise subtotal → 99900 - 50000 = 49900 → ₹499
    openWithItems([{ ...item1, price: 50000, quantity: 1 }])
    render(<CartDrawer />)
    expect(screen.getByTestId('cart-freeship-status')).toHaveTextContent(/₹499 to go/i)
  })

  it('shows "FREE SHIPPING UNLOCKED" when at/above the threshold', () => {
    openWithItems([item1]) // 129900 ≥ 99900
    render(<CartDrawer />)
    expect(screen.getByTestId('cart-freeship-status')).toHaveTextContent(/free shipping unlocked/i)
  })

  it('progress bar aria-valuenow reflects completion percent', () => {
    openWithItems([{ ...item1, price: 49950, quantity: 1 }]) // 50% of 99900
    render(<CartDrawer />)
    expect(screen.getByTestId('cart-freeship-bar')).toHaveAttribute('aria-valuenow', '50')
  })

  it('progress bar caps at 100 when subtotal ≥ threshold', () => {
    openWithItems([item1]) // 129900 ≥ 99900
    render(<CartDrawer />)
    expect(screen.getByTestId('cart-freeship-bar')).toHaveAttribute('aria-valuenow', '100')
  })

  // ── Subtotal / Total ───────────────────────────────────────────────────────

  it('shows correct subtotal', () => {
    openWithItems([item1, item2]) // 129900 + 89900×2 = 309700 → ₹3,097
    render(<CartDrawer />)
    expect(screen.getByTestId('cart-subtotal').textContent).toBe('₹3,097')
  })

  it('shows correct total (equal to subtotal in V2 — shipping added at checkout)', () => {
    openWithItems([item1, item2])
    render(<CartDrawer />)
    expect(screen.getByTestId('cart-total').textContent).toBe('₹3,097')
  })

  // ── Shipping copy ──────────────────────────────────────────────────────────

  it('shows "Free at checkout" shipping when subtotal ≥ ₹999', () => {
    openWithItems([item1])
    render(<CartDrawer />)
    expect(screen.getByTestId('cart-shipping').textContent).toMatch(/free at checkout/i)
  })

  it('shows "Calculated at checkout" shipping when subtotal < ₹999', () => {
    openWithItems([{ ...item1, price: 50000, quantity: 1 }])
    render(<CartDrawer />)
    expect(screen.getByTestId('cart-shipping').textContent).toMatch(/calculated at checkout/i)
  })

  // ── Trust strip ────────────────────────────────────────────────────────────

  it('renders the trust strip with returns and dispatch copy', () => {
    openWithItems([item1])
    render(<CartDrawer />)
    const strip = screen.getByTestId('cart-trust-strip')
    expect(strip).toHaveTextContent(/free returns/i)
    expect(strip).toHaveTextContent(/dispatched in 48h/i)
  })

  // ── Close actions ──────────────────────────────────────────────────────────

  it('calls closeCart when the × button is clicked', () => {
    useCartStore.setState({ isOpen: true })
    const closeCart = vi.spyOn(useCartStore.getState(), 'closeCart')
    render(<CartDrawer />)
    fireEvent.click(screen.getByTestId('cart-close'))
    expect(closeCart).toHaveBeenCalled()
  })

  it('calls closeCart when the backdrop is clicked', () => {
    useCartStore.setState({ isOpen: true })
    const closeCart = vi.spyOn(useCartStore.getState(), 'closeCart')
    render(<CartDrawer />)
    fireEvent.click(screen.getByTestId('cart-backdrop'))
    expect(closeCart).toHaveBeenCalled()
  })

  // ── Checkout link ──────────────────────────────────────────────────────────

  it('renders the checkout link in the footer with label "Checkout →"', () => {
    openWithItems([item1])
    render(<CartDrawer />)
    const link = screen.getByTestId('cart-checkout-link') as HTMLAnchorElement
    expect(link.getAttribute('href')).toBe('/checkout')
    expect(link).toHaveTextContent(/checkout/i)
    expect(link).toHaveTextContent('→')
  })

  // ── Upsell slot ────────────────────────────────────────────────────────────

  it('shows upsell when cart has items and upsell product is not in cart', async () => {
    openWithItems([item1])
    render(<CartDrawer />)
    await waitFor(() => expect(screen.getByTestId('cart-upsell')).toBeDefined())
  })

  it('upsell carries the § FREQUENTLY ADDED eyebrow', async () => {
    openWithItems([item1])
    render(<CartDrawer />)
    await waitFor(() => {
      expect(screen.getByTestId('cart-upsell')).toHaveTextContent(/§\s*Frequently added/i)
    })
  })

  it('hides upsell when cart is empty', () => {
    useCartStore.setState({ isOpen: true, items: [] })
    render(<CartDrawer />)
    expect(screen.queryByTestId('cart-upsell')).toBeNull()
  })

  it('hides upsell when API returns null product', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(upsellNullResponse),
    })
    openWithItems([item1])
    render(<CartDrawer />)
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(screen.queryByTestId('cart-upsell')).toBeNull()
  })

  it('renders upsell add button', async () => {
    openWithItems([item1])
    render(<CartDrawer />)
    await waitFor(() => expect(screen.getByTestId('cart-upsell-add')).toBeDefined())
  })

  it('calls fetch with correct query params', async () => {
    openWithItems([item1])
    render(<CartDrawer />)
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const url = fetchMock.mock.calls[0][0] as string
    expect(url).toContain('/api/upsell')
    expect(url).toContain('exclude=prod-1')
    expect(url).toContain('cart_key=prod-1')
  })
})
