import type { LucideIcon } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/format'

export interface KpiCardProps {
  label: string
  value: number
  format?: 'int' | 'percent' | 'currency'
  target?: number
  goal?: 'higher' | 'lower'
  icon?: LucideIcon
}

function rag({ value, target, goal = 'higher' }: KpiCardProps): 'green' | 'amber' | 'red' | null {
  if (target === undefined) return null
  const good = goal === 'higher' ? value >= target : value <= target
  if (good) return 'green'
  const near = goal === 'higher' ? value >= target * 0.8 : value <= target * 1.25
  return near ? 'amber' : 'red'
}

const ragBar: Record<'green' | 'amber' | 'red', string> = {
  green: 'bg-success',
  amber: 'bg-warning',
  red: 'bg-danger',
}

const ragText: Record<'green' | 'amber' | 'red', string> = {
  green: 'text-success',
  amber: 'text-warning',
  red: 'text-danger',
}

function formatValue(value: number, format: KpiCardProps['format']) {
  if (format === 'percent') return `${value}%`
  if (format === 'currency') return formatCurrency(value)
  return formatNumber(value)
}

export function KpiCard(props: KpiCardProps) {
  const { label, value, format = 'int', target, goal = 'higher', icon: Icon } = props
  const status = rag(props)
  return (
    <div className="card relative p-4">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">{label}</span>
        {Icon && (
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className={`mt-2 text-3xl font-bold tabular-nums ${status ? ragText[status] : 'text-text'}`}>
        {formatValue(value, format)}
      </div>
      {target !== undefined && (
        <p className="mt-1 text-xs text-muted">
          Target {goal === 'lower' ? '≤' : '≥'} {formatValue(target, format)}
        </p>
      )}
      {status && <div className={`absolute inset-x-0 bottom-0 h-1 rounded-b-xl ${ragBar[status]}`} />}
    </div>
  )
}

export function KpiGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{children}</div>
}
