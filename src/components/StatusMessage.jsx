import { useTranslation } from 'react-i18next'
// Shared loading / error / empty block.
export default function StatusMessage({ children, onRetry }) {
  const { t } = useTranslation()
  return (
    <div className="status">
      <p>{children}</p>
      {onRetry && (
        <button type="button" className="btn btn-outline" onClick={onRetry}>
          {t('common.tryAgain')}
        </button>
      )}
    </div>
  )
}
