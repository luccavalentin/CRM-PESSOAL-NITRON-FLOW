import { useEffect } from 'react'
import { useFinancasPessoaisStore } from '@/stores/financasPessoaisStore'
import { useFinancasEmpresaStore } from '@/stores/financasEmpresaStore'
import { useTarefasStore } from '@/stores/tarefasStore'
import { useProjetosStore } from '@/stores/projetosStore'
import { useLeadsStore } from '@/stores/leadsStore'
import { useClientesStore } from '@/stores/clientesStore'
import { useListaComprasStore } from '@/stores/listaComprasStore'
import { useIdeiasStore } from '@/stores/ideiasStore'
import { useProjetosPessoaisStore } from '@/stores/projetosPessoaisStore'
import { loadAcordosFromSupabase } from '@/stores/acordosStore'
import { useAuthStore } from '@/stores/authStore'

/**
 * Hook para carregar todos os dados do Supabase ao iniciar a aplicação
 */
export const useLoadDataFromSupabase = () => {
  const { isAuthenticated } = useAuthStore()
  const loadFinancasPessoais = useFinancasPessoaisStore((state) => state.loadFromSupabase)
  const loadFinancasEmpresa = useFinancasEmpresaStore((state) => state.loadFromSupabase)
  const loadTarefas = useTarefasStore((state) => state.loadFromSupabase)
  const loadProjetos = useProjetosStore((state) => state.loadFromSupabase)
  const loadLeads = useLeadsStore((state) => state.loadFromSupabase)
  const loadClientes = useClientesStore((state) => state.loadFromSupabase)
  const loadListaCompras = useListaComprasStore((state) => state.loadFromSupabase)
  const loadIdeias = useIdeiasStore((state) => state.loadFromSupabase)
  const loadProjetosPessoais = useProjetosPessoaisStore((state) => state.loadFromSupabase)

  useEffect(() => {
    if (!isAuthenticated) return

    // Carregar todos os dados do Supabase
    const loadAllData = async () => {
      try {
        console.log('🔄 Carregando dados do Supabase...')
        
        await Promise.all([
          loadFinancasPessoais(),
          loadFinancasEmpresa(),
          loadTarefas(),
          loadProjetos(),
          loadLeads(),
          loadClientes(),
          loadListaCompras(),
          loadIdeias(),
          loadProjetosPessoais(),
          loadAcordosFromSupabase(),
        ])
        
        console.log('✅ Dados carregados do Supabase com sucesso!')
      } catch (error) {
        console.error('❌ Erro ao carregar dados do Supabase:', error)
      }
    }

    loadAllData()
  }, [
    isAuthenticated,
    loadFinancasPessoais,
    loadFinancasEmpresa,
    loadTarefas,
    loadProjetos,
    loadLeads,
    loadClientes,
    loadListaCompras,
    loadIdeias,
    loadProjetosPessoais,
  ])
}

