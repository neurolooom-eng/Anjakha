import { Building2 } from 'lucide-react'
import type { DataTableColumn } from '@/components/table/DataTable'
import { SchemaForm, type FormSection, type FormValues } from '@/components/form/SchemaForm'
import { StatusCell } from '@/components/ui/StatusChip'
import { KpiCard, KpiGrid } from '@/components/ui/KpiCard'
import { ResourceModule } from '@/modules/ResourceModule'
import { useCollection } from '@/lib/useCollection'
import { loadBeds, loadWards, saveBed, updateBed, withAudit } from '@/lib/repository'
import { useAuth } from '@/context/AuthContext'
import { makeId } from '@/lib/id'
import type { Bed } from '@/types'

const BED_STATUS_OPTIONS = ['Available', 'Occupied', 'Reserved', 'Cleaning', 'Maintenance'].map((v) => ({ value: v, label: v }))

const columns: DataTableColumn<Bed>[] = [
  { key: 'bedNumber', header: 'Bed', accessor: (r) => r.bedNumber, width: 100, nowrap: true },
  { key: 'wardName', header: 'Ward', accessor: (r) => r.wardName, width: 180 },
  { key: 'dailyRate', header: 'Daily rate', accessor: (r) => r.dailyRate, width: 110, render: (r) => `₹${r.dailyRate}` },
  { key: 'status', header: 'Status', accessor: (r) => r.status, width: 130, render: (r) => <StatusCell value={r.status} /> },
]

export function WardsBedsTab() {
  const { data: beds, loading, setData } = useCollection(loadBeds)
  const { data: wards } = useCollection(loadWards)
  const { currentUser } = useAuth()

  const wardOptions = wards.map((w) => ({ value: w.id, label: `${w.name} (${w.type})` }))
  const occupied = beds.filter((b) => b.status === 'Occupied').length
  const available = beds.filter((b) => b.status === 'Available').length
  const occupancyPct = beds.length ? Math.round((occupied / beds.length) * 100) : 0

  const sections: FormSection[] = [
    {
      title: 'Bed details',
      fields: [
        { key: 'wardId', label: 'Ward', type: 'select', options: wardOptions, required: true },
        { key: 'bedNumber', label: 'Bed number', type: 'text', required: true },
        { key: 'dailyRate', label: 'Daily rate', type: 'currency', required: true },
        { key: 'status', label: 'Status', type: 'status', options: BED_STATUS_OPTIONS },
      ],
    },
  ]

  function toFormValues(record: Bed | null): FormValues {
    if (record) return { ...record }
    return { status: 'Available' }
  }

  function buildRecord(values: FormValues, editing: Bed | null): Bed {
    const ward = wards.find((w) => w.id === values.wardId)
    const base = { ...editing, ...values, wardName: ward?.name ?? editing?.wardName ?? '' } as Bed
    return withAudit(base, currentUser?.name ?? 'system', editing ?? undefined) as Bed
  }

  async function handleSave(record: Bed, editing: Bed | null) {
    if (editing) {
      await updateBed(record)
      setData((rows) => rows.map((r) => (r.id === record.id ? record : r)))
    } else {
      await saveBed(record)
      setData((rows) => [record, ...rows])
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <KpiGrid>
        <KpiCard label="Total beds" value={beds.length} icon={Building2} />
        <KpiCard label="Occupied" value={occupied} icon={Building2} />
        <KpiCard label="Available" value={available} icon={Building2} />
        <KpiCard label="Occupancy" value={occupancyPct} format="percent" target={85} goal="lower" icon={Building2} />
      </KpiGrid>
      <ResourceModule<Bed>
        tableKey="ipd-beds"
        title="Wards & Beds"
        description="Bed inventory and live occupancy status across all wards."
        icon={Building2}
        columns={columns}
        rows={beds}
        permissionBase="ipd"
        newLabel="Add Bed"
        emptyMessage={loading ? 'Loading…' : 'No beds configured.'}
        toFormValues={toFormValues}
        buildRecord={(values, editing) => buildRecord({ ...values, id: editing?.id ?? makeId('bed') }, editing)}
        onSave={handleSave}
        renderForm={(values, setField) => (
          <SchemaForm sections={sections} values={values} onChange={setField} />
        )}
      />
    </div>
  )
}
