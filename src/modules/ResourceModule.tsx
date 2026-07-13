import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { DataTable, type DataTableColumn } from '@/components/table/DataTable'
import { Drawer } from '@/components/ui/Drawer'
import type { FormValues } from '@/components/form/SchemaForm'
import { useAuth } from '@/context/AuthContext'

export interface ResourceModuleProps<T extends { id: string }> {
  tableKey: string
  title: string
  description?: string
  icon?: LucideIcon
  columns: DataTableColumn<T>[]
  rows: T[]
  permissionBase: string
  createPermission?: string
  editPermission?: string
  newLabel?: string
  drawerWidth?: string
  renderForm: (values: FormValues, setField: (key: string, value: unknown) => void, editing: T | null) => React.ReactNode
  toFormValues: (record: T | null) => FormValues
  buildRecord: (values: FormValues, editing: T | null) => T
  onSave: (record: T, editing: T | null) => Promise<void> | void
  drawerTitle?: (editing: T | null) => string
  drawerSubtitle?: (editing: T | null) => string | undefined
  toolbarExtra?: React.ReactNode
  headerExtra?: React.ReactNode
  onRowClick?: (row: T) => void
  validate?: (values: FormValues) => Record<string, string> | undefined
  emptyMessage?: string
}

export function ResourceModule<T extends { id: string }>({
  tableKey, title, description, icon: Icon, columns, rows, permissionBase, createPermission, editPermission,
  newLabel = 'New', drawerWidth, renderForm, toFormValues, buildRecord, onSave, drawerTitle, drawerSubtitle,
  toolbarExtra, headerExtra, onRowClick, validate, emptyMessage,
}: ResourceModuleProps<T>) {
  const { hasPermission } = useAuth()
  const canCreate = hasPermission(createPermission ?? `${permissionBase}:create`)
  const canEdit = hasPermission(editPermission ?? `${permissionBase}:edit`)

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [values, setValues] = useState<FormValues>({})
  const [errors, setErrors] = useState<Record<string, string> | undefined>()
  const [saving, setSaving] = useState(false)

  function openNew() {
    setEditing(null)
    setValues(toFormValues(null))
    setErrors(undefined)
    setOpen(true)
  }

  function openEdit(row: T) {
    setEditing(row)
    setValues(toFormValues(row))
    setErrors(undefined)
    setOpen(true)
  }

  function setField(key: string, value: unknown) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  async function handleSave() {
    if (validate) {
      const errs = validate(values)
      if (errs && Object.keys(errs).length > 0) {
        setErrors(errs)
        return
      }
    }
    setSaving(true)
    try {
      const record = buildRecord(values, editing)
      await onSave(record, editing)
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-semibold text-text">
            {Icon && <Icon size={18} className="text-primary" />}
            {title}
          </h1>
          {description && <p className="text-sm text-muted">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {headerExtra}
          {canCreate && (
            <button className="btn-primary" onClick={openNew}>
              <Plus size={15} /> {newLabel}
            </button>
          )}
        </div>
      </div>

      <DataTable
        tableKey={tableKey}
        columns={columns}
        rows={rows}
        onRowClick={onRowClick ?? (canEdit ? openEdit : undefined)}
        toolbarExtra={toolbarExtra}
        emptyMessage={emptyMessage}
      />

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={drawerTitle ? drawerTitle(editing) : editing ? `Edit ${title}` : newLabel}
        subtitle={drawerSubtitle?.(editing)}
        width={drawerWidth}
        footer={
          <>
            <button className="btn-outline" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" disabled={saving} onClick={handleSave}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      >
        {renderForm(values, setField, editing)}
        {errors && Object.keys(errors).length > 0 && (
          <p className="mt-2 text-xs text-danger">Please fix the highlighted fields before saving.</p>
        )}
      </Drawer>
    </div>
  )
}
