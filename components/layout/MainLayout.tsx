'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import Sidebar from './Sidebar'
import Header from './Header'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { checkAuth, isAuthenticated } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Rotas públicas que não precisam de autenticação
    const publicRoutes = ['/login', '/cadastro', '/verificar-conexao']
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    // Se for rota pública, não verificar autenticação
    if (isPublicRoute) {
      setIsChecking(false)
      return
    }

    // Verificar autenticação em rotas protegidas
    // SEGURANÇA: Verifica tanto checkAuth quanto isAuthenticated
    const verifyAuth = async () => {
      const isAuth = await checkAuth()
      
      if (!isAuth || !isAuthenticated) {
        router.push('/login')
        return
      }

      setIsChecking(false)
    }

    verifyAuth()
  }, [pathname, checkAuth, isAuthenticated, router])

  // Se estiver em rota pública, não renderizar o layout
  const publicRoutes = ['/login', '/cadastro', '/verificar-conexao']
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return <>{children}</>
  }

  // Mostrar loading enquanto verifica autenticação
  if (isChecking) {
    return (
      <div className="min-h-screen bg-dark-deep flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-electric/30 border-t-accent-electric rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-deep">
      <Sidebar />
      <div className="lg:ml-64">
        <Header />
        <main className="pt-16 sm:pt-16 lg:pt-20 pb-8 px-2 sm:px-4 lg:px-8 mt-0">{children}</main>
      </div>
    </div>
  )
}
