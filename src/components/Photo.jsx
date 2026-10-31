import { useState } from 'react'
import { getImageSrcSet, markVariantsMissing } from '../utils/image'

// <img> that serves the resized copies (see utils/image) with the original as
// fallback. Lazy and async by default; pass loading="eager" for above-the-fold
// images.
export default function Photo({ src, sizes, onError, ...rest }) {
  const [srcSet, setSrcSet] = useState(() => getImageSrcSet(src))
  return (
    <img
      loading="lazy"
      decoding="async"
      {...rest}
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      onError={(e) => {
        if (srcSet) {
          markVariantsMissing()
          setSrcSet(undefined) // retry with the original
          return
        }
        onError?.(e)
      }}
    />
  )
}
