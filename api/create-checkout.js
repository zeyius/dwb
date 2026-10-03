// POST /api/create-checkout
// Body: { items: [{ id, quantity }], customer: { name, phone, wilaya_code,
//         commune, address, delivery_type, payment_method }, locale }
//
// Prices are never taken from the client: products and the delivery rate are
// re-read from Supabase and the total recomputed here. The order is stored as
// pending / unpaid, then:
// - edahabia / cib: a Chargily checkout is created for that exact total and
//   its URL returned for the browser to redirect to. The webhook marks it paid.
// - cod (cash on delivery): nothing else happens; returns { order_id, summary }.
//   Products are NOT marked sold: the shop confirms COD orders by phone first.
import algeria from '../src/data/algeria.json' with { type: 'json' }
import {
  deliveryPrice,
  LOCALES,
  maxQuantity,
  normalizePhone,
  ONLINE_PAYMENT_METHODS,
  validateCustomer,
} from '../src/utils/checkout.js'
import { env, handle, HttpError, json, supabaseAdmin } from './_lib/server.js'


const MAX_BODY = 20_000
const MAX_ITEMS = 50
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const POST = handle(async (request) => {
  const { items, customer, locale } = await readBody(request)
  const db = supabaseAdmin()

  // Customer details: same rules as the form.
  const errors = validateCustomer(customer, algeria)
  if (Object.keys(errors).length) throw new HttpError(400, 'Please check the highlighted fields.', { fields: errors })
  const wilaya = algeria.find((w) => w.code === Number(customer.wilaya_code))

  // Products: current price and availability from the database.
  const ids = items.map((i) => i.id)
  const { data: products, error: productsError } = await db
    .from('products')
    .select('id, name, size, price, is_sold')
    .in('id', ids)
  if (productsError) throw productsError
  const byId = new Map(products.map((p) => [p.id, p]))
  const unavailable = ids.filter((id) => !byId.get(id) || byId.get(id).is_sold)
  if (unavailable.length) {
    throw new HttpError(409, 'Some items in your cart are no longer available.', { unavailable })
  }
  for (const { id, quantity } of items) {
    if (quantity > maxQuantity(byId.get(id))) {
      throw new HttpError(400, `Only ${maxQuantity(byId.get(id))} of “${byId.get(id).name}” is available.`)
    }
  }

  // Delivery: rate for this wilaya and type.
  const { data: rate, error: rateError } = await db
    .from('delivery_rates')
    .select('wilaya_code, home_price, desk_price, is_active')
    .eq('wilaya_code', wilaya.code)
    .maybeSingle()
  if (rateError) throw rateError
  const delivery = deliveryPrice(rate, customer.delivery_type)
  if (delivery === null) {
    throw new HttpError(422, `${customer.delivery_type === 'desk' ? 'Desk' : 'Home'} delivery isn’t available in ${wilaya.name}.`)
  }

  const lines = items.map(({ id, quantity }) => {
    const p = byId.get(id)
    return { id, name: p.name, size: p.size, price: p.price, quantity }
  })
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0)
  const total = subtotal + delivery

  const { data: order, error: orderError } = await db
    .from('orders')
    .insert({
      customer_name: customer.name.trim(),
      phone: normalizePhone(customer.phone),
      wilaya: `${String(wilaya.code).padStart(2, '0')} - ${wilaya.name}`,
      commune: customer.commune,
      address: customer.address.trim(),
      delivery_type: customer.delivery_type,
      delivery_price: delivery,
      subtotal,
      total,
      items: lines,
      payment_method: customer.payment_method,
      payment_status: 'unpaid',
      status: 'pending',
    })
    .select('id')
    .single()
  if (orderError) throw orderError

  if (!ONLINE_PAYMENT_METHODS.includes(customer.payment_method)) {
    // Server-computed figures for the confirmation page (it can't read orders).
    const summary = { items: lines, subtotal, delivery_type: customer.delivery_type, delivery_price: delivery, total }
    return json({ order_id: order.id, summary })
  }

  const site = env('SITE_URL').replace(/\/+$/, '')
  let checkout
  try {
    checkout = await createChargilyCheckout({
      amount: total,
      currency: 'dzd',
      payment_method: customer.payment_method,
      success_url: `${site}/checkout/success?order=${order.id}`,
      failure_url: `${site}/checkout/failed?order=${order.id}`,
      webhook_endpoint: `${site}/api/chargily-webhook`,
      locale: LOCALES.includes(locale) ? locale : 'fr',
      description: `Order ${order.id.slice(0, 8)}`,
      metadata: { order_id: order.id },
    })
  } catch (err) {
    // Keep the row for the record, but flag that no payment was ever possible.
    await db.from('orders').update({ payment_status: 'failed' }).eq('id', order.id)
    console.error('Chargily checkout failed', err)
    throw new HttpError(502, 'The payment service is unavailable right now. Please try again in a moment.')
  }

  const { error: saveError } = await db
    .from('orders')
    .update({ chargily_checkout_id: checkout.id })
    .eq('id', order.id)
  if (saveError) throw saveError

  return json({ order_id: order.id, checkout_url: checkout.checkout_url })
})

async function readBody(request) {
  const raw = await request.text()
  if (raw.length > MAX_BODY) throw new HttpError(413, 'Request too large.')
  let body
  try {
    body = JSON.parse(raw)
  } catch {
    throw new HttpError(400, 'Invalid JSON.')
  }
  const { items, customer, locale } = body ?? {}
  if (!Array.isArray(items) || items.length === 0) throw new HttpError(400, 'Your cart is empty.')
  if (items.length > MAX_ITEMS) throw new HttpError(400, 'Too many items.')
  const seen = new Set()
  for (const item of items) {
    if (!UUID.test(item?.id ?? '') || seen.has(item.id)) throw new HttpError(400, 'Invalid cart item.')
    if (!Number.isInteger(item.quantity) || item.quantity < 1) throw new HttpError(400, 'Invalid quantity.')
    seen.add(item.id)
  }
  if (!customer || typeof customer !== 'object') throw new HttpError(400, 'Missing customer details.')
  // Only known string fields go any further.
  const pick = (k) => (typeof customer[k] === 'string' || typeof customer[k] === 'number' ? String(customer[k]) : '')
  const clean = Object.fromEntries(
    ['name', 'phone', 'wilaya_code', 'commune', 'address', 'delivery_type', 'payment_method'].map((k) => [k, pick(k).slice(0, 300)]),
  )
  return { items: items.map(({ id, quantity }) => ({ id, quantity })), customer: clean, locale }
}

async function createChargilyCheckout(payload) {
  const res = await fetch(`${env('CHARGILY_API_URL').replace(/\/+$/, '')}/checkouts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env('CHARGILY_SECRET_KEY')}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15_000),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok || !body?.checkout_url) {
    throw new Error(`Chargily ${res.status}: ${JSON.stringify(body)}`)
  }
  return body
}
