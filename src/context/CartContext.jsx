import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { maxQuantity } from '../../supabase/functions/_shared/checkout.js'
import { productImages } from '../utils/product'

// Second-hand pieces are one-offs, so the cart holds each product at most once
// and quantity is capped by maxQuantity (currently 1).
const CartContext = createContext(null)
// Bumped from 'cart' so carts holding old mock products are dropped.
const STORAGE_KEY = 'cart:v2'

function loadCart() {
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []
    // Carts saved before quantities existed have none: treat as 1.
    return items.map((p) => ({ ...p, quantity: p.quantity ?? 1 }))
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)
  // Mobile bottom sheet / desktop side panel; see CartDrawer.
  const [drawerOpen, setDrawerOpen] = useState(false)

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
      count: items.reduce((sum, p) => sum + p.quantity, 0),
      total: items.reduce((sum, p) => sum + p.price * p.quantity, 0),
      has: (id) => items.some((p) => p.id === id),
      add: (product) => {
        if (product.is_sold) return
        // Store a small snapshot rather than the full row.
        const { id, name, size, price } = product
        const item = { id, name, size, price, image: productImages(product)[0], quantity: 1 }
        setItems((prev) => (prev.some((p) => p.id === id) ? prev : [...prev, item]))
      },
      remove: (id) => setItems((prev) => prev.filter((p) => p.id !== id)),
      setQuantity: (id, quantity) =>
        setItems((prev) =>
          prev.map((p) => (p.id === id ? { ...p, quantity: Math.min(Math.max(1, quantity), maxQuantity(p)) } : p)),
        ),
      clear: () => setItems([]),
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    }),
    [items, drawerOpen],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
