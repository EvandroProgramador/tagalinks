import { useState, useEffect } from 'react'
import { ExternalLink } from 'lucide-react'

/** Banners publicitários da TagaShop (cartazes verticais 3:4). */
export const TAGASHOP_BANNERS = [
  '/tagashop/tagabanner_1.png',
  '/tagashop/tagabanner_2.png',
  '/tagashop/tagabanner_3.png',
  '/tagashop/tagabanner_4.png',
] as const

const TAGASHOP_URL = import.meta.env.VITE_TAGASHOP_API_URL || 'https://tagashop.site'

/** Intervalo de rotação aleatória das imagens (ms). */
const ROTATE_MS = 15_000

function randomIndex(exclude?: number): number {
  const n = TAGASHOP_BANNERS.length
  if (n < 2) return 0
  let i = exclude
  while (i === undefined || i === exclude) i = Math.floor(Math.random() * n)
  return i
}

function shuffle(length: number): number[] {
  const a = Array.from({ length }, (_, i) => i)
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface TagaShopBannerProps {
  /** Índice fixo (modo controlado — ex.: dentro da grelha). Sem isto, roda sozinho. */
  index?: number
  className?: string
}

/** Cartão publicitário individual da TagaShop — clicável, abre tagashop.site. */
export function TagaShopBanner({ index, className = '' }: TagaShopBannerProps) {
  const controlled = typeof index === 'number'
  const [pick, setPick] = useState(() =>
    controlled ? index! % TAGASHOP_BANNERS.length : randomIndex(),
  )

  // Modo controlado: segue o índice recebido (a grelha decide a rotação).
  useEffect(() => {
    if (controlled) setPick(index! % TAGASHOP_BANNERS.length)
  }, [index, controlled])

  // Modo autónomo: troca para uma imagem aleatória diferente de 15 em 15 segundos.
  useEffect(() => {
    if (controlled) return
    const id = setInterval(() => setPick((prev) => randomIndex(prev)), ROTATE_MS)
    return () => clearInterval(id)
  }, [controlled])

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
        key={pick}
        src={TAGASHOP_BANNERS[pick]}
        alt="TagaShop — cria a tua loja em tagashop.site"
        loading="lazy"
        className="w-full h-auto object-cover animate-fade-in transition-transform duration-500 group-hover:scale-[1.03]"
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

interface TagaShopBannerGridProps {
  /** Nº de banners a mostrar (por omissão, todos). */
  count?: number
  className?: string
}

/**
 * Grelha de banners publicitários da TagaShop.
 * Baralha as posições de 15 em 15 segundos, mantendo as imagens sempre distintas.
 */
export function TagaShopBannerGrid({ count, className = '' }: TagaShopBannerGridProps) {
  const n = Math.min(count ?? TAGASHOP_BANNERS.length, TAGASHOP_BANNERS.length)
  const [order, setOrder] = useState(() => shuffle(TAGASHOP_BANNERS.length))

  useEffect(() => {
    const id = setInterval(() => setOrder(shuffle(TAGASHOP_BANNERS.length)), ROTATE_MS)
    return () => clearInterval(id)
  }, [])

  const cols = n >= 4 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'

  return (
    <div className={`grid ${cols} gap-4 ${className}`}>
      {order.slice(0, n).map((bannerIdx, slot) => (
        <TagaShopBanner key={slot} index={bannerIdx} />
      ))}
    </div>
  )
}
