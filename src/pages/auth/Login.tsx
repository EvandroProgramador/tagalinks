import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase'
import { Logo } from '@/components/ui/Logo'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

interface FormData {
  email:    string
  password: string
}

export default function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const { register, handleSubmit } = useForm<FormData>()

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email, password: data.password,
      })
      if (error) { toast.error(error.message); return }
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="h-[134px] block mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Bem-vindo de volta</h1>
          <p className="text-gray-400 mt-1">Entra na tua conta TagaLinks</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">E-mail</label>
              <input type="email" className="input" placeholder="tu@email.com"
                     {...register('email', { required: true })} />
            </div>

            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} className="input pr-12"
                       placeholder="A tua senha"
                       {...register('password', { required: true })} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? 'A entrar...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Ainda não tens conta?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300">Criar conta grátis</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
