import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import StatusMessage from './components/StatusMessage'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'

// Lazy: checkout carries the full wilaya/commune list (~20 KB gzipped); the
// result pages (and the translations they share with it) are only seen after
// an order.
const Checkout = lazy(() => import('./pages/Checkout'))
const CheckoutSuccess = lazy(() => import('./pages/CheckoutResult').then((m) => ({ default: m.CheckoutSuccess })))
const CheckoutFailed = lazy(() => import('./pages/CheckoutResult').then((m) => ({ default: m.CheckoutFailed })))
const loading = <StatusMessage>Loading…</StatusMessage>

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
            <Suspense fallback={loading}>
              <Checkout />
            </Suspense>
          }
        />
        <Route
          path="/checkout/success"
          element={
            <Suspense fallback={loading}>
              <CheckoutSuccess />
            </Suspense>
          }
        />
        <Route
          path="/checkout/failed"
          element={
            <Suspense fallback={loading}>
              <CheckoutFailed />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/shop" replace />} />
      </Route>
    </Routes>
  )
}
