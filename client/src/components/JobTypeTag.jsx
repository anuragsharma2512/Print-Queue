import { Printer, Palette, Copy } from 'lucide-react'

const CONFIG = {
  'B&W Print': {
    label: 'B&W Print',
    icon: Printer,
    className: 'bg-slate-100 text-slate-800 border-slate-200/80',
  },
  'Black & White Printout': {
    label: 'B&W Printout',
    icon: Printer,
    className: 'bg-slate-100 text-slate-800 border-slate-200/80',
  },
  'Colour Print': {
    label: 'Colour Print',
    icon: Palette,
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
  },
  'Colour Printout': {
    label: 'Colour Printout',
    icon: Palette,
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
  },
  'B&W Photocopy': {
    label: 'Photocopy',
    icon: Copy,
    className: 'bg-teal-50 text-teal-800 border-teal-200/80',
  },
  'Xerox': {
    label: 'Xerox',
    icon: Copy,
    className: 'bg-teal-50 text-teal-800 border-teal-200/80',
  },
  'Colour Xerox': {
    label: 'Colour Xerox',
    icon: Palette,
    className: 'bg-purple-50 text-purple-700 border-purple-200/80',
  },
}

export default function JobTypeTag({ jobType }) {
  const meta = CONFIG[jobType] ?? {
    label: jobType,
    icon: Printer,
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  }
  const Icon = meta.icon

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold border ${meta.className}`}>
      <Icon className="h-3 w-3 stroke-[2.2]" />
      {meta.label}
    </span>
  )
}
