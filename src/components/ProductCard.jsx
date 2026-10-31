import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { productImages } from '../utils/product'
import { ProductMarker, ProductPrice } from './ProductMeta'

// `priority` is for the first row: lazy-loading above-the-fold images delays LCP.
export default function ProductCard({ product, priority = false }) {
  const { t } = useTranslation()
  const [cover] = productImages(product)
  return (
    <Link to={`/shop/${product.id}`} className={product.is_sold ? 'card sold' : 'card'}>
      <div className="card-media">
        <img
          src={cover}
          alt=""
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
        />
        <ProductMarker product={product} />
      </div>
      <h2 className="card-name">{product.name}</h2>
      <p className="card-line">
        <ProductPrice product={product} />
        {product.size && (
          <span className="card-size">
            <span className="visually-hidden">{t('product.sizeLabel')} </span>
            {product.size}
          </span>
        )}
      </p>
    </Link>
  )
}

// Same box as a loaded card (image, then name and price lines) so swapping it
// out doesn't shift the grid.
export function ProductCardSkeleton() {
  return (
    <div className="card card-skeleton" aria-hidden="true">
      <div className="card-media skeleton" />
      <span className="skeleton skeleton-line" style={{ width: '70%' }} />
      <span className="skeleton skeleton-line" style={{ width: '40%' }} />
    </div>
  )
}
