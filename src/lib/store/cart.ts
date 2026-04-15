import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProductSummary, Variant } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  variantId:   string
  productId:   string   // needed for stock validation (GET /api/products/[id]/stock)
  sku:         string
  productName: string
  slug:        string   // needed for PDP navigation
  size_ml:     number
  price:       number   // paise — snapshotted at add time
  quantity:    number
  imageUrl:    string | null
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface CartStore {
  items:   CartItem[]
  isOpen:  boolean

  // Mutations
  addItem:    (variant: Variant, product: ProductSummary, qty: number) => void
  removeItem: (variantId: string) => void
  updateQty:  (variantId: string, qty: number) => void
  clearCart:  () => void
  openCart:   () => void
  closeCart:  () => void

  // Computed
  subtotal:  () => number  // paise
  itemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items:  [],
      isOpen: false,

      addItem(variant, product, qty) {
        set((state) => {
          const existing = state.items.find((i) => i.variantId === variant.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === variant.id
                  ? { ...i, quantity: i.quantity + qty }
                  : i,
              ),
            }
          }
          const newItem: CartItem = {
            variantId:   variant.id,
            productId:   product.id,
            sku:         variant.sku,
            productName: product.name,
            slug:        product.slug,
            size_ml:     variant.size_ml,
            price:       variant.price,
            quantity:    qty,
            imageUrl:    product.image_url,
          }
          return { items: [...state.items, newItem] }
        })
      },

      removeItem(variantId) {
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        }))
      },

      updateQty(variantId, qty) {
        if (qty < 1) {
          get().removeItem(variantId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId ? { ...i, quantity: qty } : i,
          ),
        }))
      },

      clearCart() {
        set({ items: [] })
      },

      openCart()  { set({ isOpen: true }) },
      closeCart() { set({ isOpen: false }) },

      subtotal() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
      },

      itemCount() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },
    }),
    {
      name: 'form-cart',
      // Only persist items — isOpen resets on page load
      partialize: (state) => ({ items: state.items }),
    },
  ),
)
