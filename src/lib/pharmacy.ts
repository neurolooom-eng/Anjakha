import type { Drug, DrugForm, PrescriptionItem } from '@/types'

export const DRUG_FORMS: DrugForm[] = [
  'Tablet', 'Capsule', 'Syrup', 'Suspension', 'Injection',
  'Drops', 'Ointment', 'Cream', 'Inhaler', 'Sachet', 'Other',
]

const LIQUID_FORMS = new Set<DrugForm>(['Syrup', 'Suspension', 'Drops'])
/** Liquid/measured forms take a dose amount + unit (e.g. 5 ml) on top of the timing pattern. */
export function isLiquidForm(form?: DrugForm): boolean {
  return form ? LIQUID_FORMS.has(form) : false
}

const COUNT_FORMS = new Set<DrugForm>(['Tablet', 'Capsule', 'Sachet'])
/** Discrete-count forms prescribed with the 1-0-1 morning-afternoon-night pattern. */
export function isCountForm(form?: DrugForm): boolean {
  return form ? COUNT_FORMS.has(form) : false
}

/** The single consolidated name shown on a prescription, e.g. "Atorvastatin 20 mg Tablet". */
export function drugLabel(d: Pick<Drug, 'name' | 'strength' | 'form'>): string {
  const parts = [d.name.trim()]
  const strength = (d.strength ?? '').trim()
  const nameKey = d.name.replace(/\s/g, '').toLowerCase()
  if (strength && !nameKey.includes(strength.replace(/\s/g, '').toLowerCase())) parts.push(strength)
  if (d.form) parts.push(d.form)
  return parts.filter(Boolean).join(' ')
}

/** Suggested dispense quantity for count forms: total units across the course. */
export function suggestQuantity(item: Pick<PrescriptionItem, 'morning' | 'afternoon' | 'night' | 'durationDays'>): number {
  const perDay = (item.morning ?? 0) + (item.afternoon ?? 0) + (item.night ?? 0)
  return perDay > 0 && item.durationDays > 0 ? perDay * item.durationDays : 0
}

/** Human-readable dosing summary for display, e.g. "1-0-1 · After food · 5 days" or
 * "5 ml · 1-0-1 · After food · 5 days". */
export function dosageSummary(item: PrescriptionItem): string {
  const bits: string[] = []
  const pattern = [item.morning, item.afternoon, item.night]
  const hasPattern = pattern.some((n) => n != null && n !== 0)
  if (isLiquidForm(item.form) && item.doseAmount) bits.push(`${item.doseAmount} ${item.doseUnit ?? 'ml'}`)
  if (hasPattern) bits.push(pattern.map((n) => n ?? 0).join('-'))
  if (item.timing) bits.push(item.timing)
  if (item.durationDays) bits.push(`${item.durationDays} day${item.durationDays === 1 ? '' : 's'}`)
  return bits.join(' · ') || '—'
}
