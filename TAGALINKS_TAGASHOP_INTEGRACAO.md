# TAGALINKS × TAGASHOP — Instrução de Integração
# Implementa o lado TagaLinks da integração nativa com o TagaShop

> Executa cada passo na ordem indicada. Não perguntes nada — implementa tudo de forma autónoma.
> Nunca parares a meio de um passo — completa cada um integralmente antes de avançar.
> Antes de criar qualquer ficheiro, verifica sempre se já existe — usa `str_replace` para editar,
> e só cria com `create` quando o ficheiro ainda não existe.

---

## CONTEXTO

O TagaShop vai expor uma API Key (`tgl_...`) e uma Edge Function `tagalinks-catalog`
que devolve o catálogo público da loja. O TagaLinks vai:
1. Guardar essa chave + slug da loja em `integrations` (tabela já existente)
2. Chamar `tagalinks-catalog` para validar a chave e buscar produtos
3. Expor um novo tipo de bloco **`vitrine`** no editor — um grid de produtos
4. Renderizar esse bloco na página pública com badges, preços com desconto e destaque

---

## PASSO 1 — Migração SQL

Executa no SQL Editor do Supabase **em dois blocos separados** (o ADD VALUE tem de ser
executado antes de qualquer código que use o novo valor):

**Bloco 1 — adicionar o novo link_item_type (executar sozinho):**
```sql
ALTER TYPE link_item_type ADD VALUE IF NOT EXISTS 'vitrine';
```

**Bloco 2 — executar depois do bloco 1:**
```sql
-- Campos novos em link_items para suportar o bloco vitrine
ALTER TABLE public.link_items
  ADD COLUMN IF NOT EXISTS vitrine_title         TEXT,
  ADD COLUMN IF NOT EXISTS vitrine_layout        TEXT DEFAULT 'list',
  ADD COLUMN IF NOT EXISTS vitrine_max_products  INTEGER DEFAULT 6,
  ADD COLUMN IF NOT EXISTS vitrine_only_featured BOOLEAN DEFAULT FALSE;

-- Campos novos em profiles — guardar a chave e o slug da loja ligada
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tagashop_api_key TEXT,
  ADD COLUMN IF NOT EXISTS tagashop_store_name TEXT;

-- Nota: tagashop_slug já existe em profiles — não recriar
```

---

## PASSO 2 — Tipos TypeScript

No ficheiro `src/types/index.ts`:

**2.1 — Actualizar `LinkItemType`:**

Localiza a linha:
```typescript
export type LinkItemType = 'link' | 'product' | 'whatsapp' | 'social' | 'divider' | 'header' | 'youtube' | 'email' | 'phone'
```
Substitui por:
```typescript
export type LinkItemType = 'link' | 'product' | 'whatsapp' | 'social' | 'divider' | 'header' | 'youtube' | 'email' | 'phone' | 'vitrine'
```

**2.2 — Actualizar a interface `Profile`:**

Na interface `Profile`, o campo `tagashop_slug` já existe. Adiciona os campos novos
**a seguir a `tagashop_slug`**:

```typescript
  tagashop_api_key?:    string | null
  tagashop_store_name?: string | null
```

**2.3 — Actualizar a interface `LinkItem`:**

Na interface `LinkItem`, adiciona **a seguir ao campo `thumbnail_url`**:

```typescript
  // Campos do bloco Vitrine
  vitrine_title?:         string
  vitrine_layout?:        'list' | 'grid' | 'carousel'
  vitrine_max_products?:  number
  vitrine_only_featured?: boolean
```

**2.4 — Adicionar tipo `TagaShopProduct`** (no final do ficheiro, antes do `type uuid`):

```typescript
export interface TagaShopProduct {
  id:             string
  title:          string
  description:    string | null
  price:          number
  original_price: number | null
  cover_image:    string | null
  product_type:   string
  category:       string | null
  sales:          number
  is_featured:    boolean
  product_url:    string
}

export interface TagaShopCatalog {
  seller: {
    store_name:        string
    store_slug:        string
    store_description: string | null
    store_logo:        string | null
    store_banner:      string | null
    phone:             string
  }
  products:       TagaShopProduct[]
  products_count: number
  generated_at:   string
}
```

---

## PASSO 3 — Hook `useTagaShop`

Cria `src/hooks/useTagaShop.ts`:

```typescript
import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import type { TagaShopCatalog } from '@/types'

const TAGASHOP_API_URL = import.meta.env.VITE_TAGASHOP_API_URL || 'https://tagashop.site'

export function useTagaShop(profileId?: string) {
  const [validating, setValidating] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [catalog, setCatalog] = useState<TagaShopCatalog | null>(null)

  /**
   * Valida a api_key chamando a Edge Function do TagaShop.
   * Se válida, guarda api_key + store_slug + store_name no perfil.
   */
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

      // Guardar no perfil
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

  /**
   * Busca o catálogo actualizado usando a chave guardada.
   * Usado para refresh manual e sincronização.
   */
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

  /**
   * Remove a ligação à loja.
   */
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
```

---

## PASSO 4 — Secção TagaShop na página de Settings

No ficheiro `src/pages/dashboard/Settings.tsx`, adiciona a secção de integração TagaShop.

**4.1 — Adicionar imports** (junto aos imports existentes):
```typescript
import { Store, CheckCircle2, XCircle, RefreshCw, Link2 } from 'lucide-react'
import { useTagaShop } from '@/hooks/useTagaShop'
```

**4.2 — Adicionar estado e hook** dentro do componente `Settings`, após as declarações
de estado existentes (`saving`, `avatarFile`, etc.):

```typescript
const { validating, syncing, connectStore, fetchCatalog, disconnectStore } = useTagaShop(profile?.id)
const [apiKeyInput, setApiKeyInput]       = useState('')
const [showApiKeyInput, setShowApiKeyInput] = useState(false)
const [storeConnected, setStoreConnected]   = useState(!!profile?.tagashop_api_key)

// Sincronizar estado com o perfil
useEffect(() => {
  setStoreConnected(!!profile?.tagashop_api_key)
}, [profile?.tagashop_api_key])

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
```

Nota: a função `refreshProfile` já existe no componente — reutiliza-a. Se não existir
com esse nome, usa o padrão do projecto para re-buscar o perfil:
```typescript
async function refreshProfile() {
  if (!profile?.id) return
  const { data } = await supabase.from('profiles').select('*').eq('id', profile.id).single()
  if (data) setProfile(data)
}
```

**4.3 — Adicionar o bloco JSX da secção TagaShop** dentro do `<form>` do Settings,
**após a secção de "Redes Sociais" ou qualquer outra secção já existente, antes do
botão de guardar final**:

```tsx
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
      {/* Loja ligada */}
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
```

---

## PASSO 5 — Variável de ambiente

No ficheiro `.env.example`, adiciona:
```env
VITE_TAGASHOP_API_URL=https://tagashop.site
```

No ficheiro `.env`, adiciona (se ainda não existir):
```env
VITE_TAGASHOP_API_URL=https://tagashop.site
```

---

## PASSO 6 — Bloco "Vitrine" no editor

No ficheiro `src/hooks/usePage.ts`, na constante `defaults` dentro de `addItem`,
adiciona a entrada para o novo tipo **antes do fecho de `}`**:

```typescript
      vitrine: {
        label: 'A minha loja',
        vitrine_title: 'Os meus produtos',
        vitrine_layout: 'list',
        vitrine_max_products: 6,
        vitrine_only_featured: false,
      },
```

---

## PASSO 7 — Componente editor do bloco Vitrine

Cria `src/components/editor/VitrineBlockEditor.tsx`:

```tsx
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
  { value: 'list',      label: 'Lista vertical' },
  { value: 'grid',      label: 'Grid 2 colunas' },
  { value: 'carousel',  label: 'Carrossel' },
]

export function VitrineBlockEditor({ item, onChange }: Props) {
  const { profile } = useAuthStore()
  const { syncing, catalog, fetchCatalog } = useTagaShop()
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
```

---

## PASSO 8 — Integrar o VitrineBlockEditor no LinkItemCard do editor

No ficheiro onde está definido o componente que renderiza cada bloco no editor
(deve ser `src/components/editor/LinkItemCard.tsx` ou semelhante), dentro da zona
onde são mostrados os campos de configuração de cada tipo de item, adiciona o case
para `vitrine`:

Localiza o padrão que distingue os tipos (ex: `item.type === 'youtube'`, `item.type === 'product'`)
e adiciona:

```tsx
import { VitrineBlockEditor } from '@/components/editor/VitrineBlockEditor'

// ... dentro do render de cada item, onde são mostrados os campos específicos:
{item.type === 'vitrine' && (
  <VitrineBlockEditor
    item={item}
    onChange={(updates) => {
      // Aplica as actualizações ao item — usa o padrão já existente no ficheiro
      // para actualizar um item na lista (normalmente via setItems ou handleUpdate)
      handleUpdate(item.id, updates)
    }}
  />
)}
```

Nota: o nome da função de actualização (`handleUpdate`, `onUpdate`, `onChange`)
varia conforme o que já existe no ficheiro — adapta ao padrão existente.

Também adiciona `'vitrine'` ao array ou switch que define o ícone/label do tipo de bloco,
usando o ícone `Store` do `lucide-react`:

```typescript
vitrine: { icon: Store, label: 'Vitrine de Produtos' },
```

---

## PASSO 9 — Adicionar "Vitrine" ao menu de adicionar bloco

No ficheiro `src/components/editor/AddBlockMenu.tsx` (ou onde está definido o menu
que lista os tipos de blocos que se podem adicionar), adiciona a entrada para `vitrine`
**na secção de blocos especiais ou integrações**:

```tsx
{
  type: 'vitrine',
  icon: Store,
  label: 'Vitrine',
  description: 'Grid de produtos do TagaShop',
  badge: 'Creator',           // só disponível no plano Creator+
  requiresPlan: 'creator',
}
```

Adapta ao formato exato que os outros blocos usam nesse ficheiro.
Se houver uma verificação de plano (ex: `profile?.plan === 'free'`), aplica a mesma
lógica: bloco `vitrine` requer plano `creator` ou superior.

---

## PASSO 10 — Renderização pública do bloco Vitrine

No ficheiro `src/components/preview/PublicPage.tsx`, dentro do componente `LinkBlock`,
adiciona o case para o tipo `vitrine`.

**10.1 — Importar o tipo**:

No topo do ficheiro, adiciona ao import de tipos:
```typescript
import type { TagaShopProduct } from '@/types'
```

**10.2 — Adicionar helper de badge de tipo** (coloca antes da função `LinkBlock`):

```typescript
const PRODUCT_TYPE_BADGES: Record<string, string> = {
  course:     '🎓 Curso',
  ebook:      '📄 E-book',
  service:    '🛠️ Serviço',
  beat:       '🎵 Beat',
  album:      '🎶 Álbum',
  preset:     '🎨 Preset',
  asset_pack: '📦 Pack',
  ticket:     '🎟️ Evento',
}
```

**10.3 — Adicionar componente `VitrineBlock`** (coloca antes da função `LinkBlock`):

```tsx
function VitrineBlock({
  item, theme, plan
}: { item: LinkItem; theme: any; plan: string }) {
  const [products, setProducts] = useState<TagaShopProduct[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(false)

  const TAGASHOP_URL = 'https://tagashop.site'

  // Buscar catálogo directamente do TagaShop via slug público
  // (a página pública não tem acesso à api_key — usa o slug)
  useEffect(() => {
    // O slug da loja está guardado em item.url (preenchido na sync)
    // ou podemos inferir do item.label se necessário.
    // A abordagem mais limpa: guardar os produtos em cache no próprio link_item.
    // Para esta implementação, os produtos são buscados via API pública do TagaShop.
    const storeSlug = item.url  // url do item vitrine = slug da loja
    if (!storeSlug) { setLoading(false); return }

    fetch(`${TAGASHOP_URL}/api/store/${storeSlug}/products`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data: TagaShopProduct[]) => {
        let filtered = data.filter((p: TagaShopProduct) => {
          if (item.vitrine_only_featured) return p.is_featured
          return true
        })
        filtered = filtered
          .sort((a, b) => {
            if (a.is_featured && !b.is_featured) return -1
            if (!a.is_featured && b.is_featured) return 1
            return b.sales - a.sales
          })
          .slice(0, item.vitrine_max_products ?? 6)
        setProducts(filtered)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [item.url, item.vitrine_only_featured, item.vitrine_max_products])

  const title = item.vitrine_title || item.label || 'Produtos'
  const layout = item.vitrine_layout || 'list'

  if (loading) {
    return (
      <div className="rounded-2xl py-6 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mx-auto"
             style={{ borderColor: theme.primary, borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (error || products.length === 0) return null

  return (
    <div className="space-y-3">
      {/* Título */}
      <p className="text-sm font-semibold text-center"
         style={{ color: theme.text }}>{title}</p>

      {/* Grid ou lista */}
      <div className={
        layout === 'grid'
          ? 'grid grid-cols-2 gap-2.5'
          : 'space-y-2'
      }>
        {products.map((product) => (
          <a
            key={product.id}
            href={product.product_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`block rounded-xl overflow-hidden transition-opacity hover:opacity-90 ${
              layout === 'grid' ? '' : 'flex items-center gap-3'
            }`}
            style={{ background: 'rgba(255,255,255,0.07)', border: `0.5px solid ${theme.border}` }}
          >
            {/* Imagem */}
            {product.cover_image && (
              <div className={layout === 'grid' ? 'relative' : 'flex-shrink-0'}>
                <img
                  src={product.cover_image}
                  alt={product.title}
                  className={layout === 'grid'
                    ? 'w-full aspect-square object-cover'
                    : 'w-14 h-14 object-cover'}
                />
                {/* Badge destaque */}
                {product.is_featured && layout === 'grid' && (
                  <span className="absolute top-1.5 left-1.5 text-xs px-1.5 py-0.5 rounded-full
                                   bg-yellow-500/90 text-yellow-900 font-medium">
                    ⭐ Destaque
                  </span>
                )}
              </div>
            )}

            {/* Info */}
            <div className={`p-2.5 ${layout === 'grid' ? '' : 'flex-1 min-w-0'}`}>
              {/* Badge tipo */}
              {PRODUCT_TYPE_BADGES[product.product_type] && (
                <span className="text-xs opacity-60 block mb-0.5"
                      style={{ color: theme.subtext }}>
                  {PRODUCT_TYPE_BADGES[product.product_type]}
                </span>
              )}

              <p className={`font-medium text-sm ${layout === 'grid' ? 'line-clamp-2' : 'truncate'}`}
                 style={{ color: theme.text }}>
                {product.title}
              </p>

              {/* Preço + desconto */}
              <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
                <span className="text-sm font-semibold" style={{ color: theme.primary }}>
                  {new Intl.NumberFormat('pt-PT').format(product.price)} Kz
                </span>
                {product.original_price && product.original_price > product.price && (
                  <>
                    <span className="text-xs line-through opacity-50" style={{ color: theme.subtext }}>
                      {new Intl.NumberFormat('pt-PT').format(product.original_price)} Kz
                    </span>
                    <span className="text-xs font-medium px-1 rounded"
                          style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>
                      -{Math.round((1 - product.price / product.original_price) * 100)}%
                    </span>
                  </>
                )}
              </div>

              {/* Badge mais vendido */}
              {product.sales >= 10 && !product.is_featured && (
                <span className="inline-block text-xs mt-1 opacity-70"
                      style={{ color: theme.subtext }}>
                  🔥 Mais vendido
                </span>
              )}
            </div>
          </a>
        ))}
      </div>

      {/* CTA ver loja completa */}
      {item.url && (
        <a
          href={`https://tagashop.site/store/${item.url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-xs py-2 rounded-xl transition-opacity hover:opacity-80"
          style={{ color: theme.primary, border: `0.5px solid ${theme.border}` }}
        >
          Ver loja completa →
        </a>
      )}
    </div>
  )
}
```

**10.4 — Adicionar o case `vitrine` dentro de `LinkBlock`**, imediatamente antes do
`return` final do componente (onde estão os outros `if (item.type === '...')`):

```tsx
  // Bloco Vitrine
  if (item.type === 'vitrine') {
    return <VitrineBlock item={item} theme={theme} plan={plan} />
  }
```

**10.5 — Adicionar o `useState` ao import de React** no topo do ficheiro
(se ainda não estiver importado):

```typescript
import { useEffect, useState, useRef } from 'react'
```

---

## PASSO 11 — Sync do slug no bloco Vitrine ao guardar

No ficheiro `src/hooks/usePage.ts`, na função `addItem`, o default para `vitrine`
deve preencher `url` com o slug da loja. Como o hook não tem acesso directo ao perfil,
o componente que chama `addItem` deve injectar o slug.

No ficheiro `src/pages/dashboard/Editor.tsx`, na função `handleAddBlock`,
após criar o item do tipo `vitrine`, actualiza o `url` com o slug da loja:

```typescript
async function handleAddBlock(type: string) {
  if (!page) return
  setShowAddMenu(false)
  if (profile?.plan === 'free' && items.length >= 5) {
    toast.error('Plano gratuito: máximo 5 links. Faz upgrade para Creator!')
    return
  }
  // Bloco vitrine requer plano creator
  if (type === 'vitrine' && profile?.plan === 'free') {
    toast.error('O bloco Vitrine requer plano Creator. Faz upgrade!')
    return
  }
  const newItem = await addItem(page.id, type, items.length)
  if (newItem) {
    // Para o bloco vitrine, preencher o url com o slug da loja ligada
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
```

Adiciona o import do supabase se não existir:
```typescript
import { supabase } from '@/lib/supabase'
```

---

## RESUMO DO QUE FOI ADICIONADO

| Ficheiro | O que muda |
|---|---|
| SQL (Supabase) — Bloco 1 | `ALTER TYPE link_item_type ADD VALUE 'vitrine'` |
| SQL (Supabase) — Bloco 2 | Colunas `vitrine_*` em `link_items`; `tagashop_api_key`, `tagashop_store_name` em `profiles` |
| `src/types/index.ts` | `vitrine` em `LinkItemType`; campos `vitrine_*` em `LinkItem`; `tagashop_api_key/store_name` em `Profile`; `TagaShopProduct`, `TagaShopCatalog` |
| `src/hooks/useTagaShop.ts` | Hook novo — connect, fetchCatalog, disconnect |
| `src/pages/dashboard/Settings.tsx` | Secção de integração TagaShop com campo de api_key |
| `src/components/editor/VitrineBlockEditor.tsx` | Componente de configuração do bloco no editor |
| `src/components/editor/LinkItemCard.tsx` | Case `vitrine` no editor de blocos |
| `src/components/editor/AddBlockMenu.tsx` | Entrada "Vitrine" no menu de blocos |
| `src/components/preview/PublicPage.tsx` | `VitrineBlock` + case `vitrine` em `LinkBlock` |
| `src/pages/dashboard/Editor.tsx` | Restrição de plano + preenchimento de `url` com slug |
| `.env` / `.env.example` | `VITE_TAGASHOP_API_URL` |

---

## NOTAS TÉCNICAS IMPORTANTES

- **Bloco 1 do SQL deve ser executado sozinho** — o PostgreSQL não permite usar um valor
  de enum recém adicionado na mesma transação. Executa o `ADD VALUE` sozinho, confirma,
  e só depois executa o Bloco 2.
- **A página pública não usa a api_key** — busca os dados via API pública do TagaShop
  (`/api/store/{slug}/products`). A api_key só é usada no painel de Settings para
  validar a ligação inicial.
- **O campo `url` do link_item vitrine guarda o slug da loja** — este é o identificador
  usado na página pública para saber de qual loja buscar os produtos.
- **Threshold "Mais vendido"**: definido como `sales >= 10` — ajusta conforme necessário.
- **Plano Creator**: o bloco vitrine está bloqueado para o plano gratuito, consistente
  com a tabela de planos do projecto (`Creator` inclui "TagaShop embutido").
