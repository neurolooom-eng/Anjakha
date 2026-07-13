import type { Tone } from '@/types'

const toneClass: Record<Tone, string> = {
  neutral: 'bg-muted/15 text-muted',
  info: 'bg-info/15 text-info',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/20 text-warning',
  danger: 'bg-danger/15 text-danger',
  primary: 'bg-primary/15 text-primary',
}

export function StatusChip({
  value,
  tone = 'neutral',
  dot = true,
}: {
  value?: string
  tone?: Tone
  dot?: boolean
}) {
  if (!value) return <span className="text-muted">—</span>
  return (
    <span className={`chip ${toneClass[tone]}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />}
      {value}
    </span>
  )
}

const STATUS_TONE_MAP: Record<string, Tone> = {
  // generic
  draft: 'neutral',
  active: 'primary',
  inactive: 'neutral',
  pending: 'warning',
  cancelled: 'danger',
  completed: 'success',
  posted: 'success',
  // appointments
  scheduled: 'info',
  'checked in': 'info',
  'in consultation': 'primary',
  'no show': 'danger',
  // ipd
  admitted: 'primary',
  discharged: 'success',
  transferred: 'info',
  deceased: 'neutral',
  available: 'success',
  occupied: 'danger',
  reserved: 'warning',
  cleaning: 'info',
  maintenance: 'neutral',
  // pharmacy / billing
  ordered: 'info',
  received: 'success',
  'partially dispensed': 'warning',
  dispensed: 'success',
  unpaid: 'danger',
  'partially paid': 'warning',
  paid: 'success',
  // gst / insurance
  generated: 'info',
  filed: 'success',
  'pre-auth requested': 'warning',
  'pre-auth approved': 'info',
  'pre-auth rejected': 'danger',
  'claim submitted': 'info',
  settled: 'success',
  repudiated: 'danger',
  expired: 'danger',
}

export function toneForStatus(status?: string): Tone {
  if (!status) return 'neutral'
  return STATUS_TONE_MAP[status.toLowerCase()] ?? 'neutral'
}

export function StatusCell({ value }: { value?: string }) {
  return <StatusChip value={value} tone={toneForStatus(value)} />
}
