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

  // ── Empty state ────────────────────────────────────────────────────────────

  it('shows empty state when cart has no items', () => {
    useCartStore.setState({ isOpen: true, items: [] })
    render(<CartDrawer />)
    expect(screen.getByTestId('cart-empty-heading')).toBeDefined()
    expect(screen.getByText('Your cart is empty.')).toBeDefined()
  })

  it('shows browse products link in empty state', () => {
    useCartStore.setState({ isOpen: true, items: [] })
    render(<CartDrawer />)
    expect(screen.getByTestId('cart-browse-link')).toBeDefined()
  })

  it('does not show browse link when cart has items', () => {
    openWithItems([item1])
    render(<CartDrawer />)
    expect(screen.queryByTestId('cart-browse-link')).toBeNull()
  })

  // ── Item count in header ───────────────────────────────────────────────────

  it('shows item count 0 in header for empty cart', () => {
    useCartStore.setState({ isOpen: true })
    render(<CartDrawer />)
    expect(screen.getByText('(0)')).toBeDefined()
  })

  it('shows correct item count for items with multiple quantities', () => {
    openWithItems([item1, item2]) // qty 1 + qty 2 = 3
    render(<CartDrawer />)
    expect(screen.getByText('(3)')).toBeDefined()
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
    expect(screen.getByText('Brightening Serum')).toBeDefined()
  })

  it('renders sku and size in each cart item', () => {
    openWithItems([item1])
    render(<CartDrawer />)
    expect(screen.getByText('BS-30 · 30ml')).toBeDefined()
  })

  it('renders line price (price × quantity) for each item', () => {
    openWithItems([{ ...item1, quantity: 2 }]) // 129900 × 2 = 259800 → ₹2,598
    render(<CartDrawer />)
    const cartItem = screen.getByTestId('cart-item')
    // line price is inside the cart-item row
    expect(within(cartItem).getByText('₹2,598')).toBeDefined()
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

  // ── Subtotal ───────────────────────────────────────────────────────────────

  it('shows correct subtotal', () => {
    openWithItems([item1, item2]) // 129900 + 89900×2 = 309700 → ₹3,097
    render(<CartDrawer />)
    expect(screen.getByTestId('cart-subtotal').textContent).toBe('₹3,097')
  })

  // ── Shipping ───────────────────────────────────────────────────────────────

  it('shows "Free" shipping when subtotal ≥ ₹999', () => {
    // item1: 129900 paise = ₹1,299 ≥ ₹999
    openWithItems([item1])
    render(<CartDrawer />)
    expect(screen.getByTestId('cart-shipping').textContent).toBe('Free')
  })

  it('shows shipping cost when subtotal < ₹999', () => {
    // 50000 paise = ₹500 < ₹999
    openWithItems([{ ...item1, price: 50000, quantity: 1 }])
    render(<CartDrawer />)
    expect(screen.getByTestId('cart-shipping').textContent).toBe('₹99')
  })

  // ── Close actions ──────────────────────────────────────────────────────────

  it('calls closeCart when the X button is clicked', () => {
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

  it('calls closeCart when "Continue shopping" is clicked', () => {
    openWithItems([item1])
    const closeCart = vi.spyOn(useCartStore.getState(), 'closeCart')
    render(<CartDrawer />)
    fireEvent.click(screen.getByTestId('cart-continue-shopping'))
    expect(closeCart).toHaveBeenCalled()
  })

  // ── Checkout link ──────────────────────────────────────────────────────────

  it('renders the checkout link in the footer', () => {
    openWithItems([item1])
    render(<CartDrawer />)
    const link = screen.getByTestId('cart-checkout-link') as HTMLAnchorElement
    expect(link.getAttribute('href')).toBe('/checkout')
  })

  // ── Upsell slot ────────────────────────────────────────────────────────────

  it('shows upsell when cart has items and upsell product is not in cart', async () => {
    openWithItems([item1])
    render(<CartDrawer />)
    await waitFor(() => expect(screen.getByTestId('cart-upsell')).toBeDefined())
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
