import { StatusChip } from '@/components/ui/StatusChip'
import { bmiCategory, bpTone, computeBmi, formatBp, vitalTone } from '@/lib/vitals'
import type { Tone, Vitals } from '@/types'

function Stat({ label, value, tone }: { label: string; value?: string; tone?: Tone }) {
  return (
    <div className="rounded-md bg-surface-2 px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-wide text-muted">{label}</p>
      <div className="flex items-center gap-1.5">
        <p className="text-sm font-medium text-text">{value ?? '—'}</p>
        {tone && tone !== 'neutral' && tone !== 'success' && (
          <span className={`h-1.5 w-1.5 rounded-full ${tone === 'danger' ? 'bg-danger' : 'bg-warning'}`} />
        )}
      </div>
    </div>
  )
}

/** The standard vitals read-only panel — used anywhere a past visit's vitals are shown. */
export function VitalsDisplay({ vitals }: { vitals: Vitals }) {
  const bmi = computeBmi(vitals.heightCm, vitals.weightKg)
  const bmiCat = bmiCategory(bmi)

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Stat label="Temp" value={vitals.tempF ? `${vitals.tempF}°F` : undefined} tone={vitalTone('tempF', vitals.tempF)} />
      <Stat label="Pulse" value={vitals.pulse ? `${vitals.pulse} bpm` : undefined} tone={vitalTone('pulse', vitals.pulse)} />
      <Stat label="Resp. Rate" value={vitals.respiratoryRate ? `${vitals.respiratoryRate} br/min` : undefined} tone={vitalTone('respiratoryRate', vitals.respiratoryRate)} />
      <Stat label="SpO2" value={vitals.spo2 ? `${vitals.spo2}%` : undefined} tone={vitalTone('spo2', vitals.spo2)} />
      <Stat label="BP" value={formatBp(vitals)} tone={bpTone(vitals)} />
      <Stat label="Height" value={vitals.heightCm ? `${vitals.heightCm} cm` : undefined} />
      <Stat label="Weight" value={vitals.weightKg ? `${vitals.weightKg} kg` : undefined} />
      <div className="rounded-md bg-surface-2 px-2 py-1.5">
        <p className="text-[10px] uppercase tracking-wide text-muted">BMI</p>
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-text">{bmi ? bmi.toFixed(1) : '—'}</p>
          {bmiCat && <StatusChip value={bmiCat.label} tone={bmiCat.tone} dot={false} />}
        </div>
      </div>
    </div>
  )
}
