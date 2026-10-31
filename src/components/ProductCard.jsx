import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { productImages } from '../utils/product'
import Photo from './Photo'
import { ProductMarker, ProductPrice } from './ProductMeta'

// `priority`: the first two cards, on screen at load, skip lazy-loading.
export default function ProductCard({ product, priority = false }) {
  const { t } = useTranslation()
  const [cover] = productImages(product)
  return (
    <Link to={`/shop/${product.id}`} className={product.is_sold ? 'card sold' : 'card'}>
      <div className="card-media">
        <Photo
          src={cover}
          alt=""
          sizes="(min-width: 1100px) 22vw, (min-width: 768px) 30vw, 50vw"
          loading={priority ? 'eager' : 'lazy'}
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
