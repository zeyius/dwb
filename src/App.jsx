import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import StatusMessage from './components/StatusMessage'
import Shop from './pages/Shop'
// Only the shop is in the main bundle; every other page loads when first
// visited. Checkout carries the wilaya/commune list (~20 KB gzipped), so it
// never loads on the shop.
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const CheckoutSuccess = lazy(() => import('./pages/CheckoutResult').then((m) => ({ default: m.CheckoutSuccess })))
const CheckoutFailed = lazy(() => import('./pages/CheckoutResult').then((m) => ({ default: m.CheckoutFailed })))
function Loading() {
  const { t } = useTranslation()
  return <StatusMessage>{t('common.loading')}</StatusMessage>
}
const loading = <Loading />

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/shop" replace />} />
        <Route path="/shop" element={<Shop />} />
        <Route
          path="/shop/cart"
          element={
            <Suspense fallback={loading}>
              <Cart />
            </Suspense>
          }
        />
        <Route
          path="/shop/:id"
          element={
            <Suspense fallback={loading}>
              <ProductDetail />
            </Suspense>
          }
        />
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
