import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { STORE } from '../config'
import { useCart } from '../context/CartContext'
import { useStoreSettings } from '../context/StoreSettingsContext'
import { CartIcon, InstagramIcon } from './Icons'

export default function Header() {
  const { count, openDrawer } = useCart()
  const { instagramUrl } = useStoreSettings()

  // Bump the badge only when an item is added, not on the initial load from storage.
  const prevCount = useRef(count)
  const [bump, setBump] = useState(0)
  useEffect(() => {
    if (count > prevCount.current) setBump((b) => b + 1)
    prevCount.current = count
  }, [count])

  return (
    <header className="header">
      <Link to="/shop" className="logo" aria-label={`${STORE.name} home`}>
        <span className="logo-disc">
          <img src="/logo-dark.webp" alt="" width="40" height="40" />
        </span>
      </Link>
      <nav className="header-actions" aria-label="Store">
        {instagramUrl && (
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="icon-btn">
            <InstagramIcon />
          </a>
        )}
        <Link
          to="/shop/cart"
          aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}
          className="icon-btn"
          onClick={(e) => {
            // Plain clicks open the drawer; modified clicks still open the page.
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
            e.preventDefault()
            openDrawer()
          }}
        >
          <CartIcon />
          {count > 0 && (
            <span key={bump} className={bump ? 'cart-count bump' : 'cart-count'} aria-hidden="true">
              {count}
            </span>
          )}
        </Link>
      </nav>
    </header>
  )
}
