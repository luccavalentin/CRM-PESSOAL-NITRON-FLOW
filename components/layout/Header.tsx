'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { LogOut, Eye, EyeOff } from 'lucide-react'

export default function Header() {
  const router = useRouter()
  const { logout, user } = useAuthStore()
  const { mostrarValores, toggleMostrarValores } = usePreferencesStore()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-dark-black/95 backdrop-blur-xl border-b border-card-border/50 z-30 shadow-lg shadow-black/20 min-h-[64px] flex items-center">
      <div className="w-full h-full px-4 lg:px-6 flex items-center justify-end">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMostrarValores}
            className="p-2 rounded-lg bg-dark-black/50 hover:bg-dark-black/70 text-gray-400 hover:text-white transition-colors"
            title={mostrarValores ? 'Ocultar Valores' : 'Exibir Valores'}
          >
            {mostrarValores ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
          {user && (
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-white">{user.name || user.email}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:text-red-300 font-semibold transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  )
}
