export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <button aria-label="Close" className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="card relative w-full max-w-sm p-4">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        <p className="mt-2 text-sm text-muted">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
