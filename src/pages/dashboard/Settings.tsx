import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/useAuthStore'
import { supabase } from '@/lib/supabase'
import { Save, KeyRound, Eye, EyeOff, Camera } from 'lucide-react'
import toast from 'react-hot-toast'

interface ProfileForm {
  name:    string
  phone:   string
  username: string
}

interface PasswordForm {
  current:  string
  next:     string
  confirm:  string
}

export default function Settings() {
  const { user, profile } = useAuth()
  const { fetchProfile }  = useAuthStore()
  const [saving, setSaving]               = useState(false)
  const [changingPw, setChangingPw]       = useState(false)
  const [showCurrent, setShowCurrent]     = useState(false)
  const [showNext, setShowNext]           = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, reset } = useForm<ProfileForm>()
  const { register: regPw, handleSubmit: handlePw, reset: resetPw, formState: { errors: pwErrors } } = useForm<PasswordForm>()

  useEffect(() => {
    if (profile) reset({ name: profile.name, phone: profile.phone || '', username: profile.username || '' })
  }, [profile])

  async function onChangePassword(data: PasswordForm) {
    if (data.next !== data.confirm) {
      toast.error('As passwords não coincidem.')
      return
    }
    if (data.next.length < 6) {
      toast.error('A nova password deve ter pelo menos 6 caracteres.')
      return
    }
    setChangingPw(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile?.email || '',
      password: data.current,
    })
    if (signInError) {
      toast.error('Password actual incorrecta.')
      setChangingPw(false)
      return
    }
    const { error } = await supabase.auth.updateUser({ password: data.next })
    if (error) toast.error(error.message)
    else { toast.success('Password alterada com sucesso!'); resetPw() }
    setChangingPw(false)
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !user?.id) return
    if (!file.type.startsWith('image/')) { toast.error('Escolhe uma imagem válida'); return }
    if (file.size > 2 * 1024 * 1024) { toast.error('Imagem deve ter menos de 2MB'); return }

    setUploadingAvatar(true)
    try {
      const ext  = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `${user.id}/profile.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars').upload(path, file, { upsert: true })
      if (uploadError) { toast.error('Erro ao carregar foto'); return }

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      const avatarUrl = `${publicUrl}?t=${Date.now()}`

      const { error } = await supabase.from('profiles')
        .update({ avatar_url: avatarUrl }).eq('id', user.id)
      if (error) { toast.error('Erro ao guardar foto'); return }

      await fetchProfile(user.id)
      toast.success('Foto de perfil actualizada!')
    } finally {
      setUploadingAvatar(false)
    }
  }

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
    <div className="max-w-2xl space-y-6 stagger">
      <h1 className="text-xl font-bold text-white">Definições</h1>

      {/* Perfil */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Perfil</h2>

        {/* Avatar da conta */}
        <div className="flex items-center gap-4 mb-5 pb-5 border-b border-surface-border">
          <div className="relative flex-shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar"
                   className="w-16 h-16 rounded-full object-cover ring-2 ring-brand-500/40 transition-transform duration-300 hover:scale-105" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-tagatech flex items-center justify-center text-2xl font-bold text-white shadow-glow-soft">
                {profile?.name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-white mb-1">Foto da conta</p>
            <p className="text-xs text-gray-500 mb-2">Aparece na sidebar · JPG, PNG ou WebP · máx 2MB</p>
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

      {/* Alterar password */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-300">Alterar password</h2>
        </div>
        <form onSubmit={handlePw(onChangePassword)} className="space-y-4">
          <div>
            <label className="label">Password actual</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                className="input pr-10"
                {...regPw('current', { required: true })}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="label">Nova password</label>
            <div className="relative">
              <input
                type={showNext ? 'text' : 'password'}
                className="input pr-10"
                placeholder="Mínimo 6 caracteres"
                {...regPw('next', { required: true, minLength: 6 })}
              />
              <button
                type="button"
                onClick={() => setShowNext(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showNext ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {pwErrors.next && <p className="text-xs text-red-400 mt-1">Mínimo 6 caracteres.</p>}
          </div>
          <div>
            <label className="label">Confirmar nova password</label>
            <input
              type="password"
              className="input"
              {...regPw('confirm', { required: true })}
            />
          </div>
          <button type="submit" disabled={changingPw} className="btn-primary text-sm flex items-center gap-1.5">
            <KeyRound className="w-4 h-4" /> {changingPw ? 'A alterar...' : 'Alterar password'}
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
