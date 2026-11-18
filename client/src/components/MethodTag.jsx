import { User, MessageCircle, FileUp } from 'lucide-react'

const CONFIG = {
  'Walk-in': {
    icon: User,
    className: 'bg-amber-50 text-amber-800 border-amber-200/80',
  },
  WhatsApp: {
    icon: MessageCircle,
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  },
  'Student Upload': {
    icon: FileUp,
    className: 'bg-blue-50 text-blue-700 border-blue-200/80',
  },
}

export default function MethodTag({ method }) {
  const meta = CONFIG[method] ?? {
    icon: User,
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  }
  const Icon = meta.icon

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold border ${meta.className}`}>
      <Icon className="h-3 w-3 stroke-[2.2]" />
      {method}
    </span>
  )
}
