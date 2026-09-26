import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getCategories } from '../api/categories'
import { getProducts } from '../api/products'
import CategorySidebar from '../components/CategorySidebar'
import ProductCard from '../components/ProductCard'
import StatusMessage from '../components/StatusMessage'

const PAGE_SIZE = 8

export default function Shop() {
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category') || null

  const [categories, setCategories] = useState([])
  const [categoriesError, setCategoriesError] = useState(null)

  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [moreStatus, setMoreStatus] = useState('idle') // idle | loading | error
  const requestId = useRef(0)

  const loadCategories = useCallback(() => {
    setCategoriesError(null)
    getCategories().then(setCategories, setCategoriesError)
  }, [])

  useEffect(loadCategories, [loadCategories])

  // First page; also runs whenever the category changes. requestId drops
  // responses that arrive after the user switched category.
  const loadFirstPage = useCallback(() => {
    const id = ++requestId.current
    setStatus('loading')
    setMoreStatus('idle')
    getProducts({ categorySlug: category, offset: 0, limit: PAGE_SIZE }).then(
      (res) => {
        if (id !== requestId.current) return
        setItems(res.items)
        setTotal(res.total)
        setStatus('ready')
      },
      () => id === requestId.current && setStatus('error'),
    )
  }, [category])

  useEffect(loadFirstPage, [loadFirstPage])

  function showMore() {
    const id = requestId.current
    setMoreStatus('loading')
    getProducts({ categorySlug: category, offset: items.length, limit: PAGE_SIZE }).then(
      (res) => {
        if (id !== requestId.current) return
        setItems((prev) => [...prev, ...res.items])
        setTotal(res.total)
        setMoreStatus('idle')
      },
      () => id === requestId.current && setMoreStatus('error'),
    )
  }

  const heading = category ? (categories.find((c) => c.slug === category)?.name ?? '') : 'All'

  return (
    <div className="shop">
      <CategorySidebar
        categories={categories}
        active={category}
        error={categoriesError}
        onRetry={loadCategories}
      />
      <section className="shop-content">
        <div className="shop-heading">
          <h1>{heading}</h1>
          {status === 'ready' && <span className="muted">{total} items</span>}
        </div>

        {status === 'loading' && <StatusMessage>Loading products…</StatusMessage>}
        {status === 'error' && (
          <StatusMessage onRetry={loadFirstPage}>Couldn’t load products.</StatusMessage>
        )}
        {status === 'ready' && items.length === 0 && <StatusMessage>No products yet</StatusMessage>}

        {status === 'ready' && items.length > 0 && (
          <>
            <div className="grid">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {items.length < total && (
              <div className="show-more">
                {moreStatus === 'error' && <p className="muted">Couldn’t load more products.</p>}
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={showMore}
                  disabled={moreStatus === 'loading'}
                >
                  {moreStatus === 'loading' ? 'Loading…' : moreStatus === 'error' ? 'Try again' : 'Show more'}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
