import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '../types'

interface CartState {
  items: CartItem[]
  addItem: (productId: string, qty?: number) => void
  removeItem: (productId: string) => void
  setQty: (productId: string, quantity: number) => void
  clear: () => void
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem(productId, qty = 1) {
        const items = [...get().items]
        const index = items.findIndex((item) => item.productId === productId)
        if (index >= 0)
          items[index] = {
            ...items[index],
            quantity: items[index].quantity + qty,
          }
        else items.push({ productId, quantity: qty })
        set({ items })
      },
      removeItem(productId) {
        set({
          items: get().items.filter((item) => item.productId !== productId),
        })
      },
      setQty(productId, quantity) {
        if (quantity <= 0) {
          set({
            items: get().items.filter((item) => item.productId !== productId),
          })
          return
        }
        set({
          items: get().items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item,
          ),
        })
      },
      clear() {
        set({ items: [] })
      },
    }),
    { name: 'northwind-cart' },
  ),
)
