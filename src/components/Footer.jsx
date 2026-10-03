import { STORE } from '../config'
import ContactLinks from './ContactLinks'

export default function Footer() {
  return (
    <footer className="footer">
      <img src="/logo-light.webp" alt={STORE.name} className="footer-logo" width="72" height="72" loading="lazy" decoding="async" />
      <p className="footer-tagline">{STORE.tagline}</p>
      <ContactLinks className="contact-links footer-contact" />
      <p className="footer-copy">
        © {new Date().getFullYear()} {STORE.name}. All rights reserved.
      </p>
    </footer>
  )
}
