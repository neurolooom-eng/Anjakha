import clsx from 'clsx'

export interface TabDef {
  key: string
  label: string
  badge?: number
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: TabDef[]
  active: string
  onChange: (key: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={clsx(
            'flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
            active === tab.key
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-text',
          )}
        >
          {tab.label}
          {tab.badge !== undefined && tab.badge > 0 && (
            <span className="chip bg-primary/15 text-primary">{tab.badge}</span>
          )}
        </button>
      ))}
    </div>
  )
}
