import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Edit3, BarChart2, Globe, ExternalLink, Zap, CheckCircle2, XCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePage } from '@/hooks/usePage'
import { useEditorStore } from '@/store/useEditorStore'
import { useAnalytics } from '@/hooks/useAnalytics'
import { StatsCards } from '@/components/analytics/StatsCards'
import { Badge } from '@/components/ui/Badge'
import { TagaShopBanner } from '@/components/tagashop/TagaShopBanner'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const { loadPage } = usePage()
  const { page, items } = useEditorStore()
  const { summary, fetch: fetchAnalytics } = useAnalytics()

  useEffect(() => {
    if (user?.id) loadPage(user.id)
  }, [user?.id])

  useEffect(() => {
    if (page?.id) fetchAnalytics(page.id, 7)
  }, [page?.id, fetchAnalytics])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 animate-slide-up">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-white">
            Olá, <span className="gradient-text">{profile?.name?.split(' ')[0] || 'Criador'}</span>!
          </h1>
          <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${page?.published ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
            {page?.published ? 'A tua página está publicada' : 'A tua página ainda não está publicada'}
          </p>
        </div>
        {page?.slug && (
          <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer"
             className="btn-secondary flex items-center gap-2 text-sm flex-shrink-0 group">
            <ExternalLink className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            <span className="hidden sm:inline">Ver página</span>
          </a>
        )}
      </div>

      {/* Acções rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger">
        <Link to="/dashboard/editor"
              className="card-interactive flex items-center gap-4 hover:border-brand-500/50 group">
          <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center transition-all duration-300 group-hover:bg-brand-500/25 group-hover:scale-110">
            <Edit3 className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <p className="font-medium text-white text-sm">Editar página</p>
            <p className="text-xs text-gray-500">{items.length} link{items.length !== 1 ? 's' : ''}</p>
          </div>
        </Link>

        <Link to="/dashboard/analytics"
              className="card-interactive flex items-center gap-4 hover:border-accent-500/50 group">
          <div className="w-10 h-10 rounded-xl bg-accent-500/15 flex items-center justify-center transition-all duration-300 group-hover:bg-accent-500/25 group-hover:scale-110">
            <BarChart2 className="w-5 h-5 text-accent-400" />
          </div>
          <div>
            <p className="font-medium text-white text-sm">Analytics</p>
            <p className="text-xs text-gray-500">{summary?.total_views || 0} visitas (7d)</p>
          </div>
        </Link>

        <Link to="/dashboard/upgrade"
              className="card-interactive flex items-center gap-4 hover:border-yellow-500/50 group">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center transition-all duration-300 group-hover:bg-yellow-500/25 group-hover:scale-110">
            <Zap className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <p className="font-medium text-white text-sm">Upgrade</p>
            <p className="text-xs text-gray-500 capitalize">{profile?.plan || 'free'}</p>
          </div>
        </Link>
      </div>

      {/* Estado da loja TagaShop */}
      <Link
        to="/dashboard/integrar-loja"
        className="card-interactive flex items-center gap-4 hover:border-brand-500/50 group animate-slide-up"
      >
        <img
          src="/tagashop/tagashop_semfundo.png"
          alt="TagaShop"
          className="w-10 h-10 flex-shrink-0 object-contain transition-transform duration-300 group-hover:scale-110"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white text-sm">Loja TagaShop</p>
          <p className="text-xs text-gray-500 truncate">
            {profile?.tagashop_store_name || profile?.tagashop_slug || 'Integração com a loja'}
          </p>
        </div>
        {profile?.tagashop_api_key ? (
          <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full flex-shrink-0">
            <CheckCircle2 className="w-3 h-3" /> Ligada
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-gray-500 bg-surface-elevated px-2 py-1 rounded-full flex-shrink-0">
            <XCircle className="w-3 h-3" /> Desligada
          </span>
        )}
      </Link>

      {/* Status da página */}
      {page && (
        <div className="card animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-300">Estado da página</h2>
            <Badge variant={page.published ? 'success' : 'default'}>
              {page.published ? 'Publicada' : 'Rascunho'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-400">tagalinks.ao/{page.slug}</span>
          </div>
          {!page.published && (
            <p className="text-xs text-yellow-400/70 mt-2">
              A página ainda não está visível publicamente. Publica no Editor.
            </p>
          )}
        </div>
      )}

      {/* Stats rápidas */}
      {summary && (
        <div>
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Últimos 7 dias</h2>
          <StatsCards summary={summary} />
        </div>
      )}

      {/* Banner publicitário TagaShop — apenas se ainda não tem loja ligada */}
      {!profile?.tagashop_api_key && (
        <div className="animate-slide-up">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Vende com a TagaShop</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
            <TagaShopBanner index={0} />
            <TagaShopBanner index={3} className="hidden sm:block" />
          </div>
        </div>
      )}
    </div>
  )
}
