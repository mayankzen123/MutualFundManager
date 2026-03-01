import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Toaster } from 'react-hot-toast'
import { Menu } from 'lucide-react'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-[260px]">
        <header className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-sm border-b border-slate-200/60 px-4 py-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-1 rounded-xl hover:bg-slate-100 transition-colors">
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
        </header>
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">
          <Outlet />
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          className: 'text-sm font-medium',
          duration: 3000,
          style: {
            borderRadius: '14px',
            padding: '14px 20px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.04)',
          },
        }}
      />
    </div>
  )
}
