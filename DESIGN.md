# dwb — visual design

dwb sells second-hand clothes in Algeria. Every item is a single piece in a
single size, and once it's sold it's gone. Most customers shop on a phone, in
Arabic. The brand is the logo: black slanted block letters in a white circle,
photographed on a charcoal wall (`public/bg-logo.*`).

This file describes the visual layer only. Data, i18n, cart and checkout logic
are unchanged.

---

## 1. The one idea: the hang tag (replaced, see §11)

In a thrift shop, a unique piece carries a paper tag with its price and size
written on it. On dwb that tag is the only decorated thing on the page.

- **Shape:** manila card (`--manila`). The top edge has its two corners cut
  off, and a hole is punched through near the top (a CSS mask, so the photo
  behind shows through).
- **Angle:** rotated 4° clockwise, so the top leans the same way as the
  letters of the logo. The angle doesn't mirror in RTL, because the logo
  doesn't either. Only the tag's position mirrors.
- **Content, top to bottom:** "New" (when `is_new`) · price (bold, the
  largest text on the tag) · old price crossed out (when `old_price` is higher
  than `price`) · size.
- **Sold:** a red rubber stamp ("Sold" / "Vendu" / "مباعة") with a double
  border and a −10° angle, printed where the old price was, under the price.
  It multiplies into the manila like ink. The photo stays in full colour: the piece is still worth looking at,
  it just isn't available. No grey overlay.
- **Where it appears:** hanging off the bottom inline-end corner of each
  shop card photo, and bigger next to the title on the product page. It
  doesn't appear anywhere else (cart, checkout and success use plain text) so
  it keeps its meaning.

## 2. Palette

| Name      | Hex       | Use |
|-----------|-----------|-----|
| Ink       | `#000000` | Logo black. Header and footer bands, text on paper and manila, primary button text. |
| Paper     | `#FFFFFF` | Text on charcoal, primary button, the checkout / cart order slip. |
| Charcoal  | `#1C1D21` | Page background (sampled from the logo photo). |
| Graphite  | `#3A3B41` | Hairlines and input borders on charcoal; skeleton blocks. |
| Stamp red | `#A3221B` | The SOLD stamp and form errors. Only ever placed on Paper or Manila. |

Supporting neutrals, derived (not brand colours): muted text on charcoal
`#A6A7AD` (7.0:1), muted text on paper `#5C5D63` (6.6:1).

Contrast checks (AA):
- Paper on Charcoal 16.8:1 · Ink on Manila 13.8:1 · Ink on Paper 21:1
- Stamp red on Paper 7.5:1 · Stamp red on Manila 4.9:1
- Red on Charcoal is only about 2.6:1, so **red never sits on charcoal**.
  This is why the order form is paper (see the review).
- White focus ring on Charcoal: 16.8:1. On paper the ring switches to Ink,
  and to red on a field with an error.
- Input borders on paper (`#8E8F95`): 3.2:1. Placeholders (`#6E6F75`): 5.0:1.

No gradients except one functional scrim (the sticky bars have none either).
No tinted near-blacks: the dark values are exactly Ink and Charcoal.

## 3. Type

**One family: Readex Pro** (Google Fonts, variable 160–700). It was designed
for Arabic and Latin together, so mixed lines like "Veste Badsix — المقاس M"
share one x-height and stroke. Google's `unicode-range` subsets mean French
and English visitors never download the Arabic glyphs.

| Role     | Size (mobile → ≥768px) | Weight | Line-height (Latin / Arabic) | Used for |
|----------|------------------------|--------|------------------------------|----------|
| Display  | 28 → 40px              | 600    | 1.15 / 1.35                  | Product name on its page, page titles |
| Title    | 20 → 24px              | 600    | 1.25 / 1.5                   | Section headings, shop heading, step titles |
| Tag      | 17 → 22px              | 700    | 1.1                          | Price on the tag (tabular figures) |
| Body     | 16px                   | 400    | 1.5 / 1.75                   | Descriptions, form text |
| Label    | 15px                   | 500    | 1.4 / 1.6                    | Buttons, field labels, card names |
| Small    | 13px                   | 400    | 1.4 / 1.6                    | Hints, size, counts, old price |

Rules:
- Sentence case everywhere. **No `text-transform: uppercase`, no
  `letter-spacing`** in any language.
- Weights mean something: 400 reads, 500 is interactive, 600 heads, 700 is
  money.
- Prices use `font-variant-numeric: tabular-nums` so they line up in lists.

## 4. Shape, depth, motion

- **Corners:** square by default (the logo letters are slabs). Exceptions:
  the logo disc (a circle), the tag (cut corners), and the radio dots. There
  is no shared border-radius token.
- **Depth:** none. No shadows anywhere, the tag included (see pass 2).
  Things are separated by hairlines or a change of surface.
- **Motion:**
  - Page load: the tags on the first row of the shop drop in on their string
    (rotate from 0° to 4° with a small overshoot, staggered 40ms). This is
    the one orchestrated moment.
  - Responses to actions: the add-to-cart button changes to "Added to cart"
    and the cart count bumps · the drawer slides in · the confirm button
    shows progress · the success page stamps the order "Confirmed".
  - Scroll-linked: the shop hero collapses as the page scrolls (§10). It's
    driven by the scroll position, so it isn't a second one-shot moment.
  - Nothing animates on hover, and nothing fades in on scroll.
    `prefers-reduced-motion` turns all of this off.

## 5. The logo backdrop

The charcoal photo with the white disc is the brand's wall, but it fought the
product photos when it sat behind the grid. It now appears **only behind the
footer** (cover, centred on the disc, darkened 40%). That's where nothing is
for sale. The page itself is plain Charcoal, so product photos are the only
light things on screen.

---

## 6. Layouts

Mobile first. Breakpoints: 768px (tablet: sidebar, 3 columns) and 1100px
(desktop: 4 columns). The content max-width is 1280px.

### Shop — mobile (375)

```
┌────────────────────────────────────┐
│ (dwb)          ع  FR  EN   ◎   🛍2 │  Ink header, 56px, sticky
├────────────────────────────────────┤
│ [ hero_image_url, full width,      │  Never cropped, never covered:
│   natural ratio — the banner has   │  the banner carries its own words.
│   its own type ]                   │
├────────────────────────────────────┤  Collapses on scroll (§10)
│ All  Jackets  Sneakers  Pants  … → │  Text tabs, scrolls sideways,
│ ‾‾‾                                │  manila underline on the active one
│ 5 pieces                           │  Count only, small
├─────────────────┬──────────────────┤
│                 │                  │  2 columns, edge to edge,
│     photo       │     photo        │  2px gap, 4:5
│      4:5        │      4:5   ┌───┐ │
│            ┌──┐ │            │ o │ │  ← tag hangs off the
│            │o │ │            │New│ │    bottom inline-end corner,
│            │14│ │            │14 │ │    overlapping the name row
├────────────│00│─┼────────────│000│─┤
│ Veste léo… └──┘ │ Veste Bad… └───┘ │  Name, Label 15px, 2 lines max
│                 │                  │
├─────────────────┴──────────────────┤
│           [ Show more ]            │
├────────────────────────────────────┤
│ ░░ footer on the logo backdrop ░░ │
└────────────────────────────────────┘
```

### Shop — desktop (1280)

```
┌──────────────────────────────────────────────────────────────────────┐
│ (dwb)                                          ع  FR  EN    ◎    🛍  │
├──────────────────────────────────────────────────────────────────────┤
│        [ hero banner, full width, natural ratio ]                    │
├────────────┬─────────────────────────────────────────────────────────┤
│ All        │ 5 pieces                                                │
│ Jackets    │ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ │
│ Sneakers   │ │           │ │           │ │           │ │           │ │
│ Pants      │ │   photo   │ │   photo   │ │   photo   │ │   photo   │ │
│ …          │ │    4:5    │ │    4:5 ┌─┐│ │           │ │           │ │
│            │ │       ┌─┐ │ │        │ ││ │      ┌─┐  │ │     ┌─┐   │ │
│ sticky,    │ └───────│ │─┘ └────────└─┘┘ └──────│ │──┘ └─────│ │───┘ │
│ 200px      │  Name   └─┘    Name              └─┘ ...       └─┘     │
│            │                                                         │
└────────────┴─────────────────────────────────────────────────────────┘
  4 columns, 24px gap. Category list: plain text, manila bar on active.
```

### Product — mobile

```
┌────────────────────────────────────┐
│ (dwb)          ع  FR  EN   ◎   🛍  │
├────────────────────────────────────┤
│ ← Jackets                          │  Back link, 44px tall
│┌──────────────────────────────────┐│
││                                  ││  Gallery: full bleed, 4:5,
││            photo 1/3             ││  swipe; position bars under it
││                                  ││
│└──────────────────────────────────┘│
│             ▬  ▭  ▭                │
│ Veste Badsix                ┌────┐ │  Display name, and the tag
│                             │ o  │ │  (larger) at inline-end
│                             │New │ │
│                             │14 000 DA
│                             │17 000 (struck)
│                             │Size M│
│                             └────┘ │
│ Category: Jackets                  │
│ Description…                       │
│ ── Rather order by message? ────── │  Contact block
│ ☎ +213 …   ✉ …   ◎ @dwb_official_  │
├────────────────────────────────────┤
│ 14 000 DA     [  Add to cart   ]   │  Sticky buy bar (Ink), safe-area aware
└────────────────────────────────────┘
```

### Product — desktop

```
┌───────────────────────────────┬─────────────────────────────┐
│ ← Jackets                     │                             │
│ ┌──┐ ┌──────────────────────┐ │  Veste Badsix         ┌───┐ │
│ │t1│ │                      │ │                       │ o │ │
│ ├──┤ │      photo 4:5       │ │                       │14 │ │
│ │t2│ │                      │ │                       │000│ │
│ ├──┤ │                      │ │                       └───┘ │
│ │t3│ │                      │ │  [ Add to cart          ]   │
│ └──┘ │                      │ │  Category · description     │
│      └──────────────────────┘ │  Contact block              │
└───────────────────────────────┴─────────────────────────────┘
  7/5 split, the info column is sticky. Thumbnails sit in a column on the
  inline-start side.
```

### Checkout — mobile (the order slip)

```
┌────────────────────────────────────┐
│ (dwb)          ع  FR  EN   ◎   🛍1 │
├────────────────────────────────────┤
│ Place your order                   │  Display, on charcoal
│ ┌────────────────────────────────┐ │
│ │ PAPER SLIP (white, ink text)   │ │
│ │ 1  Your details                │ │  Numbered: a real sequence
│ │    Full name  [____________]   │ │
│ │    Phone      [0550 12 34 56]  │ │
│ │ ─────────────────────────────  │ │  dashed rule = tear line
│ │ 2  Delivery                    │ │
│ │    Wilaya [▾]  Commune [▾]     │ │
│ │    Address [_______________]   │ │
│ │    (•) Home        600 DA      │ │
│ │    ( ) Desk pickup 400 DA      │ │
│ │ ─────────────────────────────  │ │
│ │ 3  Payment                     │ │
│ │    (•) Cash on delivery        │ │
│ │    ( ) Edahabia                │ │
│ │    ( ) CIB                     │ │
│ └────────────────────────────────┘ │
├────────────────────────────────────┤
│ Order summary (1 piece)        ˄   │  Sticky Ink bar; opens upward
│ [  Confirm order · 14 600 DA    ]  │
└────────────────────────────────────┘
```

### Checkout — desktop

```
┌──────────────────────────────────────┬───────────────────────────┐
│ Place your order                     │                           │
│ ┌──────────────────────────────────┐ │ ┌───────────────────────┐ │
│ │ 1 Your details                   │ │ │ Order summary         │ │
│ │   [name]          [phone]        │ │ │ ▢ Veste Badsix  14000 │ │
│ │ 2 Delivery                       │ │ │ ─────────────────     │ │
│ │   [wilaya]        [commune]      │ │ │ Delivery        600   │ │
│ │   [address                     ] │ │ │ Total        14 600   │ │
│ │   (•) Home   ( ) Desk            │ │ │ [ Confirm order ]     │ │
│ │ 3 Payment                        │ │ └───────────────────────┘ │
│ │   (•) COD  ( ) Edahabia  ( ) CIB │ │  sticky                   │
│ └──────────────────────────────────┘ │                           │
└──────────────────────────────────────┴───────────────────────────┘
```

### Success

```
┌────────────────────────────────────┐
│ ┌────────────────────────────────┐ │  The same paper slip, now
│ │  Order confirmed       [STAMP] │ │  stamped "Confirmed" in ink
│ │  Order #0F3A9C12               │ │  (the confirmation reuses the
│ │  We'll call you on … to        │ │  verb on the button)
│ │  confirm delivery.             │ │
│ │  ───────────────────────────── │ │
│ │  Veste Badsix          14 000  │ │
│ │  Home delivery            600  │ │
│ │  Total                 14 600  │ │
│ └────────────────────────────────┘ │
│        [ Keep shopping ]           │
└────────────────────────────────────┘
```

---

## 7. Copy

- From the customer's side, active voice, sentence case.
- Buttons say what happens, and the result reuses the verb:
  "Add to cart" → "Added to cart"; "Confirm order" → "Order confirmed";
  "Pay now" → "Payment confirmed".
- Errors say what's wrong and how to fix it: "Enter a 10-digit number
  starting with 05, 06 or 07."
- Empty states invite an action: "Your cart is empty. Every piece is one of a
  kind, so if you like one, grab it before someone else does."
- Arabic is written directly for Algerian customers (دج, ولاية, بلدية,
  الدفع عند الاستلام, "ستوب ديسك" is avoided in favour of
  "الاستلام من المكتب"). It's clear modern Arabic with a light local voice,
  not a word-for-word copy of the English.

---

## 8. Review of the first draft, and what changed

I re-read the first draft asking, for each part, "would this look the same on
any other shop?" Five parts would have, so they changed:

1. **Hero.** Draft: the hero image cropped to 60vh, with the tagline and a
   "Shop now" button laid over it. That's the default hero for any shop, and
   it actually breaks here: `hero_image_url` is a 2.7:1 banner with its own
   text ("When it's gone, it's gone"), so cropping cut that text in half.
   **Now:** the banner is shown whole at its natural ratio, with nothing on
   top of it. A single line of our copy sits under it. The "Shop now" button
   is gone, because the products start right below.
2. **Checkout surface.** Draft: dark bordered panels on charcoal, the
   standard dark-mode form. Besides being generic, the stamp red fails
   contrast on charcoal (2.4:1). **Now:** the form is a white paper
   order slip with ink text and dashed tear lines between the numbered
   steps. Errors are red on paper (6.5:1). The success page reuses the same
   slip and stamps it, so "Confirm order" visibly becomes "Order confirmed".
   The cart drawer uses paper too: it's the same order, earlier.
3. **Badges.** Draft: white "NEW" chips on the photo corner, plus a tag. That's
   two labelling systems, and the chip is the template one. **Now:** "New"
   is written on the tag. The photo carries nothing but the tag.
4. **Category filter.** Draft: rounded pills, the most common filter UI there
   is. **Now:** plain text tabs with a 2px manila underline on the active one
   (on mobile), and a plain list with a manila bar on desktop. It's quieter,
   and the manila stays tied to the tag.
5. **Logo backdrop.** Draft: kept fixed behind the whole site with a dark
   overlay, and visible through the gaps in the grid. That's what fought the
   photos before. **Now:** it's only behind the footer.

I kept the hang tag, the palette and the single type family. They come from
the brand itself (the manila of the old shop, the slant and black of the
logo, the charcoal of the logo photo), not from a template.

---

## 9. Pass 2: screenshot critique

Screenshots were taken with Playwright at 375px and 1280px, in Arabic and
French, of: shop, product, product after "Add to cart", cart drawer,
checkout, checkout with errors, success, and the sold state (with mocked
`is_sold` data, since the live catalogue has nothing sold yet). Findings and
fixes:

1. **Horizontal scroll on checkout** (the page was 409px wide at 375px).
   `.field input { width: 100% }` overrode `.visually-hidden` on the payment
   radios. That was a specificity fight. The text-field rule now targets
   `input:not([type='radio'])`. I re-checked every page at 360px and 1280px:
   no overflow.
2. **Hero too tall on desktop.** The full-width banner was 450px tall and
   pushed every product below the fold. From 768px up, the banner takes two
   thirds of the row and the line of copy sits beside it.
3. **Footer disc behind the text.** The logo letters ran through the tagline.
   The disc now sits above the text, and the photo's square edges are masked
   into the page.
4. **The stamp hid the price.** Laid across the middle of the tag, it
   collided with the price and the old price. It's now part of the tag's
   flow and takes the old price's place.
5. **Stamp red failed AA on manila** (4.3:1 measured, not the 4.6:1 I'd
   estimated). Darkened from `#B3261E` to `#A3221B`: 4.9:1 on manila,
   7.5:1 on paper.
6. **An invalid field lost its red border on focus.** The focus rule swapped
   the border to ink. Focus now only adds an outline, and that outline is red
   on an invalid field.
7. **The desktop pay button wrapped** ("Confirmer la commande" plus the total
   in 332px). On desktop the summary already shows the total, so the button
   shows only the verb there. On mobile, where the summary is folded away, it
   shows both.
8. **The selected-row marker used `[dir=rtl]` overrides** with an inset
   box-shadow. It's now `border-inline-start`, so it mirrors by itself.
9. **"Added to cart" wrapped to two lines** at 375px. It's now held to one.

**Decoration removed:** the hard drop shadow under the tag. It was the only
shadow on the site, and the manila already separates clearly from every
photo. Without it, the rule is simply "flat everywhere", and the tag reads as
paper rather than a sticker.

Also checked: every interactive element is at least 44px tall at 360px (the
20px radios sit inside 60px rows that are the real target). Tabbing shows a
manila ring on dark surfaces and an ink ring on paper.
`prefers-reduced-motion` turns off the tag swing, the stamp, the drawer
slide and the count bump.

---

## 10. Collapsing hero (added after pass 2)

As the shop scrolls, the banner collapses: its visible height goes from
full to 0, its opacity from 1 to 0 and its scale from 1 to 0.95, all driven
by the scroll position. Scrolling back up reverses it. Once the banner is
gone, the header and the category tabs are pinned together as one compact
block, and a hairline appears under it. On desktop, where the tabs are a
sidebar, that block is just the header. The tagline and the big category
title are gone. The count stays, small, and the `h1` is kept for screen
readers only.

**How the grid never jumps:** the hero's layout box keeps its full height
the whole time. Only its inner frame moves. The frame is translated down by
exactly the distance scrolled (so it stays pinned under the header) and
fades and shrinks, while `.shop` (opaque, on a layer above it) slides up over
it. Only `transform` and `opacity` are animated, so it all runs on the
compositor.

- **Native:** the `.hero` view timeline (`view-timeline-inset` equal to the
  header height), `animation-range: exit 0% exit 100%`.
- **Fallback** (no `animation-timeline`, e.g. older iOS Safari): `Hero.jsx`
  writes the same progress to `--hero-p`, at most once per animation frame.
  It reads only `scrollY` while scrolling. The hero is measured with a
  ResizeObserver, and an IntersectionObserver attaches the scroll listener
  only while the hero is on screen.
- **Hairline:** an IntersectionObserver on a marker at the hero's bottom
  edge sets `<html data-hero-gone>`.
- **Reduced motion:** no animation at all. The banner scrolls away like any
  content, and the hairline still appears.

Verified with Playwright at 375px (Arabic) and 1280px (French), in both
modes. The first card's document position was constant at every scroll
step, the frame stayed pinned at the header line while it faded, and the two
modes produced the same values.

---

## 11. Hang tag replaced by a plain treatment (latest)

The manila tag, its tilt, the sold stamp and the tag-swing load animation are
gone. Manila was used elsewhere too (focus ring, active category and
language underlines, cart count, the "Added" check), so it was dropped
everywhere. Those now use the surface's text colour: white on charcoal, ink
on paper. The palette is Ink, Paper, Charcoal, Graphite and the error red.

**Card**
- The photo is full-bleed at 4:5. The only thing on it is a marker in the
  top-start corner, with no radius. "Sold" is 12px, white on black, with
  4px 8px padding. "New" is inverted so the two are easy to tell apart:
  black on white, 12px semibold, with 5px 10px padding. The first time a
  given "New" marker appears during a visit, it fades in and slides 4px
  from the start side (250ms, once, mirrored in RTL). It doesn't replay
  after "Show more", a category switch or going back, and it's off under
  reduced motion.
- Under the photo, start-aligned with 10px top spacing:
  - Line 1: the name, 15px regular, one line with an ellipsis.
  - Line 2: the price (15px medium), the old price struck through (13px, 50%
    opacity), and the size at the end side of the line (13px, 60% opacity).
    Screen readers hear "Size M".
- Sold: the photo is grey and at 50% opacity, the marker says "Sold", the
  price is struck through and the old price is dropped.

**Product page:** the name is 22px with the price at 20px under it, the old
price struck and muted, and the size as plain "Size M". The same marker sits
on the photo. Sold pieces get the same grey photo.

With the tag gone, the collapsing hero (§10) is the only orchestrated motion.

