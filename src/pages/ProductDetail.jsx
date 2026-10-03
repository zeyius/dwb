import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProductById } from '../api/products'
import ImageCarousel from '../components/ImageCarousel'
import OrderContact from '../components/OrderContact'
import ProductBadge from '../components/ProductBadge'
import StatusMessage from '../components/StatusMessage'
import { useCart } from '../context/CartContext'
import { formatPrice, productImages } from '../utils/product'

export default function ProductDetail() {
  const { id } = useParams()
  const { add, has, openDrawer } = useCart()
  const [product, setProduct] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ready | notfound | error

  const load = useCallback(() => {
    let cancelled = false
    setStatus('loading')
    getProductById(id).then(
      (p) => {
        if (cancelled) return
        setProduct(p)
        setStatus(p ? 'ready' : 'notfound')
      },
      () => !cancelled && setStatus('error'),
    )
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(load, [load])

  if (status === 'loading') return <DetailSkeleton />
  if (status === 'error') return <StatusMessage onRetry={load}>Couldn’t load this product.</StatusMessage>
  if (status === 'notfound') {
    return (
      <div className="page-message">
        <p>This item doesn’t exist.</p>
        <Link to="/shop" className="btn">Back to shop</Link>
      </div>
    )
  }

  const category = product.categories
  const images = productImages(product)
  const inCart = has(product.id)

  return (
    <article className={product.is_sold ? 'detail sold' : 'detail'}>
      <Link
        to={category ? `/shop?category=${encodeURIComponent(category.slug)}` : '/shop'}
        className="back-link"
      >
        ← {category?.name ?? 'Shop'}
      </Link>
      <div className="detail-layout">
        {/* key: start a new product on its first image */}
        <ImageCarousel key={product.id} images={images} alt={product.name}>
          <ProductBadge product={product} />
        </ImageCarousel>
        <div className="detail-info">
          <h1>{product.name}</h1>
          {product.size && <p className="detail-size">Size {product.size}</p>}
          <p className="detail-price">{formatPrice(product.price)}</p>
          {category && (
            <dl className="detail-meta">
              <dt>Category</dt>
              <dd>{category.name}</dd>
            </dl>
          )}
          {product.description && <p className="detail-description">{product.description}</p>}
          {!product.is_sold && (
            <OrderContact>Add it to your cart, or message us directly to reserve this piece.</OrderContact>
          )}
          {/* Sticky to the bottom of the screen on mobile, inline from tablet up. */}
          <div className="buy-bar">
            <span className="buy-bar-price">{formatPrice(product.price)}</span>
            {product.is_sold ? (
              <button type="button" className="btn btn-block" disabled>
                Sold
              </button>
            ) : inCart ? (
              <button type="button" className="btn btn-block btn-outline" onClick={openDrawer}>
                In cart · View
              </button>
            ) : (
              <button type="button" className="btn btn-block" onClick={() => add(product)}>
                Add to cart
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

// Mirrors the loaded layout (back link, 4/5 image, text lines) to avoid a jump.
function DetailSkeleton() {
  return (
    <div className="detail" aria-busy="true" aria-label="Loading product">
      <span className="back-link">&nbsp;</span>
      <div className="detail-layout">
        <div className="gallery">
          <div className="carousel skeleton" />
        </div>
        <div className="detail-info">
          <span className="skeleton skeleton-line" style={{ width: '70%', height: 28 }} />
          <span className="skeleton skeleton-line" style={{ width: '25%' }} />
          <span className="skeleton skeleton-line" style={{ width: '35%', height: 22 }} />
        </div>
      </div>
    </div>
  )
}
