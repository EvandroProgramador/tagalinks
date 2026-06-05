import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useEditorStore } from '@/store/useEditorStore'
import type { LinkPage, LinkItem } from '@/types'
import toast from 'react-hot-toast'

export function usePage() {
  const [loading, setLoading] = useState(false)
  const { setPage, setItems, setDirty, setSaving } = useEditorStore()

  const loadPage = useCallback(async (profileId: string) => {
    setLoading(true)
    try {
      const { data: page, error } = await supabase
        .from('link_pages').select('*').eq('profile_id', profileId).maybeSingle()
      if (error) throw error

      if (!page) return null

      const { data: items } = await supabase
        .from('link_items').select('*')
        .eq('page_id', page.id).order('position')

      setPage(page as LinkPage)
      setItems((items || []) as LinkItem[])
      return page
    } finally {
      setLoading(false)
    }
  }, [setPage, setItems])

  const createPage = useCallback(async (profileId: string, username: string) => {
    const { data, error } = await supabase
      .from('link_pages')
      .insert({ profile_id: profileId, slug: username, title: '', published: false })
      .select().single()
    if (error) { toast.error('Erro ao criar página'); return null }
    setPage(data as LinkPage)
    setItems([])
    return data
  }, [setPage, setItems])

  const savePage = useCallback(async (pageId: string, updates: Partial<LinkPage>) => {
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('link_pages')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', pageId)
        .select('id')
      if (error) {
        console.error('[savePage] Supabase error:', error.message, '| details:', error.details, '| hint:', error.hint, '| code:', error.code)
        toast.error(`Erro ao guardar: ${error.message}`)
        return false
      }
      if (!data || data.length === 0) {
        console.error('[savePage] No rows updated — RLS blocked or page not found. pageId:', pageId)
        toast.error('Erro ao guardar: sem permissão ou página não encontrada')
        return false
      }
      toast.success('Guardado!')
      setDirty(false)
      return true
    } finally {
      setSaving(false)
    }
  }, [setDirty, setSaving])

  const saveItems = useCallback(async (pageId: string, items: LinkItem[]) => {
    setSaving(true)
    try {
      const { error } = await supabase.from('link_items').upsert(
        items.map((item, i) => ({ ...item, page_id: pageId, position: i })),
        { onConflict: 'id' }
      )
      if (error) { toast.error('Erro ao guardar links'); return false }
      setDirty(false)
      return true
    } finally {
      setSaving(false)
    }
  }, [setDirty, setSaving])

  const addItem = useCallback(async (pageId: string, type: string, position: number) => {
    const defaults: Record<string, Partial<LinkItem>> = {
      link:      { label: 'Novo link', url: 'https://' },
      youtube:   { label: 'Vídeo de apresentação', youtube_url: '' },
      whatsapp:  { label: 'Fala comigo no WhatsApp' },
      social:    { label: 'Instagram', social_network: 'instagram', url: '' },
      header:    { label: 'Título da secção' },
      divider:   { label: '' },
      tagashop:  { label: 'A minha loja TagaShop', url: '' },
      product:   { label: 'Produto TagaShop', url: '' },
      email:     { label: 'Envia-me um e-mail' },
      phone:     { label: 'Liga-me' },
      vitrine: {
        label: 'A minha loja',
        vitrine_title: 'Os meus produtos',
        vitrine_layout: 'list',
        vitrine_max_products: 6,
        vitrine_only_featured: false,
      },
    }
    const { data, error } = await supabase
      .from('link_items')
      .insert({ page_id: pageId, type, position, visible: true, ...(defaults[type] || {}) })
      .select().single()
    if (error) { toast.error('Erro ao adicionar bloco'); return null }
    return data as LinkItem
  }, [])

  const deleteItem = useCallback(async (itemId: string) => {
    const { error } = await supabase.from('link_items').delete().eq('id', itemId)
    if (error) { toast.error('Erro ao remover bloco'); return false }
    return true
  }, [])

  return { loading, loadPage, createPage, savePage, saveItems, addItem, deleteItem }
}
