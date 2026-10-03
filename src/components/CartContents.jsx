import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/product'

// Item list + total, shared by the cart page and the cart drawer.
// `onNavigate` lets the drawer close itself when a link inside it is followed.
export default function CartContents({ onNavigate }) {
  const { items, total, remove, clear } = useCart()

  if (items.length === 0) {
    return (
      <div className="page-message">
        <p className="cart-empty">Your cart is empty</p>
        <Link to="/shop" className="btn" onClick={onNavigate}>Browse the shop</Link>
      </div>
    )
  }

  return (
    <>
      <ul className="cart-list">
        {items.map((p) => (
          <li key={p.id} className="cart-item">
            <Link to={`/shop/${p.id}`} className="cart-thumb" onClick={onNavigate} tabIndex={-1} aria-hidden="true">
              <img src={p.image} alt="" loading="lazy" decoding="async" />
            </Link>
            <div className="cart-item-info">
              <Link to={`/shop/${p.id}`} className="cart-item-name" onClick={onNavigate}>{p.name}</Link>
              {p.size && <span className="muted">Size {p.size}</span>}
              <span>{formatPrice(p.price)}</span>
            </div>
            <button type="button" className="link-btn" onClick={() => remove(p.id)} aria-label={`Remove ${p.name}`}>
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
        <Link to="/checkout" className="btn btn-block" onClick={onNavigate}>
          Checkout
        </Link>
        <button type="button" className="link-btn" onClick={clear}>
          Clear cart
        </button>
      </div>
    </>
  )
}
