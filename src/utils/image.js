// Phone-sized WebP copies of the bucket's photos, made by
// scripts/optimize-images.mjs and stored next to each original:
// ".../Produit 1/IMG_4146.jpeg" -> "IMG_4146-480.webp", "IMG_4146-1080.webp".
const BUCKET_PATH = '/storage/v1/object/public/product-images/'
const WIDTHS = [480, 1080]
const MISSING_KEY = 'img-variants:missing'

// If a copy fails to load (the script hasn't been run for it yet), Photo
// falls back to the original, and the rest of this session stops asking.
let variantsMissing = (() => {
  try {
    return sessionStorage.getItem(MISSING_KEY) === '1'
  } catch {
    return false
  }
})()

export function markVariantsMissing() {
  variantsMissing = true
  try {
    sessionStorage.setItem(MISSING_KEY, '1')
  } catch {
    // storage unavailable: the in-memory flag still applies
  }
}

const variantUrl = (url, width) => url.replace(/\.[^./?#]+([?#].*)?$/, `-${width}.webp`)

// srcset for a bucket photo, or undefined (use the original) for anything
// else: the placeholder, external URLs, or when copies are known missing.
export function getImageSrcSet(url) {
  if (variantsMissing || typeof url !== 'string' || !url.includes(BUCKET_PATH)) return undefined
  return WIDTHS.map((w) => `${variantUrl(url, w)} ${w}w`).join(', ')
}
