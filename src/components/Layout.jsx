import { Outlet, useLocation } from 'react-router-dom'
import useScrollRestoration from '../hooks/useScrollRestoration'
import CartDrawer from './CartDrawer'
import Footer from './Footer'
import Header from './Header'

export default function Layout() {
  const { pathname } = useLocation()
  useScrollRestoration()

  return (
    <div className="app">
      <Header />
      {/* Keyed by path so each page fades in; category changes (?category=)
          stay on the same element and don't flash. */}
      <main className="main page" key={pathname}>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
