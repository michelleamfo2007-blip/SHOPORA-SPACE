import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  variantId: string
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl?: string | null
  /** Stock available when the item was added. Checkout re-checks on the server. */
  maxQuantity?: number
}

interface CartStore {
  items: CartItem[]
  isDrawerOpen: boolean
  /** Adds the item, capped at its stock. Returns how many were actually added. */
  addItem: (item: CartItem) => number
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  openDrawer: () => void
  closeDrawer: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

function cap(quantity: number, max?: number) {
  return typeof max === "number" ? Math.min(quantity, Math.max(0, max)) : quantity
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      addItem: (item) => {
        const currentItems = get().items
        const existingItem = currentItems.find((i) => i.variantId === item.variantId)
        const max = item.maxQuantity ?? existingItem?.maxQuantity

        if (existingItem) {
          const next = cap(existingItem.quantity + item.quantity, max)
          set({
            items: currentItems.map((i) =>
              i.variantId === item.variantId ? { ...i, quantity: next, maxQuantity: max } : i
            ),
          })
          return next - existingItem.quantity
        }

        const quantity = cap(item.quantity, max)
        if (quantity <= 0) return 0
        set({ items: [...currentItems, { ...item, quantity, maxQuantity: max }] })
        return quantity
      },

      removeItem: (variantId) => {
        set({
          items: get().items.filter((i) => i.variantId !== variantId),
        })
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId)
          return
        }

        set({
          items: get().items.map((i) =>
            i.variantId === variantId ? { ...i, quantity: Math.max(1, cap(quantity, i.maxQuantity)) } : i
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      openDrawer: () => set({ isDrawerOpen: true }),

      closeDrawer: () => set({ isDrawerOpen: false }),

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      },

      getTotalItems: () => {
        return get().items.reduce(
          (total, item) => total + item.quantity,
          0
        )
      },
    }),
    {
      name: "shopora-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
)
