import { useEffect, useMemo, useState } from 'react'
import {
  ChevronDown, ChevronUp, ChevronsUpDown, Columns3, Download, GripVertical, LayoutList, Search,
} from 'lucide-react'
import clsx from 'clsx'

export interface DataTableColumn<T> {
  key: string
  header: string
  width?: number
  nowrap?: boolean
  accessor?: (row: T) => unknown
  render?: (row: T) => React.ReactNode
  toText?: (row: T) => string
  sortable?: boolean
}

interface SavedView {
  order: string[]
  hidden: string[]
  widths: Record<string, number>
  density: 'comfortable' | 'compact'
}

function loadView(tableKey: string, columns: DataTableColumn<unknown>[]): SavedView {
  const defaults: SavedView = {
    order: columns.map((c) => c.key),
    hidden: [],
    widths: Object.fromEntries(columns.map((c) => [c.key, c.width ?? 160])),
    density: 'comfortable',
  }
  try {
    const raw = localStorage.getItem(`table.${tableKey}`)
    if (!raw) return defaults
    const parsed = JSON.parse(raw) as Partial<SavedView>
    return {
      order: parsed.order?.filter((k) => columns.some((c) => c.key === k)).length
        ? [...(parsed.order ?? []), ...columns.map((c) => c.key).filter((k) => !parsed.order?.includes(k))]
        : defaults.order,
      hidden: parsed.hidden ?? [],
      widths: { ...defaults.widths, ...parsed.widths },
      density: parsed.density ?? 'comfortable',
    }
  } catch {
    return defaults
  }
}

function saveView(tableKey: string, view: SavedView) {
  localStorage.setItem(`table.${tableKey}`, JSON.stringify(view))
}

function toCsvValue(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v)
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function DataTable<T extends { id: string }>({
  tableKey,
  columns,
  rows,
  onRowClick,
  rowsBeforeScroll = 12,
  emptyMessage = 'No records found.',
  toolbarExtra,
}: {
  tableKey: string
  columns: DataTableColumn<T>[]
  rows: T[]
  onRowClick?: (row: T) => void
  rowsBeforeScroll?: number
  emptyMessage?: string
  toolbarExtra?: React.ReactNode
}) {
  const [view, setView] = useState<SavedView>(() => loadView(tableKey, columns as DataTableColumn<unknown>[]))
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null)
  const [showColMenu, setShowColMenu] = useState(false)
  const [dragKey, setDragKey] = useState<string | null>(null)

  useEffect(() => saveView(tableKey, view), [tableKey, view])

  const orderedColumns = useMemo(
    () => view.order.map((k) => columns.find((c) => c.key === k)).filter((c): c is DataTableColumn<T> => !!c),
    [view.order, columns],
  )
  const visibleColumns = orderedColumns.filter((c) => !view.hidden.includes(c.key))

  const getCellText = (row: T, col: DataTableColumn<T>): string => {
    if (col.toText) return col.toText(row)
    if (col.accessor) return String(col.accessor(row) ?? '')
    return ''
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter((row) => visibleColumns.some((c) => getCellText(row, c).toLowerCase().includes(q)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, search, visibleColumns])

  const sorted = useMemo(() => {
    if (!sort) return filtered
    const col = columns.find((c) => c.key === sort.key)
    if (!col) return filtered
    const copy = [...filtered]
    copy.sort((a, b) => {
      const av = col.accessor ? col.accessor(a) : getCellText(a, col)
      const bv = col.accessor ? col.accessor(b) : getCellText(b, col)
      if (av === bv) return 0
      const cmp = av! > bv! ? 1 : -1
      return sort.dir === 'asc' ? cmp : -cmp
    })
    return copy
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, sort, columns])

  function toggleSort(key: string, sortable?: boolean) {
    if (sortable === false) return
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: 'asc' }
      if (prev.dir === 'asc') return { key, dir: 'desc' }
      return null
    })
  }

  function toggleHidden(key: string) {
    setView((v) => ({
      ...v,
      hidden: v.hidden.includes(key) ? v.hidden.filter((k) => k !== key) : [...v.hidden, key],
    }))
  }

  function resetView() {
    setView(loadView(tableKey, columns as DataTableColumn<unknown>[]))
    localStorage.removeItem(`table.${tableKey}`)
  }

  function exportCsv() {
    const header = visibleColumns.map((c) => c.header)
    const lines = [header.map(toCsvValue).join(',')]
    for (const row of sorted) {
      lines.push(visibleColumns.map((c) => toCsvValue(getCellText(row, c))).join(','))
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tableKey}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function onDragStart(key: string) {
    setDragKey(key)
  }
  function onDragOver(e: React.DragEvent, overKey: string) {
    e.preventDefault()
    if (!dragKey || dragKey === overKey) return
  }
  function onDrop(overKey: string) {
    if (!dragKey || dragKey === overKey) return
    setView((v) => {
      const order = [...v.order]
      const from = order.indexOf(dragKey)
      const to = order.indexOf(overKey)
      order.splice(from, 1)
      order.splice(to, 0, dragKey)
      return { ...v, order }
    })
    setDragKey(null)
  }

  function startResize(e: React.MouseEvent, key: string) {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = view.widths[key] ?? 160
    function onMove(ev: MouseEvent) {
      const next = Math.max(80, startWidth + (ev.clientX - startX))
      setView((v) => ({ ...v, widths: { ...v.widths, [key]: next } }))
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  const rowHeight = view.density === 'compact' ? 'py-1.5' : 'py-3'
  const maxHeight = rowsBeforeScroll ? `${rowsBeforeScroll * (view.density === 'compact' ? 38 : 52) + 40}px` : undefined

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-8"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {toolbarExtra}
        <div className="relative">
          <button className="btn-outline" onClick={() => setShowColMenu((s) => !s)}>
            <Columns3 size={14} /> Columns
          </button>
          {showColMenu && (
            <>
              <button className="fixed inset-0 z-10" onClick={() => setShowColMenu(false)} aria-label="Close" />
              <div className="absolute right-0 z-20 mt-1 w-56 rounded-lg border border-border bg-surface p-2 shadow-card">
                {orderedColumns.map((c) => (
                  <label key={c.key} className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-surface-2">
                    <input
                      type="checkbox"
                      checked={!view.hidden.includes(c.key)}
                      onChange={() => toggleHidden(c.key)}
                    />
                    {c.header}
                  </label>
                ))}
                <div className="mt-1 border-t border-border pt-1">
                  <button className="btn-ghost w-full justify-start text-xs" onClick={resetView}>
                    Reset view
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        <button
          className="btn-outline"
          onClick={() => setView((v) => ({ ...v, density: v.density === 'compact' ? 'comfortable' : 'compact' }))}
          title="Toggle density"
        >
          <LayoutList size={14} /> {view.density === 'compact' ? 'Compact' : 'Comfortable'}
        </button>
        <button className="btn-outline" onClick={exportCsv}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="p-6 text-center text-sm text-muted">{emptyMessage}</div>
      ) : (
        <div className="overflow-auto" style={{ maxHeight }}>
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-surface-2">
              <tr>
                {visibleColumns.map((c) => (
                  <th
                    key={c.key}
                    draggable
                    onDragStart={() => onDragStart(c.key)}
                    onDragOver={(e) => onDragOver(e, c.key)}
                    onDrop={() => onDrop(c.key)}
                    style={{ width: view.widths[c.key] }}
                    className="relative select-none border-b border-border px-3 py-2 text-left text-xs font-semibold text-muted"
                  >
                    <div className="flex items-center gap-1">
                      <GripVertical size={12} className="cursor-grab text-muted/60" />
                      <button
                        className="flex items-center gap-1 truncate hover:text-text"
                        onClick={() => toggleSort(c.key, c.sortable)}
                      >
                        {c.header}
                        {sort?.key === c.key ? (
                          sort.dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                        ) : (
                          c.sortable !== false && <ChevronsUpDown size={12} className="opacity-30" />
                        )}
                      </button>
                    </div>
                    <div
                      onMouseDown={(e) => startResize(e, c.key)}
                      className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-primary/30"
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={clsx('border-b border-border last:border-0', onRowClick && 'cursor-pointer hover:bg-surface-2')}
                >
                  {visibleColumns.map((c) => (
                    <td
                      key={c.key}
                      style={{ width: view.widths[c.key] }}
                      className={clsx('align-top px-3 text-text', rowHeight, !c.nowrap && 'whitespace-normal break-words', c.nowrap && 'whitespace-nowrap')}
                    >
                      {c.render ? c.render(row) : getCellText(row, c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
