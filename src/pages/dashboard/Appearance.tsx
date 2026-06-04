import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePage } from '@/hooks/usePage'
import { useEditorStore } from '@/store/useEditorStore'
import { ColorPicker } from '@/components/ui/ColorPicker'
import { UpgradeGate } from '@/components/ui/UpgradeGate'
import { THEME_PRESETS, GOOGLE_FONTS } from '@/lib/theme'
import { Save } from 'lucide-react'

export default function Appearance() {
  const { user, profile } = useAuth()
  const { loadPage, savePage } = usePage()
  const { page, setPage, dirty } = useEditorStore()

  useEffect(() => {
    if (user?.id) loadPage(user.id)
  }, [user?.id])

  async function handleSave() {
    if (!page) return
    await savePage(page.id, {
      theme_preset:        page.theme_preset,
      custom_bg_color:     page.custom_bg_color,
      custom_primary_color: page.custom_primary_color,
      custom_accent_color: page.custom_accent_color,
      custom_text_color:   page.custom_text_color,
      custom_font:         page.custom_font,
      custom_bg_type:      page.custom_bg_type,
      custom_bg_gradient:  page.custom_bg_gradient,
    })
  }

  if (!page) return (
    <div className="flex justify-center py-10">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Aparência</h1>
        <button onClick={handleSave} disabled={!dirty} className="btn-primary text-sm flex items-center gap-1.5">
          <Save className="w-4 h-4" /> Guardar
        </button>
      </div>

      {/* Tema base */}
      <div className="card space-y-3">
        <h2 className="text-sm font-semibold text-gray-300">Tema</h2>
        <div className="grid grid-cols-3 gap-2">
          {THEME_PRESETS.map((t) => (
            <button
              key={t}
              onClick={() => setPage({ ...page, theme_preset: t })}
              className={`py-2 px-3 rounded-xl text-sm font-medium capitalize transition-all ${
                page.theme_preset === t
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/50'
                  : 'bg-surface-elevated text-gray-400 hover:text-white border border-surface-border'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Personalização (planos pagos) */}
      <UpgradeGate requiredPlan="creator" currentPlan={profile?.plan || 'free'} featureName="Personalização de cores">
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-gray-300">Cores personalizadas</h2>

          <ColorPicker
            label="Cor de fundo"
            value={page.custom_bg_color || '#0A0A0F'}
            onChange={(c) => setPage({ ...page, custom_bg_color: c })}
          />
          <ColorPicker
            label="Cor primária"
            value={page.custom_primary_color || '#7C3AED'}
            onChange={(c) => setPage({ ...page, custom_primary_color: c })}
          />
          <ColorPicker
            label="Cor de destaque"
            value={page.custom_accent_color || '#06B6D4'}
            onChange={(c) => setPage({ ...page, custom_accent_color: c })}
          />
          <ColorPicker
            label="Cor do texto"
            value={page.custom_text_color || '#F8F8FF'}
            onChange={(c) => setPage({ ...page, custom_text_color: c })}
          />

          <div>
            <label className="label">Fonte</label>
            <select
              className="input"
              value={page.custom_font || 'Inter'}
              onChange={(e) => setPage({ ...page, custom_font: e.target.value })}
            >
              {GOOGLE_FONTS.map((f) => (
                <option key={f} value={f} className="bg-surface-elevated">{f}</option>
              ))}
            </select>
          </div>
        </div>
      </UpgradeGate>
    </div>
  )
}
