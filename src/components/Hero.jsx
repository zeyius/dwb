import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStoreSettings } from '../context/StoreSettingsContext'

// Full-width banner from store_settings.hero_image_url. Shows a skeleton while
// the settings or the image are loading, and nothing at all once we know
// there's no image (or it fails to load).
export default function Hero({ targetRef }) {
  const { t } = useTranslation()
  const { heroImageUrl, loaded } = useStoreSettings()
  const [status, setStatus] = useState('loading') // loading | ready | error

  if (loaded && (!heroImageUrl || status === 'error')) return null

  function scrollToProducts() {
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    targetRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
  }

  const ready = status === 'ready'

  return (
    <section className={`hero${ready ? '' : ' skeleton'}`} aria-busy={!ready}>
      {heroImageUrl && (
        <img
          key={heroImageUrl}
          className="hero-img"
          src={heroImageUrl}
          alt=""
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onLoad={() => setStatus('ready')}
          onError={() => setStatus('error')}
        />
      )}
      {ready && (
        <div className="hero-overlay">
          <p className="hero-tagline">{t('hero.tagline')}</p>
          <button type="button" className="btn hero-btn" onClick={scrollToProducts}>
            {t('hero.shopNow')}
          </button>
        </div>
      )}
    </section>
  )
}
