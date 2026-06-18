import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }: Props) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'
  const variants = {
    primary:   'bg-gradient-tagatech text-white font-semibold shadow-[0_2px_18px_-8px_rgba(124,58,237,0.7)] hover:brightness-110 hover:shadow-[0_6px_26px_-8px_rgba(124,58,237,0.75)]',
    secondary: 'bg-transparent text-white border border-surface-border hover:bg-surface-elevated hover:border-brand-500/50',
    ghost:     'text-gray-400 hover:bg-surface-elevated hover:text-white',
    danger:    'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  )
}
