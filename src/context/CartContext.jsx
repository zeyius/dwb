import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { productImages } from '../utils/product'

// Second-hand pieces are one-offs, so the cart holds each product at most once.
const CartContext = createContext(null)
// Bumped from 'cart' so carts holding old mock products are dropped.
const STORAGE_KEY = 'cart:v2'

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // storage unavailable: cart just won't persist
    }
  }, [items])

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      total: items.reduce((sum, p) => sum + p.price, 0),
      has: (id) => items.some((p) => p.id === id),
      add: (product) => {
        if (product.is_sold) return
        // Store a small snapshot rather than the full row.
        const { id, name, size, price } = product
        const item = { id, name, size, price, image: productImages(product)[0] }
        setItems((prev) => (prev.some((p) => p.id === id) ? prev : [...prev, item]))
      },
      remove: (id) => setItems((prev) => prev.filter((p) => p.id !== id)),
      clear: () => setItems([]),
    }),
    [items],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
