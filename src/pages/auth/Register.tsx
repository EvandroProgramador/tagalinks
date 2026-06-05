import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import { Logo } from '@/components/ui/Logo'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

interface FormData {
  name:     string
  username: string
  email:    string
  phone:    string
  password: string
}

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>()

  function onNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue('name', e.target.value)
    const auto = slugify(e.target.value).slice(0, 30)
    setValue('username', auto)
  }

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      const { data: existing } = await supabase
        .from('profiles').select('id').eq('username', data.username).maybeSingle()
      if (existing) { toast.error('Este nome de utilizador já está ocupado'); return }

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email, password: data.password,
        options: { data: { name: data.name } },
      })
      if (error) { toast.error(error.message); return }

      const userId = authData.user?.id
      if (!userId) { toast.error('Erro ao criar conta'); return }

      const { error: profileErr } = await supabase.from('profiles').upsert({
        id: userId, name: data.name, email: data.email,
        phone: data.phone, username: data.username,
        plan: 'free', role: 'user',
      })
      if (profileErr) { toast.error(profileErr.message); return }

      await supabase.from('link_pages').insert({
        profile_id: userId, slug: data.username,
        title: data.name, published: false,
      })

      toast.success('Conta criada! Bem-vindo ao TagaLinks!')
      navigate('/dashboard/editor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="h-[134px] block mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Cria a tua página</h1>
          <p className="text-gray-400 mt-1">Partilha tudo com um único link</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Nome completo</label>
              <input className="input" placeholder="Kizomba Beats AO"
                     {...register('name', { required: true, onChange: onNameChange })} />
            </div>

            <div>
              <label className="label">Nome de utilizador</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  tagalinks.ao/
                </span>
                <input className="input pl-28" placeholder="kizomba_beats"
                       {...register('username', {
                         required: true,
                         pattern: { value: /^[a-zA-Z0-9_-]{3,30}$/, message: 'Apenas letras, números, _ e -' },
                       })} />
              </div>
              {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="label">E-mail</label>
              <input type="email" className="input" placeholder="tu@email.com"
                     {...register('email', { required: true })} />
            </div>

            <div>
              <label className="label">Telefone (opcional)</label>
              <input type="tel" className="input" placeholder="+244 9XX XXX XXX"
                     {...register('phone')} />
            </div>

            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} className="input pr-12"
                       placeholder="Mínimo 8 caracteres"
                       {...register('password', { required: true, minLength: 8 })} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? 'A criar conta...' : 'Criar conta gratuita'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Já tens conta?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
