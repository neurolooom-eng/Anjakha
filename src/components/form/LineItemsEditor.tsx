import { Plus, Trash2 } from 'lucide-react'

export interface LineItemColumn<T> {
  key: keyof T
  label: string
  type: 'text' | 'number' | 'select' | 'readonly'
  options?: { value: string; label: string }[]
  width?: string
  onSelect?: (row: T, value: string) => Partial<T>
}

export function LineItemsEditor<T extends object>({
  columns,
  rows,
  onChange,
  newRow,
  addLabel = 'Add line',
}: {
  columns: LineItemColumn<T>[]
  rows: T[]
  onChange: (rows: T[]) => void
  newRow: () => T
  addLabel?: string
}) {
  function updateRow(idx: number, patch: Partial<T>) {
    onChange(rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
  }
  function removeRow(idx: number) {
    onChange(rows.filter((_, i) => i !== idx))
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead className="bg-surface-2">
          <tr>
            {columns.map((c) => (
              <th key={String(c.key)} className="whitespace-nowrap px-2 py-1.5 text-left text-xs font-semibold text-muted" style={c.width ? { width: c.width } : undefined}>
                {c.label}
              </th>
            ))}
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="border-t border-border">
              {columns.map((c) => (
                <td key={String(c.key)} className="px-2 py-1">
                  {c.type === 'readonly' ? (
                    <span className="text-text">{String(row[c.key] ?? '')}</span>
                  ) : c.type === 'select' ? (
                    <select
                      className="select py-1"
                      value={String(row[c.key] ?? '')}
                      onChange={(e) => {
                        const patch: Partial<T> = { [c.key]: e.target.value } as Partial<T>
                        updateRow(idx, c.onSelect ? { ...patch, ...c.onSelect(row, e.target.value) } : patch)
                      }}
                    >
                      <option value="">Select…</option>
                      {c.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={c.type === 'number' ? 'number' : 'text'}
                      className="input py-1"
                      value={(row[c.key] as string | number) ?? ''}
                      onChange={(e) =>
                        updateRow(idx, { [c.key]: c.type === 'number' ? Number(e.target.value) : e.target.value } as Partial<T>)
                      }
                    />
                  )}
                </td>
              ))}
              <td className="px-2 py-1 text-center">
                <button type="button" className="text-muted hover:text-danger" onClick={() => removeRow(idx)}>
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" className="btn-ghost w-full justify-center border-t border-border text-xs" onClick={() => onChange([...rows, newRow()])}>
        <Plus size={13} /> {addLabel}
      </button>
    </div>
  )
}
