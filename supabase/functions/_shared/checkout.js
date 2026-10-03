// Checkout rules shared by the browser (src/pages/Checkout.jsx) and the
// create-checkout Edge Function, so validation can't drift between them.
// Plain JS with no imports: it runs in both Vite and Deno. It lives under
// supabase/functions/_shared because only that tree is bundled on deploy.

export const DELIVERY_TYPES = ['home', 'desk']
export const PAYMENT_METHODS = ['cod', 'edahabia', 'cib']
// Paid up front through Chargily; 'cod' is cash on delivery.
export const ONLINE_PAYMENT_METHODS = ['edahabia', 'cib']
export const LOCALES = ['ar', 'fr', 'en']

// "0550 12 34 56", "+213 550123456", "+213 0550…", "00213550123456" -> "0550123456".
export function normalizePhone(input) {
  const digits = String(input ?? '').replace(/[\s.\-()]/g, '')
  return digits.replace(/^(?:\+|00)2130?/, '0')
}

// Algerian mobile: 05 / 06 / 07 followed by 8 digits.
export const isValidPhone = (input) => /^0[567]\d{8}$/.test(normalizePhone(input))

// Every piece is second-hand and one of a kind, so one is all there is.
// Kept as a function so a future stock column only changes this line.
export const maxQuantity = (_product) => 1

// Delivery price for a delivery_rates row, or null when that option isn't
// offered there: its price is null (or there's no row for the wilaya).
// is_active = false switches a whole wilaya off.
export function deliveryPrice(rate, type) {
  if (!rate || rate.is_active === false) return null
  const price = type === 'desk' ? rate.desk_price : rate.home_price
  return Number.isInteger(price) && price >= 0 ? price : null
}

// Field-level checks; returns { field: message } for anything invalid.
export function validateCustomer(c, wilayas) {
  const errors = {}
  if (!c.name || c.name.trim().length < 3) errors.name = 'Enter your full name.'
  if (!isValidPhone(c.phone)) errors.phone = 'Enter a mobile number like 0550 12 34 56.'
  const wilaya = wilayas.find((w) => w.code === Number(c.wilaya_code))
  if (!wilaya) errors.wilaya_code = 'Choose a wilaya.'
  else if (!wilaya.communes.some((m) => m.name === c.commune)) errors.commune = 'Choose a commune.'
  if (!c.address || c.address.trim().length < 5) errors.address = 'Enter your address.'
  if (!DELIVERY_TYPES.includes(c.delivery_type)) errors.delivery_type = 'Choose a delivery type.'
  if (!PAYMENT_METHODS.includes(c.payment_method)) errors.payment_method = 'Choose a payment method.'
  return errors
}
