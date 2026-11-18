import { cn } from '../../lib/utils'

export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/90 bg-white shadow-xs backdrop-blur-xs transition-shadow duration-200 hover:shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('flex flex-col gap-1.5 p-5 pb-3', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-base font-bold text-slate-900 tracking-tight leading-snug', className)}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className }) {
  return (
    <p className={cn('text-xs text-slate-500 leading-relaxed', className)}>
      {children}
    </p>
  )
}

export function CardContent({ children, className }) {
  return (
    <div className={cn('p-5 pt-2', className)}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className }) {
  return (
    <div className={cn('flex items-center p-5 pt-0 gap-3 border-t border-slate-100 mt-2', className)}>
      {children}
    </div>
  )
}
