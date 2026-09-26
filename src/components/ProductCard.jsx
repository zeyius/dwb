import { Link } from 'react-router-dom'
import { formatPrice, productImages } from '../utils/product'
import ProductBadge from './ProductBadge'

export default function ProductCard({ product }) {
  return (
    <Link to={`/shop/${product.id}`} className={product.is_sold ? 'card sold' : 'card'}>
      <div className="card-media">
        <img src={productImages(product)[0]} alt={product.name} loading="lazy" />
        <ProductBadge product={product} />
      </div>
      <div className="card-body">
        <h3 className="card-name">{product.name}</h3>
        {product.size && <p className="card-size">Size {product.size}</p>}
        <p className="card-price">{formatPrice(product.price)}</p>
      </div>
    </Link>
  )
}
