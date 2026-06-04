import { useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { ExternalLink, MessageCircle, Store } from 'lucide-react'
import { YouTubeEmbed } from '@/components/ui/YouTubeEmbed'
import { computeTheme } from '@/lib/theme'
import { generateSessionId, detectReferrer } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import type { LinkPage, LinkItem } from '@/types'

const SOCIAL_ICONS: Record<string, string> = {
  instagram: '📸', tiktok: '🎵', youtube: '▶️', facebook: '👤',
  twitter: '🐦', linkedin: '💼', spotify: '🎧', telegram: '✈️',
}

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

      <div className="min-h-screen py-10 px-4" style={bgStyle}>
        <div className="max-w-md mx-auto">

          <div className="text-center mb-6">
            {page.avatar_url ? (
              <img src={page.avatar_url} alt={page.title}
                   className="w-20 h-20 rounded-full mx-auto mb-3 object-cover ring-2"
                   style={{ outline: `2px solid ${theme.primary}`, outlineOffset: '2px' }} />
            ) : (
              <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl font-bold"
                   style={{ background: theme.primary, color: '#fff' }}>
                {(page.title || '?')[0].toUpperCase()}
              </div>
            )}
            {page.title && (
              <h1 className="text-xl font-bold" style={{ color: theme.text }}>{page.title}</h1>
            )}
            {page.bio && (
              <p className="text-sm mt-1 leading-relaxed" style={{ color: theme.subtext }}>{page.bio}</p>
            )}
          </div>

          {page.youtube_url && (
            <div className="mb-4">
              <YouTubeEmbed url={page.youtube_url} title={page.youtube_title} />
            </div>
          )}

          <div className="space-y-3">
            {items.filter((i) => i.visible).sort((a, b) => a.position - b.position).map((item) => (
              <LinkBlock key={item.id} item={item} theme={theme} plan={plan} onTrack={() => trackClick(item)} />
            ))}
          </div>

          <p className="text-center text-xs mt-8 opacity-40" style={{ color: theme.subtext }}>
            feito com{' '}
            <a href="https://tagalinks.ao" className="underline" style={{ color: theme.primary }}>
              TagaLinks
            </a>
          </p>
        </div>
      </div>
    </>
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
         className="flex items-center gap-3 py-3.5 px-5 font-medium transition-opacity hover:opacity-90 w-full"
         style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`, color: '#fff', borderRadius: radius, boxShadow: shadow }}>
        <Store className="w-5 h-5 flex-shrink-0" />
        <span className="flex-1">{item.label}</span>
        <ExternalLink className="w-4 h-4 opacity-70 flex-shrink-0" />
      </a>
    )
  }

  if (item.type === 'product') {
    return (
      <a href={item.url || '#'} target="_blank" rel="noopener noreferrer" onClick={onTrack}
         className="flex items-center gap-3 p-3 transition-opacity hover:opacity-90"
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
         className="flex items-center justify-center gap-2 py-3.5 px-5 font-medium transition-opacity hover:opacity-90 w-full"
         style={{ background: '#25D366', color: '#fff', borderRadius: radius, boxShadow: shadow }}>
        <MessageCircle className="w-5 h-5" />
        <span>{item.label}</span>
      </a>
    )
  }

  if (item.type === 'social') {
    const icon = SOCIAL_ICONS[item.social_network || ''] || '🔗'
    return (
      <a href={item.url || '#'} target="_blank" rel="noopener noreferrer" onClick={onTrack}
         className="flex items-center justify-center gap-2 py-3.5 px-5 font-medium transition-opacity hover:opacity-90 w-full"
         style={baseStyle}>
        <span>{icon}</span>
        <span>{item.label}</span>
      </a>
    )
  }

  return (
    <a href={item.url || '#'} target="_blank" rel="noopener noreferrer" onClick={onTrack}
       className="flex items-center justify-between py-3.5 px-5 font-medium transition-opacity hover:opacity-90 w-full"
       style={baseStyle}>
      <span>{item.label}</span>
      <ExternalLink className="w-4 h-4 opacity-60" />
    </a>
  )
}
