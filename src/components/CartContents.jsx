import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/product'

// Item list + total, shared by the cart page and the cart drawer.
// `onNavigate` lets the drawer close itself when a link inside it is followed.
export default function CartContents({ onNavigate }) {
  const { t } = useTranslation()
  const { items, total, remove, clear } = useCart()

  if (items.length === 0) {
    return (
      <div className="page-message">
        <p className="cart-empty">{t('cart.empty')}</p>
        <p className="muted">{t('cart.emptyBody')}</p>
        <Link to="/shop" className="btn" onClick={onNavigate}>{t('cart.browse')}</Link>
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
              {p.size && <span className="muted">{t('product.size', { size: p.size })}</span>}
              <span className="cart-item-price">{formatPrice(p.price)}</span>
            </div>
            <button type="button" className="link-btn" onClick={() => remove(p.id)} aria-label={t('cart.removeItem', { name: p.name })}>
              {t('cart.remove')}
            </button>
          </li>
        ))}
      </ul>
      <div className="cart-summary">
        <div className="cart-total">
          <span>{t('cart.total')}</span>
          <strong>{formatPrice(total)}</strong>
        </div>
        <Link to="/checkout" className="btn btn-block" onClick={onNavigate}>
          {t('cart.checkout')}
        </Link>
        <button type="button" className="link-btn" onClick={clear}>
          {t('cart.clear')}
        </button>
      </div>
    </>
  )
}
