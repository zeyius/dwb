import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

// Sticky horizontal pill bar on mobile, sidebar from tablet up (see index.css).
export default function CategorySidebar({ categories, active, error, onRetry }) {
  const links = [{ slug: null, name: 'All' }, ...categories]
  const scroller = useRef(null)

  // Bring the active pill into view, e.g. when arriving from a product's
  // category link. Only touches the bar's own scroll, never the page's.
  useEffect(() => {
    const bar = scroller.current
    const pill = bar?.querySelector('[aria-current="page"]')
    if (!pill || bar.scrollWidth <= bar.clientWidth) return
    const left = pill.offsetLeft - (bar.clientWidth - pill.offsetWidth) / 2
    bar.scrollTo({ left, behavior: 'instant' })
  }, [active, categories])

  return (
    <nav className="categories" aria-label="Categories" ref={scroller}>
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
              Categories failed · retry
            </button>
          </li>
        )}
      </ul>
    </nav>
  )
}
