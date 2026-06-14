import { useState } from 'react'
import { ExternalLink } from 'lucide-react'

/** Banners publicitários da TagaShop (cartazes verticais 3:4). */
export const TAGASHOP_BANNERS = [
  '/tagashop/tagabanner_1.png',
  '/tagashop/tagabanner_2.png',
  '/tagashop/tagabanner_3.png',
  '/tagashop/tagabanner_4.png',
] as const

const TAGASHOP_URL = import.meta.env.VITE_TAGASHOP_API_URL || 'https://tagashop.site'

interface TagaShopBannerProps {
  /** Índice do banner a mostrar. Por omissão escolhe um aleatório. */
  index?: number
  className?: string
}

/** Cartão publicitário individual da TagaShop — clicável, abre tagashop.site. */
export function TagaShopBanner({ index, className = '' }: TagaShopBannerProps) {
  // Escolhe um banner aleatório uma única vez (evita layout shift entre renders).
  const [pick] = useState(() =>
    typeof index === 'number'
      ? index % TAGASHOP_BANNERS.length
      : Math.floor(Math.random() * TAGASHOP_BANNERS.length),
  )

  return (
    <a
      href={TAGASHOP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative block overflow-hidden rounded-2xl border border-surface-border
                  shadow-glow-soft transition-all duration-300 hover:-translate-y-1
                  hover:border-brand-500/50 hover:shadow-glow-brand ${className}`}
    >
      <img
        src={TAGASHOP_BANNERS[pick]}
        alt="TagaShop — cria a tua loja em tagashop.site"
        loading="lazy"
        className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
      {/* Selo "Ver loja" no hover */}
      <span className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full
                       bg-black/60 backdrop-blur-sm text-white text-xs font-medium
                       opacity-0 translate-y-1 transition-all duration-300
                       group-hover:opacity-100 group-hover:translate-y-0">
        Ver loja <ExternalLink className="w-3.5 h-3.5" />
      </span>
    </a>
  )
}

/** Grelha com vários banners publicitários da TagaShop. */
export function TagaShopBannerGrid({ className = '' }: { className?: string }) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {TAGASHOP_BANNERS.map((_, i) => (
        <TagaShopBanner key={i} index={i} />
      ))}
    </div>
  )
}
