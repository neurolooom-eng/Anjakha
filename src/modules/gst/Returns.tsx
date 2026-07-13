import { useMemo, useState } from 'react'
import { Download, FileSpreadsheet, Landmark } from 'lucide-react'
import type { DataTableColumn } from '@/components/table/DataTable'
import { DataTable } from '@/components/table/DataTable'
import { StatusChip } from '@/components/ui/StatusChip'
import { Drawer } from '@/components/ui/Drawer'
import { useCollection } from '@/lib/useCollection'
import { loadGstReturns, loadInvoices, loadPharmacySales, saveGstReturn, withAudit } from '@/lib/repository'
import { useAuth } from '@/context/AuthContext'
import { formatCurrency } from '@/lib/format'
import { makeId } from '@/lib/id'
import type { GstReturnSummary, GstReturnType, Invoice, PharmacySale } from '@/types'

function periodOf(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleString('en-IN', { month: 'long', year: 'numeric' })
}

function summarizePeriod(period: string, invoices: Invoice[], sales: PharmacySale[]) {
  const invLines = invoices.filter((i) => periodOf(i.date) === period)
  const saleLines = sales.filter((s) => periodOf(s.date) === period)

  const taxableValue = invLines.reduce((s, i) => s + i.subtotal, 0) + saleLines.reduce((s, sl) => s + sl.items.reduce((x, it) => x + it.quantity * it.rate, 0), 0)
  const cgst = invLines.reduce((s, i) => s + i.cgst, 0) + saleLines.reduce((s, sl) => s + (sl.totalAmount - sl.items.reduce((x, it) => x + it.quantity * it.rate, 0)) / 2, 0)
  const sgst = cgst
  const igst = invLines.reduce((s, i) => s + i.igst, 0)
  const invoiceCount = invLines.length + saleLines.length

  return { taxableValue, cgst, sgst, igst, totalTax: cgst + sgst + igst, invoiceCount }
}

const columns: DataTableColumn<GstReturnSummary>[] = [
  { key: 'returnType', header: 'Return', accessor: (r) => r.returnType, width: 100 },
  { key: 'period', header: 'Period', accessor: (r) => r.period, width: 140 },
  { key: 'taxableValue', header: 'Taxable value', accessor: (r) => r.taxableValue, width: 130, render: (r) => formatCurrency(r.taxableValue) },
  { key: 'totalTax', header: 'Total tax', accessor: (r) => r.totalTax, width: 120, render: (r) => formatCurrency(r.totalTax) },
  { key: 'invoiceCount', header: 'Docs', accessor: (r) => r.invoiceCount, width: 80 },
  { key: 'status', header: 'Status', accessor: (r) => r.status, width: 110, render: (r) => <StatusChip value={r.status} tone={r.status === 'Filed' ? 'success' : r.status === 'Generated' ? 'info' : 'neutral'} /> },
]

export function ReturnsTab() {
  const { data: returns, loading, setData } = useCollection(loadGstReturns)
  const { data: invoices } = useCollection(loadInvoices)
  const { data: sales } = useCollection(loadPharmacySales)
  const { hasPermission, currentUser } = useAuth()
  const canGenerate = hasPermission('gst:create')

  const [open, setOpen] = useState(false)
  const [period, setPeriod] = useState(() => new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' }))
  const [returnType, setReturnType] = useState<GstReturnType>('GSTR-1')

  const preview = useMemo(() => summarizePeriod(period, invoices, sales), [period, invoices, sales])

  async function handleGenerate() {
    const record: GstReturnSummary = withAudit(
      {
        id: makeId('gst'), returnType, period, ...preview, status: 'Generated', generatedAt: new Date().toISOString(),
      },
      currentUser?.name ?? 'system',
    ) as GstReturnSummary
    await saveGstReturn(record)
    setData((rows) => [record, ...rows])
    setOpen(false)
  }

  function exportReturn(r: GstReturnSummary) {
    const blob = new Blob([JSON.stringify(r, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${r.returnType}-${r.period.replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const columnsWithExport: DataTableColumn<GstReturnSummary>[] = [
    ...columns,
    {
      key: 'export', header: '', width: 90, sortable: false,
      render: (r) => (
        <button className="btn-ghost !px-2 !py-1 text-xs" onClick={(e) => { e.stopPropagation(); exportReturn(r) }}>
          <Download size={12} /> JSON
        </button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-semibold text-text">
            <Landmark size={18} className="text-primary" /> GSTR-1 & GSTR-3B Summaries
          </h1>
          <p className="text-sm text-muted">Generated from Billing and Pharmacy sale tax lines — export-ready, no live GSTN filing.</p>
        </div>
        {canGenerate && (
          <button className="btn-primary" onClick={() => setOpen(true)}>
            <FileSpreadsheet size={15} /> Generate Return
          </button>
        )}
      </div>

      <DataTable tableKey="gst-returns" columns={columnsWithExport} rows={returns} emptyMessage={loading ? 'Loading…' : 'No GST returns generated yet.'} />

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Generate GST Return"
        subtitle="Pulls taxable value and tax split from invoices and pharmacy sales in the selected period."
        footer={
          <>
            <button className="btn-outline" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleGenerate}>Generate</button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="card p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Return type</label>
                <select className="select" value={returnType} onChange={(e) => setReturnType(e.target.value as GstReturnType)}>
                  <option value="GSTR-1">GSTR-1</option>
                  <option value="GSTR-3B">GSTR-3B</option>
                </select>
              </div>
              <div>
                <label className="label">Period</label>
                <input className="input" value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="July 2026" />
              </div>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="mb-2 text-sm font-semibold text-text">Preview</h3>
            <div className="flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between text-muted"><span>Documents</span><span className="text-text">{preview.invoiceCount}</span></div>
              <div className="flex justify-between text-muted"><span>Taxable value</span><span className="text-text">{formatCurrency(preview.taxableValue)}</span></div>
              <div className="flex justify-between text-muted"><span>CGST</span><span className="text-text">{formatCurrency(preview.cgst)}</span></div>
              <div className="flex justify-between text-muted"><span>SGST</span><span className="text-text">{formatCurrency(preview.sgst)}</span></div>
              <div className="flex justify-between border-t border-border pt-1 font-semibold text-text"><span>Total tax</span><span>{formatCurrency(preview.totalTax)}</span></div>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  )
}
