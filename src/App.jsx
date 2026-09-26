import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/shop" replace />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/cart" element={<Cart />} />
        <Route path="/shop/:id" element={<ProductDetail />} />
        <Route path="*" element={<Navigate to="/shop" replace />} />
      </Route>
    </Routes>
  )
}
