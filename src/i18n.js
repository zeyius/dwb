import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import ar from './locales/ar.json'
import en from './locales/en.json'
import fr from './locales/fr.json'

export const LANGUAGES = ['ar', 'fr', 'en']
export const LANG_STORAGE_KEY = 'lang'

// Language: the visitor's saved choice, else their browser language if it's
// one of ours (ar-DZ -> ar, en-US -> en), else French.
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { ar: { translation: ar }, fr: { translation: fr }, en: { translation: en } },
    supportedLngs: LANGUAGES,
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    fallbackLng: 'fr',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANG_STORAGE_KEY,
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false }, // React already escapes
    initAsync: false, // resources are bundled: render translated on first paint
  })

// Cairo, the Arabic font, is only fetched once Arabic is actually used, so
// French and English visitors don't pay for it (it cost ~7 Lighthouse points
// when loaded on every page).
const ARABIC_FONT = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400..900&display=swap'
function loadArabicFont() {
  if (document.querySelector(`link[href="${ARABIC_FONT}"]`)) return
  const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: ARABIC_FONT })
  document.head.append(link)
}

// <html lang dir>: Arabic flips the whole layout to right-to-left.
function applyDocumentLanguage(lng) {
  const lang = i18n.resolvedLanguage ?? lng
  document.documentElement.lang = lang
  document.documentElement.dir = i18n.dir(lang)
  if (lang === 'ar') loadArabicFont()
}
applyDocumentLanguage(i18n.resolvedLanguage)
i18n.on('languageChanged', applyDocumentLanguage)

export default i18n
