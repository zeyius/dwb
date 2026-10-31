// node --env-file=.env scripts/optimize-images.mjs [--dry-run] [--force]
//
// Makes phone-sized copies of every photo in the product-images bucket:
// for each original "Produit 1/IMG_4146.jpeg" it uploads, next to it,
// "Produit 1/IMG_4146-480.webp" and "Produit 1/IMG_4146-1080.webp"
// (WebP q75, EXIF rotation applied, metadata stripped). The shop's
// getImageSrcSet() (src/utils/image.js) points browsers at these files.
//
// Needs SUPABASE_SERVICE_ROLE_KEY in .env (server-side only: never prefix it
// with VITE_, which would ship it to the browser). --dry-run needs no key: it
// converts the images referenced by products / store_settings, prints the
// size table and uploads nothing. Existing copies are skipped unless --force.
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

const BUCKET = 'product-images'
const WIDTHS = [480, 1080]
const QUALITY = 75
const VARIANT = /-(\d+)\.webp$/i
const IMAGE = /\.(jpe?g|png|webp|avif|heic|heif|tiff?)$/i

const dryRun = process.argv.includes('--dry-run')
const force = process.argv.includes('--force')
const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url) fail('Missing SUPABASE_URL (or VITE_SUPABASE_URL) in .env')
if (!serviceKey && !dryRun) fail('Missing SUPABASE_SERVICE_ROLE_KEY in .env (or run with --dry-run)')

const supabase = createClient(url, serviceKey ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } })
const storage = supabase.storage.from(BUCKET)

const variantPath = (path, width) => path.replace(/\.[^./]+$/, '') + `-${width}.webp`
const kb = (bytes) => (bytes == null ? '' : `${Math.round(bytes / 1024).toLocaleString('en')} KB`)

function fail(message) {
  console.error(message)
  process.exit(1)
}

// Every object in the bucket, recursively (folders come back without an id).
async function listBucket(prefix = '') {
  const files = []
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await storage.list(prefix, { limit: 1000, offset })
    if (error) throw error
    for (const item of data) {
      const path = prefix ? `${prefix}/${item.name}` : item.name
      if (item.id === null) files.push(...(await listBucket(path)))
      else files.push(path)
    }
    if (data.length < 1000) return files
  }
}

// Dry run without the service key: listing the bucket isn't allowed, so take
// the photos the shop actually references.
async function referencedPaths() {
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const [{ data: products, error: e1 }, { data: settings, error: e2 }] = await Promise.all([
    supabase.from('products').select('images'),
    supabase.from('store_settings').select('hero_image_url'),
  ])
  if (e1 || e2) throw e1 ?? e2
  const urls = [...products.flatMap((p) => p.images ?? []), ...settings.map((s) => s.hero_image_url)]
  return [...new Set(urls.filter((u) => u?.includes(marker)).map((u) => decodeURIComponent(u.split(marker)[1])))]
}

async function optimize(path, existing) {
  const row = { path, original: null }
  const todo = WIDTHS.filter((w) => force || !existing.has(variantPath(path, w)))
  if (!todo.length) return { ...row, skipped: true }

  const { data, error } = await storage.download(path)
  // Referenced by a product but not in the bucket: report it, don't fail.
  if (error) return { ...row, missing: true }
  const input = Buffer.from(await data.arrayBuffer())
  row.original = input.length

  for (const width of WIDTHS) {
    if (!todo.includes(width)) continue
    const output = await sharp(input)
      .rotate() // apply EXIF orientation; metadata is dropped on output
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer()
    row[width] = output.length
    if (dryRun) continue
    const { error: upErr } = await storage.upload(variantPath(path, width), output, {
      contentType: 'image/webp',
      cacheControl: '31536000',
      upsert: true,
    })
    if (upErr) row.error = upErr.message
  }
  return row
}

const all = serviceKey ? await listBucket() : await referencedPaths()
const existing = new Set(all.filter((p) => VARIANT.test(p)))
const originals = all.filter((p) => IMAGE.test(p) && !VARIANT.test(p))
console.log(`${originals.length} originals${dryRun ? ' (dry run: nothing uploaded)' : ''}\n`)

const rows = []
for (let i = 0; i < originals.length; i += 3) {
  rows.push(...(await Promise.all(originals.slice(i, i + 3).map((p) => optimize(p, existing)))))
}

console.table(
  rows.map((r) => ({
    file: r.path,
    original: kb(r.original),
    '480w': r.skipped ? 'exists' : r.missing ? 'MISSING in bucket' : kb(r[480]),
    '1080w': r.skipped ? 'exists' : kb(r[1080]),
    ...(r.error ? { error: r.error } : {}),
  })),
)
const done = rows.filter((r) => !r.skipped && !r.missing && !r.error)
const sum = (k) => done.reduce((s, r) => s + (r[k] ?? 0), 0)
if (done.length) {
  console.log(`\nTotal: originals ${kb(sum('original'))} -> 480w ${kb(sum(480))}, 1080w ${kb(sum(1080))}`)
}
if (rows.some((r) => r.error)) process.exit(1)
