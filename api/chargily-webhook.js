// POST /api/chargily-webhook
// Chargily signs every event: header `signature` = hex HMAC-SHA256 of the raw
// request body, keyed with the API secret key. The raw text is verified before
// anything is parsed; unsigned or mis-signed requests are rejected.
//
// Events are applied idempotently (Chargily may retry): a paid order is never
// downgraded by a late failed/canceled event, and a repeated checkout.paid
// only re-applies the same writes. Valid events always get a 200 so Chargily
// stops retrying; a 500 is returned only when a database write failed and a
// retry could help.
import { createHmac, timingSafeEqual } from 'node:crypto'
import { env, handle, json, supabaseAdmin } from './_lib/server.js'

const PAYMENT_STATUS = {
  'checkout.paid': 'paid',
  'checkout.failed': 'failed',
  'checkout.canceled': 'canceled',
}

export function isValidSignature(raw, signature, secret) {
  if (typeof signature !== 'string' || !/^[0-9a-f]{64}$/i.test(signature)) return false
  const expected = createHmac('sha256', secret).update(raw, 'utf8').digest()
  return timingSafeEqual(expected, Buffer.from(signature, 'hex'))
}

export const POST = handle(async (request) => {
  const raw = await request.text()
  if (!isValidSignature(raw, request.headers.get('signature'), env('CHARGILY_SECRET_KEY'))) {
    return json({ error: 'Invalid signature' }, 403)
  }

  const event = JSON.parse(raw)
  const paymentStatus = PAYMENT_STATUS[event.type]
  if (!paymentStatus) return json({ received: true, ignored: event.type })

  const checkout = event.data ?? {}
  const db = supabaseAdmin()

  // Match on the checkout id we stored; metadata.order_id narrows it further.
  let query = db.from('orders').select('id, payment_status, items').eq('chargily_checkout_id', checkout.id)
  const orderId = metadataOrderId(checkout.metadata)
  if (orderId) query = query.eq('id', orderId)
  const { data: order, error } = await query.maybeSingle()
  if (error) throw error
  if (!order) {
    console.warn('Webhook for unknown checkout', checkout.id, orderId)
    return json({ received: true })
  }
  // Never downgrade a paid order.
  if (order.payment_status === 'paid' && paymentStatus !== 'paid') return json({ received: true })

  if (order.payment_status !== 'paid') {
    const update =
      paymentStatus === 'paid' ? { payment_status: 'paid', status: 'confirmed' } : { payment_status: paymentStatus }
    // The neq guard keeps a concurrent failed/canceled delivery from overwriting 'paid'.
    const { error: updateError } = await db.from('orders').update(update).eq('id', order.id).neq('payment_status', 'paid')
    if (updateError) throw updateError
  }

  // Runs again on a retried checkout.paid, so a failure here self-heals.
  if (paymentStatus === 'paid') {
    const ids = (order.items ?? []).map((i) => i.id).filter(Boolean)
    if (ids.length) {
      const { error: soldError } = await db.from('products').update({ is_sold: true }).in('id', ids)
      if (soldError) throw soldError
    }
  }

  return json({ received: true })
})

// Chargily documents metadata as an array of key/value pairs but echoes back
// whatever was sent; accept both { order_id } and [{ order_id }].
function metadataOrderId(metadata) {
  const entries = Array.isArray(metadata) ? metadata : [metadata]
  return entries.find((m) => m && typeof m.order_id === 'string')?.order_id ?? null
}
