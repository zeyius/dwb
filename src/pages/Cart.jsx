import { useTranslation } from 'react-i18next'
import CartContents from '../components/CartContents'

// Direct-link fallback; in-app the header opens CartDrawer instead.
export default function Cart() {
  const { t } = useTranslation()
  return (
    <div className="cart">
      <h1>{t('cart.title')}</h1>
      <CartContents />
    </div>
  )
}
