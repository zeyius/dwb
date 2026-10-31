import i18n from '../i18n'

export const PLACEHOLDER_IMAGE = '/placeholder.svg'

// "14 000 DA" in French/English, "14000 دج" in Arabic (as written in Algeria).
// Each is wrapped in a Unicode isolate (invisible) so the number and currency
// keep their order inside text of the other direction.
export function formatPrice(price) {
  if (i18n.resolvedLanguage === 'ar') return `\u2067${price}\u00a0دج\u2069`
  const grouped = String(price).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')
  return `\u2066${grouped}\u00a0DA\u2069`
}

// Blank entries are dropped; an empty list falls back to the placeholder.
export function productImages(product) {
  const images = (product.images ?? []).filter((src) => typeof src === 'string' && src.trim())
  return images.length ? images : [PLACEHOLDER_IMAGE]
}
