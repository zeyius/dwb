// "+213 555 12 34 56" -> "tel:+213555123456"
export const telHref = (phone) => `tel:${phone.replace(/[^\d+]/g, '')}`

// "https://instagram.com/dwb.store/" -> "@dwb.store"; falls back to "Instagram".
export function instagramLabel(url) {
  const handle = url.match(/instagram\.com\/([^/?#]+)/i)?.[1]
  return handle ? `@${handle}` : 'Instagram'
}
