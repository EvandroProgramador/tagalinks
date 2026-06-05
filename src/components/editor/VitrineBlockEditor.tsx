import { useState, useEffect } from 'react'
import { RefreshCw, Store, Star } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useTagaShop } from '@/hooks/useTagaShop'
import type { LinkItem, TagaShopProduct } from '@/types'

interface Props {
  item:     LinkItem
  onChange: (updates: Partial<LinkItem>) => void
}

const LAYOUT_OPTIONS = [
  { value: 'list',     label: 'Lista vertical' },
  { value: 'grid',     label: 'Grid 2 colunas' },
  { value: 'carousel', label: 'Carrossel' },
]

export function VitrineBlockEditor({ item, onChange }: Props) {
  const { profile } = useAuthStore()
  const { fetchCatalog } = useTagaShop()
  const [products, setProducts] = useState<TagaShopProduct[]>([])
  const [loading, setLoading]   = useState(false)

  const isConnected = !!profile?.tagashop_api_key

  useEffect(() => {
    if (!isConnected || !profile?.tagashop_api_key) return
    setLoading(true)
    fetchCatalog(profile.tagashop_api_key).then((cat) => {
      if (cat) setProducts(cat.products)
      setLoading(false)
    })
  }, [profile?.tagashop_api_key])

  const previewProducts = products
    .filter((p) => !item.vitrine_only_featured || p.is_featured)
    .slice(0, item.vitrine_max_products ?? 6)

  if (!isConnected) {
    return (
      <div className="rounded-xl bg-surface-elevated border border-surface-border p-4 text-center space-y-2">
        <Store className="w-8 h-8 text-gray-500 mx-auto" />
        <p className="text-sm text-gray-400">
          Liga a tua loja TagaShop nas{' '}
          <a href="/dashboard/settings" className="text-brand-400 underline">
            Definições
          </a>
          {' '}para activar o bloco Vitrine.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">

      {/* Título da vitrine */}
      <div>
        <label className="label">Título da vitrine</label>
        <input
          className="input"
          placeholder="Os meus produtos"
          value={item.vitrine_title || ''}
          onChange={(e) => onChange({ vitrine_title: e.target.value })}
        />
      </div>

      {/* Layout */}
      <div>
        <label className="label">Disposição</label>
        <div className="grid grid-cols-3 gap-2">
          {LAYOUT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ vitrine_layout: value as LinkItem['vitrine_layout'] })}
              className={`text-xs py-2 rounded-lg border transition-colors ${
                (item.vitrine_layout ?? 'list') === value
                  ? 'border-brand-500 bg-brand-500/20 text-brand-300'
                  : 'border-surface-border bg-surface-elevated text-gray-400 hover:border-gray-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Número máximo */}
      <div>
        <label className="label">Máximo de produtos a mostrar</label>
        <select
          className="input"
          value={item.vitrine_max_products ?? 6}
          onChange={(e) => onChange({ vitrine_max_products: Number(e.target.value) })}
        >
          {[3, 4, 6, 8, 12].map((n) => (
            <option key={n} value={n}>{n} produtos</option>
          ))}
          <option value={99}>Todos</option>
        </select>
      </div>

      {/* Apenas destacados */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div
          role="checkbox"
          aria-checked={item.vitrine_only_featured ?? false}
          onClick={() => onChange({ vitrine_only_featured: !(item.vitrine_only_featured ?? false) })}
          className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${
            item.vitrine_only_featured ? 'bg-brand-500' : 'bg-surface-elevated border border-surface-border'
          }`}
        >
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
            item.vitrine_only_featured ? 'left-4' : 'left-0.5'
          }`} />
        </div>
        <span className="text-sm text-gray-300 flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-yellow-400" />
          Mostrar apenas produtos em destaque
        </span>
      </label>

      {/* Preview do que vai aparecer */}
      {loading ? (
        <div className="text-center py-4">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : previewProducts.length > 0 ? (
        <div className="space-y-1">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />
            {previewProducts.length} produto{previewProducts.length !== 1 ? 's' : ''} a mostrar
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {previewProducts.map((p) => (
              <div key={p.id}
                   className="flex items-center gap-2 bg-surface-elevated rounded-lg px-3 py-1.5">
                {p.cover_image && (
                  <img src={p.cover_image} alt={p.title}
                       className="w-8 h-8 rounded object-cover flex-shrink-0" />
                )}
                <span className="text-xs text-gray-300 truncate flex-1">{p.title}</span>
                {p.is_featured && <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />}
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {new Intl.NumberFormat('pt-PT').format(p.price)} Kz
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-500 text-center py-2">
          {item.vitrine_only_featured
            ? 'Nenhum produto marcado como destaque no TagaShop.'
            : 'Nenhum produto activo na loja.'}
        </p>
      )}

    </div>
  )
}
