import { Link } from 'react-router-dom'
import OrderContact from '../components/OrderContact'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/product'

export default function Cart() {
  const { items, total, remove, clear } = useCart()

  if (items.length === 0) {
    return (
      <div className="page-message">
        <h1>Your cart is empty</h1>
        <Link to="/shop" className="btn">Browse the shop</Link>
      </div>
    )
  }

  return (
    <div className="cart">
      <h1>Cart</h1>
      <ul className="cart-list">
        {items.map((p) => (
          <li key={p.id} className="cart-item">
            <Link to={`/shop/${p.id}`} className="cart-thumb">
              <img src={p.image} alt={p.name} />
            </Link>
            <div className="cart-item-info">
              <Link to={`/shop/${p.id}`} className="cart-item-name">{p.name}</Link>
              {p.size && <span className="muted">Size {p.size}</span>}
              <span>{formatPrice(p.price)}</span>
            </div>
            <button type="button" className="link-btn" onClick={() => remove(p.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div className="cart-summary">
        <div className="cart-total">
          <span>Total</span>
          <strong>{formatPrice(total)}</strong>
        </div>
        <button type="button" className="link-btn" onClick={clear}>
          Clear cart
        </button>
      </div>
      <OrderContact>Send us the items in your cart and we’ll confirm your order.</OrderContact>
    </div>
  )
}
