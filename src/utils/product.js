export const PLACEHOLDER_IMAGE = '/placeholder.svg'

// Wrapped in Unicode isolates (LRI … PDI, invisible) so "1000 DA" keeps its
// order inside right-to-left text instead of rendering as "DA 1000".
export const formatPrice = (price) => `\u2066${price} DA\u2069`

// Blank entries are dropped; an empty list falls back to the placeholder.
export function productImages(product) {
  const images = (product.images ?? []).filter((src) => typeof src === 'string' && src.trim())
  return images.length ? images : [PLACEHOLDER_IMAGE]
}
