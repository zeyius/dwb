// "+213 555 12 34 56" -> "tel:+213555123456"
export const telHref = (phone) => `tel:${phone.replace(/[^\d+]/g, '')}`

// "https://instagram.com/dwb.store/" -> "@dwb.store"; null when the URL has no
// handle (the caller shows a translated "Instagram" instead).
export function instagramLabel(url) {
  const handle = url.match(/instagram\.com\/([^/?#]+)/i)?.[1]
  return handle ? `@${handle}` : null
}
