import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import StatusMessage from './components/StatusMessage'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import { CheckoutFailed, CheckoutSuccess } from './pages/CheckoutResult'

// Lazy: it carries the full wilaya/commune list (~20 KB gzipped).
const Checkout = lazy(() => import('./pages/Checkout'))

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/shop" replace />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/cart" element={<Cart />} />
        <Route path="/shop/:id" element={<ProductDetail />} />
        <Route
          path="/checkout"
          element={
            <Suspense fallback={<StatusMessage>Loading…</StatusMessage>}>
              <Checkout />
            </Suspense>
          }
        />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/checkout/failed" element={<CheckoutFailed />} />
        <Route path="*" element={<Navigate to="/shop" replace />} />
      </Route>
    </Routes>
  )
}
