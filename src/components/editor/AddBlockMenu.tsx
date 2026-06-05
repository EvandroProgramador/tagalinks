import { X, Link2, Youtube, MessageCircle, Share2, Type, Minus, ShoppingBag, Store, Mail, Phone } from 'lucide-react'
import type { SubscriptionPlan } from '@/types'

interface Props {
  onSelect:  (type: string) => void
  onClose:   () => void
  plan:      SubscriptionPlan
  itemCount: number
}

const blocks = [
  { type: 'link',     icon: Link2,       label: 'Link',             desc: 'Link genérico para qualquer URL' },
  { type: 'social',   icon: Share2,       label: 'Rede social',      desc: 'Instagram, TikTok, YouTube…' },
  { type: 'whatsapp', icon: MessageCircle,label: 'WhatsApp',         desc: 'Botão de contacto directo' },
  { type: 'youtube',  icon: Youtube,      label: 'Vídeo YouTube',    desc: 'Player embutido na página' },
  { type: 'tagashop', icon: Store,        label: 'Loja TagaShop',    desc: 'Link directo para a tua loja', plan: 'creator' as SubscriptionPlan },
  { type: 'product',  icon: ShoppingBag,  label: 'Produto TagaShop', desc: 'Produto individual da tua loja', plan: 'creator' as SubscriptionPlan },
  { type: 'vitrine',  icon: Store,        label: 'Vitrine',          desc: 'Grid de produtos do TagaShop',   plan: 'creator' as SubscriptionPlan },
  { type: 'email',    icon: Mail,         label: 'E-mail',           desc: 'Link mailto directo' },
  { type: 'phone',    icon: Phone,        label: 'Telefone',         desc: 'Link de chamada directa' },
  { type: 'header',   icon: Type,         label: 'Título',           desc: 'Título de secção / separador' },
  { type: 'divider',  icon: Minus,        label: 'Linha',            desc: 'Linha divisória visual' },
]

const planOrder: SubscriptionPlan[] = ['free', 'creator', 'business']

export function AddBlockMenu({ onSelect, onClose, plan, itemCount }: Props) {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-surface-card border border-surface-border rounded-2xl w-full max-w-sm shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-surface-border">
          <h3 className="text-base font-semibold text-white">Adicionar bloco</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 space-y-1 max-h-[60vh] overflow-y-auto">
          {blocks.map(({ type, icon: Icon, label, desc, plan: reqPlan }) => {
            const locked = reqPlan && planOrder.indexOf(plan) < planOrder.indexOf(reqPlan)
            const limitReached = plan === 'free' && itemCount >= 5

            return (
              <button
                key={type}
                onClick={() => !locked && onSelect(type)}
                disabled={!!locked || (limitReached && type !== 'header' && type !== 'divider')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left
                           hover:bg-surface-elevated disabled:opacity-40 disabled:cursor-not-allowed
                           transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-500/25 transition-colors">
                  <Icon className="w-4 h-4 text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-gray-500 truncate">{desc}</p>
                </div>
                {locked && (
                  <span className="text-xs text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded">
                    {reqPlan}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
