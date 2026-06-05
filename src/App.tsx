import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import { useAuth } from '@/hooks/useAuth'

import Landing          from '@/pages/Landing'
import Login            from '@/pages/auth/Login'
import Register         from '@/pages/auth/Register'
import Dashboard        from '@/pages/dashboard/Dashboard'
import Editor           from '@/pages/dashboard/Editor'
import Analytics        from '@/pages/dashboard/Analytics'
import Appearance       from '@/pages/dashboard/Appearance'
import Settings         from '@/pages/dashboard/Settings'
import Upgrade          from '@/pages/dashboard/Upgrade'
import AdminPanel       from '@/pages/admin/AdminPanel'
import UserPage         from '@/pages/public/UserPage'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AdminGuard }   from '@/components/admin/AdminGuard'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-bg">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#13131A', color: '#F8F8FF', border: '1px solid #2A2A3A' },
          }}
        />
        <Routes>
          <Route path="/"         element={<Landing />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<AuthGuard><DashboardLayout /></AuthGuard>}>
            <Route index             element={<Dashboard />} />
            <Route path="editor"     element={<Editor />} />
            <Route path="analytics"  element={<Analytics />} />
            <Route path="appearance" element={<Appearance />} />
            <Route path="settings"   element={<Settings />} />
            <Route path="upgrade"    element={<Upgrade />} />
            <Route path="admin"      element={<AdminGuard><AdminPanel /></AdminGuard>} />
          </Route>

          <Route path="/:username" element={<UserPage />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  )
}
