import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/useAuthStore'
import { supabase } from '@/lib/supabase'
import { Save, Store, CheckCircle2, XCircle, RefreshCw, Link2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTagaShop } from '@/hooks/useTagaShop'

interface ProfileForm {
  name:    string
  phone:   string
  username: string
}

export default function Settings() {
  const { user, profile } = useAuth()
  const { fetchProfile }  = useAuthStore()
  const [saving, setSaving] = useState(false)

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

  const { register, handleSubmit, reset } = useForm<ProfileForm>()

  useEffect(() => {
    if (profile) reset({ name: profile.name, phone: profile.phone || '', username: profile.username || '' })
  }, [profile])

  async function onSubmit(data: ProfileForm) {
    if (!user?.id) return
    setSaving(true)
    const { error } = await supabase.from('profiles').update({
      name: data.name, phone: data.phone, username: data.username,
    }).eq('id', user.id)
    if (error) { toast.error(error.message) }
    else { toast.success('Definições guardadas!'); fetchProfile(user.id) }
    setSaving(false)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-white">Definições</h1>

      {/* Perfil */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Perfil</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Nome completo</label>
            <input className="input" {...register('name', { required: true })} />
          </div>
          <div>
            <label className="label">Nome de utilizador</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">tagalinks.ao/</span>
              <input className="input pl-28" {...register('username', {
                pattern: { value: /^[a-zA-Z0-9_-]{3,30}$/, message: 'Formato inválido' }
              })} />
            </div>
          </div>
          <div>
            <label className="label">Telefone</label>
            <input type="tel" className="input" placeholder="+244 9XX XXX XXX" {...register('phone')} />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input type="email" className="input" value={profile?.email || ''} disabled />
          </div>
          <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center gap-1.5">
            <Save className="w-4 h-4" /> {saving ? 'A guardar...' : 'Guardar alterações'}
          </button>
        </form>
      </div>

      {/* ─── Integração TagaShop ─────────────────────────────── */}
      <div className="card space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex-shrink-0">
            <Store className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Integração TagaShop</h3>
            <p className="text-xs text-gray-400">
              Liga a tua loja para mostrar produtos automaticamente no teu bio-link.
            </p>
          </div>
          {storeConnected ? (
            <span className="ml-auto flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full flex-shrink-0">
              <CheckCircle2 className="w-3 h-3" /> Ligado
            </span>
          ) : (
            <span className="ml-auto flex items-center gap-1 text-xs text-gray-500 bg-surface-elevated px-2 py-1 rounded-full flex-shrink-0">
              <XCircle className="w-3 h-3" /> Desligado
            </span>
          )}
        </div>

        {storeConnected ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-300 bg-surface-elevated
                            rounded-xl px-3 py-2.5">
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
                {syncing ? 'A sincronizar...' : 'Sincronizar'}
              </button>
              <button
                type="button"
                onClick={handleDisconnectStore}
                className="btn-ghost text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-1.5 py-2"
              >
                <XCircle className="w-3.5 h-3.5" /> Desligar
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
              <div className="space-y-2">
                <p className="text-xs text-gray-400">
                  No TagaShop, vai a{' '}
                  <strong className="text-gray-200">Integrações → TagaLinks</strong>
                  , activa a integração e copia a API Key.
                </p>
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

      {/* Zona perigosa */}
      <div className="card border-red-500/20">
        <h2 className="text-sm font-semibold text-red-400 mb-3">Zona perigosa</h2>
        <p className="text-xs text-gray-500 mb-3">
          Eliminar a conta remove todos os teus dados permanentemente. Esta acção não pode ser revertida.
        </p>
        <button
          onClick={() => confirm('Tens a certeza? Esta acção é irreversível!') && toast.error('Contacta o suporte para eliminar a conta.')}
          className="text-sm text-red-400 hover:text-red-300 underline"
        >
          Eliminar conta
        </button>
      </div>
    </div>
  )
}
