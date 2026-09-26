import { createContext, useContext, useEffect, useState } from 'react'
import { getStoreSettings } from '../api/storeSettings'

// Blank values become null so components can hide them with a simple check.
const clean = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null)

const EMPTY = { phone: null, email: null, instagramUrl: null }
const StoreSettingsContext = createContext(EMPTY)

export function StoreSettingsProvider({ children }) {
  const [settings, setSettings] = useState(EMPTY)

  useEffect(() => {
    let cancelled = false
    getStoreSettings().then(
      (row) => {
        if (cancelled) return
        setSettings({ phone: clean(row.phone), email: clean(row.email), instagramUrl: clean(row.instagram_url) })
      },
      // Contact details are optional UI; on failure they simply stay hidden.
      (error) => console.error('Failed to load store settings', error),
    )
    return () => {
      cancelled = true
    }
  }, [])

  return <StoreSettingsContext.Provider value={settings}>{children}</StoreSettingsContext.Provider>
}

export const useStoreSettings = () => useContext(StoreSettingsContext)

export function useHasContact() {
  const { phone, email, instagramUrl } = useStoreSettings()
  return Boolean(phone || email || instagramUrl)
}
