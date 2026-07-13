import type { LucideIcon } from 'lucide-react'

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon?: LucideIcon
  title: string
  message?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      {Icon && (
        <div className="mb-2 rounded-lg bg-primary/10 p-3 text-primary">
          <Icon size={24} />
        </div>
      )}
      <p className="text-sm font-medium text-text">{title}</p>
      {message && <p className="max-w-sm text-xs text-muted">{message}</p>}
      {action}
    </div>
  )
}
