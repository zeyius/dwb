import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { categoryName } from '../utils/category'

// Sticky horizontal pill bar on mobile, sidebar from tablet up (see index.css).
export default function CategorySidebar({ categories, active, error, onRetry }) {
  const { t } = useTranslation()
  const links = [{ slug: null, name: t('categories.all') }, ...categories.map((c) => ({ slug: c.slug, name: categoryName(t, c) }))]
  const scroller = useRef(null)

  // Bring the active pill into view, e.g. when arriving from a product's
  // category link. Only touches the bar's own scroll, never the page's.
  // A physical delta between centres works in both LTR and RTL (scrollLeft
  // runs negative in RTL, so absolute positions would not).
  useEffect(() => {
    const bar = scroller.current
    const pill = bar?.querySelector('[aria-current="page"]')
    if (!pill || bar.scrollWidth <= bar.clientWidth) return
    const b = bar.getBoundingClientRect()
    const p = pill.getBoundingClientRect()
    bar.scrollBy({ left: p.left + p.width / 2 - (b.left + b.width / 2), behavior: 'instant' })
  }, [active, categories, t])

  return (
    <nav className="categories" aria-label={t('categories.label')} ref={scroller}>
      <ul>
        {links.map(({ slug, name }) => (
          <li key={slug ?? 'all'}>
            <Link
              to={slug ? `/shop?category=${encodeURIComponent(slug)}` : '/shop'}
              className={active === slug ? 'category active' : 'category'}
              aria-current={active === slug ? 'page' : undefined}
            >
              {name}
            </Link>
          </li>
        ))}
        {error && (
          <li>
            <button type="button" className="category category-error" onClick={onRetry}>
              {t('categories.error')}
            </button>
          </li>
        )}
      </ul>
    </nav>
  )
}
