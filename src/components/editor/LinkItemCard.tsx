import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { usePage } from '@/hooks/usePage'
import { Toggle } from '@/components/ui/Toggle'
import { cn } from '@/lib/utils'
import type { LinkItem, SubscriptionPlan } from '@/types'

const TYPE_LABELS: Record<string, string> = {
  link: 'Link', social: 'Rede social', whatsapp: 'WhatsApp', youtube: 'YouTube',
  product: 'Produto', email: 'E-mail', phone: 'Telefone', header: 'Título', divider: 'Linha',
}

interface Props {
  item: LinkItem
  plan: SubscriptionPlan
}

export function LinkItemCard({ item, plan }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const [expanded, setExpanded] = useState(false)
  const { updateItem, removeItem } = useEditorStore()
  const { deleteItem } = usePage()

  const style = { transform: CSS.Transform.toString(transform), transition }

  async function handleDelete() {
    if (!confirm('Remover este bloco?')) return
    const ok = await deleteItem(item.id)
    if (ok) removeItem(item.id)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-surface-elevated border border-surface-border rounded-xl overflow-hidden',
        isDragging && 'opacity-50 shadow-2xl ring-2 ring-brand-500/50',
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button {...attributes} {...listeners}
                className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none">
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{item.label || '(sem título)'}</p>
          <p className="text-xs text-gray-500">{TYPE_LABELS[item.type] || item.type}</p>
        </div>

        <div className="flex items-center gap-1">
          <Toggle
            checked={item.visible}
            onChange={(v) => updateItem(item.id, { visible: v })}
          />
          <button onClick={() => setExpanded(!expanded)}
                  className="p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-surface-card transition-colors">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button onClick={handleDelete}
                  className="p-1.5 text-gray-600 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-surface-border space-y-3">
          <div>
            <label className="label">Rótulo</label>
            <input className="input" value={item.label}
                   onChange={(e) => updateItem(item.id, { label: e.target.value })} />
          </div>

          {['link', 'social', 'email', 'phone', 'product'].includes(item.type) && (
            <div>
              <label className="label">URL</label>
              <input className="input" value={item.url || ''}
                     onChange={(e) => updateItem(item.id, { url: e.target.value })}
                     placeholder="https://" />
            </div>
          )}

          {item.type === 'youtube' && (
            <div>
              <label className="label">URL do YouTube</label>
              <input className="input" value={item.youtube_url || ''}
                     onChange={(e) => updateItem(item.id, { youtube_url: e.target.value })}
                     placeholder="https://youtube.com/watch?v=..." />
            </div>
          )}

          {item.type === 'whatsapp' && (
            <div>
              <label className="label">Número WhatsApp</label>
              <input className="input" value={item.url || ''}
                     onChange={(e) => updateItem(item.id, { url: `https://wa.me/${e.target.value.replace(/\D/g, '')}` })}
                     placeholder="+244 9XX XXX XXX" />
            </div>
          )}

          {item.type === 'social' && (
            <div>
              <label className="label">Rede social</label>
              <select className="input"
                      value={item.social_network || ''}
                      onChange={(e) => updateItem(item.id, { social_network: e.target.value as any })}>
                {['instagram','tiktok','youtube','facebook','twitter','linkedin','snapchat','telegram','spotify'].map(n => (
                  <option key={n} value={n} className="bg-surface-elevated capitalize">{n}</option>
                ))}
              </select>
            </div>
          )}

          {plan !== 'free' && !['header', 'divider'].includes(item.type) && (
            <div>
              <label className="label">Estilo do botão</label>
              <select className="input"
                      value={item.custom_style || 'solid'}
                      onChange={(e) => updateItem(item.id, { custom_style: e.target.value as any })}>
                <option value="solid"    className="bg-surface-elevated">Sólido</option>
                <option value="outline"  className="bg-surface-elevated">Contorno</option>
                <option value="ghost"    className="bg-surface-elevated">Ghost</option>
                <option value="gradient" className="bg-surface-elevated">Gradiente</option>
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
