import { lazy, Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import useScrollRestoration from '../hooks/useScrollRestoration'
import Footer from './Footer'
import Header from './Header'

// The drawer's code loads the first time it's opened, then stays mounted so
// it can animate open and closed.
const CartDrawer = lazy(() => import('./CartDrawer'))

export default function Layout() {
  const { pathname } = useLocation()
  const { drawerOpen } = useCart()
  const [drawerUsed, setDrawerUsed] = useState(drawerOpen)
  useEffect(() => {
    if (drawerOpen) setDrawerUsed(true)
  }, [drawerOpen])
  useScrollRestoration()

  return (
    <div className="app">
      <Header />
      {/* Keyed by path so each page starts fresh; category changes
          (?category=) stay on the same element. */}
      <main className="main" key={pathname}>
        <Outlet />
      </main>
      <Footer />
      {drawerUsed && (
        <Suspense fallback={null}>
          <CartDrawer />
        </Suspense>
      )}
    </div>
  )
}
