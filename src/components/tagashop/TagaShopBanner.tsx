import { useState, useEffect } from 'react'

/** Banners publicitários da TagaShop (cartazes verticais 3:4). */
export const TAGASHOP_BANNERS = [
  '/tagashop/tagabanner_1.png',
  '/tagashop/tagabanner_2.png',
  '/tagashop/tagabanner_3.png',
  '/tagashop/tagabanner_4.png',
] as const

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

/** Cartão publicitário individual da TagaShop — apenas visual, não clicável. */
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
    <div
      className={`relative overflow-hidden rounded-2xl border border-surface-border
                  shadow-glow-soft select-none pointer-events-none ${className}`}
    >
      {/* Crossfade: todas as imagens empilhadas, só a activa fica visível. */}
      {TAGASHOP_BANNERS.map((src, i) => (
        <img
          key={src}
          src={src}
          alt="Banner publicitário TagaShop"
          loading="lazy"
          draggable={false}
          aria-hidden={i !== pick}
          className={`w-full h-auto object-cover transition-opacity duration-700 ease-in-out
                      ${i === 0 ? 'relative' : 'absolute inset-0'}
                      ${i === pick ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
    </div>
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
