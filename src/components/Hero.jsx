import { useEffect, useRef, useState } from 'react'
import { useStoreSettings } from '../context/StoreSettingsContext'
import Photo from './Photo'

// The banner's frame is sized before the image arrives so nothing below it
// moves when it loads: the ratio of the last banner seen on this device, else
// the current banner's (2744 x 1298). Update it when the banner changes shape.
const RATIO_KEY = 'hero:ratio'
const DEFAULT_RATIO = 2744 / 1298
function savedRatio() {
  try {
    return Number(localStorage.getItem(RATIO_KEY)) || DEFAULT_RATIO
  } catch {
    return DEFAULT_RATIO
  }
}

// Banner from store_settings.hero_image_url, full width under the header,
// shown whole at its own ratio. A skeleton holds the space while the settings
// or the image load; nothing at all once we know there's no image (or it
// fails to load).
//
// While the page scrolls, the banner collapses: it stays pinned under the
// header and fades/shrinks while the shop slides up over it (see .hero-frame
// in index.css). Its layout box never changes size, so the grid never jumps.
// Browsers with scroll-driven animations do this in CSS alone;
// useCollapseFallback drives the same effect for the others (older iOS Safari).
export default function Hero() {
  const { heroImageUrl, loaded } = useStoreSettings()
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [ratio, setRatio] = useState(savedRatio)
  const ref = useRef(null)
  useCollapseFallback(ref)

  function onLoad(e) {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget
    if (w && h) {
      setRatio(w / h)
      try {
        localStorage.setItem(RATIO_KEY, String(w / h))
      } catch {
        // storage unavailable: next visit uses the default ratio
      }
    }
    setStatus('ready')
  }

  if (loaded && (!heroImageUrl || status === 'error')) return null
  const ready = status === 'ready'

  return (
    <section className="hero" ref={ref} aria-busy={!ready}>
      <div className={ready ? 'hero-frame' : 'hero-frame skeleton'} style={{ aspectRatio: ratio }}>
        {heroImageUrl && (
          <Photo
            key={heroImageUrl}
            className="hero-img"
            src={heroImageUrl}
            alt=""
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
            onLoad={onLoad}
            onError={() => setStatus('error')}
          />
        )}
      </div>
    </section>
  )
}

const supportsScrollTimeline = () => typeof CSS !== 'undefined' && CSS.supports('animation-timeline: view()')

// Writes the collapse progress (0 = fully shown, 1 = gone) to --hero-p, which
// the CSS fallback turns into transform/opacity. Scroll events only schedule a
// frame; each frame reads scrollY (no layout) and writes one custom property.
// The hero's position is measured once and again on resize, never while
// scrolling, and the scroll listener only exists while the hero is on screen.
function useCollapseFallback(ref) {
  useEffect(() => {
    const hero = ref.current
    if (!hero || supportsScrollTimeline() || matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 56
    let start = 0 // scrollY at which the hero's top reaches the header
    let height = 1
    let frame = 0
    let last = -1

    const measure = () => {
      const rect = hero.getBoundingClientRect()
      start = rect.top + scrollY - headerH
      height = rect.height || 1
    }
    const paint = () => {
      frame = 0
      const p = Math.min(1, Math.max(0, (scrollY - start) / height))
      if (p === last) return
      last = p
      hero.style.setProperty('--hero-p', p.toFixed(4))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(paint)
    }

    const resize = new ResizeObserver(() => {
      measure()
      onScroll()
    })
    resize.observe(hero)

    // Listen to scroll only while the hero is (partly) below the header.
    // Once it's out of view, pin the progress at 1; scrolling back brings it
    // into view and the listener back.
    const visible = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          measure()
          addEventListener('scroll', onScroll, { passive: true })
          onScroll()
        } else {
          removeEventListener('scroll', onScroll)
          paint()
        }
      },
      { rootMargin: `-${headerH}px 0px 0px 0px` },
    )
    visible.observe(hero)

    return () => {
      visible.disconnect()
      resize.disconnect()
      removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [ref])
}
