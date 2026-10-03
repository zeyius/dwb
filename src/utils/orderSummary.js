// Hand-off from /checkout to /checkout/success for cash-on-delivery orders:
// the success page can't read the orders table (RLS), so the checkout page
// stores the server-computed summary it got back from the create-checkout
// Edge Function.
// sessionStorage, keyed by order id, so a reload of the success page still works.
const key = (orderId) => `checkout:order:${orderId}`

export function saveOrderSummary(orderId, summary) {
  try {
    sessionStorage.setItem(key(orderId), JSON.stringify(summary))
  } catch {
    // storage unavailable: the success page falls back to a summary-less message
  }
}

export function loadOrderSummary(orderId) {
  try {
    return orderId ? JSON.parse(sessionStorage.getItem(key(orderId))) : null
  } catch {
    return null
  }
}
