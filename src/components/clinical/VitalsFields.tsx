import { StatusChip } from '@/components/ui/StatusChip'
import { bmiCategory, computeBmi, vitalTone, type VitalKey } from '@/lib/vitals'
import type { Vitals } from '@/types'

interface FieldDef {
  key: keyof Vitals
  label: string
  unit: string
  rangeKey?: VitalKey
  step?: string
}

const FIELDS: FieldDef[] = [
  { key: 'tempF', label: 'Temperature', unit: '°F', rangeKey: 'tempF', step: '0.1' },
  { key: 'pulse', label: 'Pulse', unit: 'bpm', rangeKey: 'pulse' },
  { key: 'respiratoryRate', label: 'Resp. Rate', unit: 'br/min', rangeKey: 'respiratoryRate' },
  { key: 'spo2', label: 'SpO2', unit: '%', rangeKey: 'spo2' },
  { key: 'bpSystolic', label: 'BP Systolic', unit: 'mmHg', rangeKey: 'bpSystolic' },
  { key: 'bpDiastolic', label: 'BP Diastolic', unit: 'mmHg', rangeKey: 'bpDiastolic' },
  { key: 'heightCm', label: 'Height', unit: 'cm' },
  { key: 'weightKg', label: 'Weight', unit: 'kg', step: '0.1' },
]

const FLAG_LABEL = { warning: 'Out of range', danger: 'Critical' } as const

/** The standard vitals capture panel — used by Nurse's Station and Consultations alike. */
export function VitalsFields({
  value,
  onChange,
  disabled,
}: {
  value: Vitals
  onChange: (next: Vitals) => void
  disabled?: boolean
}) {
  const bmi = computeBmi(value.heightCm, value.weightKg)
  const bmiCat = bmiCategory(bmi)

  function setField(key: keyof Vitals, raw: string) {
    onChange({ ...value, [key]: raw === '' ? undefined : Number(raw) })
  }

  return (
    <div>
      <p className="label">Vitals</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {FIELDS.map((f) => {
          const tone = f.rangeKey ? vitalTone(f.rangeKey, value[f.key]) : 'neutral'
          const flag = tone === 'warning' || tone === 'danger' ? FLAG_LABEL[tone] : undefined
          return (
            <div key={f.key}>
              <div className="mb-1 flex items-center justify-between gap-1">
                <label className="text-xs font-medium text-muted">{f.label} ({f.unit})</label>
                {flag && <StatusChip value={flag} tone={tone} dot={false} />}
              </div>
              <input
                type="number"
                step={f.step}
                className="input"
                disabled={disabled}
                value={value[f.key] ?? ''}
                onChange={(e) => setField(f.key, e.target.value)}
              />
            </div>
          )
        })}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">BMI</label>
          <div className="input flex items-center justify-between bg-surface-2 text-muted">
            <span className={bmiCat ? 'text-text' : ''}>{bmi ? bmi.toFixed(1) : '—'}</span>
            {bmiCat && <StatusChip value={bmiCat.label} tone={bmiCat.tone} dot={false} />}
          </div>
        </div>
      </div>
    </div>
  )
}
