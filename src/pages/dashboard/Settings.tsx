import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/useAuthStore'
import { supabase } from '@/lib/supabase'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'

interface ProfileForm {
  name:    string
  phone:   string
  username: string
}

export default function Settings() {
  const { user, profile } = useAuth()
  const { fetchProfile }  = useAuthStore()
  const [saving, setSaving] = useState(false)

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
