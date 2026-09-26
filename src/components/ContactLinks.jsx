import { useHasContact, useStoreSettings } from '../context/StoreSettingsContext'
import { instagramLabel, telHref } from '../utils/contact'
import { InstagramIcon, MailIcon, PhoneIcon } from './Icons'

// Phone / email / Instagram from store_settings; each is hidden when empty,
// and the whole list renders nothing if all three are.
export default function ContactLinks({ className = 'contact-links' }) {
  const { phone, email, instagramUrl } = useStoreSettings()
  if (!useHasContact()) return null

  return (
    <ul className={className}>
      {phone && (
        <li>
          <a href={telHref(phone)}>
            <PhoneIcon /> {phone}
          </a>
        </li>
      )}
      {email && (
        <li>
          <a href={`mailto:${email}`}>
            <MailIcon /> {email}
          </a>
        </li>
      )}
      {instagramUrl && (
        <li>
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
            <InstagramIcon /> {instagramLabel(instagramUrl)}
          </a>
        </li>
      )}
    </ul>
  )
}
