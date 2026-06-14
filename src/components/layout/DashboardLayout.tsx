import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Sobe ao topo a cada navegação (o documento — e não um contentor interno — é o que rola).
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="flex min-h-dvh bg-surface-bg">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        {/* O documento é o contentor de scroll → pull-to-refresh nativo fiável no mobile.
            keyed by pathname para cada rota fazer fade-in ao navegar. */}
        <main key={location.pathname} className="flex-1 p-3 sm:p-5 pb-10 sm:pb-12 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
