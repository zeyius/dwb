import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { formatPrice } from '../utils/product'

// Products whose "New" marker has already been shown this visit: it slides in
// the first time only, not again on "Show more", a category switch or back.
const seenNew = new Set()

// "Sold" wins over "New". Sits in the photo's top-start corner.
export function ProductMarker({ product }) {
  const { t } = useTranslation()
  const isNew = product.is_new && !product.is_sold
  const firstTime = useRef(isNew && !seenNew.has(product.id)).current
  useEffect(() => {
    if (isNew) seenNew.add(product.id)
  }, [isNew, product.id])

  if (product.is_sold) return <span className="marker">{t('product.sold')}</span>
  if (isNew) return <span className={firstTime ? 'marker marker-new enter' : 'marker marker-new'}>{t('product.new')}</span>
  return null
}

const hasOldPrice = (p) => typeof p.old_price === 'number' && p.old_price > p.price

// Price, then the old price struck through. Sold: the price itself is struck
// and the old price is dropped.
export function ProductPrice({ product, className = 'price' }) {
  const { t } = useTranslation()
  const Price = product.is_sold ? 's' : 'span'
  return (
    <span className={className}>
      <Price className="price-now">{formatPrice(product.price)}</Price>
      {hasOldPrice(product) && !product.is_sold && (
        <s className="price-old">
          <span className="visually-hidden">{t('product.wasPrice')} </span>
          {formatPrice(product.old_price)}
        </s>
      )}
    </span>
  )
}
