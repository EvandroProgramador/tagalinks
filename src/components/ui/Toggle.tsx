import { cn } from '@/lib/utils'

interface Props {
  checked:   boolean
  onChange:  (v: boolean) => void
  label?:    string
  disabled?: boolean
}

export function Toggle({ checked, onChange, label, disabled }: Props) {
  return (
    <label className={cn('flex items-center gap-3 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed')}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none',
          checked ? 'bg-brand-500' : 'bg-surface-elevated border border-surface-border',
        )}
      >
        <span className={cn(
          'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-1',
        )} />
      </button>
      {label && <span className="text-sm text-gray-300">{label}</span>}
    </label>
  )
}
