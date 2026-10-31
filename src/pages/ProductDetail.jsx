import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { getProductById } from '../api/products'
import { BackIcon, CheckIcon } from '../components/Icons'
import ImageCarousel from '../components/ImageCarousel'
import OrderContact from '../components/OrderContact'
import { ProductMarker, ProductPrice } from '../components/ProductMeta'
import StatusMessage from '../components/StatusMessage'
import { useCart } from '../context/CartContext'
import { categoryName } from '../utils/category'
import { productImages } from '../utils/product'

export default function ProductDetail() {
  const { t } = useTranslation()
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
  if (status === 'error') return <StatusMessage onRetry={load}>{t('product.loadError')}</StatusMessage>
  if (status === 'notfound') {
    return (
      <div className="page-message">
        <p>{t('product.notFound')}</p>
        <Link to="/shop" className="btn">{t('product.backToShop')}</Link>
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
        <BackIcon /> {category ? categoryName(t, category) : t('product.shop')}
      </Link>
      <div className="detail-layout">
        {/* key: start a new product on its first image */}
        <ImageCarousel key={product.id} images={images} alt={product.name}>
          <ProductMarker product={product} />
        </ImageCarousel>
        <div className="detail-info">
          <div className="detail-head">
            <h1>{product.name}</h1>
            <ProductPrice product={product} className="price detail-price" />
            {product.size && <p className="detail-size">{t('product.size', { size: product.size })}</p>}
          </div>
          {category && (
            <dl className="detail-meta">
              <dt>{t('product.categoryLabel')}</dt>
              <dd>{categoryName(t, category)}</dd>
            </dl>
          )}
          {product.description && <p className="detail-description">{product.description}</p>}
          {!product.is_sold && (
            <OrderContact>{t('product.orderNote')}</OrderContact>
          )}
          {/* Sticky to the bottom of the screen on mobile, inline from tablet up. */}
          <div className="buy-bar">
            {/* Sold: the stamp on the tag already says it; the bar explains. */}
            {product.is_sold ? (
              <p className="buy-bar-note">{t('product.soldNote')}</p>
            ) : inCart ? (
              <>
                <p className="buy-bar-note added" role="status">
                  <CheckIcon /> {t('product.added')}
                </p>
                <button type="button" className="btn btn-outline" onClick={openDrawer}>
                  {t('product.viewCart')}
                </button>
              </>
            ) : (
              <button type="button" className="btn btn-block" onClick={() => add(product)}>
                {t('product.addToCart')}
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
  const { t } = useTranslation()
  return (
    <div className="detail" aria-busy="true" aria-label={t('common.loading')}>
      <span className="back-link">&nbsp;</span>
      <div className="detail-layout">
        <div className="gallery">
          <div className="carousel skeleton" />
        </div>
        <div className="detail-info">
          <span className="skeleton skeleton-line" style={{ width: '70%', height: 32 }} />
          <span className="skeleton skeleton-line" style={{ width: '40%' }} />
        </div>
      </div>
    </div>
  )
}
