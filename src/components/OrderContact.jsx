import { useTranslation } from 'react-i18next'
import { useHasContact } from '../context/StoreSettingsContext'
import ContactLinks from './ContactLinks'

// "How to order" block for the product and cart pages.
export default function OrderContact({ children }) {
  const { t } = useTranslation()
  if (!useHasContact()) return null
  return (
    <div className="order-contact">
      <h2>{t('order.howTo')}</h2>
      <p className="muted">{children}</p>
      <ContactLinks />
    </div>
  )
}
