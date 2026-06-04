import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { PublicPage } from '@/components/preview/PublicPage'
import type { LinkPage, LinkItem } from '@/types'

export default function UserPage() {
  const { username } = useParams<{ username: string }>()
  const [page,     setPage]     = useState<LinkPage | null>(null)
  const [items,    setItems]    = useState<LinkItem[]>([])
  const [plan,     setPlan]     = useState('free')
  const [loading,  setLoading]  = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      if (!username) return

      const { data: pageData } = await supabase
        .from('link_pages').select('*')
        .eq('slug', username).eq('published', true).maybeSingle()

      if (!pageData) { setNotFound(true); setLoading(false); return }

      const { data: itemsData } = await supabase
        .from('link_items').select('*')
        .eq('page_id', pageData.id).order('position')

      const { data: profile } = await supabase
        .from('profiles').select('plan').eq('id', pageData.profile_id).maybeSingle()

      setPage(pageData as LinkPage)
      setItems((itemsData || []) as LinkItem[])
      setPlan(profile?.plan || 'free')
      setLoading(false)
    }
    load()
  }, [username])

  if (loading) return (
    <div className="min-h-screen bg-surface-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen bg-surface-bg flex items-center justify-center text-center p-4">
      <div>
        <p className="text-4xl mb-4">🔗</p>
        <h1 className="text-xl font-bold text-white mb-2">Página não encontrada</h1>
        <p className="text-gray-400 text-sm">O link <strong>tagalinks.ao/{username}</strong> não existe.</p>
        <a href="/" className="inline-block mt-6 btn-primary px-6 py-2">
          Criar a minha página
        </a>
      </div>
    </div>
  )

  return <PublicPage page={page!} items={items} plan={plan} />
}
