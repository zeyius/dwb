import { useTranslation } from 'react-i18next'
import { useHasContact, useStoreSettings } from '../context/StoreSettingsContext'
import { instagramLabel, telHref } from '../utils/contact'
import { InstagramIcon, MailIcon, PhoneIcon } from './Icons'

// Phone / email / Instagram from store_settings; each is hidden when empty,
// and the whole list renders nothing if all three are. Values are isolated as
// left-to-right so Arabic pages don't reorder them ("+213 660 …" would
// otherwise render as "… 660 213+").
export default function ContactLinks({ className = 'contact-links' }) {
  const { t } = useTranslation()
  const { phone, email, instagramUrl } = useStoreSettings()
  if (!useHasContact()) return null

  return (
    <ul className={className}>
      {phone && (
        <li>
          <a href={telHref(phone)}>
            <PhoneIcon /> <bdi dir="ltr">{phone}</bdi>
          </a>
        </li>
      )}
      {email && (
        <li>
          <a href={`mailto:${email}`}>
            <MailIcon /> <bdi dir="ltr">{email}</bdi>
          </a>
        </li>
      )}
      {instagramUrl && (
        <li>
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
            <InstagramIcon /> <bdi dir="ltr">{instagramLabel(instagramUrl) ?? t('header.instagram')}</bdi>
          </a>
        </li>
      )}
    </ul>
  )
}
