import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProductById } from '../api/products'
import OrderContact from '../components/OrderContact'
import ProductBadge from '../components/ProductBadge'
import StatusMessage from '../components/StatusMessage'
import { useCart } from '../context/CartContext'
import { formatPrice, productImages } from '../utils/product'

export default function ProductDetail() {
  const { id } = useParams()
  const { add, has } = useCart()
  const [product, setProduct] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ready | notfound | error
  const [activeImage, setActiveImage] = useState(0)

  const load = useCallback(() => {
    let cancelled = false
    setStatus('loading')
    setActiveImage(0)
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

  if (status === 'loading') return <StatusMessage>Loading…</StatusMessage>
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
        <div className="gallery">
          <div className="detail-media">
            <img src={images[activeImage]} alt={product.name} />
            <ProductBadge product={product} />
          </div>
          {images.length > 1 && (
            <div className="thumbs">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  className={i === activeImage ? 'thumb active' : 'thumb'}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Show image ${i + 1}`}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="detail-info">
          <h1>{product.name}</h1>
          <p className="detail-price">{formatPrice(product.price)}</p>
          <dl className="detail-meta">
            {product.size && (
              <>
                <dt>Size</dt>
                <dd>{product.size}</dd>
              </>
            )}
            {category && (
              <>
                <dt>Category</dt>
                <dd>{category.name}</dd>
              </>
            )}
          </dl>
          {product.description && <p className="detail-description">{product.description}</p>}
          {product.is_sold ? (
            <button type="button" className="btn btn-block" disabled>
              Sold
            </button>
          ) : inCart ? (
            <Link to="/shop/cart" className="btn btn-block">In cart — view cart</Link>
          ) : (
            <button type="button" className="btn btn-block" onClick={() => add(product)}>
              Add to cart
            </button>
          )}
          {!product.is_sold && (
            <OrderContact>Add it to your cart, or message us directly to reserve this piece.</OrderContact>
          )}
        </div>
      </div>
    </article>
  )
}
