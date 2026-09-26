import { Link } from 'react-router-dom'

export default function CategorySidebar({ categories, active, error, onRetry }) {
  const links = [{ slug: null, name: 'All' }, ...categories]

  return (
    <aside className="categories" aria-label="Categories">
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
    </aside>
  )
}
