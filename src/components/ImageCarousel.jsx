import { useRef, useState } from 'react'

// Swipeable scroll-snap carousel with position dots below it. From tablet up,
// thumbnails are also shown and jump to their slide. One image: neither.
export default function ImageCarousel({ images, alt, children }) {
  const track = useRef(null)
  const [active, setActive] = useState(0)
  const multiple = images.length > 1

  function onScroll() {
    const el = track.current
    setActive(Math.round(el.scrollLeft / el.clientWidth))
  }

  function goTo(i) {
    const el = track.current
    el.scrollTo({ left: i * el.clientWidth, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }

  return (
    <div className="gallery">
      <div className="carousel">
        <div
          ref={track}
          className="carousel-track"
          onScroll={multiple ? onScroll : undefined}
          // Focusable so keyboard users can scroll it with the arrow keys.
          tabIndex={multiple ? 0 : undefined}
          role={multiple ? 'region' : undefined}
          aria-label={multiple ? `${alt} photos, ${images.length} images` : undefined}
        >
          {images.map((src, i) => (
            <div className="carousel-slide" key={src + i}>
              <img
                src={src}
                alt={multiple ? `${alt}, image ${i + 1} of ${images.length}` : alt}
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : 'auto'}
                decoding="async"
              />
            </div>
          ))}
        </div>
        {children}
      </div>
      {multiple && (
        <div className="carousel-dots" aria-hidden="true">
          {images.map((src, i) => (
            <span key={src + i} className={i === active ? 'dot active' : 'dot'} />
          ))}
        </div>
      )}
      {multiple && (
        <div className="thumbs">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              className={i === active ? 'thumb active' : 'thumb'}
              onClick={() => goTo(i)}
              aria-label={`Show image ${i + 1}`}
              aria-pressed={i === active}
            >
              <img src={src} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
