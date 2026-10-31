import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import CartContents from './CartContents'
import { CloseIcon } from './Icons'

const CLOSE_MS = 200

// Cart as a bottom sheet (mobile) / side panel (tablet+). A modal <dialog>
// gives focus trapping, Esc and top-layer stacking for free.
export default function CartDrawer() {
  const { t } = useTranslation()
  const { count, drawerOpen, closeDrawer } = useCart()
  const ref = useRef(null)
  const { key } = useLocation()

  useEffect(() => {
    const dialog = ref.current
    if (drawerOpen) {
      if (!dialog.open) dialog.showModal()
      return
    }
    if (!dialog.open) return
    // Let the slide-out play before removing it from the top layer.
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    dialog.classList.add('closing')
    const t = setTimeout(() => {
      dialog.classList.remove('closing')
      dialog.close()
    }, reduced ? 0 : CLOSE_MS)
    return () => {
      clearTimeout(t)
      dialog.classList.remove('closing')
    }
  }, [drawerOpen])

  // Any navigation (link inside the drawer, back button) closes it. Not on
  // mount: the drawer is first mounted by being opened (see Layout).
  const openedAt = useRef(key)
  useEffect(() => {
    if (key !== openedAt.current) {
      openedAt.current = key
      closeDrawer()
    }
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <dialog
      ref={ref}
      className="drawer"
      aria-labelledby="drawer-title"
      onCancel={(e) => {
        e.preventDefault() // Esc: go through closeDrawer so the animation runs
        closeDrawer()
      }}
      // Clicks on the ::backdrop land on the <dialog> itself.
      onClick={(e) => e.target === e.currentTarget && closeDrawer()}
    >
      <div className="drawer-panel">
        <div className="drawer-handle" aria-hidden="true" />
        <header className="drawer-header">
          <h2 id="drawer-title">{count > 0 ? t('cart.titleCount', { count }) : t('cart.title')}</h2>
          <button type="button" className="icon-btn" onClick={closeDrawer} aria-label={t('cart.close')}>
            <CloseIcon />
          </button>
        </header>
        <div className="drawer-body"><CartContents onNavigate={closeDrawer} /></div>
      </div>
    </dialog>
  )
}
