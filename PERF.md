# Phone performance

Lighthouse mobile (simulated slow 4G, Moto G class phone), production build.

| Page     | Before: score / LCP / CLS | After: score / LCP / CLS |
|----------|---------------------------|--------------------------|
| Shop     | 62 / 39.5 s / 0.035       | 72 / 13.9 s / 0.001      |
| Product  | 70 / 9.8 s / 0.001        | 71 / 9.5 s / 0.001       |
| Checkout | 82 / 3.8 s / 0.002        | 85 / 3.4 s / 0.001       |

The "after" column was measured **before the resized photos were
uploaded**, so the photos are still the originals: 21.6 MB in total, with
one 9.5 MB JPEG. They are what keeps LCP high. `npm run images:optimize`
brings what a phone downloads to 266 KB (480w copies; the dry-run table is
below). Re-run Lighthouse after that.

## What changed

- **Photos:** `scripts/optimize-images.mjs` makes 480w and 1080w WebP copies
  next to each original. `<Photo>` serves them with `srcset`/`sizes`, falls
  back to the original if a copy is missing, and is lazy and async except
  for the hero and the first two cards.
- **No layout shift:** the hero frame is sized before the image loads, and
  every product photo has a fixed 4:5 frame.
- **Fonts:** Readex Pro is self-hosted (Arabic and Latin subsets, 54 KB) and
  preloaded, which removes the render-blocking Google Fonts request.
- **Code:** the product page, cart page and cart drawer load on demand. The
  wilaya list is only in the checkout chunk. The main chunk went from
  44.8 KB to 39.7 KB (14.0 KB gzipped).
- **Data:** categories, store settings and delivery rates are fetched once
  per session. Going back to the shop reuses the list and scroll position
  without refetching. Queries select only the columns they use.
- **Phone forms:** inputs are 16px (no iOS zoom), and the phone field uses
  `inputmode="tel"` with `autocomplete="tel"`.

## Dry run of the image script (21.6 MB of originals)

| File                         | Original | 480w  | 1080w  |
|------------------------------|----------|-------|--------|
| Produit 1/IMG_4146.jpeg      | 9,274 KB | 97 KB | 451 KB |
| Produit 1/IMG_3806.jpeg      | 5,489 KB | 72 KB | 283 KB |
| Produit 2/IMG_2478 2.jpeg    | 1,409 KB | 18 KB | 69 KB  |
| Produit 1/IMG_3740.png       | 1,379 KB | 19 KB | 51 KB  |
| Produit 5/ensemble velour.png| 1,224 KB | 14 KB | 34 KB  |
| Produit 3/Badsix.png         | 1,210 KB | 18 KB | 45 KB  |
| Produit 4/tot bag.png        | 808 KB   | 10 KB | 34 KB  |
| image de compte/cover.jpeg   | 770 KB   | 5 KB  | 15 KB  |
| Total                        | 21.6 MB  | 266 KB| 1.0 MB |

`Produit 2/IMG_2484 2.jpeg` and `IMG_2665 2.jpeg` are referenced by a
product but missing from the bucket.
