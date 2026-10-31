import { useTranslation } from 'react-i18next'
import { STORE } from '../config'
import ContactLinks from './ContactLinks'

// Sits on the logo photo (bg-logo), the only place the backdrop appears, so
// it never competes with product photos.
export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p className="footer-tagline">{t('footer.tagline')}</p>
        <ContactLinks className="contact-links footer-contact" />
        <p className="footer-copy">{t('footer.rights', { year: new Date().getFullYear(), name: STORE.name })}</p>
      </div>
    </footer>
  )
}
