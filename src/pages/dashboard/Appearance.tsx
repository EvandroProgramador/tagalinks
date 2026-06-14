import { useEffect, useState, type CSSProperties } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePage } from '@/hooks/usePage'
import { useEditorStore } from '@/store/useEditorStore'
import { ColorPicker } from '@/components/ui/ColorPicker'
import { UpgradeGate } from '@/components/ui/UpgradeGate'
import { PagePreview } from '@/components/preview/PagePreview'
import { THEME_PRESETS_META, GRADIENT_PRESETS, GOOGLE_FONTS, computeTheme } from '@/lib/theme'
import { Save, ToggleLeft, ToggleRight, ExternalLink, MessageCircle, Share2 } from 'lucide-react'
import type { LinkPage } from '@/types'

function BtnPreview({ page, plan }: { page: LinkPage; plan: string }) {
  const t = computeTheme(page, plan)
  const radius = t.btnShape
  const shadow = t.btnShadow ? '0 4px 14px rgba(0,0,0,0.3)' : undefined

  function btnStyle(overrideStyle?: string): CSSProperties {
    const s = overrideStyle || t.btnStyle
    const base: CSSProperties = { borderRadius: radius, boxShadow: shadow, transition: 'opacity 0.15s' }
    if (s === 'outline')  return { ...base, background: 'transparent', color: t.primary, border: `1.5px solid ${t.primary}` }
    if (s === 'ghost')    return { ...base, background: 'transparent', color: t.text }
    if (s === 'gradient') return { ...base, background: `linear-gradient(135deg, ${t.primary}, ${t.accent})`, color: '#fff' }
    return { ...base, background: t.primary, color: '#fff' }
  }

  const bgStyle: CSSProperties =
    (page.custom_bg_type === 'gradient' && plan !== 'free' && page.custom_bg_gradient)
      ? { background: page.custom_bg_gradient }
      : { background: t.bg }

  return (
    <div className="rounded-xl overflow-hidden border border-surface-border">
      <div className="px-3 py-2 border-b border-surface-border flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        <span className="text-xs text-gray-600 ml-1">preview</span>
      </div>
      <div className="p-4 space-y-2.5" style={bgStyle}>
        <a className="flex items-center justify-between py-3 px-4 w-full font-medium text-sm"
           style={btnStyle()}>
          <span style={{ fontFamily: t.font }}>O meu link</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </a>
        <a className="flex items-center justify-center gap-2 py-3 px-4 w-full font-medium text-sm"
           style={{ ...btnStyle(), background: '#25D366', color: '#fff', border: 'none' }}>
          <MessageCircle className="w-4 h-4" />
          <span style={{ fontFamily: t.font }}>WhatsApp</span>
        </a>
        <a className="flex items-center justify-center gap-2 py-3 px-4 w-full font-medium text-sm"
           style={btnStyle()}>
          <Share2 className="w-4 h-4" />
          <span style={{ fontFamily: t.font }}>Instagram</span>
        </a>
      </div>
    </div>
  )
}

export default function Appearance() {
  const { user, profile } = useAuth()
  const { loadPage, savePage } = usePage()
  const { page, setPage, saving } = useEditorStore()
  const [changed, setChanged] = useState(false)

  useEffect(() => {
    if (user?.id) loadPage(user.id)
  }, [user?.id])

  function update(fields: Partial<LinkPage>) {
    if (!page) return
    setPage({ ...page, ...fields })
    setChanged(true)
  }

  async function handleSave() {
    if (!page) return
    const ok = await savePage(page.id, {
      theme_preset:         page.theme_preset,
      custom_bg_color:      page.custom_bg_color,
      custom_primary_color: page.custom_primary_color,
      custom_accent_color:  page.custom_accent_color,
      custom_text_color:    page.custom_text_color,
      custom_font:          page.custom_font,
      custom_bg_type:       page.custom_bg_type,
      custom_bg_gradient:   page.custom_bg_gradient,
      custom_btn_style:     page.custom_btn_style,
      custom_btn_shape:     page.custom_btn_shape,
      custom_btn_shadow:    page.custom_btn_shadow,
    })
    if (ok) setChanged(false)
  }

  if (!page) return (
    <div className="relative flex justify-center py-10 overflow-hidden">
      <div className="glow-blob top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-brand-500/20 animate-glow-pulse" />
      <div className="relative w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex gap-6 h-full">
      <div className="flex-1 min-w-0 space-y-6 max-w-2xl stagger">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Aparência</h1>
          <button onClick={handleSave} disabled={!changed || saving}
                  className="btn-primary text-sm flex items-center gap-1.5">
            <Save className="w-4 h-4" />
            {saving ? 'A guardar...' : 'Guardar'}
          </button>
        </div>

        {/* Temas */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-gray-300">Tema</h2>
          <div className="grid grid-cols-3 gap-2">
            {THEME_PRESETS_META.map((t) => {
              const active = page.theme_preset === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => update({ theme_preset: t.id })}
                  className={`relative flex flex-col gap-2 p-3 rounded-xl border text-left transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${
                    active
                      ? 'border-brand-500/70 bg-brand-500/10 shadow-glow-soft'
                      : 'border-surface-border bg-surface-elevated hover:border-gray-500'
                  }`}
                >
                  {/* Swatch preview */}
                  <div className="flex gap-1 items-center">
                    <span className="w-7 h-7 rounded-lg flex-shrink-0 border border-white/10"
                          style={{ background: t.bg }} />
                    <span className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ background: t.primary }} />
                    <span className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ background: t.accent }} />
                  </div>
                  <span className={`text-xs font-medium ${active ? 'text-brand-300' : 'text-gray-400'}`}>
                    {t.name}
                  </span>
                  {active && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Fundo */}
        <UpgradeGate requiredPlan="creator" currentPlan={profile?.plan || 'free'} featureName="Fundo personalizado">
          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-gray-300">Tipo de fundo</h2>

            <div className="flex gap-2">
              {(['solid', 'gradient'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => update({ custom_bg_type: type })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${
                    (page.custom_bg_type || 'solid') === type
                      ? 'border-brand-500/70 bg-brand-500/10 text-brand-300'
                      : 'border-surface-border bg-surface-elevated text-gray-400 hover:text-white'
                  }`}
                >
                  {type === 'solid' ? 'Cor sólida' : 'Gradiente'}
                </button>
              ))}
            </div>

            {(page.custom_bg_type || 'solid') === 'solid' ? (
              <ColorPicker
                label="Cor de fundo"
                value={page.custom_bg_color || '#0A0A0F'}
                onChange={(c) => update({ custom_bg_color: c })}
              />
            ) : (
              <div className="space-y-3">
                <label className="label">Gradiente</label>
                <div className="grid grid-cols-3 gap-2">
                  {GRADIENT_PRESETS.map((g) => (
                    <button
                      key={g}
                      onClick={() => update({ custom_bg_gradient: g })}
                      className={`h-12 rounded-xl border-2 transition-all duration-200 hover:scale-105 active:scale-95 ${
                        page.custom_bg_gradient === g
                          ? 'border-brand-400 scale-105 shadow-glow-soft'
                          : 'border-surface-border hover:border-gray-500'
                      }`}
                      style={{ background: g }}
                    />
                  ))}
                </div>
                <input
                  className="input font-mono text-xs"
                  placeholder="linear-gradient(135deg, #000 0%, #111 100%)"
                  value={page.custom_bg_gradient || ''}
                  onChange={(e) => update({ custom_bg_gradient: e.target.value })}
                />
              </div>
            )}
          </div>
        </UpgradeGate>

        {/* Cores */}
        <UpgradeGate requiredPlan="creator" currentPlan={profile?.plan || 'free'} featureName="Cores personalizadas">
          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-gray-300">Cores</h2>
            <BtnPreview page={page} plan={profile?.plan || 'free'} />
            <ColorPicker label="Cor primária (botões)"
              value={page.custom_primary_color || '#7C3AED'}
              onChange={(c) => update({ custom_primary_color: c })} />
            <ColorPicker label="Cor de destaque"
              value={page.custom_accent_color || '#06B6D4'}
              onChange={(c) => update({ custom_accent_color: c })} />
            <ColorPicker label="Cor do texto"
              value={page.custom_text_color || '#F8F8FF'}
              onChange={(c) => update({ custom_text_color: c })} />
          </div>
        </UpgradeGate>

        {/* Botões */}
        <UpgradeGate requiredPlan="creator" currentPlan={profile?.plan || 'free'} featureName="Personalização de botões">
          <div className="card space-y-5">
            <h2 className="text-sm font-semibold text-gray-300">Botões</h2>

            <BtnPreview page={page} plan={profile?.plan || 'free'} />

            {/* Forma */}
            <div className="space-y-2">
              <label className="label">Forma</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: 'rounded', label: 'Arredondado', radius: '0.75rem' },
                  { id: 'pill',    label: 'Pílula',      radius: '9999px'  },
                  { id: 'square',  label: 'Quadrado',    radius: '0.375rem'},
                ] as const).map(({ id, label, radius }) => {
                  const active = (page.custom_btn_shape || 'rounded') === id
                  return (
                    <button key={id} onClick={() => update({ custom_btn_shape: id })}
                            className={`py-2 px-3 border text-sm transition-all ${
                              active ? 'border-brand-500/70 bg-brand-500/10 text-brand-300'
                                     : 'border-surface-border bg-surface-elevated text-gray-400 hover:text-white'
                            }`}
                            style={{ borderRadius: radius }}>
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Estilo padrão */}
            <div className="space-y-2">
              <label className="label">Estilo padrão</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { id: 'solid',    label: 'Sólido'   },
                  { id: 'gradient', label: 'Gradiente'},
                  { id: 'outline',  label: 'Contorno' },
                  { id: 'ghost',    label: 'Ghost'    },
                ] as const).map(({ id, label }) => {
                  const active = (page.custom_btn_style || 'solid') === id
                  return (
                    <button key={id} onClick={() => update({ custom_btn_style: id })}
                            className={`py-2.5 px-3 rounded-xl border text-sm text-left transition-all ${
                              active ? 'border-brand-500/70 bg-brand-500/10 text-brand-300'
                                     : 'border-surface-border bg-surface-elevated text-gray-400 hover:text-white'
                            }`}>
                      <span className="block font-medium">{label}</span>
                      <span className="block text-xs opacity-60 mt-0.5">
                        {id === 'solid'    && 'Cor sólida com texto claro'}
                        {id === 'gradient' && 'Gradiente primária→destaque'}
                        {id === 'outline'  && 'Transparente com borda'}
                        {id === 'ghost'    && 'Sem fundo, texto simples'}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Sombra */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Sombra nos botões</p>
                <p className="text-xs text-gray-500 mt-0.5">Adiciona profundidade visual</p>
              </div>
              <button onClick={() => update({ custom_btn_shadow: !page.custom_btn_shadow })}
                      className="text-brand-400 hover:text-brand-300 transition-colors">
                {page.custom_btn_shadow
                  ? <ToggleRight className="w-8 h-8" />
                  : <ToggleLeft  className="w-8 h-8 text-gray-600" />}
              </button>
            </div>
          </div>
        </UpgradeGate>

        {/* Fonte */}
        <UpgradeGate requiredPlan="creator" currentPlan={profile?.plan || 'free'} featureName="Fonte personalizada">
          <div className="card space-y-3">
            <h2 className="text-sm font-semibold text-gray-300">Fonte</h2>
            <BtnPreview page={page} plan={profile?.plan || 'free'} />
            <div className="grid grid-cols-2 gap-2">
              {GOOGLE_FONTS.map((f) => (
                <button
                  key={f}
                  onClick={() => update({ custom_font: f })}
                  className={`py-2.5 px-3 rounded-xl text-sm border text-left transition-all ${
                    (page.custom_font || 'Inter') === f
                      ? 'border-brand-500/70 bg-brand-500/10 text-brand-300'
                      : 'border-surface-border bg-surface-elevated text-gray-400 hover:text-white'
                  }`}
                  style={{ fontFamily: f }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </UpgradeGate>

      </div>

      {/* Preview ao vivo */}
      <div className="hidden lg:block w-72 flex-shrink-0">
        <PagePreview />
      </div>
    </div>
  )
}
