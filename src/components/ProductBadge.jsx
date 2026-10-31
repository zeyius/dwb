import { useTranslation } from 'react-i18next'

// SOLD takes precedence over NEW.
export default function ProductBadge({ product }) {
  const { t } = useTranslation()
  if (product.is_sold) return <span className="badge badge-sold">{t('product.sold')}</span>
  if (product.is_new) return <span className="badge">{t('product.new')}</span>
  return null
}
