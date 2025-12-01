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
  const { checkAuth } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Não verificar autenticação na página de login
    if (pathname === '/login') {
      setIsChecking(false)
      return
    }

    // Verificar autenticação em outras rotas
    if (!checkAuth()) {
      router.push('/login')
    } else {
      setIsChecking(false)
    }
  }, [pathname, checkAuth, router])

  // Se estiver na página de login, não renderizar o layout
  if (pathname === '/login') {
    return <>{children}</>
  }

  // Mostrar loading enquanto verifica autenticação
  if (isChecking) {
    return null
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
