import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import type { TagaShopCatalog } from '@/types'

const TAGASHOP_API_URL = import.meta.env.VITE_TAGASHOP_API_URL || 'https://tagashop.site'

export function useTagaShop(profileId?: string) {
  const [validating, setValidating] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [catalog, setCatalog] = useState<TagaShopCatalog | null>(null)

  const connectStore = useCallback(async (apiKey: string): Promise<boolean> => {
    if (!profileId || !apiKey.trim()) return false
    setValidating(true)
    try {
      const res = await fetch(`${TAGASHOP_API_URL}/functions/v1/tagalinks-catalog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey.trim() }),
      })
      const data: TagaShopCatalog & { error?: string } = await res.json()

      if (!res.ok || data.error) {
        toast.error(
          data.error === 'invalid_api_key'
            ? 'Chave inválida. Confirma a chave no TagaShop.'
            : 'Erro ao ligar à loja. Tenta novamente.',
        )
        return false
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          tagashop_api_key:    apiKey.trim(),
          tagashop_slug:       data.seller.store_slug,
          tagashop_store_name: data.seller.store_name,
        })
        .eq('id', profileId)

      if (error) { toast.error('Erro ao guardar configuração'); return false }

      setCatalog(data)
      toast.success(`Loja "${data.seller.store_name}" ligada com sucesso!`)
      return true
    } catch {
      toast.error('Não foi possível alcançar o TagaShop. Verifica a ligação.')
      return false
    } finally {
      setValidating(false)
    }
  }, [profileId])

  const fetchCatalog = useCallback(async (apiKey: string): Promise<TagaShopCatalog | null> => {
    if (!apiKey) return null
    setSyncing(true)
    try {
      const res = await fetch(`${TAGASHOP_API_URL}/functions/v1/tagalinks-catalog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey }),
      })
      const data: TagaShopCatalog & { error?: string } = await res.json()
      if (data.error) return null
      setCatalog(data)
      return data
    } catch {
      return null
    } finally {
      setSyncing(false)
    }
  }, [])

  const disconnectStore = useCallback(async (): Promise<boolean> => {
    if (!profileId) return false
    const { error } = await supabase
      .from('profiles')
      .update({
        tagashop_api_key:    null,
        tagashop_slug:       null,
        tagashop_store_name: null,
      })
      .eq('id', profileId)
    if (error) { toast.error('Erro ao desligar loja'); return false }
    setCatalog(null)
    toast.success('Loja desligada.')
    return true
  }, [profileId])

  return { validating, syncing, catalog, connectStore, fetchCatalog, disconnectStore }
}
