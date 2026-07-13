export const CHART_PALETTE = [
  '#0d9488', '#0284c7', '#7c3aed', '#d97706', '#dc2626', '#059669', '#db2777', '#0891b2',
]

export function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-4">
      <h3 className="mb-3 text-sm font-semibold text-text">{title}</h3>
      <div className="h-64">{children}</div>
    </div>
  )
}
