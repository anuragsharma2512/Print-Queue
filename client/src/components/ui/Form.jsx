import { cn } from '../../lib/utils'

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2',
        'text-sm text-slate-900 placeholder:text-slate-400',
        'transition-all duration-150',
        'focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  )
}

export function Label({ children, className, htmlFor }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('block text-xs font-semibold text-slate-700 tracking-tight mb-1.5', className)}
    >
      {children}
    </label>
  )
}

export function Select({ children, className, ...props }) {
  return (
    <select
      className={cn(
        'flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2',
        'text-sm text-slate-900 font-medium',
        'transition-all duration-150 cursor-pointer',
        'focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}
