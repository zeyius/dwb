import CartContents from '../components/CartContents'

// Direct-link fallback; in-app the header opens CartDrawer instead.
export default function Cart() {
  return (
    <div className="cart">
      <h1>Cart</h1>
      <CartContents />
    </div>
  )
}
