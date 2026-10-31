import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '../i18n'

// AR / FR / EN. The choice is saved to localStorage by the language detector
// (caches: ['localStorage'] in src/i18n.js).
export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  return (
    <div className="lang-switch" role="group" aria-label={t('language.label')}>
      {LANGUAGES.map((lng) => (
        <button
          key={lng}
          type="button"
          lang={lng}
          aria-label={t(`language.${lng}`)}
          aria-pressed={i18n.resolvedLanguage === lng}
          onClick={() => i18n.changeLanguage(lng)}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
