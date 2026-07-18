import { Pill, Plus, Trash2 } from 'lucide-react'
import { drugLabel, isCountForm, isLiquidForm, suggestQuantity } from '@/lib/pharmacy'
import type { DoseTiming, Drug, PrescriptionItem } from '@/types'

const TIMINGS: DoseTiming[] = ['Before food', 'After food', 'With food', 'Empty stomach', 'Bedtime']

function emptyItem(): PrescriptionItem {
  return { drugId: '', drugName: '', morning: 0, afternoon: 0, night: 0, durationDays: 5, quantity: 0 }
}

/** Small labelled number box used for the morning-afternoon-night (1-0-1) pattern. */
function SlotBox({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value?: number
  onChange: (v: number) => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="mb-0.5 text-[10px] uppercase tracking-wide text-muted">{label}</span>
      <input
        type="number"
        min={0}
        step="0.5"
        disabled={disabled}
        className="input w-14 px-1 text-center tabular-nums"
        value={value ?? 0}
        onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
      />
    </div>
  )
}

/** The doctor's prescription editor: pick a consolidated medicine, then dose it in the
 * 1-0-1 morning-afternoon-night pattern for tablets/capsules, or with a dose amount + unit
 * (e.g. 5 ml) for syrups and other liquids. */
export function PrescriptionEditor({
  drugs,
  rows,
  onChange,
}: {
  drugs: Drug[]
  rows: PrescriptionItem[]
  onChange: (rows: PrescriptionItem[]) => void
}) {
  const options = drugs
    .filter((d) => d.status === 'Active')
    .map((d) => ({ value: d.id, label: drugLabel(d), drug: d }))
    .sort((a, b) => a.label.localeCompare(b.label))

  function update(idx: number, patch: Partial<PrescriptionItem>) {
    onChange(
      rows.map((r, i) => {
        if (i !== idx) return r
        const next = { ...r, ...patch }
        // Auto-suggest dispense quantity for count forms as the pattern/duration changes.
        if (isCountForm(next.form) && ('morning' in patch || 'afternoon' in patch || 'night' in patch || 'durationDays' in patch)) {
          next.quantity = suggestQuantity(next)
        }
        return next
      }),
    )
  }

  function pickDrug(idx: number, drugId: string) {
    const drug = drugs.find((d) => d.id === drugId)
    if (!drug) {
      update(idx, { drugId: '', drugName: '', form: undefined, doseUnit: undefined })
      return
    }
    update(idx, {
      drugId,
      drugName: drugLabel(drug),
      form: drug.form,
      doseUnit: isLiquidForm(drug.form) ? drug.doseUnit ?? 'ml' : undefined,
    })
  }

  function removeRow(idx: number) {
    onChange(rows.filter((_, i) => i !== idx))
  }

  return (
    <div className="flex flex-col gap-2">
      {rows.length === 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted">
          <Pill size={15} /> No medicines added yet.
        </div>
      )}

      {rows.map((row, idx) => {
        const liquid = isLiquidForm(row.form)
        const count = isCountForm(row.form)
        return (
          <div key={idx} className="rounded-lg border border-border bg-surface-2/40 p-3">
            <div className="flex items-center gap-2">
              <select
                className="select flex-1"
                value={row.drugId}
                onChange={(e) => pickDrug(idx, e.target.value)}
              >
                <option value="">Select medicine…</option>
                {options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <button
                type="button"
                className="rounded-md p-1.5 text-muted hover:bg-danger/10 hover:text-danger"
                onClick={() => removeRow(idx)}
                aria-label="Remove medicine"
              >
                <Trash2 size={15} />
              </button>
            </div>

            {row.drugId && (
              <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-3">
                {liquid && (
                  <div className="flex flex-col">
                    <span className="mb-0.5 text-[10px] uppercase tracking-wide text-muted">Dose</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        step="0.5"
                        className="input w-16 text-center tabular-nums"
                        value={row.doseAmount ?? ''}
                        onChange={(e) => update(idx, { doseAmount: e.target.value === '' ? undefined : Number(e.target.value) })}
                      />
                      <input
                        type="text"
                        className="input w-14 text-center"
                        value={row.doseUnit ?? 'ml'}
                        onChange={(e) => update(idx, { doseUnit: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {(count || liquid) && (
                  <div className="flex flex-col">
                    <span className="mb-0.5 text-[10px] uppercase tracking-wide text-muted">
                      {liquid ? 'Times (M-A-N)' : 'Dosage (M-A-N)'}
                    </span>
                    <div className="flex items-center gap-1">
                      <SlotBox label="Morn" value={row.morning} onChange={(v) => update(idx, { morning: v })} />
                      <span className="mt-3 text-muted">–</span>
                      <SlotBox label="Noon" value={row.afternoon} onChange={(v) => update(idx, { afternoon: v })} />
                      <span className="mt-3 text-muted">–</span>
                      <SlotBox label="Night" value={row.night} onChange={(v) => update(idx, { night: v })} />
                    </div>
                  </div>
                )}

                <div className="flex flex-col">
                  <span className="mb-0.5 text-[10px] uppercase tracking-wide text-muted">Timing</span>
                  <select
                    className="select w-36"
                    value={row.timing ?? ''}
                    onChange={(e) => update(idx, { timing: (e.target.value || undefined) as DoseTiming | undefined })}
                  >
                    <option value="">—</option>
                    {TIMINGS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="flex flex-col">
                  <span className="mb-0.5 text-[10px] uppercase tracking-wide text-muted">Days</span>
                  <input
                    type="number"
                    min={0}
                    className="input w-16 text-center tabular-nums"
                    value={row.durationDays ?? ''}
                    onChange={(e) => update(idx, { durationDays: e.target.value === '' ? 0 : Number(e.target.value) })}
                  />
                </div>

                <div className="flex flex-col">
                  <span className="mb-0.5 text-[10px] uppercase tracking-wide text-muted">Qty ({drugUnitOf(drugs, row.drugId)})</span>
                  <input
                    type="number"
                    min={0}
                    className="input w-20 text-center tabular-nums"
                    value={row.quantity ?? ''}
                    onChange={(e) => update(idx, { quantity: e.target.value === '' ? 0 : Number(e.target.value) })}
                  />
                </div>

                {!count && !liquid && (
                  <div className="flex flex-1 flex-col">
                    <span className="mb-0.5 text-[10px] uppercase tracking-wide text-muted">Instructions</span>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. apply locally twice a day"
                      value={row.notes ?? ''}
                      onChange={(e) => update(idx, { notes: e.target.value })}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      <button
        type="button"
        className="btn-outline w-full justify-center"
        onClick={() => onChange([...rows, emptyItem()])}
      >
        <Plus size={14} /> Add medicine
      </button>
    </div>
  )
}

function drugUnitOf(drugs: Drug[], drugId: string): string {
  return drugs.find((d) => d.id === drugId)?.unit ?? 'unit'
}
