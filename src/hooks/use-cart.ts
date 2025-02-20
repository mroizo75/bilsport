import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useSession } from 'next-auth/react'

interface CartItem {
  id: string
  name: string
  price: number
  category: string
  subType: string
  driverName?: string
  startDate?: string
  endDate?: string
  quantity: number
  clubId: string
  vehicleReg?: string
  licenseId: string
}

interface CartStore {
  items: { [userId: string]: CartItem[] }
  addItem: (userId: string, item: CartItem) => void
  removeItem: (userId: string, itemId: string) => void
  clearCart: (userId: string) => void
  updateQuantity: (userId: string, itemId: string, quantity: number) => void
}

export const useCartStore = create(
  persist<CartStore>(
    (set) => ({
      items: {},
      addItem: (userId, item) =>
        set((state) => ({
          items: {
            ...state.items,
            [userId]: [...(state.items[userId] || []), item],
          },
        })),
      removeItem: (userId, itemId) =>
        set((state) => ({
          items: {
            ...state.items,
            [userId]: (state.items[userId] || []).filter((item) => item.id !== itemId),
          },
        })),
      updateQuantity: (userId, itemId, quantity) =>
        set((state) => ({
          items: {
            ...state.items,
            [userId]: (state.items[userId] || []).map((item) =>
              item.id === itemId ? { ...item, quantity } : item
            ),
          },
        })),
      clearCart: (userId) =>
        set((state) => ({
          items: {
            ...state.items,
            [userId]: [],
          },
        })),
    }),
    {
      name: 'cart-storage',
    }
  )
)

export function useCart() {
  const { data: session } = useSession()
  const userId = session?.user?.id || 'anonymous'
  const store = useCartStore()
  const items = store.items[userId] || []

  const total = items.reduce((sum, item) => {
    const itemTotal = item.price * (item.quantity || 1)
    return sum + (isNaN(itemTotal) ? 0 : itemTotal)
  }, 0)

  return {
    items,
    total,
    addItem: (item: CartItem) => store.addItem(userId, item),
    removeItem: (itemId: string) => store.removeItem(userId, itemId),
    updateQuantity: (itemId: string, quantity: number) => 
      store.updateQuantity(userId, itemId, quantity),
    clearCart: () => {
      console.log("clearCart called for userId:", userId)
      store.clearCart(userId)
    },
  }
} 