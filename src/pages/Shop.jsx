import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { getCategories } from '../api/categories'
import { getProducts } from '../api/products'
import CategorySidebar from '../components/CategorySidebar'
import Hero from '../components/Hero'
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard'
import StatusMessage from '../components/StatusMessage'
import { categoryName } from '../utils/category'

const PAGE_SIZE = 8
// Cards in the first row on the widest layout; these skip lazy-loading.
const PRIORITY_CARDS = 4

// Last result per category, kept across mounts so coming back from a product
// renders the same list (including "Show more" pages) immediately and the
// scroll position can be restored. Refreshed in the background on revisit.
const listCache = new Map()
let categoriesCache = null

const skeletons = (n) => Array.from({ length: n }, (_, i) => <ProductCardSkeleton key={`s${i}`} />)

export default function Shop() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category') || null
  const cached = listCache.get(category)

  const [categories, setCategories] = useState(categoriesCache ?? [])
  const [categoriesError, setCategoriesError] = useState(null)

  const [items, setItems] = useState(cached?.items ?? [])
  const [total, setTotal] = useState(cached?.total ?? 0)
  const [status, setStatus] = useState(cached ? 'ready' : 'loading') // loading | ready | error
  const [moreStatus, setMoreStatus] = useState('idle') // idle | loading | error
  const requestId = useRef(0)

  const loadCategories = useCallback(() => {
    setCategoriesError(null)
    getCategories().then((data) => {
      categoriesCache = data
      setCategories(data)
    }, setCategoriesError)
  }, [])

  useEffect(loadCategories, [loadCategories])

  // First page; also runs whenever the category changes. requestId drops
  // responses that arrive after the user switched category. With a cached
  // list, the cached items stay on screen and as many are re-fetched as were
  // shown, so the page length (and scroll position) doesn't change.
  const loadFirstPage = useCallback(() => {
    const id = ++requestId.current
    const hit = listCache.get(category)
    if (hit) {
      setItems(hit.items)
      setTotal(hit.total)
      setStatus('ready')
    } else {
      setStatus('loading')
    }
    setMoreStatus('idle')
    const limit = Math.max(PAGE_SIZE, hit?.items.length ?? 0)
    getProducts({ categorySlug: category, offset: 0, limit }).then(
      (res) => {
        if (id !== requestId.current) return
        listCache.set(category, res)
        setItems(res.items)
        setTotal(res.total)
        setStatus('ready')
      },
      // A failed background refresh keeps the cached list.
      () => id === requestId.current && !hit && setStatus('error'),
    )
  }, [category])

  useEffect(loadFirstPage, [loadFirstPage])

  // The header and the category tabs pin together as one block; it gets its
  // bottom hairline once the hero has gone under it (or right away when
  // scrolled, if there's no hero). Marker: <html data-hero-gone>.
  const heroEnd = useRef(null)
  useEffect(() => {
    const root = document.documentElement
    const headerH = parseFloat(getComputedStyle(root).getPropertyValue('--header-h')) || 56
    const observer = new IntersectionObserver(
      ([entry]) => {
        root.toggleAttribute('data-hero-gone', !entry.isIntersecting && entry.boundingClientRect.top < headerH)
      },
      { rootMargin: `-${headerH}px 0px 0px 0px` },
    )
    observer.observe(heroEnd.current)
    return () => {
      observer.disconnect()
      root.removeAttribute('data-hero-gone')
    }
  }, [])

  function showMore() {
    const id = requestId.current
    setMoreStatus('loading')
    getProducts({ categorySlug: category, offset: items.length, limit: PAGE_SIZE }).then(
      (res) => {
        if (id !== requestId.current) return
        setItems((prev) => {
          const next = [...prev, ...res.items]
          listCache.set(category, { items: next, total: res.total })
          return next
        })
        setTotal(res.total)
        setMoreStatus('idle')
      },
      () => id === requestId.current && setMoreStatus('error'),
    )
  }

  const current = categories.find((c) => c.slug === category)
  const heading = category ? (current ? categoryName(t, current) : '') : t('categories.all')
  const remaining = total - items.length

  return (
    <>
      <Hero />
      <div className="hero-end" ref={heroEnd} aria-hidden="true" />
      <div className="shop">
        <CategorySidebar
          categories={categories}
          active={category}
          error={categoriesError}
          onRetry={loadCategories}
        />
        <section className="shop-content" aria-busy={status === 'loading'}>
          {/* The tabs already show the category; the heading is for screen readers. */}
          <h1 className="visually-hidden">{heading}</h1>
          {/* Always rendered so the count appearing doesn't shift the grid. */}
          <p className="shop-count muted">{status === 'ready' ? t('shop.count', { count: total }) : ' '}</p>

          {status === 'loading' && <div className="grid">{skeletons(PAGE_SIZE)}</div>}
          {status === 'error' && (
            <StatusMessage onRetry={loadFirstPage}>{t('shop.loadError')}</StatusMessage>
          )}
          {status === 'ready' && items.length === 0 && <StatusMessage>{t('shop.empty')}</StatusMessage>}

          {status === 'ready' && items.length > 0 && (
            <>
              <div className="grid">
                {items.map((p, i) => (
                  <ProductCard key={p.id} product={p} priority={i < PRIORITY_CARDS} />
                ))}
                {moreStatus === 'loading' && skeletons(Math.min(PAGE_SIZE, remaining))}
              </div>

              {remaining > 0 && (
                <div className="show-more">
                  {moreStatus === 'error' && <p className="muted">{t('shop.loadMoreError')}</p>}
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={showMore}
                    disabled={moreStatus === 'loading'}
                  >
                    {moreStatus === 'loading' ? t('common.loading') : moreStatus === 'error' ? t('common.tryAgain') : t('shop.showMore')}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </>
  )
}
