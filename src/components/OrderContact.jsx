import { useHasContact } from '../context/StoreSettingsContext'
import ContactLinks from './ContactLinks'

// "How to order" block for the product and cart pages.
export default function OrderContact({ children }) {
  if (!useHasContact()) return null
  return (
    <div className="order-contact">
      <h2>How to order</h2>
      <p className="muted">{children}</p>
      <ContactLinks />
    </div>
  )
}
