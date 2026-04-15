import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '@/lib/store/cart'
import type { ProductSummary, Variant } from '@/types'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockVariant: Variant = {
  id:        'v1',
  size_ml:   30,
  price:     129900,
  sku:       'BS-30',
  stock:     10,
  is_active: true,
}

const mockVariant2: Variant = {
  id:        'v2',
  size_ml:   60,
  price:     229900,
  sku:       'BS-60',
  stock:     5,
  is_active: true,
}

const mockProduct: ProductSummary = {
  id:             'prod-1',
  name:           'Brightening Serum',
  slug:           'brightening-serum',
  category:       'serum',
  skin_types:     ['dry'],
  concerns:       ['dullness'],
  starting_price: 129900,
  image_url:      null,
  is_active:      true,
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false })
    localStorage.clear()
  })

  // ── addItem ────────────────────────────────────────────────────────────────

  it('addItem adds a new item to the cart', () => {
    useCartStore.getState().addItem(mockVariant, mockProduct, 1)

    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].variantId).toBe('v1')
    expect(items[0].productName).toBe('Brightening Serum')
    expect(items[0].sku).toBe('BS-30')
    expect(items[0].size_ml).toBe(30)
    expect(items[0].price).toBe(129900)
    expect(items[0].quantity).toBe(1)
  })

  it('addItem merges quantity when the same variantId is added again', () => {
    useCartStore.getState().addItem(mockVariant, mockProduct, 1)
    useCartStore.getState().addItem(mockVariant, mockProduct, 2)

    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(3)
  })

  it('addItem adds separate items for different variants', () => {
    useCartStore.getState().addItem(mockVariant, mockProduct, 1)
    useCartStore.getState().addItem(mockVariant2, mockProduct, 1)

    const { items } = useCartStore.getState()
    expect(items).toHaveLength(2)
  })

  it('addItem snapshots productId and slug onto CartItem', () => {
    useCartStore.getState().addItem(mockVariant, mockProduct, 1)

    const item = useCartStore.getState().items[0]
    expect(item.productId).toBe('prod-1')
    expect(item.slug).toBe('brightening-serum')
  })

  // ── removeItem ─────────────────────────────────────────────────────────────

  it('removeItem removes the matching item', () => {
    useCartStore.getState().addItem(mockVariant, mockProduct, 2)
    useCartStore.getState().removeItem('v1')

    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('removeItem leaves other items intact', () => {
    useCartStore.getState().addItem(mockVariant, mockProduct, 1)
    useCartStore.getState().addItem(mockVariant2, mockProduct, 1)
    useCartStore.getState().removeItem('v1')

    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].variantId).toBe('v2')
  })

  // ── updateQty ──────────────────────────────────────────────────────────────

  it('updateQty updates quantity for the matching item', () => {
    useCartStore.getState().addItem(mockVariant, mockProduct, 1)
    useCartStore.getState().updateQty('v1', 5)

    expect(useCartStore.getState().items[0].quantity).toBe(5)
  })

  it('updateQty removes item when qty is 0', () => {
    useCartStore.getState().addItem(mockVariant, mockProduct, 2)
    useCartStore.getState().updateQty('v1', 0)

    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('updateQty removes item when qty is negative', () => {
    useCartStore.getState().addItem(mockVariant, mockProduct, 2)
    useCartStore.getState().updateQty('v1', -1)

    expect(useCartStore.getState().items).toHaveLength(0)
  })

  // ── clearCart ──────────────────────────────────────────────────────────────

  it('clearCart empties all items', () => {
    useCartStore.getState().addItem(mockVariant, mockProduct, 1)
    useCartStore.getState().addItem(mockVariant2, mockProduct, 3)
    useCartStore.getState().clearCart()

    expect(useCartStore.getState().items).toHaveLength(0)
  })

  // ── subtotal ───────────────────────────────────────────────────────────────

  it('subtotal() returns 0 for an empty cart', () => {
    expect(useCartStore.getState().subtotal()).toBe(0)
  })

  it('subtotal() sums price × quantity across all items', () => {
    useCartStore.getState().addItem(mockVariant, mockProduct, 2)   // 129900 × 2 = 259800
    useCartStore.getState().addItem(mockVariant2, mockProduct, 1)  // 229900 × 1 = 229900

    expect(useCartStore.getState().subtotal()).toBe(259800 + 229900)
  })

  // ── itemCount ──────────────────────────────────────────────────────────────

  it('itemCount() returns 0 for an empty cart', () => {
    expect(useCartStore.getState().itemCount()).toBe(0)
  })

  it('itemCount() sums quantities across all items', () => {
    useCartStore.getState().addItem(mockVariant, mockProduct, 2)
    useCartStore.getState().addItem(mockVariant2, mockProduct, 3)

    expect(useCartStore.getState().itemCount()).toBe(5)
  })

  // ── openCart / closeCart ───────────────────────────────────────────────────

  it('openCart sets isOpen to true', () => {
    useCartStore.getState().openCart()
    expect(useCartStore.getState().isOpen).toBe(true)
  })

  it('closeCart sets isOpen to false', () => {
    useCartStore.getState().openCart()
    useCartStore.getState().closeCart()
    expect(useCartStore.getState().isOpen).toBe(false)
  })
})
