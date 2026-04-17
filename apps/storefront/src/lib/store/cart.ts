import { create } from 'zustand'
import { persist, type PersistStorage } from 'zustand/middleware'
import type { ProductSummary, Variant } from '@/types'

// ─── Debounced localStorage adapter ──────────────────────────────────────────

function createDebouncedStorage(delay = 300): PersistStorage<Pick<CartStore, 'items'>> {
  let timer: ReturnType<typeof setTimeout> | null = null

  return {
    getItem(name) {
      const str = localStorage.getItem(name)
      return str ? JSON.parse(str) : null
    },
    setItem(name, value) {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        localStorage.setItem(name, JSON.stringify(value))
      }, delay)
    },
    removeItem(name) {
      if (timer) clearTimeout(timer)
      localStorage.removeItem(name)
    },
  }
}

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

  // Derived (recomputed on every items mutation)
  subtotal:  number  // paise
  itemCount: number

  // Mutations
  addItem:    (variant: Variant, product: ProductSummary, qty: number) => void
  addItems:   (items: CartItem[]) => void
  removeItem: (variantId: string) => void
  updateQty:  (variantId: string, qty: number) => void
  clearCart:  () => void
  openCart:   () => void
  closeCart:  () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => {
      function deriveFromItems(items: CartItem[]) {
        return {
          subtotal:  items.reduce((sum, i) => sum + i.price * i.quantity, 0),
          itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
        }
      }

      function setItems(items: CartItem[]) {
        set({ items, ...deriveFromItems(items) })
      }

      return {
        items:     [],
        isOpen:    false,
        subtotal:  0,
        itemCount: 0,

        addItem(variant, product, qty) {
          const state = get()
          const existing = state.items.find((i) => i.variantId === variant.id)
          if (existing) {
            setItems(
              state.items.map((i) =>
                i.variantId === variant.id
                  ? { ...i, quantity: i.quantity + qty }
                  : i,
              ),
            )
          } else {
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
            setItems([...state.items, newItem])
          }
        },

        addItems(incoming) {
          const next = [...get().items]
          for (const item of incoming) {
            const idx = next.findIndex((i) => i.variantId === item.variantId)
            if (idx >= 0) {
              next[idx] = { ...next[idx]!, quantity: next[idx]!.quantity + item.quantity }
            } else {
              next.push(item)
            }
          }
          setItems(next)
        },

        removeItem(variantId) {
          setItems(get().items.filter((i) => i.variantId !== variantId))
        },

        updateQty(variantId, qty) {
          if (qty < 1) {
            get().removeItem(variantId)
            return
          }
          setItems(
            get().items.map((i) =>
              i.variantId === variantId ? { ...i, quantity: qty } : i,
            ),
          )
        },

        clearCart() {
          setItems([])
        },

        openCart()  { set({ isOpen: true }) },
        closeCart() { set({ isOpen: false }) },
      }
    },
    {
      name: 'form-cart',
      partialize: (state) => ({ items: state.items }),
      storage: createDebouncedStorage(300),
    },
  ),
)
