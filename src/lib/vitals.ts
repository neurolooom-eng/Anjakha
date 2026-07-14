import type { Tone, Vitals } from '@/types'

/** Adult normal reference ranges — the same bands most hospital EMRs flag against. */
const RANGES = {
  tempF: { low: 97.0, high: 99.5, criticalLow: 95.0, criticalHigh: 103.0 },
  pulse: { low: 60, high: 100, criticalLow: 40, criticalHigh: 130 },
  respiratoryRate: { low: 12, high: 20, criticalLow: 8, criticalHigh: 30 },
  spo2: { low: 95, high: 100, criticalLow: 90, criticalHigh: 100 },
  bpSystolic: { low: 90, high: 130, criticalLow: 80, criticalHigh: 180 },
  bpDiastolic: { low: 60, high: 85, criticalLow: 50, criticalHigh: 110 },
} as const

export type VitalKey = keyof typeof RANGES

/** 'danger' outside critical bounds, 'warning' outside normal bounds, 'success' in range. */
export function vitalTone(key: VitalKey, value?: number): Tone {
  if (value === undefined || value === null || Number.isNaN(value)) return 'neutral'
  const r = RANGES[key]
  if (value < r.criticalLow || value > r.criticalHigh) return 'danger'
  if (value < r.low || value > r.high) return 'warning'
  return 'success'
}

export function computeBmi(heightCm?: number, weightKg?: number): number | undefined {
  if (!heightCm || !weightKg) return undefined
  const m = heightCm / 100
  if (m <= 0) return undefined
  return weightKg / (m * m)
}

export function bmiCategory(bmi?: number): { label: string; tone: Tone } | undefined {
  if (bmi === undefined) return undefined
  if (bmi < 18.5) return { label: 'Underweight', tone: 'info' }
  if (bmi < 25) return { label: 'Normal', tone: 'success' }
  if (bmi < 30) return { label: 'Overweight', tone: 'warning' }
  return { label: 'Obese', tone: 'danger' }
}

export function formatBp(v: Pick<Vitals, 'bpSystolic' | 'bpDiastolic'>): string {
  if (!v.bpSystolic || !v.bpDiastolic) return '—'
  return `${v.bpSystolic}/${v.bpDiastolic}`
}

/** Systolic and diastolic can each be individually out of range — worst of the two wins. */
export function bpTone(v: Pick<Vitals, 'bpSystolic' | 'bpDiastolic'>): Tone {
  if (!v.bpSystolic || !v.bpDiastolic) return 'neutral'
  const order: Tone[] = ['success', 'warning', 'danger']
  const sysTone = vitalTone('bpSystolic', v.bpSystolic)
  const diaTone = vitalTone('bpDiastolic', v.bpDiastolic)
  return order[Math.max(order.indexOf(sysTone), order.indexOf(diaTone))]
}

export const VITALS_EMPTY: Vitals = {}
