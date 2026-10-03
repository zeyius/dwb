import ar from './ar.json'
import en from './en.json'
import fr from './fr.json'

// Minimal translations, keyed by the page language (<html lang>). Only the
// checkout payment / confirmation strings are translated so far; English is
// the fallback for missing keys.
const dictionaries = { ar, en, fr }

export const lang = () => document.documentElement.lang.slice(0, 2)

// t('success.order', { ref: 'AB12' }) -> "Order #AB12"
export function t(key, vars = {}) {
  const text = dictionaries[lang()]?.[key] ?? en[key] ?? key
  return text.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '')
}
