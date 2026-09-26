export const PLACEHOLDER_IMAGE = '/placeholder.svg'

export const formatPrice = (price) => `${price} DA`

export const productImages = (product) =>
  product.images?.length ? product.images : [PLACEHOLDER_IMAGE]
