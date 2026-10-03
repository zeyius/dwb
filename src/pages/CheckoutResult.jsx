import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ContactLinks from '../components/ContactLinks'
import { useCart } from '../context/CartContext'

// Chargily redirects here with ?order=<uuid>. The redirect only says where the
// customer ended up; the webhook is what actually marks the order paid.
function useOrderRef() {
  const [params] = useSearchParams()
  return params.get('order')?.slice(0, 8).toUpperCase() ?? null
}

export function CheckoutSuccess() {
  const { clear } = useCart()
  const ref = useOrderRef()

  useEffect(() => {
    clear()
    try {
      sessionStorage.removeItem('checkout:form')
    } catch {
      // nothing to clear
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="page-message checkout-result">
      <SuccessIcon />
      <h1>Thank you!</h1>
      <p>
        Your payment went through{ref && <> for order <strong dir="ltr">#{ref}</strong></>}. We’ll call you to arrange
        delivery.
      </p>
      <Link to="/shop" className="btn">Continue shopping</Link>
    </div>
  )
}

export function CheckoutFailed() {
  const ref = useOrderRef()
  return (
    <div className="page-message checkout-result">
      <h1>Payment not completed</h1>
      <p>
        The payment{ref && <> for order <strong dir="ltr">#{ref}</strong></>} was canceled or declined, and you
        haven’t been charged. Your cart is still saved.
      </p>
      <Link to="/checkout" className="btn">Try again</Link>
      <Link to="/shop" className="link-btn">Back to the shop</Link>
      <div className="checkout-result-help">
        <p className="muted">Having trouble? Contact us:</p>
        <ContactLinks />
      </div>
    </div>
  )
}

const SuccessIcon = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="m7.5 12.5 3 3 6-6.5" />
  </svg>
)
