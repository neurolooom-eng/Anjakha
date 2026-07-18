import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity, AlertTriangle, BedDouble, CheckCircle2, IndianRupee, Receipt, ShieldCheck, Stethoscope, Users,
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { KpiCard, KpiGrid } from '@/components/ui/KpiCard'
import { ChartCard, CHART_PALETTE } from '@/components/ui/ChartCard'
import { useCollection } from '@/lib/useCollection'
import {
  loadAdmissions, loadAppointments, loadBeds, loadClaims, loadDrugs, loadInvoices, loadPatients, loadStockBatches,
} from '@/lib/repository'
import { formatCurrency, todayISO } from '@/lib/format'
import { NAV_GROUPS } from '@/lib/nav'
import { useAuth } from '@/context/AuthContext'

export function DashboardPage() {
  const { data: patients } = useCollection(loadPatients)
  const { data: appointments } = useCollection(loadAppointments)
  const { data: beds } = useCollection(loadBeds)
  const { data: admissions } = useCollection(loadAdmissions)
  const { data: invoices } = useCollection(loadInvoices)
  const { data: claims } = useCollection(loadClaims)
  const { data: drugs } = useCollection(loadDrugs)
  const { data: batches } = useCollection(loadStockBatches)
  const { hasPermission } = useAuth()

  const today = todayISO()
  const todaysAppointments = appointments.filter((a) => a.date === today)
  const completedToday = todaysAppointments.filter((a) => a.status === 'Completed').length
  const doctorsInConsultation = new Set(
    todaysAppointments.filter((a) => a.status === 'In Consultation').map((a) => a.doctorName),
  ).size
  const occupied = beds.filter((b) => b.status === 'Occupied').length
  const occupancyPct = beds.length ? Math.round((occupied / beds.length) * 100) : 0
  const todaysRevenue = invoices.filter((i) => i.date === today).reduce((s, i) => s + i.amountPaid, 0)
  const pendingClaims = claims.filter((c) => !['Settled', 'Repudiated'].includes(c.status)).length

  const qtyByDrug = new Map<string, number>()
  for (const b of batches) qtyByDrug.set(b.drugId, (qtyByDrug.get(b.drugId) ?? 0) + b.quantity)
  const lowStock = drugs.filter((d) => (qtyByDrug.get(d.id) ?? 0) < d.reorderLevel).length

  const revenueByCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const inv of invoices) map.set(inv.category, (map.get(inv.category) ?? 0) + inv.total)
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [invoices])

  const appointmentsByDept = useMemo(() => {
    const map = new Map<string, number>()
    for (const a of appointments) map.set(a.department, (map.get(a.department) ?? 0) + 1)
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [appointments])

  const activeModules = NAV_GROUPS.filter((g) => !g.inProgress)
    .flatMap((g) => g.items)
    .filter((item) => item.path !== '/' && item.permission && hasPermission(item.permission))
  const inProgressModules = NAV_GROUPS.filter((g) => g.inProgress)
    .flatMap((g) => g.items)
    .filter((item) => item.permission && hasPermission(item.permission))

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-text">Executive Dashboard</h1>
        <p className="text-sm text-muted">Live snapshot of today&rsquo;s OPD operations — patients, appointments, and the doctor&rsquo;s console.</p>
      </div>

      <KpiGrid>
        <KpiCard label="Registered patients" value={patients.length} icon={Users} />
        <KpiCard label="Today's appointments" value={todaysAppointments.length} icon={Activity} />
        <KpiCard label="Completed today" value={completedToday} icon={CheckCircle2} />
        <KpiCard label="Doctors in consultation" value={doctorsInConsultation} icon={Stethoscope} />
      </KpiGrid>

      <ChartCard title="Appointments by department">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={appointmentsByDept} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
              {appointmentsByDept.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
            </Pie>
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-text">Modules</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {activeModules.map((item) => (
            <Link key={item.path} to={item.path} className="card flex items-center gap-3 p-4 transition-colors hover:bg-surface-2">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <item.icon size={18} />
              </div>
              <span className="text-sm font-medium text-text">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <div className="mb-1 flex items-center gap-2">
          <h2 className="text-sm font-semibold text-muted">In Progress</h2>
          <span className="rounded-full bg-muted/15 px-1.5 py-0.5 text-[10px] font-semibold text-muted">Coming soon</span>
        </div>
        <p className="mb-3 text-xs text-muted">Preview data from modules outside the current OPD rollout.</p>

        <div className="opacity-70">
          <KpiGrid>
            <KpiCard label="Bed occupancy" value={occupancyPct} format="percent" target={85} goal="lower" icon={BedDouble} />
            <KpiCard label="Today's collections" value={todaysRevenue} format="currency" icon={IndianRupee} />
            <KpiCard label="Active admissions" value={admissions.filter((a) => a.status === 'Admitted').length} icon={BedDouble} />
            <KpiCard label="Pending insurance claims" value={pendingClaims} icon={ShieldCheck} target={0} goal="lower" />
            <KpiCard label="Low stock drugs" value={lowStock} icon={AlertTriangle} target={0} goal="lower" />
            <KpiCard label="Outstanding invoices" value={invoices.filter((i) => i.status === 'Unpaid' || i.status === 'Partially Paid').length} icon={Receipt} target={0} goal="lower" />
          </KpiGrid>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Revenue by category">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--c-border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="rgb(var(--c-muted))" angle={-15} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11 }} stroke="rgb(var(--c-muted))" />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {revenueByCategory.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="grid grid-cols-2 gap-3 self-start sm:grid-cols-3">
              {inProgressModules.map((item) => (
                <Link key={item.path} to={item.path} className="card flex items-center gap-3 p-4 transition-colors hover:bg-surface-2">
                  <div className="rounded-lg bg-muted/15 p-2 text-muted">
                    <item.icon size={18} />
                  </div>
                  <span className="text-sm font-medium text-text">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
