import {
  ArrowDown, ArrowRight, ClipboardList, HeartPulse, Pill, Stethoscope, Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Tone } from '@/types'

interface Stage {
  title: string
  role: string
  icon: LucideIcon
  tone: Tone
  steps: string[]
  optional?: boolean
  muted?: boolean
}

const STAGES: Stage[] = [
  {
    title: 'Front Office',
    role: 'Front Desk',
    icon: Users,
    tone: 'info',
    steps: [
      'Find patient by phone, or register (name · age · sex)',
      'Book appointment — auto-assigned slot & token',
      'Check in → patient enters the OPD queue',
    ],
  },
  {
    title: 'Nurse’s Station',
    role: 'Nurse',
    icon: HeartPulse,
    tone: 'warning',
    optional: true,
    steps: [
      'Record vitals — Temp · Pulse · Resp · BP · SpO₂ · Ht/Wt → BMI',
      'Capture the chief complaint',
      'Marks “Vitals Recorded”',
    ],
  },
  {
    title: 'Doctor — My Console',
    role: 'Doctor',
    icon: Stethoscope,
    tone: 'primary',
    steps: [
      'Call token → open the patient workspace',
      'Review vitals + cross-visit history',
      'Dictate notes & diagnosis',
      'Prescribe — 1-0-1 tablets / dose + ml syrups',
      'Finalize → Next patient',
    ],
  },
  {
    title: 'Fulfilment',
    role: 'In progress',
    icon: Pill,
    tone: 'neutral',
    muted: true,
    steps: [
      'Pharmacy dispensing queue',
      'Billing & GST invoice',
      'Follow-up scheduling',
    ],
  },
]

const toneAccent: Record<Tone, string> = {
  primary: 'border-t-primary',
  info: 'border-t-info',
  warning: 'border-t-warning',
  success: 'border-t-success',
  danger: 'border-t-danger',
  neutral: 'border-t-muted',
}
const toneChip: Record<Tone, string> = {
  primary: 'bg-primary/12 text-primary',
  info: 'bg-info/15 text-info',
  warning: 'bg-warning/20 text-warning',
  success: 'bg-success/15 text-success',
  danger: 'bg-danger/15 text-danger',
  neutral: 'bg-muted/15 text-muted',
}
const toneIcon: Record<Tone, string> = {
  primary: 'bg-primary/10 text-primary',
  info: 'bg-info/10 text-info',
  warning: 'bg-warning/15 text-warning',
  success: 'bg-success/10 text-success',
  danger: 'bg-danger/10 text-danger',
  neutral: 'bg-muted/10 text-muted',
}

function StageCard({ stage }: { stage: Stage }) {
  const Icon = stage.icon
  return (
    <div
      className={`flex-1 rounded-xl border border-t-4 border-border bg-surface p-3.5 shadow-card ${toneAccent[stage.tone]} ${stage.muted ? 'opacity-80' : ''}`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded-lg p-1.5 ${toneIcon[stage.tone]}`}><Icon size={16} /></span>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight text-text">{stage.title}</p>
          <span className={`chip mt-0.5 ${toneChip[stage.tone]}`}>{stage.role}</span>
        </div>
      </div>
      <ol className="flex flex-col gap-1.5">
        {stage.steps.map((s, i) => (
          <li key={i} className="flex gap-2 text-xs text-muted">
            <span className="mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[9px] font-bold text-text">
              {i + 1}
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
      {stage.optional && (
        <p className="mt-2 border-t border-dashed border-border pt-2 text-[11px] italic text-muted">
          Skippable in an emergency — the doctor can enter vitals from the console.
        </p>
      )}
    </div>
  )
}

function Connector() {
  return (
    <div className="flex shrink-0 items-center justify-center py-1 text-muted lg:py-0">
      <ArrowDown size={18} className="lg:hidden" />
      <ArrowRight size={18} className="hidden lg:block" />
    </div>
  )
}

/** A visual process map of the OPD patient journey through the app, role by role. */
export function AppProcessMap() {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <ClipboardList size={15} className="text-primary" />
        <h3 className="text-sm font-semibold text-text">OPD patient journey</h3>
      </div>

      <div className="flex flex-col items-stretch gap-1 lg:flex-row lg:items-center">
        {STAGES.map((stage, i) => (
          <div key={stage.title} className="contents">
            <StageCard stage={stage} />
            {i < STAGES.length - 1 && <Connector />}
          </div>
        ))}
      </div>

      <p className="mt-3 text-[11px] text-muted">
        Each stage is a role with its own view of the same OPD queue. The token flows left to right;
        a patient&rsquo;s history and prescriptions travel with them to the doctor, and finalized
        prescriptions feed the fulfilment modules.
      </p>
    </div>
  )
}
