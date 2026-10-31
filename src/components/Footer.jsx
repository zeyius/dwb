import { useTranslation } from 'react-i18next'
import { STORE } from '../config'
import ContactLinks from './ContactLinks'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="footer">
      <img src="/logo-light.webp" alt={STORE.name} className="footer-logo" width="72" height="72" loading="lazy" decoding="async" />
      <p className="footer-tagline">{t('footer.tagline')}</p>
      <ContactLinks className="contact-links footer-contact" />
      <p className="footer-copy">{t('footer.rights', { year: new Date().getFullYear(), name: STORE.name })}</p>
    </footer>
  )
}
