import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  variantId: string
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl?: string | null
}

interface CartStore {
  items: CartItem[]
  isDrawerOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  openDrawer: () => void
  closeDrawer: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      
      addItem: (item) => {
        const currentItems = get().items
        const existingItem = currentItems.find((i) => i.variantId === item.variantId)

        if (existingItem) {
          set({
            items: currentItems.map((i) =>
              i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          })
        } else {
          set({ items: [...currentItems, item] })
        }
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
            i.variantId === variantId ? { ...i, quantity } : i
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
