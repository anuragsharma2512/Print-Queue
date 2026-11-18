import { cn } from '../../lib/utils'

export function Badge({ children, className, variant = 'default' }) {
  const variants = {
    default: 'bg-slate-900 text-white shadow-xs',
    secondary: 'bg-slate-100 text-slate-700 border border-slate-200/80',
    outline: 'border border-slate-300 text-slate-700 bg-white shadow-2xs',
    pending: 'bg-amber-50 text-amber-700 border border-amber-200/70',
    processing: 'bg-blue-50 text-blue-700 border border-blue-200/80 animate-pulse-subtle',
    completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200/70',
    info: 'bg-indigo-50 text-indigo-700 border border-indigo-200/70',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-tight transition-all',
        variants[variant] ?? variants.default,
        className
      )}
    >
      {children}
    </span>
  )
}
