import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  value:    string
  onChange: (color: string) => void
  label?:   string
  presets?: string[]
}

const DEFAULT_PRESETS = [
  '#7C3AED','#06B6D4','#EC4899','#F59E0B',
  '#10B981','#EF4444','#3B82F6','#8B5CF6',
  '#FFFFFF','#0A0A0F','#13131A','#1C1C27',
]

export function ColorPicker({ value, onChange, label, presets = DEFAULT_PRESETS }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-10 h-10 rounded-xl border-2 border-surface-border hover:border-brand-500 transition-colors flex-shrink-0"
          style={{ background: value }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#7C3AED"
          className="input flex-1 font-mono text-sm"
        />
      </div>

      {open && (
        <div className="mt-2 p-3 bg-surface-elevated rounded-xl border border-surface-border">
          <div className="grid grid-cols-6 gap-2 mb-3">
            {presets.map((c) => (
              <button
                key={c} type="button"
                className={cn(
                  'w-8 h-8 rounded-lg border-2 transition-all hover:scale-110',
                  value === c ? 'border-white scale-110' : 'border-surface-border',
                )}
                style={{ background: c }}
                onClick={() => { onChange(c); setOpen(false) }}
              />
            ))}
          </div>
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-0"
          />
        </div>
      )}
    </div>
  )
}
