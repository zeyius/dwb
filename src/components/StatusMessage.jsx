// Shared loading / error / empty block.
export default function StatusMessage({ children, onRetry }) {
  return (
    <div className="status">
      <p>{children}</p>
      {onRetry && (
        <button type="button" className="btn btn-outline" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}
