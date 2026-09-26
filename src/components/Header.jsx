import { Link } from 'react-router-dom'
import { STORE } from '../config'
import { useCart } from '../context/CartContext'
import { useStoreSettings } from '../context/StoreSettingsContext'
import { CartIcon, InstagramIcon } from './Icons'

export default function Header() {
  const { count } = useCart()
  const { instagramUrl } = useStoreSettings()

  return (
    <header className="header">
      <Link to="/shop" className="logo" aria-label={`${STORE.name} home`}>
        <img src="/logo-dark.png" alt={STORE.name} width="44" height="44" />
      </Link>
      <nav className="header-actions">
        {instagramUrl && (
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="icon-btn">
            <InstagramIcon />
          </a>
        )}
        <Link to="/shop/cart" aria-label={`Cart, ${count} items`} className="icon-btn">
          <CartIcon />
          {count > 0 && <span className="cart-count">{count}</span>}
        </Link>
      </nav>
    </header>
  )
}
