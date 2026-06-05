import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, ChevronDown, ChevronUp, Link2, Mail, Phone, Type, Minus, Store, ShoppingBag, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { usePage } from '@/hooks/usePage'
import { SOCIAL_BRAND_ICONS, WhatsAppIcon, YouTubeIcon } from '@/components/ui/BrandIcons'
import { cn } from '@/lib/utils'
import type { LinkItem, SubscriptionPlan } from '@/types'

/* ── ícone por tipo / rede ── */
function ItemIcon({ item, className = 'w-4 h-4', style }: { item: LinkItem; className?: string; style?: React.CSSProperties }) {
  if (item.type === 'social') {
    const Icon = SOCIAL_BRAND_ICONS[item.social_network || '']
    return Icon ? <Icon className={className} style={style} /> : <Link2 className={className} style={style} />
  }
  const props = { className, style }
  const icons: Record<string, React.ReactNode> = {
    whatsapp: <WhatsAppIcon {...props} />,
    youtube:  <YouTubeIcon  {...props} />,
    email:    <Mail         {...props} />,
    phone:    <Phone        {...props} />,
    link:     <Link2        {...props} />,
    product:  <ShoppingBag  {...props} />,
    tagashop: <Store        {...props} />,
    header:   <Type         {...props} />,
    divider:  <Minus        {...props} />,
  }
  return <>{icons[item.type] ?? <Link2 {...props} />}</>
}

/* ── configuração das redes sociais ── */
const SOCIAL_CONFIG: Record<string, { label: string; base: string; prefix: string; placeholder: string }> = {
  instagram: { label: 'Instagram',   base: 'https://instagram.com/',    prefix: 'instagram.com/',    placeholder: 'nome_utilizador' },
  tiktok:    { label: 'TikTok',      base: 'https://tiktok.com/@',      prefix: 'tiktok.com/@',      placeholder: 'nome_utilizador' },
  youtube:   { label: 'YouTube',     base: 'https://youtube.com/@',     prefix: 'youtube.com/@',     placeholder: 'canal_ou_utilizador' },
  facebook:  { label: 'Facebook',    base: 'https://facebook.com/',     prefix: 'facebook.com/',     placeholder: 'pagina_ou_perfil' },
  twitter:   { label: 'X / Twitter', base: 'https://x.com/',            prefix: 'x.com/',            placeholder: 'nome_utilizador' },
  linkedin:  { label: 'LinkedIn',    base: 'https://linkedin.com/in/',  prefix: 'linkedin.com/in/',  placeholder: 'perfil' },
  snapchat:  { label: 'Snapchat',    base: 'https://snapchat.com/add/', prefix: 'snapchat.com/add/', placeholder: 'nome_utilizador' },
  telegram:  { label: 'Telegram',    base: 'https://t.me/',             prefix: 't.me/',             placeholder: 'nome_utilizador' },
  spotify:   { label: 'Spotify',     base: '',                          prefix: '',                  placeholder: 'https://open.spotify.com/...' },
}

const SOCIAL_NETWORK_COLORS: Record<string, string> = {
  instagram: '#E1306C', tiktok: '#010101', youtube: '#FF0000',
  facebook: '#1877F2',  twitter: '#000000', linkedin: '#0A66C2',
  snapchat: '#FFFC00',  telegram: '#2AABEE', spotify: '#1DB954',
}

/* ── helpers URL ── */
function extractSocialValue(url: string, network: string): string {
  const cfg = SOCIAL_CONFIG[network]
  if (!cfg?.base || !url) return url || ''
  for (const base of [cfg.base, cfg.base.replace('https://', 'https://www.')]) {
    if (url.startsWith(base)) return url.slice(base.length)
  }
  return url
}
function buildSocialUrl(value: string, network: string): string {
  const cfg = SOCIAL_CONFIG[network]
  if (!cfg?.base) return value
  return value ? cfg.base + value.replace(/^@/, '').trim() : ''
}
function extractWhatsAppNumber(url: string) { return url?.match(/wa\.me\/(\d+)/)?.[1] ?? '' }
function extractWhatsAppMessage(url: string) {
  const m = url?.match(/[?&]text=([^&]*)/)
  return m ? decodeURIComponent(m[1]) : ''
}
function buildWhatsAppUrl(number: string, message: string): string {
  const d = number.replace(/\D/g, '')
  if (!d) return ''
  return message ? `https://wa.me/${d}?text=${encodeURIComponent(message)}` : `https://wa.me/${d}`
}
function extractEmail(url: string) { return url?.startsWith('mailto:') ? url.slice(7).split('?')[0] : (url || '') }
function extractEmailSubject(url: string) {
  const m = url?.match(/[?&]subject=([^&]*)/)
  return m ? decodeURIComponent(m[1]) : ''
}
function buildEmailUrl(email: string, subject: string) {
  if (!email) return ''
  return subject ? `mailto:${email}?subject=${encodeURIComponent(subject)}` : `mailto:${email}`
}
function extractPhone(url: string) { return url?.startsWith('tel:') ? url.slice(4) : (url || '') }

/* ── campos específicos por tipo ── */
function LinkFields({ item, update }: { item: LinkItem; update: (f: Partial<LinkItem>) => void }) {
  const [waMsg,    setWaMsg]    = useState(extractWhatsAppMessage(item.url || ''))
  const [emailSub, setEmailSub] = useState(extractEmailSubject(item.url || ''))
  const net = item.social_network || 'instagram'
  const cfg = SOCIAL_CONFIG[net]

  switch (item.type) {
    case 'link':
      return (
        <div>
          <label className="label">URL</label>
          <input className="input" type="url" value={item.url || ''} placeholder="https://..."
                 onChange={(e) => update({ url: e.target.value })} />
        </div>
      )

    case 'social':
      return (
        <>
          <div>
            <label className="label">Rede social</label>
            <div className="grid grid-cols-3 gap-1.5">
              {Object.entries(SOCIAL_CONFIG).map(([key, s]) => {
                const Icon = SOCIAL_BRAND_ICONS[key]
                const active = net === key
                return (
                  <button key={key} type="button"
                          onClick={() => {
                            const val = extractSocialValue(item.url || '', net)
                            update({ social_network: key as any, url: buildSocialUrl(val, key) })
                          }}
                          className={cn(
                            'flex items-center gap-1.5 px-2 py-2 rounded-lg border text-xs font-medium transition-all',
                            active
                              ? 'border-brand-500/70 bg-brand-500/10 text-white'
                              : 'border-surface-border text-gray-500 hover:text-white hover:border-gray-500'
                          )}>
                    {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
                    <span className="truncate">{s.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <label className="label">{cfg.base ? 'Nome de utilizador' : 'URL do perfil'}</label>
            {cfg.base ? (
              <div className="flex items-center input p-0 overflow-hidden">
                <span className="text-gray-500 text-xs px-3 py-2.5 bg-surface-card border-r border-surface-border flex-shrink-0 whitespace-nowrap">
                  {cfg.prefix}
                </span>
                <input className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder-gray-600"
                       placeholder={cfg.placeholder}
                       value={extractSocialValue(item.url || '', net)}
                       onChange={(e) => update({ url: buildSocialUrl(e.target.value, net) })} />
              </div>
            ) : (
              <input className="input" type="url" value={item.url || ''}
                     placeholder={cfg.placeholder}
                     onChange={(e) => update({ url: e.target.value })} />
            )}
          </div>
        </>
      )

    case 'whatsapp':
      return (
        <>
          <div>
            <label className="label">Número de telefone</label>
            <div className="flex items-center input p-0 overflow-hidden">
              <span className="text-gray-500 text-xs px-3 py-2.5 bg-surface-card border-r border-surface-border flex-shrink-0">wa.me/</span>
              <input className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder-gray-600"
                     placeholder="244912345678"
                     value={extractWhatsAppNumber(item.url || '')}
                     onChange={(e) => update({ url: buildWhatsAppUrl(e.target.value, waMsg) })} />
            </div>
            <p className="text-xs text-gray-600 mt-1">Código do país + número sem espaços (ex: 244912345678)</p>
          </div>
          <div>
            <label className="label">Mensagem pré-definida <span className="text-gray-600 font-normal">(opcional)</span></label>
            <textarea className="input resize-none text-sm" rows={2}
                      placeholder="Olá! Vim do teu TagaLinks..."
                      value={waMsg}
                      onChange={(e) => { setWaMsg(e.target.value); update({ url: buildWhatsAppUrl(extractWhatsAppNumber(item.url || ''), e.target.value) }) }} />
          </div>
        </>
      )

    case 'email':
      return (
        <>
          <div>
            <label className="label">Endereço de e-mail</label>
            <div className="flex items-center input p-0 overflow-hidden">
              <span className="text-gray-500 text-xs px-3 py-2.5 bg-surface-card border-r border-surface-border flex-shrink-0">mailto:</span>
              <input className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder-gray-600"
                     type="email" placeholder="exemplo@email.com"
                     value={extractEmail(item.url || '')}
                     onChange={(e) => update({ url: buildEmailUrl(e.target.value, emailSub) })} />
            </div>
          </div>
          <div>
            <label className="label">Assunto <span className="text-gray-600 font-normal">(opcional)</span></label>
            <input className="input text-sm" placeholder="Assunto da mensagem" value={emailSub}
                   onChange={(e) => { setEmailSub(e.target.value); update({ url: buildEmailUrl(extractEmail(item.url || ''), e.target.value) }) }} />
          </div>
        </>
      )

    case 'phone':
      return (
        <div>
          <label className="label">Número de telefone</label>
          <div className="flex items-center input p-0 overflow-hidden">
            <span className="text-gray-500 text-xs px-3 py-2.5 bg-surface-card border-r border-surface-border flex-shrink-0">tel:</span>
            <input className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder-gray-600"
                   type="tel" placeholder="+244 9XX XXX XXX"
                   value={extractPhone(item.url || '')}
                   onChange={(e) => update({ url: `tel:${e.target.value.replace(/\s/g, '')}` })} />
          </div>
          <p className="text-xs text-gray-600 mt-1">Abre directamente o marcador do telefone</p>
        </div>
      )

    case 'youtube':
      return (
        <div>
          <label className="label">URL do vídeo YouTube</label>
          <input className="input" type="url" value={item.youtube_url || ''}
                 placeholder="https://youtube.com/watch?v=..."
                 onChange={(e) => update({ youtube_url: e.target.value })} />
          <p className="text-xs text-gray-600 mt-1">O vídeo será incorporado directamente na página</p>
        </div>
      )

    case 'product':
      return (
        <>
          <div>
            <label className="label">URL do produto</label>
            <input className="input" type="url" value={item.url || ''}
                   placeholder="https://tagashop.ao/produto/..."
                   onChange={(e) => update({ url: e.target.value })} />
          </div>
          <div>
            <label className="label">Preço <span className="text-gray-600 font-normal">(Kz, opcional)</span></label>
            <input className="input" type="number" min="0" value={item.product_price || ''}
                   placeholder="5000"
                   onChange={(e) => update({ product_price: e.target.value ? Number(e.target.value) : undefined })} />
          </div>
        </>
      )

    case 'tagashop':
      return (
        <div>
          <label className="label">URL da loja</label>
          <input className="input" type="url" value={item.url || ''}
                 placeholder="https://tagashop.ao/loja/..."
                 onChange={(e) => update({ url: e.target.value })} />
        </div>
      )

    default:
      return null
  }
}

/* ── personalização de botão ── */
function BtnCustomization({ item, update }: { item: LinkItem; update: (f: Partial<LinkItem>) => void }) {
  return (
    <div className="space-y-3 pt-1 border-t border-surface-border">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Personalização do botão</p>

      {/* Estilo */}
      <div>
        <label className="label">Estilo</label>
        <div className="grid grid-cols-4 gap-1.5">
          {([
            { value: 'solid',    label: 'Sólido'    },
            { value: 'gradient', label: 'Gradiente' },
            { value: 'outline',  label: 'Contorno'  },
            { value: 'ghost',    label: 'Ghost'     },
          ] as const).map(({ value, label }) => (
            <button key={value} type="button"
                    onClick={() => update({ custom_style: value })}
                    className={cn(
                      'py-1.5 rounded-lg border text-xs font-medium transition-all',
                      (item.custom_style || 'solid') === value
                        ? 'border-brand-500/70 bg-brand-500/10 text-brand-300'
                        : 'border-surface-border text-gray-500 hover:text-white'
                    )}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Cores (só fazem sentido em sólido/contorno) */}
      {['solid', 'outline'].includes(item.custom_style || 'solid') && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Cor do fundo</label>
            <div className="flex items-center gap-2">
              <input type="color" value={item.custom_bg_color || '#7C3AED'}
                     className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border border-surface-border flex-shrink-0"
                     onChange={(e) => update({ custom_bg_color: e.target.value })} />
              <input className="input flex-1 font-mono text-xs py-2" value={item.custom_bg_color || ''}
                     placeholder="#7C3AED"
                     onChange={(e) => update({ custom_bg_color: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Cor do texto</label>
            <div className="flex items-center gap-2">
              <input type="color" value={item.custom_text_color || '#FFFFFF'}
                     className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border border-surface-border flex-shrink-0"
                     onChange={(e) => update({ custom_text_color: e.target.value })} />
              <input className="input flex-1 font-mono text-xs py-2" value={item.custom_text_color || ''}
                     placeholder="#FFFFFF"
                     onChange={(e) => update({ custom_text_color: e.target.value })} />
            </div>
          </div>
        </div>
      )}

      {/* Cor de borda (só em contorno) */}
      {item.custom_style === 'outline' && (
        <div>
          <label className="label">Cor da borda</label>
          <div className="flex items-center gap-2">
            <input type="color" value={item.custom_border_color || item.custom_bg_color || '#7C3AED'}
                   className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border border-surface-border flex-shrink-0"
                   onChange={(e) => update({ custom_border_color: e.target.value })} />
            <input className="input flex-1 font-mono text-xs py-2" value={item.custom_border_color || ''}
                   placeholder="#7C3AED"
                   onChange={(e) => update({ custom_border_color: e.target.value })} />
          </div>
        </div>
      )}

      {/* Cor do texto em ghost */}
      {item.custom_style === 'ghost' && (
        <div>
          <label className="label">Cor do texto</label>
          <div className="flex items-center gap-2">
            <input type="color" value={item.custom_text_color || '#F8F8FF'}
                   className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border border-surface-border flex-shrink-0"
                   onChange={(e) => update({ custom_text_color: e.target.value })} />
            <input className="input flex-1 font-mono text-xs py-2" value={item.custom_text_color || ''}
                   placeholder="#F8F8FF"
                   onChange={(e) => update({ custom_text_color: e.target.value })} />
          </div>
        </div>
      )}
    </div>
  )
}

/* ── componente principal ── */
interface Props { item: LinkItem; plan: SubscriptionPlan }

export function LinkItemCard({ item, plan }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const [expanded, setExpanded] = useState(false)
  const { updateItem, removeItem } = useEditorStore()
  const { deleteItem } = usePage()

  const dragStyle = { transform: CSS.Transform.toString(transform), transition }
  const hasFields = item.type !== 'divider'

  async function handleDelete() {
    if (!confirm('Remover este bloco?')) return
    const ok = await deleteItem(item.id)
    if (ok) removeItem(item.id)
  }

  const socialColor = item.type === 'social' ? SOCIAL_NETWORK_COLORS[item.social_network || ''] : undefined

  return (
    <div ref={setNodeRef} style={dragStyle}
         className={cn('bg-surface-elevated border border-surface-border rounded-xl overflow-hidden',
           isDragging && 'opacity-50 shadow-2xl ring-2 ring-brand-500/50')}>

      <div className="flex items-center gap-2 px-3 py-2.5">
        <button {...attributes} {...listeners}
                className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none flex-shrink-0">
          <GripVertical className="w-4 h-4" />
        </button>

        {/* ícone da marca/tipo */}
        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                           !socialColor && 'bg-surface-card')}
             style={socialColor ? { background: `${socialColor}22` } : undefined}>
          <ItemIcon item={item} className="w-4 h-4"
                    style={socialColor ? { color: socialColor } : { color: '#9B9BAA' }} />
        </div>

        <div className="flex-1 min-w-0 overflow-hidden">
          <p className="text-sm font-medium text-white truncate leading-tight">{item.label || '(sem título)'}</p>
          <p className="text-xs text-gray-500 truncate leading-tight">
            {item.type === 'social'
              ? SOCIAL_CONFIG[item.social_network || '']?.label ?? 'Rede social'
              : { link: 'Link', whatsapp: 'WhatsApp', youtube: 'YouTube', email: 'E-mail',
                  phone: 'Telefone', product: 'Produto TagaShop', tagashop: 'Loja TagaShop',
                  header: 'Título', divider: 'Linha' }[item.type] ?? item.type}
          </p>
        </div>

        {/* acções — ícones compactos em fila horizontal fixa */}
        <div className="flex items-center flex-shrink-0 ml-1">
          <button
            onClick={() => updateItem(item.id, { visible: !item.visible })}
            title={item.visible ? 'Ocultar' : 'Mostrar'}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              item.visible
                ? 'text-brand-400 hover:text-brand-300 hover:bg-brand-500/10'
                : 'text-gray-600 hover:text-gray-400 hover:bg-surface-card'
            )}>
            {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          {hasFields && (
            <button
              onClick={() => setExpanded(!expanded)}
              title={expanded ? 'Fechar' : 'Editar'}
              className="p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-surface-card transition-colors">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={handleDelete}
            title="Eliminar"
            className="p-1.5 text-gray-600 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && hasFields && (
        <div className="px-4 pb-4 pt-1 border-t border-surface-border space-y-3">
          {item.type !== 'divider' && (
            <div>
              <label className="label">Rótulo</label>
              <input className="input" value={item.label}
                     onChange={(e) => updateItem(item.id, { label: e.target.value })} />
            </div>
          )}

          <LinkFields item={item} update={(f) => updateItem(item.id, f)} />

          {plan !== 'free' && !['header', 'divider'].includes(item.type) && (
            <BtnCustomization item={item} update={(f) => updateItem(item.id, f)} />
          )}
        </div>
      )}
    </div>
  )
}
