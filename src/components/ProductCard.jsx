import { Link } from 'react-router-dom'
import { formatPrice, productImages } from '../utils/product'
import ProductBadge from './ProductBadge'

// `priority` is for the first row: lazy-loading above-the-fold images delays LCP.
export default function ProductCard({ product, priority = false }) {
  const [cover, alt] = productImages(product)
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
        {/* Second photo, crossfaded in on hover. Hidden (display: none) on touch
            screens, where a lazy image that's never displayed is never fetched. */}
        {alt && <img src={alt} alt="" className="card-media-alt" loading="lazy" decoding="async" />}
        <ProductBadge product={product} />
      </div>
      <div className="card-body">
        <h2 className="card-name">{product.name}</h2>
        {product.size && <p className="card-size">Size {product.size}</p>}
        <p className="card-price">{formatPrice(product.price)}</p>
      </div>
    </Link>
  )
}

// Same box as a loaded card (image, then name/size/price lines) so swapping
// it out doesn't shift the grid.
export function ProductCardSkeleton() {
  return (
    <div className="card card-skeleton" aria-hidden="true">
      <div className="card-media skeleton" />
      <div className="card-body">
        <span className="skeleton skeleton-line" style={{ width: '80%' }} />
        <span className="skeleton skeleton-line" style={{ width: '40%' }} />
        <span className="skeleton skeleton-line" style={{ width: '50%' }} />
      </div>
    </div>
  )
}
