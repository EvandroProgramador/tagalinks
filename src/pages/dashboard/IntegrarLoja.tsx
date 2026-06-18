import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/useAuthStore'
import { CheckCircle2, XCircle, RefreshCw, Link2, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTagaShop } from '@/hooks/useTagaShop'
import { TagaShopBanner } from '@/components/tagashop/TagaShopBanner'

const TAGASHOP_CONNECT_URL = 'https://www.tagashop.site/dashboard/integracoes/tagalinks'

export default function IntegrarLoja() {
  const { user, profile } = useAuth()
  const { fetchProfile }  = useAuthStore()

  const { validating, syncing, connectStore, fetchCatalog, disconnectStore } = useTagaShop(profile?.id)
  const [apiKeyInput, setApiKeyInput]         = useState('')
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [storeConnected, setStoreConnected]   = useState(!!profile?.tagashop_api_key)

  useEffect(() => {
    setStoreConnected(!!profile?.tagashop_api_key)
  }, [profile?.tagashop_api_key])

  async function refreshProfile() {
    if (user?.id) await fetchProfile(user.id)
  }

  async function handleConnectStore() {
    const ok = await connectStore(apiKeyInput)
    if (ok) {
      setStoreConnected(true)
      setShowApiKeyInput(false)
      setApiKeyInput('')
      await refreshProfile()
    }
  }

  async function handleDisconnectStore() {
    if (!confirm('Desligar a loja TagaShop? Os blocos Vitrine deixarão de mostrar produtos.')) return
    const ok = await disconnectStore()
    if (ok) { setStoreConnected(false); await refreshProfile() }
  }

  async function handleSyncStore() {
    if (!profile?.tagashop_api_key) return
    const cat = await fetchCatalog(profile.tagashop_api_key)
    if (cat) toast.success(`${cat.products_count} produtos sincronizados!`)
    else toast.error('Erro ao sincronizar.')
  }

  return (
    <div className="max-w-2xl space-y-6 stagger">
      <h1 className="font-display text-3xl font-bold text-white">Integrar com a loja</h1>

      {/* Descrição */}
      <div className="card group">
        <div className="flex items-start gap-4">
          <img
            src="/tagashop/tagashop_semfundo.png"
            alt="TagaShop"
            className="w-11 h-11 flex-shrink-0 object-contain"
          />
          <div>
            <h2 className="font-display text-lg font-bold text-white mb-1">TagaShop</h2>
            <p className="text-sm text-gray-400">
              Liga a tua loja TagaShop ao bio-link para mostrar produtos automaticamente
              através do bloco <strong className="text-gray-200">Vitrine</strong>. Os teus
              clientes poderão ver e comprar directamente a partir do teu link.
            </p>
          </div>
        </div>
      </div>

      {/* Estado da ligação */}
      <div className="card space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="eyebrow flex-1">Estado da ligação</h3>
          {storeConnected ? (
            <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full flex-shrink-0">
              <CheckCircle2 className="w-3 h-3" /> Ligado
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-gray-500 bg-surface-elevated px-2 py-1 rounded-full flex-shrink-0">
              <XCircle className="w-3 h-3" /> Desligado
            </span>
          )}
        </div>

        {storeConnected ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-300 bg-surface-elevated
                            rounded-lg px-3 py-2.5">
              <Link2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <span className="truncate">
                {profile?.tagashop_store_name || profile?.tagashop_slug || 'Loja ligada'}
              </span>
              {profile?.tagashop_slug && (
                <a
                  href={`${import.meta.env.VITE_TAGASHOP_API_URL || 'https://tagashop.site'}/store/${profile.tagashop_slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-gray-500 hover:text-gray-300 flex-shrink-0"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSyncStore}
                disabled={syncing}
                className="btn-secondary text-sm flex items-center gap-1.5 py-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'A sincronizar...' : 'Sincronizar catálogo'}
              </button>
              <button
                type="button"
                onClick={handleDisconnectStore}
                className="btn-ghost text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-1.5 py-2"
              >
                <XCircle className="w-3.5 h-3.5" /> Desligar loja
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {!showApiKeyInput ? (
              <button
                type="button"
                onClick={() => setShowApiKeyInput(true)}
                className="btn-secondary text-sm w-full"
              >
                Ligar loja TagaShop
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-400">
                  Abre o TagaShop na página <strong className="text-gray-200">Integrações → TagaLinks</strong>,
                  activa a integração e copia a <strong className="text-gray-200">API Key</strong> gerada.
                  Depois cola-a aqui em baixo para ligar a tua loja.
                </p>
                <a
                  href={TAGASHOP_CONNECT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm w-full flex items-center justify-center gap-2 group"
                >
                  Abrir TagaShop para obter a chave
                  <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
                <input
                  type="text"
                  className="input font-mono text-sm"
                  placeholder="tgl_..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleConnectStore}
                    disabled={validating || !apiKeyInput.startsWith('tgl_')}
                    className="btn-primary text-sm flex-1"
                  >
                    {validating ? 'A validar...' : 'Ligar loja'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowApiKeyInput(false); setApiKeyInput('') }}
                    className="btn-ghost text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Como funciona */}
      {!storeConnected && (
        <div className="card space-y-3">
          <h3 className="eyebrow">Como funciona</h3>
          <ol className="space-y-2.5 text-sm text-gray-400">
            <li className="flex gap-3">
              <span className="font-mono text-xs text-brand-300 flex-shrink-0 mt-0.5 w-5">01</span>
              <span>
                Entra no TagaShop em{' '}
                <a
                  href={TAGASHOP_CONNECT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-400 hover:text-brand-300 underline underline-offset-2 inline-flex items-center gap-1"
                >
                  Integrações → TagaLinks
                  <ExternalLink className="w-3 h-3" />
                </a>.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-xs text-brand-300 flex-shrink-0 mt-0.5 w-5">02</span>
              Activa a integração e copia a API Key gerada.
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-xs text-brand-300 flex-shrink-0 mt-0.5 w-5">03</span>
              Cola a API Key aqui e clica em <strong className="text-gray-200">Ligar loja</strong>.
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-xs text-brand-300 flex-shrink-0 mt-0.5 w-5">04</span>
              Adiciona um bloco <strong className="text-gray-200">Vitrine</strong> no Editor para mostrar os teus produtos.
            </li>
          </ol>
        </div>
      )}

      {/* Banner publicitário TagaShop */}
      <div className="space-y-3">
        <p className="eyebrow">Ainda não tens loja?</p>
        <TagaShopBanner className="max-w-sm" />
      </div>
    </div>
  )
}
