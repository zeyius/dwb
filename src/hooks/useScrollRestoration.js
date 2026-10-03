import { useEffect, useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// Scroll position per history entry. BrowserRouter has no <ScrollRestoration>
// (that needs a data router), so this does the same job: new navigations start
// at the top, back/forward return to where the user was. It relies on pages
// rendering their content synchronously when revisited (see Shop's cache).
const positions = new Map()

export default function useScrollRestoration() {
  const { key } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    history.scrollRestoration = 'manual'
  }, [])

  // Record continuously: by the time the location changes, the old page is
  // already gone and window.scrollY may have been clamped.
  useEffect(() => {
    let frame = 0
    const save = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => positions.set(key, window.scrollY))
    }
    window.addEventListener('scroll', save, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', save)
    }
  }, [key])

  // Layout effect: runs after the new page's DOM is in, before paint.
  useLayoutEffect(() => {
    const y = navigationType === 'POP' ? (positions.get(key) ?? 0) : 0
    window.scrollTo(0, y)
  }, [key, navigationType])
}
