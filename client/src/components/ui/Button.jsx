import { cn } from '../../lib/utils'

export function Button({ children, className, variant = 'default', size = 'md', disabled, ...props }) {
  const variants = {
    default: 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98] shadow-xs',
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-[0.98] shadow-xs',
    outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] shadow-2xs',
    ghost: 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900',
    danger: 'bg-rose-600 text-white hover:bg-rose-500 active:scale-[0.98] shadow-xs',
    success: 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-[0.98] shadow-xs',
    blue: 'bg-blue-600 text-white hover:bg-blue-500 active:scale-[0.98] shadow-xs',
  }

  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs font-medium rounded-lg',
    md: 'px-3.5 py-2 text-sm font-semibold rounded-lg',
    lg: 'px-5 py-2.5 text-base font-semibold rounded-xl',
    icon: 'p-2 rounded-lg',
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium select-none',
        'transition-all duration-150 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50',
        'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
