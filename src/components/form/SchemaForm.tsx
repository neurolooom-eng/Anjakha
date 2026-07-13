export type FieldType =
  | 'text' | 'textarea' | 'number' | 'currency' | 'date' | 'select' | 'multiselect'
  | 'status' | 'user' | 'boolean' | 'email' | 'tags' | 'attachment' | 'signature'

export interface FieldOption {
  value: string
  label: string
}

export interface FieldDef {
  key: string
  label: string
  type: FieldType
  required?: boolean
  options?: FieldOption[]
  help?: string
  readonly?: boolean
  placeholder?: string
}

export interface FormSection {
  title: string
  fields: FieldDef[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormValues = Record<string, any>

export function SchemaForm({
  sections,
  values,
  onChange,
  errors,
}: {
  sections: FormSection[]
  values: FormValues
  onChange: (key: string, value: unknown) => void
  errors?: Record<string, string>
}) {
  return (
    <div className="flex flex-col gap-4">
      {sections.map((section) => (
        <fieldset key={section.title} className="card p-4">
          <legend className="px-1 text-sm font-semibold text-primary">{section.title}</legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {section.fields.map((field) => (
              <FieldRow
                key={field.key}
                field={field}
                value={values[field.key]}
                error={errors?.[field.key]}
                onChange={(v) => onChange(field.key, v)}
              />
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  )
}

function FieldRow({
  field,
  value,
  error,
  onChange,
}: {
  field: FieldDef
  value: unknown
  error?: string
  onChange: (v: unknown) => void
}) {
  const spanFull = field.type === 'textarea' || field.type === 'signature' || field.type === 'attachment'
  return (
    <div className={spanFull ? 'sm:col-span-2' : ''}>
      <label className="label">
        {field.label}
        {field.required && <span className="text-danger"> *</span>}
      </label>
      <FieldControl field={field} value={value} onChange={onChange} />
      {error ? (
        <p className="mt-0.5 text-[11px] text-danger">{error}</p>
      ) : field.help ? (
        <p className="mt-0.5 text-[11px] text-muted">{field.help}</p>
      ) : null}
    </div>
  )
}

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: FieldDef
  value: unknown
  onChange: (v: unknown) => void
}) {
  const disabled = field.readonly
  const commonProps = { disabled, placeholder: field.placeholder }

  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          className="textarea min-h-[80px]"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          {...commonProps}
        />
      )
    case 'number':
      return (
        <input
          type="number"
          className="input"
          value={value === undefined || value === null ? '' : (value as number)}
          onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          {...commonProps}
        />
      )
    case 'currency':
      return (
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">₹</span>
          <input
            type="number"
            className="input pl-6"
            value={value === undefined || value === null ? '' : (value as number)}
            onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
            {...commonProps}
          />
        </div>
      )
    case 'date':
      return (
        <input
          type="date"
          className="input"
          value={(value as string)?.slice(0, 10) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          {...commonProps}
        />
      )
    case 'email':
      return (
        <input
          type="email"
          className="input"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          {...commonProps}
        />
      )
    case 'boolean':
      return (
        <label className="mt-1.5 flex items-center gap-2 text-sm text-text">
          <input
            type="checkbox"
            checked={Boolean(value)}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
          />
          {field.placeholder ?? 'Yes'}
        </label>
      )
    case 'select':
    case 'status':
    case 'user':
      return (
        <select
          className="select"
          value={(value as string) ?? ''}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">{field.type === 'user' ? '— Unassigned —' : `Select ${field.label.toLowerCase()}…`}</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )
    case 'multiselect':
    case 'tags': {
      const selected = Array.isArray(value) ? (value as string[]) : []
      const toggle = (v: string) => {
        onChange(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v])
      }
      return (
        <div className="flex flex-wrap gap-1.5 rounded-md border border-border bg-surface p-2">
          {field.options?.length ? (
            field.options.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => toggle(opt.value)}
                className={`chip border ${
                  selected.includes(opt.value)
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border text-muted hover:bg-surface-2'
                }`}
              >
                {opt.label}
              </button>
            ))
          ) : (
            <span className="text-xs text-muted">No options configured</span>
          )}
        </div>
      )
    }
    case 'attachment':
      return (
        <div className="flex items-center gap-2">
          <span className="text-muted">📎</span>
          <input
            type="url"
            className="input"
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            {...commonProps}
            placeholder={field.placeholder ?? 'Paste a link (Drive, etc.)'}
          />
        </div>
      )
    case 'signature':
      return (
        <div className="flex items-center gap-2 rounded-md border border-dashed border-border p-2">
          <span className="text-muted">✒️</span>
          <input
            type="text"
            className="input border-0 px-0 focus:ring-0"
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            {...commonProps}
            placeholder={field.placeholder ?? 'Type name to e-sign'}
          />
        </div>
      )
    case 'text':
    default:
      return (
        <input
          type="text"
          className="input"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          {...commonProps}
        />
      )
  }
}
