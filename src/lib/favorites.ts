import { create } from "zustand"
import { persist } from "zustand/middleware"

interface FavoritesStore {
  items: string[] // Array of product IDs
  toggleFavorite: (productId: string) => void
  isFavorite: (productId: string) => boolean
}

export const useFavorites = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      toggleFavorite: (productId) => {
        const currentItems = get().items
        if (currentItems.includes(productId)) {
          // Remove if it exists
          set({ items: currentItems.filter((id) => id !== productId) })
        } else {
          // Add if it doesn't exist
          set({ items: [...currentItems, productId] })
        }
      },

      isFavorite: (productId) => {
        return get().items.includes(productId)
      }
    }),
    {
      name: "shopora-favorites",
    }
  )
)
