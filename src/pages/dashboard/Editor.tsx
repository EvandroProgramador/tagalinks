import { useEffect, useState, useRef } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { Plus, Eye, EyeOff, Save, Globe, ExternalLink, Camera, Store } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/useAuthStore'
import { usePage } from '@/hooks/usePage'
import { useEditorStore } from '@/store/useEditorStore'
import { useTagaShop } from '@/hooks/useTagaShop'
import { supabase } from '@/lib/supabase'
import { LinkItemCard } from '@/components/editor/LinkItemCard'
import { AddBlockMenu } from '@/components/editor/AddBlockMenu'
import { PagePreview } from '@/components/preview/PagePreview'
import toast from 'react-hot-toast'

export default function Editor() {
  const { user, profile }  = useAuth()
  const { fetchProfile }   = useAuthStore()
  const { loadPage, savePage, saveItems, addItem } = usePage()
  const { page, items, dirty, preview, saving, setItems, setPage, setDirty, reorderItems, setPreview } = useEditorStore()
  const [showAddMenu, setShowAddMenu]         = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [apiKeyInput, setApiKeyInput]         = useState('')
  const [showApiInput, setShowApiInput]       = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { validating, connectStore } = useTagaShop(profile?.id)

  const sensors = useSensors(useSensor(PointerSensor))

  useEffect(() => {
    if (user?.id) loadPage(user.id)
  }, [user?.id])

  async function handleSave() {
    if (!page) return
    await Promise.all([
      savePage(page.id, {
        title:         page.title,
        bio:           page.bio,
        youtube_url:   page.youtube_url,
        youtube_title: page.youtube_title,
        published:     page.published,
      }),
      saveItems(page.id, items),
    ])
  }

  async function handleConnectAndAddVitrine() {
    if (!page) return
    const ok = await connectStore(apiKeyInput)
    if (!ok) return
    if (user?.id) await fetchProfile(user.id)
    setShowApiInput(false)
    setApiKeyInput('')
    const newItem = await addItem(page.id, 'vitrine', items.length)
    if (newItem) setItems([...items, newItem])
  }

  async function handleAddBlock(type: string) {
    if (!page) return
    setShowAddMenu(false)
    if (profile?.plan === 'free' && items.length >= 5) {
      toast.error('Plano gratuito: máximo 5 links. Faz upgrade para Creator!')
      return
    }
    if (type === 'vitrine' && profile?.plan === 'free') {
      toast.error('O bloco Vitrine requer plano Creator. Faz upgrade!')
      return
    }
    const newItem = await addItem(page.id, type, items.length)
    if (newItem) {
      if (type === 'vitrine' && profile?.tagashop_slug) {
        await supabase
          .from('link_items')
          .update({ url: profile.tagashop_slug })
          .eq('id', newItem.id)
        setItems([...items, { ...newItem, url: profile.tagashop_slug }])
      } else {
        setItems([...items, newItem])
      }
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !user?.id || !page) return
    if (!file.type.startsWith('image/')) { toast.error('Escolhe uma imagem válida'); return }
    if (file.size > 2 * 1024 * 1024) { toast.error('Imagem deve ter menos de 2MB'); return }

    setUploadingAvatar(true)
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `${user.id}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars').upload(path, file, { upsert: true })
      if (uploadError) { toast.error('Erro ao carregar foto'); return }

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      const avatarUrl = `${publicUrl}?t=${Date.now()}`

      const { error: saveError } = await supabase
        .from('link_pages')
        .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
        .eq('id', page.id)
      if (saveError) { toast.error('Erro ao guardar foto'); return }

      setPage({ ...page, avatar_url: avatarUrl })
      toast.success('Foto de perfil actualizada!')
    } finally {
      setUploadingAvatar(false)
    }
  }

  function handleDragEnd(event: any) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = items.findIndex((i) => i.id === active.id)
    const newIdx = items.findIndex((i) => i.id === over.id)
    reorderItems(arrayMove(items, oldIdx, newIdx))
  }

  async function togglePublish() {
    if (!page) return
    const next = !page.published
    const ok = await savePage(page.id, { published: next })
    if (ok) {
      setPage({ ...page, published: next })
      toast.success(next ? 'Página publicada!' : 'Página despublicada')
    }
  }

  if (!page) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex gap-6 h-full">
      <div className="flex-1 space-y-4 min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-lg font-semibold text-white">Editor de página</h1>
            <p className="text-sm text-gray-400">tagalinks.ao/{page.slug}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer"
               className="btn-ghost flex items-center gap-1.5 text-sm">
              <ExternalLink className="w-4 h-4" /> Ver página
            </a>
            <button onClick={() => setPreview(!preview)} className="btn-ghost text-sm p-2">
              {preview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button onClick={togglePublish}
                    className={`btn-secondary text-sm flex items-center gap-1.5 ${page.published ? 'text-green-400 border-green-500/30' : ''}`}>
              <Globe className="w-4 h-4" />
              {page.published ? 'Publicado' : 'Publicar'}
            </button>
            <button onClick={handleSave} disabled={!dirty || saving}
                    className="btn-primary text-sm flex items-center gap-1.5">
              <Save className="w-4 h-4" />
              {saving ? 'A guardar...' : dirty ? 'Guardar' : 'Guardado'}
            </button>
          </div>
        </div>

        {/* Perfil rápido */}
        <div className="card space-y-3">
          <h2 className="text-sm font-semibold text-gray-300">Perfil</h2>

          {/* Avatar upload */}
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              {page.avatar_url ? (
                <img src={page.avatar_url} alt="Avatar"
                     className="w-16 h-16 rounded-full object-cover ring-2 ring-brand-500/40" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-tagatech flex items-center justify-center text-2xl font-bold text-white">
                  {(page.title || '?')[0].toUpperCase()}
                </div>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-white mb-1">Foto de perfil</p>
              <p className="text-xs text-gray-500 mb-2">JPG, PNG ou WebP · máx 2MB · guarda automaticamente</p>
              <button type="button" disabled={uploadingAvatar}
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3">
                <Camera className="w-3.5 h-3.5" />
                {uploadingAvatar ? 'A carregar...' : 'Alterar foto'}
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*"
                   className="hidden" onChange={handleAvatarUpload} />
          </div>

          <input className="input" placeholder="Título da página (ex: Kizomba Beats AO)"
                 value={page.title || ''}
                 onChange={(e) => { setPage({ ...page, title: e.target.value }); setDirty(true) }} />
          <textarea className="input resize-none" rows={2} placeholder="Bio — descreve quem és..."
                    value={page.bio || ''}
                    onChange={(e) => { setPage({ ...page, bio: e.target.value }); setDirty(true) }} />
        </div>

        {/* Vídeo de apresentação */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-300">Vídeo de apresentação</h2>
            <span className="badge bg-brand-500/20 text-brand-300 text-xs">YouTube</span>
          </div>
          <input className="input" placeholder="https://youtube.com/watch?v=..."
                 value={page.youtube_url || ''}
                 onChange={(e) => { setPage({ ...page, youtube_url: e.target.value }); setDirty(true) }} />
          {page.youtube_url && (
            <input className="input text-sm" placeholder="Legenda do vídeo (opcional)"
                   value={page.youtube_title || ''}
                   onChange={(e) => { setPage({ ...page, youtube_title: e.target.value }); setDirty(true) }} />
          )}
          <p className="text-xs text-gray-500">
            Aparece no topo da página, antes dos links. Ideal para apresentação pessoal.
          </p>
        </div>

        {/* Banner TagaShop — só aparece quando a loja não está ligada */}
        {!profile?.tagashop_api_key && (
          <div className="card border-brand-500/20 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex-shrink-0">
                <Store className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">Liga a tua loja TagaShop</p>
                <p className="text-xs text-gray-400">Mostra produtos automaticamente com o bloco Vitrine.</p>
              </div>
            </div>
            {!showApiInput ? (
              <button
                type="button"
                onClick={() => setShowApiInput(true)}
                className="btn-secondary text-sm w-full"
              >
                Ligar loja
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-gray-400">
                  No TagaShop, vai a <strong className="text-gray-200">Integrações → TagaLinks</strong>, activa e copia a API Key.
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
                    onClick={handleConnectAndAddVitrine}
                    disabled={validating || !apiKeyInput.startsWith('tgl_')}
                    className="btn-primary text-sm flex-1"
                  >
                    {validating ? 'A validar...' : 'Ligar loja'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowApiInput(false); setApiKeyInput('') }}
                    className="btn-ghost text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Links */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-300">
              Links{' '}
              <span className="text-gray-500 font-normal">
                ({items.length}{profile?.plan === 'free' ? '/5' : ''})
              </span>
            </h2>
            <button onClick={() => setShowAddMenu(true)}
                    className="btn-primary text-sm flex items-center gap-1.5 py-1.5 px-3">
              <Plus className="w-4 h-4" /> Adicionar
            </button>
          </div>

          {items.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              <p className="text-3xl mb-2">🔗</p>
              <p className="text-sm">Ainda não tens links. Adiciona o primeiro!</p>
            </div>
          )}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              {items.map((item) => (
                <LinkItemCard key={item.id} item={item} plan={profile?.plan || 'free'} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {preview && (
        <div className="hidden lg:block w-80 flex-shrink-0">
          <PagePreview />
        </div>
      )}

      {showAddMenu && (
        <AddBlockMenu
          onSelect={handleAddBlock}
          onClose={() => setShowAddMenu(false)}
          plan={profile?.plan || 'free'}
          itemCount={items.length}
        />
      )}
    </div>
  )
}
