'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { useLoadDataFromSupabase } from '@/hooks/useLoadDataFromSupabase'
import Sidebar from './Sidebar'
import Header from './Header'
import { 
  loadTransacoesPessoais, 
  loadTransacoesEmpresa, 
  loadTarefas, 
  loadProjetos, 
  loadLeads, 
  loadClientes,
  loadItensCompra 
} from '@/utils/supabaseSync'
import { useFinancasPessoaisStore } from '@/stores/financasPessoaisStore'
import { useFinancasEmpresaStore } from '@/stores/financasEmpresaStore'
import { useTarefasStore } from '@/stores/tarefasStore'
import { useProjetosStore } from '@/stores/projetosStore'
import { useLeadsStore } from '@/stores/leadsStore'
import { useClientesStore } from '@/stores/clientesStore'
import { useListaComprasStore } from '@/stores/listaComprasStore'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { checkAuth, isAuthenticated } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)
  const [lastCheckedPath, setLastCheckedPath] = useState<string | null>(null)
  
  // Carregar dados do Supabase quando autenticado
  useLoadDataFromSupabase()

  // Memoizar rotas públicas
  const publicRoutes = useMemo(() => ['/login', '/cadastro', '/verificar-conexao'], [])
  const isPublicRoute = useMemo(() => 
    publicRoutes.some(route => pathname.startsWith(route)), 
    [pathname, publicRoutes]
  )

  // Verificar autenticação apenas quando necessário
  const verifyAuth = useCallback(async () => {
    // Evitar verificação duplicada na mesma rota
    if (lastCheckedPath === pathname && !isChecking) {
      return
    }

    const isAuth = await checkAuth()
    
    if (!isAuth || !isAuthenticated) {
      router.push('/login')
      return
    }

    setIsChecking(false)
    setLastCheckedPath(pathname)
  }, [pathname, checkAuth, isAuthenticated, router, lastCheckedPath, isChecking])

  useEffect(() => {
    // Se for rota pública, não verificar autenticação
    if (isPublicRoute) {
      setIsChecking(false)
      return
    }

    // Verificar autenticação em rotas protegidas apenas se necessário
    verifyAuth()
  }, [pathname, isPublicRoute, verifyAuth])

  // Carregar dados do Supabase quando autenticado
  useLoadDataFromSupabase()

  // Se estiver em rota pública, não renderizar o layout
  if (isPublicRoute) {
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
