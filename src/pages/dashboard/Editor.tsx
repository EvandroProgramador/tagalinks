import { useEffect, useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { Plus, Eye, EyeOff, Save, Globe, ExternalLink } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePage } from '@/hooks/usePage'
import { useEditorStore } from '@/store/useEditorStore'
import { LinkItemCard } from '@/components/editor/LinkItemCard'
import { AddBlockMenu } from '@/components/editor/AddBlockMenu'
import { PagePreview } from '@/components/preview/PagePreview'
import toast from 'react-hot-toast'

export default function Editor() {
  const { user, profile }  = useAuth()
  const { loadPage, savePage, saveItems, addItem } = usePage()
  const { page, items, dirty, preview, saving, setItems, setPage, setPreview } = useEditorStore()
  const [showAddMenu, setShowAddMenu] = useState(false)

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

  async function handleAddBlock(type: string) {
    if (!page) return
    setShowAddMenu(false)
    if (profile?.plan === 'free' && items.length >= 5) {
      toast.error('Plano gratuito: máximo 5 links. Faz upgrade para Creator!')
      return
    }
    const newItem = await addItem(page.id, type, items.length)
    if (newItem) setItems([...items, newItem])
  }

  function handleDragEnd(event: any) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = items.findIndex((i) => i.id === active.id)
    const newIdx = items.findIndex((i) => i.id === over.id)
    setItems(arrayMove(items, oldIdx, newIdx))
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
          <input className="input" placeholder="Título da página (ex: Kizomba Beats AO)"
                 value={page.title || ''}
                 onChange={(e) => setPage({ ...page, title: e.target.value })} />
          <textarea className="input resize-none" rows={2} placeholder="Bio — descreve quem és..."
                    value={page.bio || ''}
                    onChange={(e) => setPage({ ...page, bio: e.target.value })} />
        </div>

        {/* Vídeo de apresentação */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-300">Vídeo de apresentação</h2>
            <span className="badge bg-brand-500/20 text-brand-300 text-xs">YouTube</span>
          </div>
          <input className="input" placeholder="https://youtube.com/watch?v=..."
                 value={page.youtube_url || ''}
                 onChange={(e) => setPage({ ...page, youtube_url: e.target.value })} />
          {page.youtube_url && (
            <input className="input text-sm" placeholder="Legenda do vídeo (opcional)"
                   value={page.youtube_title || ''}
                   onChange={(e) => setPage({ ...page, youtube_title: e.target.value })} />
          )}
          <p className="text-xs text-gray-500">
            Aparece no topo da página, antes dos links. Ideal para apresentação pessoal.
          </p>
        </div>

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
