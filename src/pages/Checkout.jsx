import { cloneElement, useEffect, useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { createCheckout } from '../api/checkout'
import { getDeliveryRates } from '../api/deliveryRates'
import { getProductsByIds } from '../api/products'
import Photo from '../components/Photo'
import { CardIcon, CashIcon, CheckIcon, ChevronUpIcon, TrashIcon } from '../components/Icons'
import { useCart } from '../context/CartContext'
import algeria from '../../supabase/functions/_shared/algeria.json'
import {
  deliveryPrice,
  LOCALES,
  maxQuantity,
  normalizePhone,
  isValidPhone,
  ONLINE_PAYMENT_METHODS,
  validateCustomer,
} from '../../supabase/functions/_shared/checkout.js'
import { saveOrderSummary } from '../utils/orderSummary'
import { formatPrice } from '../utils/product'

// The form survives a trip to Chargily and back (e.g. a failed payment).
// sessionStorage: kept per tab, gone when it closes.
const FORM_KEY = 'checkout:form'
const EMPTY_FORM = {
  name: '',
  phone: '',
  wilaya_code: '',
  commune: '',
  address: '',
  delivery_type: 'home',
  payment_method: 'cod',
}

const PAYMENT_OPTIONS = [
  { value: 'cod', icon: <CashIcon /> },
  { value: 'edahabia', icon: <CardIcon /> },
  { value: 'cib', icon: <CardIcon /> },
]

function loadForm() {
  try {
    return { ...EMPTY_FORM, ...JSON.parse(sessionStorage.getItem(FORM_KEY)) }
  } catch {
    return EMPTY_FORM
  }
}

const pad = (code) => String(code).padStart(2, '0')
// Wilaya / commune names in the page language (values sent stay the French
// names, which is what the server validates against).
const placeName = (place, lang) => (lang === 'ar' ? place.name_ar : place.name)
// Order in which to focus the first invalid field.
const FIELD_ORDER = ['name', 'phone', 'wilaya_code', 'commune', 'address', 'delivery_type', 'payment_method']

export default function Checkout() {
  const { t, i18n } = useTranslation()
  const lang = i18n.resolvedLanguage
  const { items, remove, setQuantity } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState(loadForm)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [rates, setRates] = useState({ status: 'loading', byCode: new Map() })
  const [fresh, setFresh] = useState(null) // Map of current product rows, null until loaded
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [banner, setBanner] = useState(null)

  useEffect(() => {
    try {
      sessionStorage.setItem(FORM_KEY, JSON.stringify(form))
    } catch {
      // storage unavailable: the form just won't be restored
    }
  }, [form])

  function loadRates() {
    setRates((r) => ({ ...r, status: 'loading' }))
    getDeliveryRates().then(
      (rows) => setRates({ status: 'ready', byCode: new Map(rows.map((r) => [r.wilaya_code, r])) }),
      () => setRates((r) => ({ ...r, status: 'error' })),
    )
  }
  useEffect(loadRates, [])

  // Current prices / sold flags for what's in the cart (the cart holds a
  // snapshot from when each piece was added).
  const idsKey = items.map((i) => i.id).join(',')
  useEffect(() => {
    let cancelled = false
    getProductsByIds(idsKey ? idsKey.split(',') : []).then(
      (rows) => !cancelled && setFresh(new Map(rows.map((p) => [p.id, p]))),
      () => {}, // display only; the server re-checks everything
    )
    return () => {
      cancelled = true
    }
  }, [idsKey])

  // Back from Chargily via the back button: the page may come from bfcache
  // with the button still in its "redirecting" state.
  useEffect(() => {
    const reset = (e) => e.persisted && setSubmitting(false)
    window.addEventListener('pageshow', reset)
    return () => window.removeEventListener('pageshow', reset)
  }, [])

  const wilaya = algeria.find((w) => w.code === Number(form.wilaya_code))
  const rate = wilaya ? rates.byCode.get(wilaya.code) : undefined
  const prices = {
    home: wilaya && rates.status === 'ready' ? deliveryPrice(rate, 'home') : undefined,
    desk: wilaya && rates.status === 'ready' ? deliveryPrice(rate, 'desk') : undefined,
  }
  // A type is offered when it has a price. If the chosen one isn't offered in
  // this wilaya but the other is, use the other: no error, the unpriced card is
  // just disabled. Derived, not stored, so picking a wilaya where the original
  // choice is priced again goes back to it.
  const offered = (type) => typeof prices[type] === 'number'
  const otherType = form.delivery_type === 'home' ? 'desk' : 'home'
  const deliveryType = !offered(form.delivery_type) && offered(otherType) ? otherType : form.delivery_type
  const delivery = prices[deliveryType]
  const noDelivery = prices.home === null && prices.desk === null

  const lines = items.map((item) => {
    const row = fresh?.get(item.id)
    return { ...item, price: row?.price ?? item.price, sold: fresh ? !row || row.is_sold : false }
  })
  const unavailable = lines.filter((l) => l.sold)
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0)
  const total = subtotal + (delivery ?? 0)
  const count = lines.reduce((sum, l) => sum + l.quantity, 0)
  const online = ONLINE_PAYMENT_METHODS.includes(form.payment_method)

  const allErrors = useMemo(() => {
    const e = validateCustomer(form, algeria)
    // Only when neither option has a price.
    if (!e.wilaya_code && noDelivery) e.delivery_type = 'errors.noDelivery'
    return e
  }, [form, noDelivery, wilaya])

  // Before the first submit, a field shows its error only once it's been left.
  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value, ...(field === 'wilaya_code' ? { commune: '' } : {}) }))
    if (submitted || errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }
  function blur(field) {
    if (form[field] !== '' && allErrors[field]) setErrors((e) => ({ ...e, [field]: allErrors[field] }))
  }
  // After a submit, live client checks plus anything the server flagged.
  // Values are translation keys (see validateCustomer).
  const shownKeys = submitted ? { ...errors, ...allErrors } : errors
  const shown = Object.fromEntries(
    Object.entries(shownKeys)
      .filter(([, key]) => key)
      .map(([field, key]) => [field, t(key, { wilaya: wilaya ? placeName(wilaya, lang) : '' })]),
  )

  // Server errors carry a code; show our own translation of it.
  function serverMessage(body) {
    switch (body.code) {
      case 'invalid_fields':
        return t('serverErrors.invalid_fields')
      case 'quantity_limit':
        return t('serverErrors.quantity_limit', { max: body.max, name: body.name })
      case 'delivery_unavailable': {
        const w = algeria.find((x) => x.code === body.wilaya_code)
        const type = body.delivery_type === 'desk' ? 'desk' : 'home'
        return t(`serverErrors.delivery_unavailable_${type}`, { wilaya: w ? placeName(w, lang) : '' })
      }
      case 'payment_unavailable':
        return t('serverErrors.payment_unavailable')
      default:
        return t('serverErrors.generic')
    }
  }

  async function submit(e) {
    e.preventDefault()
    setSubmitted(true)
    setBanner(null)
    const first = FIELD_ORDER.find((f) => allErrors[f])
    if (first) {
      document.getElementById(`checkout-${first}`)?.focus()
      return
    }
    if (unavailable.length) {
      setBanner(t('checkout.removeSold'))
      setSummaryOpen(true)
      return
    }

    setSubmitting(true)
    try {
      const { ok, body } = await createCheckout({
        items: items.map(({ id, quantity }) => ({ id, quantity })),
        customer: { ...form, delivery_type: deliveryType, phone: normalizePhone(form.phone) },
        locale: LOCALES.includes(lang) ? lang : 'fr', // Chargily's page language
      })
      if (ok && body.checkout_url) {
        window.location.assign(body.checkout_url)
        return // stay in "redirecting" state while the browser leaves
      }
      if (ok && body.order_id) {
        // Cash on delivery: the order is placed; no payment step.
        saveOrderSummary(body.order_id, { ...body.summary, payment_method: form.payment_method })
        navigate(`/checkout/success?order=${body.order_id}`)
        return
      }
      if (body.unavailable?.length) {
        const names = items.filter((i) => body.unavailable.includes(i.id)).map((i) => i.name)
        body.unavailable.forEach(remove)
        setBanner(t('checkout.justSold', { names: names.join(lang === 'ar' ? '، ' : ', ') || t('checkout.someItems'), count: Math.max(names.length, 1) }))
      } else {
        if (body.fields) setErrors(body.fields)
        setBanner(serverMessage(body))
      }
    } catch {
      setBanner(t('checkout.unreachable'))
    }
    setSubmitting(false)
  }

  if (items.length === 0) {
    return (
      <div className="page-message">
        <h1>{t('cart.empty')}</h1>
        <p>{t('cart.emptyBody')}</p>
        <Link to="/shop" className="btn">{t('cart.browse')}</Link>
      </div>
    )
  }

  return (
    <form className="checkout" onSubmit={submit} noValidate>
      <h1>{t('checkout.title')}</h1>

      {banner && (
        <p className="checkout-banner" role="alert">
          {banner}
        </p>
      )}

      <div className="checkout-sections slip">
        <fieldset className="checkout-section">
          <legend>
            <span className="step-num">1</span> {t('checkout.contact')}
          </legend>
          <Field id="name" label={t('checkout.name')} error={shown.name}>
            <input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              onBlur={() => blur('name')}
              autoComplete="name"
              maxLength={100}
            />
          </Field>
          <Field id="phone" label={t('checkout.phone')} hint={t('checkout.phoneHint')} error={shown.phone}>
            <input
              type="tel"
              inputMode="tel"
              dir="ltr"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              onBlur={() => {
                // Tidy a valid number to 0550 12 34 56.
                if (isValidPhone(form.phone)) {
                  update('phone', normalizePhone(form.phone).replace(/^(\d{4})(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3 $4'))
                } else blur('phone')
              }}
              autoComplete="tel"
              placeholder="0550 12 34 56"
              maxLength={20}
            />
          </Field>
        </fieldset>

        <fieldset className="checkout-section">
          <legend>
            <span className="step-num">2</span> {t('checkout.delivery')}
          </legend>
          <Field id="wilaya_code" label={t('checkout.wilaya')} error={shown.wilaya_code}>
            <select value={form.wilaya_code} onChange={(e) => update('wilaya_code', e.target.value)} onBlur={() => blur('wilaya_code')}>
              <option value="" disabled>
                {t('checkout.chooseWilaya')}
              </option>
              {algeria.map((w) => (
                <option key={w.code} value={w.code}>
                  {pad(w.code)} {placeName(w, lang)}
                </option>
              ))}
            </select>
          </Field>
          <Field id="commune" label={t('checkout.commune')} error={shown.commune}>
            <select
              value={form.commune}
              onChange={(e) => update('commune', e.target.value)}
              onBlur={() => blur('commune')}
              disabled={!wilaya}
            >
              <option value="" disabled>
                {wilaya ? t('checkout.chooseCommune') : t('checkout.chooseWilayaFirst')}
              </option>
              {wilaya?.communes.map((c) => (
                <option key={c.name} value={c.name}>
                  {placeName(c, lang)}
                </option>
              ))}
            </select>
          </Field>
          <Field id="address" label={t('checkout.address')} error={shown.address}>
            <input
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              onBlur={() => blur('address')}
              autoComplete="street-address"
              placeholder={t('checkout.addressPlaceholder')}
              maxLength={200}
            />
          </Field>

          <ChoiceGroup
            id="delivery_type"
            label={t('checkout.deliveryType')}
            value={deliveryType}
            onChange={(v) => update('delivery_type', v)}
            error={shown.delivery_type}
            options={[
              { value: 'home', label: t('checkout.home'), note: t('checkout.homeNote') },
              { value: 'desk', label: t('checkout.desk'), note: t('checkout.deskNote') },
            ].map((o) => ({ ...o, aside: <DeliveryPrice price={prices[o.value]} status={rates.status} hasWilaya={!!wilaya} />, disabled: prices[o.value] === null }))}
          />
          {rates.status === 'error' && (
            <p className="field-error">
              {t('checkout.ratesError')}{' '}
              <button type="button" className="link-btn" onClick={loadRates}>
                {t('common.retry')}
              </button>
            </p>
          )}
        </fieldset>

        <fieldset className="checkout-section">
          <legend>
            <span className="step-num">3</span> {t('payment.title')}
          </legend>
          <PaymentMethods
            value={form.payment_method}
            onChange={(v) => update('payment_method', v)}
            error={shown.payment_method}
          />
          <p className="muted checkout-secure">{t(online ? 'payment.onlineInfo' : 'payment.codInfo')}</p>
        </fieldset>
      </div>

      <div className={summaryOpen ? 'checkout-bar open' : 'checkout-bar'}>
        <button
          type="button"
          className="summary-toggle"
          aria-expanded={summaryOpen}
          aria-controls="order-summary"
          onClick={() => setSummaryOpen((o) => !o)}
        >
          <span>
            {t('checkout.summary')} <span className="muted">{t('checkout.items', { count })}</span>
          </span>
          <ChevronUpIcon />
        </button>
        <div className="summary-details" id="order-summary">
          <h2 className="summary-title">{t('checkout.summary')}</h2>
          <ul className="summary-lines">
            {lines.map((l) => (
              <li key={l.id} className={l.sold ? 'summary-line sold' : 'summary-line'}>
                <Photo src={l.image} alt="" className="summary-thumb" sizes="48px" width="48" height="60" />
                <div className="summary-line-info">
                  <span className="summary-line-name">{l.name}</span>
                  {l.size && <span className="muted">{t('product.size', { size: l.size })}</span>}
                  {l.sold && <span className="badge-inline">{t('checkout.sold')}</span>}
                </div>
                <div className="summary-line-end">
                  <span>{formatPrice(l.price * l.quantity)}</span>
                  <Stepper item={l} onChange={(q) => (q < 1 ? remove(l.id) : setQuantity(l.id, q))} />
                </div>
              </li>
            ))}
          </ul>
          <dl className="summary-totals">
            <div>
              <dt>{t('checkout.subtotal')}</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div>
              <dt>{t('checkout.deliveryLine')}</dt>
              <dd>
                {!wilaya ? (
                  <span className="badge-inline">{t('checkout.chooseWilaya')}</span>
                ) : delivery == null ? (
                  '—'
                ) : (
                  formatPrice(delivery)
                )}
              </dd>
            </div>
            <div className="summary-total">
              <dt>{t('checkout.total')}</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>
        </div>
        <button type="submit" className="btn btn-block pay-btn" disabled={submitting} aria-live="polite">
          {submitting
            ? t(online ? 'button.redirecting' : 'button.placing')
            : (
              <>
                <span>{t(online ? 'button.pay' : 'button.confirm')}</span>
                <span className="pay-btn-total">{formatPrice(total)}</span>
              </>
            )}
        </button>
      </div>
    </form>
  )
}

function Field({ id, label, hint, error, children }) {
  const inputId = `checkout-${id}`
  const describedBy = [hint && `${inputId}-hint`, error && `${inputId}-error`].filter(Boolean).join(' ') || undefined
  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      {cloneElement(children, { id: inputId, 'aria-invalid': !!error, 'aria-describedby': describedBy })}
      {hint && !error && (
        <p className="field-hint" id={`${inputId}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field-error" id={`${inputId}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}

// Radio cards. The first enabled option carries the id so error focus lands on
// it; with every option disabled, the group itself takes it instead.
function ChoiceGroup({ id, label, value, onChange, options, error }) {
  const name = useId()
  const firstEnabled = options.find((o) => !o.disabled)?.value
  return (
    <div
      className="field"
      role="radiogroup"
      aria-labelledby={`${name}-label`}
      aria-describedby={error ? `checkout-${id}-error` : undefined}
      id={firstEnabled === undefined ? `checkout-${id}` : undefined}
      tabIndex={firstEnabled === undefined ? -1 : undefined}
    >
      <span id={`${name}-label`} className="field-label">
        {label}
      </span>
      <div className="choices">
        {options.map((o) => (
          <label key={o.value} className={`choice${value === o.value ? ' selected' : ''}${o.disabled ? ' disabled' : ''}`}>
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              disabled={o.disabled}
              onChange={() => onChange(o.value)}
              id={o.value === firstEnabled ? `checkout-${id}` : undefined}
            />
            <span className="choice-text">
              <span className="choice-label">{o.label}</span>
              {o.note && <span className="muted">{o.note}</span>}
            </span>
            {o.aside}
          </label>
        ))}
      </div>
      {error && (
        <p className="field-error" id={`checkout-${id}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}

// Radio cards with an icon and a check mark on the selected one. Native radios
// (visually hidden) keep arrow-key navigation and screen reader semantics.
function PaymentMethods({ value, onChange, error }) {
  const { t } = useTranslation()
  const name = useId()
  return (
    <div className="field" role="radiogroup" aria-label={t('payment.title')} aria-describedby={error ? 'checkout-payment_method-error' : undefined}>
      <div className="pay-methods">
        {PAYMENT_OPTIONS.map((o, i) => (
          <label key={o.value} className={value === o.value ? 'pay-method selected' : 'pay-method'}>
            <input
              type="radio"
              className="visually-hidden"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              id={i === 0 ? 'checkout-payment_method' : undefined}
            />
            <span className="pay-method-icon">{o.icon}</span>
            <span className="pay-method-text">
              <span className="pay-method-label">{t(`payment.${o.value}.label`)}</span>
              <span className="muted">{t(`payment.${o.value}.note`)}</span>
            </span>
            <span className="pay-method-check">{value === o.value && <CheckIcon />}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="field-error" id="checkout-payment_method-error">
          {error}
        </p>
      )}
    </div>
  )
}

function DeliveryPrice({ price, status, hasWilaya }) {
  const { t } = useTranslation()
  if (!hasWilaya) return <span className="badge-inline">{t('checkout.chooseWilaya')}</span>
  if (status === 'loading') return <span className="muted">…</span>
  if (status === 'error') return null
  if (price === null) return <span className="muted">{t('checkout.unavailable')}</span>
  return <span className="choice-price">{formatPrice(price)}</span>
}

// − at 1 removes the line; + stops at what's in stock (1 for unique pieces).
function Stepper({ item, onChange }) {
  const { t } = useTranslation()
  const max = maxQuantity(item)
  return (
    <div className="stepper">
      <button
        type="button"
        onClick={() => onChange(item.quantity - 1)}
        aria-label={item.quantity === 1 ? t('cart.removeItem', { name: item.name }) : t('checkout.fewer', { name: item.name })}
      >
        {item.quantity === 1 ? <TrashIcon /> : '−'}
      </button>
      <span aria-label={t('checkout.quantity', { count: item.quantity })}>{item.quantity}</span>
      <button
        type="button"
        onClick={() => onChange(item.quantity + 1)}
        disabled={item.quantity >= max}
        aria-label={t('checkout.more', { name: item.name })}
        title={item.quantity >= max ? t('checkout.oneOfAKind') : undefined}
      >
        +
      </button>
    </div>
  )
}

