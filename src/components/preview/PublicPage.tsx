import { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { ExternalLink, ArrowUpRight } from 'lucide-react'
import { YouTubeEmbed } from '@/components/ui/YouTubeEmbed'
import { SOCIAL_BRAND_ICONS, WhatsAppIcon } from '@/components/ui/BrandIcons'
import { computeTheme } from '@/lib/theme'
import { generateSessionId, detectReferrer } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import type { LinkPage, LinkItem, TagaShopProduct } from '@/types'

interface Props {
  page:    LinkPage
  items:   LinkItem[]
  plan:    string
  preview?: boolean
}

export function PublicPage({ page, items, plan, preview = false }: Props) {
  const theme      = computeTheme(page, plan)
  const sessionRef = useRef(generateSessionId())

  useEffect(() => {
    if (preview) return
    const referrer = detectReferrer(document.referrer)
    supabase.functions.invoke('track-event', {
      body: { type: 'page_view', page_id: page.id, referrer, session_id: sessionRef.current },
    })
  }, [page.id, preview])

  function trackClick(item: LinkItem) {
    if (preview) return
    supabase.functions.invoke('track-event', {
      body: { type: 'link_click', page_id: page.id, link_item_id: item.id, session_id: sessionRef.current },
    })
  }

  const bgStyle: React.CSSProperties =
    page.custom_bg_type === 'gradient' && plan !== 'free' && page.custom_bg_gradient
      ? { background: page.custom_bg_gradient }
      : page.custom_bg_type === 'image' && plan !== 'free' && page.custom_bg_image_url
      ? { backgroundImage: `url(${page.custom_bg_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { background: theme.bg }

  return (
    <>
      {!preview && (
        <Helmet>
          <title>{page.seo_title || page.title || 'TagaLinks'}</title>
          <meta name="description" content={page.seo_description || page.bio || ''} />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link href={`https://fonts.googleapis.com/css2?family=${theme.font.replace(/ /g, '+')}:wght@400;500;600;700&display=swap`} rel="stylesheet" />
          <style>{`body { font-family: '${theme.font}', sans-serif; }`}</style>
        </Helmet>
      )}

      <div className="min-h-dvh py-10 px-4" style={{ ...bgStyle, fontFamily: `'${theme.font}', sans-serif` }}>
        <div className="max-w-md mx-auto">

          <div className="text-center mb-7 animate-slide-up">
            {/* Anel de gradiente com as cores do tema — assinatura editorial */}
            <div className="w-[5.5rem] h-[5.5rem] rounded-full mx-auto mb-4 p-[2.5px]"
                 style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
              {page.avatar_url ? (
                <img src={page.avatar_url} alt={page.title}
                     className="w-full h-full rounded-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                     style={{ border: `3px solid ${theme.bg}` }} />
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center text-3xl font-bold"
                     style={{ background: theme.primary, color: '#fff', border: `3px solid ${theme.bg}` }}>
                  {(page.title || '?')[0].toUpperCase()}
                </div>
              )}
            </div>
            {page.title && (
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: theme.text, fontFamily: 'inherit' }}>{page.title}</h1>
            )}
            {page.bio && (
              <p className="text-sm mt-2 leading-relaxed max-w-xs mx-auto" style={{ color: theme.subtext }}>{page.bio}</p>
            )}
          </div>

          {page.youtube_url && (
            <div className="mb-4">
              <YouTubeEmbed url={page.youtube_url} title={page.youtube_title} />
            </div>
          )}

          <div className="space-y-3 stagger">
            {items.filter((i) => i.visible).sort((a, b) => a.position - b.position).map((item) => (
              <LinkBlock key={item.id} item={item} theme={theme} plan={plan} onTrack={() => trackClick(item)} />
            ))}
          </div>

          <p className="text-center font-mono text-[0.62rem] uppercase tracking-[0.25em] mt-9 opacity-50" style={{ color: theme.subtext }}>
            feito com{' '}
            <a href="https://tagalinks.ao" style={{ color: theme.primary }}>
              TagaLinks
            </a>
          </p>
        </div>
      </div>
    </>
  )
}

const PRODUCT_TYPE_BADGES: Record<string, string> = {
  course:     '🎓 Curso',
  ebook:      '📄 E-book',
  service:    '🛠️ Serviço',
  beat:       '🎵 Beat',
  album:      '🎶 Álbum',
  preset:     '🎨 Preset',
  asset_pack: '📦 Pack',
  ticket:     '🎟️ Evento',
}

function VitrineBlock({ item, theme }: { item: LinkItem; theme: any }) {
  const [products, setProducts] = useState<TagaShopProduct[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(false)

  const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL      || ''
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  const TAGASHOP_URL      = import.meta.env.VITE_TAGASHOP_API_URL   || 'https://tagashop.site'

  useEffect(() => {
    const storeSlug = item.url
    if (!storeSlug) { setLoading(false); return }

    fetch(`${SUPABASE_URL}/functions/v1/tagashop-products`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
      body:    JSON.stringify({ store_slug: storeSlug }),
    })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((catalog: { products: TagaShopProduct[] }) => {
        const data = catalog.products || []
        let filtered = data.filter((p: TagaShopProduct) => {
          if (item.vitrine_only_featured) return p.is_featured
          return true
        })
        filtered = filtered
          .sort((a, b) => {
            if (a.is_featured && !b.is_featured) return -1
            if (!a.is_featured && b.is_featured) return 1
            return b.sales - a.sales
          })
          .slice(0, item.vitrine_max_products ?? 6)
        setProducts(filtered)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [item.url, item.vitrine_only_featured, item.vitrine_max_products])

  const title  = item.vitrine_title || item.label || 'Produtos'
  const layout = item.vitrine_layout || 'list'

  if (loading) {
    return (
      <div className="rounded-xl py-6 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mx-auto"
             style={{ borderColor: theme.primary, borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (error || products.length === 0) return null

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-center" style={{ color: theme.text }}>{title}</p>

      <div className={layout === 'grid' ? 'grid grid-cols-2 gap-2.5' : 'space-y-2'}>
        {products.map((product) => (
          <a
            key={product.id}
            href={product.product_url || `${TAGASHOP_URL}/p/${product.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`block rounded-xl overflow-hidden transition-opacity hover:opacity-90 ${
              layout === 'grid' ? '' : 'flex items-center gap-3'
            }`}
            style={{ background: 'rgba(255,255,255,0.07)', border: `0.5px solid ${theme.border}` }}
          >
            {product.cover_image && (
              <div className={layout === 'grid' ? 'relative' : 'flex-shrink-0'}>
                <img
                  src={product.cover_image}
                  alt={product.title}
                  className={layout === 'grid'
                    ? 'w-full aspect-square object-cover'
                    : 'w-14 h-14 object-cover'}
                />
                {product.is_featured && layout === 'grid' && (
                  <span className="absolute top-1.5 left-1.5 text-xs px-1.5 py-0.5 rounded-full
                                   bg-yellow-500/90 text-yellow-900 font-medium">
                    ⭐ Destaque
                  </span>
                )}
              </div>
            )}

            <div className={`p-2.5 ${layout === 'grid' ? '' : 'flex-1 min-w-0'}`}>
              {PRODUCT_TYPE_BADGES[product.product_type] && (
                <span className="text-xs opacity-60 block mb-0.5" style={{ color: theme.subtext }}>
                  {PRODUCT_TYPE_BADGES[product.product_type]}
                </span>
              )}

              <p className={`font-medium text-sm ${layout === 'grid' ? 'line-clamp-2' : 'truncate'}`}
                 style={{ color: theme.text }}>
                {product.title}
              </p>

              <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
                <span className="text-sm font-semibold" style={{ color: theme.primary }}>
                  {new Intl.NumberFormat('pt-PT').format(product.price)} Kz
                </span>
                {product.original_price && product.original_price > product.price && (
                  <>
                    <span className="text-xs line-through opacity-50" style={{ color: theme.subtext }}>
                      {new Intl.NumberFormat('pt-PT').format(product.original_price)} Kz
                    </span>
                    <span className="text-xs font-medium px-1 rounded"
                          style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>
                      -{Math.round((1 - product.price / product.original_price) * 100)}%
                    </span>
                  </>
                )}
              </div>

              {product.sales >= 10 && !product.is_featured && (
                <span className="inline-block text-xs mt-1 opacity-70" style={{ color: theme.subtext }}>
                  🔥 Mais vendido
                </span>
              )}
            </div>
          </a>
        ))}
      </div>

      {item.url && (
        <a
          href={`https://tagashop.site/store/${item.url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-xs py-2 rounded-xl transition-opacity hover:opacity-80"
          style={{ color: theme.primary, border: `0.5px solid ${theme.border}` }}
        >
          Ver loja completa →
        </a>
      )}
    </div>
  )
}

function LinkBlock({ item, theme, plan, onTrack }:
  { item: LinkItem; theme: any; plan: string; onTrack: () => void }) {

  const btnBg     = (plan !== 'free' && item.custom_bg_color)   || theme.primary
  const btnText   = (plan !== 'free' && item.custom_text_color) || '#FFFFFF'
  const style     = (plan !== 'free' && item.custom_style)      || theme.btnStyle
  const radius    = theme.btnShape
  const shadow    = theme.btnShadow ? '0 4px 14px rgba(0,0,0,0.3)' : undefined

  const baseStyle: React.CSSProperties = {
    borderRadius: radius,
    boxShadow:    shadow,
    ...(style === 'outline'
      ? { background: 'transparent', color: btnBg, border: `1.5px solid ${btnBg}` }
      : style === 'ghost'
      ? { background: 'transparent', color: theme.text }
      : style === 'gradient'
      ? { background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`, color: '#fff' }
      : { background: btnBg, color: btnText }),
  }

  if (item.type === 'header') {
    return (
      <div className="text-center py-1">
        <p className="text-sm font-semibold uppercase tracking-wider opacity-60" style={{ color: theme.text }}>
          {item.label}
        </p>
      </div>
    )
  }

  if (item.type === 'divider') {
    return <hr style={{ borderColor: theme.border }} />
  }

  if (item.type === 'youtube' && item.youtube_url) {
    return (
      <div style={{ borderRadius: radius, border: `0.5px solid ${theme.border}`, overflow: 'hidden' }}>
        {item.label && (
          <p className="text-sm font-medium px-4 py-2" style={{ color: theme.text, background: theme.surface }}>
            {item.label}
          </p>
        )}
        <YouTubeEmbed url={item.youtube_url} title={item.youtube_title} />
      </div>
    )
  }

  if (item.type === 'tagashop') {
    return (
      <a href={item.url || '#'} target="_blank" rel="noopener noreferrer" onClick={onTrack}
         className="flex items-center gap-3 py-3.5 px-5 font-medium transition-all duration-200 hover:opacity-95 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] w-full"
         style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`, color: '#fff', borderRadius: radius, boxShadow: shadow }}>
        <img src="/tagashop/tagashop_semfundo.png" alt="TagaShop" className="w-6 h-6 flex-shrink-0 object-contain" />
        <span className="flex-1">{item.label}</span>
        <ExternalLink className="w-4 h-4 opacity-70 flex-shrink-0" />
      </a>
    )
  }

  if (item.type === 'product') {
    return (
      <a href={item.url || '#'} target="_blank" rel="noopener noreferrer" onClick={onTrack}
         className="flex items-center gap-3 p-3 transition-all duration-200 hover:opacity-95 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
         style={{ ...baseStyle, border: `0.5px solid ${theme.border}` }}>
        {item.product_image_url && (
          <img src={item.product_image_url} alt={item.label} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{item.label}</p>
          {item.product_price && (
            <p className="text-xs opacity-70">{new Intl.NumberFormat('pt-PT').format(item.product_price)} Kz</p>
          )}
        </div>
        <ExternalLink className="w-4 h-4 opacity-60 flex-shrink-0" />
      </a>
    )
  }

  if (item.type === 'whatsapp') {
    return (
      <a href={item.url || '#'} target="_blank" rel="noopener noreferrer" onClick={onTrack}
         className="flex items-center justify-center gap-2 py-3.5 px-5 font-medium transition-all duration-200 hover:opacity-95 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] w-full"
         style={{ background: '#25D366', color: '#fff', borderRadius: radius, boxShadow: shadow }}>
        <WhatsAppIcon className="w-5 h-5" />
        <span>{item.label}</span>
      </a>
    )
  }

  if (item.type === 'social') {
    const BrandIcon = SOCIAL_BRAND_ICONS[item.social_network || '']
    return (
      <a href={item.url || '#'} target="_blank" rel="noopener noreferrer" onClick={onTrack}
         className="flex items-center justify-center gap-2 py-3.5 px-5 font-medium transition-all duration-200 hover:opacity-95 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] w-full"
         style={baseStyle}>
        {BrandIcon && <BrandIcon className="w-5 h-5 flex-shrink-0" />}
        <span>{item.label}</span>
      </a>
    )
  }

  if (item.type === 'vitrine') {
    return <VitrineBlock item={item} theme={theme} />
  }

  return (
    <a href={item.url || '#'} target="_blank" rel="noopener noreferrer" onClick={onTrack}
       className="group flex items-center justify-between py-3.5 px-5 font-medium transition-all duration-200 hover:opacity-95 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] w-full"
       style={baseStyle}>
      <span>{item.label}</span>
      <ArrowUpRight className="w-4 h-4 opacity-60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  )
}
