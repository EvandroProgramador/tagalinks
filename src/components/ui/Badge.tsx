import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'brand' | 'accent'
  className?: string
}

export function Badge({ children, variant = 'default', className }: Props) {
  const variants = {
    default: 'bg-surface-elevated text-gray-300 border border-surface-border',
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    danger:  'bg-red-500/20 text-red-400',
    brand:   'bg-brand-500/20 text-brand-300',
    accent:  'bg-accent-500/20 text-accent-300',
  }
  return (
    <span className={cn('badge', variants[variant], className)}>
      {children}
    </span>
  )
}
