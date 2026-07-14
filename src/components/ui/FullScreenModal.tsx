import { X } from 'lucide-react'
import { useEffect } from 'react'

/** A single-page, full-viewport workspace — for flows that need everything visible at once
 * (e.g. a doctor's consultation view) rather than a side-sliding Drawer. */
export function FullScreenModal({
  open,
  onClose,
  title,
  subtitle,
  headerExtra,
  footer,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  headerExtra?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface">
      <div className="flex items-start justify-between gap-3 border-b border-border p-4">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-text">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {headerExtra}
          <button className="btn-ghost !p-1.5" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl flex-1 overflow-auto p-4">{children}</div>
      {footer && <div className="flex justify-end gap-2 border-t border-border p-4">{footer}</div>}
    </div>
  )
}
