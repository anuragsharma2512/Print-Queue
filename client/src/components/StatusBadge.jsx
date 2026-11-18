import { Clock, Printer, CheckCircle2 } from 'lucide-react'

const CONFIG = {
  Pending: {
    label: 'In Queue',
    icon: Clock,
    className: 'bg-amber-50 text-amber-800 border-amber-200/90',
  },
  Processing: {
    label: 'Printing Now',
    icon: Printer,
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse-subtle',
  },
  Completed: {
    label: 'Completed',
    icon: CheckCircle2,
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
  },
}

export default function StatusBadge({ status }) {
  const meta = CONFIG[status] ?? {
    label: status,
    icon: Clock,
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  }
  const Icon = meta.icon

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${meta.className}`}>
      <Icon className="h-3 w-3 stroke-[2.2]" />
      {meta.label}
    </span>
  )
}
