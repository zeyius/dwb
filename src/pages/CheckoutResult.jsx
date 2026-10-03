import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ContactLinks from '../components/ContactLinks'
import { useCart } from '../context/CartContext'
import { t } from '../i18n'
import { loadOrderSummary } from '../utils/orderSummary'
import { formatPrice } from '../utils/product'

// Online payments: Chargily redirects here with ?order=<uuid>. The redirect
// only says where the customer ended up; the webhook marks the order paid.
// Cash on delivery: the checkout page navigates here itself after storing the
// server's order summary (see utils/orderSummary).
function useOrder() {
  const [params] = useSearchParams()
  const id = params.get('order')
  return { id, ref: id?.slice(0, 8).toUpperCase() ?? null }
}

export function CheckoutSuccess() {
  const { clear } = useCart()
  const { id, ref } = useOrder()
  const summary = loadOrderSummary(id)
  const cod = summary?.payment_method === 'cod'

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
      <h1>{t(cod ? 'success.cod.title' : 'success.paid.title')}</h1>
      {ref && <p className="order-ref">{t('success.order', { ref })}</p>}
      <p>{t(cod ? 'success.cod.body' : 'success.paid.body')}</p>
      {cod && <OrderSummary summary={summary} />}
      <Link to="/shop" className="btn">{t('success.continue')}</Link>
    </div>
  )
}

function OrderSummary({ summary }) {
  return (
    <section className="result-summary" aria-labelledby="result-summary-title">
      <h2 id="result-summary-title">{t('summary.title')}</h2>
      <ul>
        {summary.items.map((item) => (
          <li key={item.id}>
            <span>
              {item.name}
              {item.quantity > 1 && ` × ${item.quantity}`}
              {item.size && <span className="muted"> · {t('summary.size', { size: item.size })}</span>}
            </span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <dl>
        <div>
          <dt>{t('summary.subtotal')}</dt>
          <dd>{formatPrice(summary.subtotal)}</dd>
        </div>
        <div>
          <dt>{t(`summary.delivery.${summary.delivery_type}`)}</dt>
          <dd>{formatPrice(summary.delivery_price)}</dd>
        </div>
        <div className="result-summary-total">
          <dt>{t('summary.total')}</dt>
          <dd>{formatPrice(summary.total)}</dd>
        </div>
        <div>
          <dt>{t('summary.payment')}</dt>
          <dd>{t('payment.cod')}</dd>
        </div>
      </dl>
    </section>
  )
}

export function CheckoutFailed() {
  const { ref } = useOrder()
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
