/**
 * Limpeza imediata de dados - executa limpeza completa
 */

import { useLeadsStore } from '@/stores/leadsStore'

/**
 * Limpa todos os leads de Piracicamirim IMEDIATAMENTE
 */
export const cleanLeadsPiracicamirimImmediate = () => {
  if (typeof window === 'undefined') return
  
  const { leads, deleteLead } = useLeadsStore.getState()
  
  // Filtrar leads de Piracicamirim
  const leadsPiracicamirim = leads.filter(
    (lead) => lead.bairro === 'Piracicamirim' || (lead.cidade === 'Piracicaba' && lead.bairro === 'Piracicamirim')
  )
  
  // Deletar cada lead
  leadsPiracicamirim.forEach((lead) => {
    deleteLead(lead.id)
  })
  
  return leadsPiracicamirim.length
}

/**
 * Limpa todos os dados mockados IMEDIATAMENTE
 */
export const cleanMockDataImmediate = () => {
  if (typeof window === 'undefined') return
  
  // Limpar flag de inicialização
  localStorage.removeItem('mock-data-initialized')
  
  // Limpar dados mockados de leads
  const leadsStorage = localStorage.getItem('leads-storage')
  if (leadsStorage) {
    try {
      const parsed = JSON.parse(leadsStorage)
      const mockLeads = ['João Silva', 'Maria Santos', 'Pedro Oliveira']
      parsed.state.leads = parsed.state.leads.filter(
        (lead: any) => !mockLeads.includes(lead.nome)
      )
      localStorage.setItem('leads-storage', JSON.stringify(parsed))
    } catch (e) {
      console.error('Erro ao limpar leads mockados:', e)
    }
  }
  
  // Limpar dados mockados de tarefas
  const tarefasStorage = localStorage.getItem('tarefas-storage')
  if (tarefasStorage) {
    try {
      const parsed = JSON.parse(tarefasStorage)
      const mockTarefas = ['Revisar proposta comercial', 'Atualizar documentação', 'Reunião com equipe']
      parsed.state.tarefas = parsed.state.tarefas.filter(
        (tarefa: any) => !mockTarefas.includes(tarefa.titulo)
      )
      localStorage.setItem('tarefas-storage', JSON.stringify(parsed))
    } catch (e) {
      console.error('Erro ao limpar tarefas mockadas:', e)
    }
  }
  
  // Limpar dados mockados de clientes
  const clientesStorage = localStorage.getItem('clientes-storage')
  if (clientesStorage) {
    try {
      const parsed = JSON.parse(clientesStorage)
      const mockClientes = ['Empresa ABC Ltda', 'Tech Solutions', 'Digital Marketing']
      parsed.state.clientes = parsed.state.clientes.filter(
        (cliente: any) => !mockClientes.includes(cliente.nome) && !mockClientes.includes(cliente.empresa)
      )
      localStorage.setItem('clientes-storage', JSON.stringify(parsed))
    } catch (e) {
      console.error('Erro ao limpar clientes mockados:', e)
    }
  }
  
  // Limpar dados mockados de projetos
  const projetosStorage = localStorage.getItem('projetos-storage')
  if (projetosStorage) {
    try {
      const parsed = JSON.parse(projetosStorage)
      const mockProjetos = ['Sistema de Gestão', 'Site Institucional', 'App Mobile']
      parsed.state.projetos = parsed.state.projetos.filter(
        (projeto: any) => !mockProjetos.includes(projeto.nome)
      )
      localStorage.setItem('projetos-storage', JSON.stringify(parsed))
    } catch (e) {
      console.error('Erro ao limpar projetos mockados:', e)
    }
  }
  
  // Limpar dados mockados de ideias
  const ideiasStorage = localStorage.getItem('ideias-storage')
  if (ideiasStorage) {
    try {
      const parsed = JSON.parse(ideiasStorage)
      const mockIdeias = [
        'Criar sistema de automação para vendas',
        'Plataforma de e-commerce integrada',
        'App de gestão financeira pessoal'
      ]
      parsed.state.ideias = parsed.state.ideias.filter(
        (ideia: any) => !mockIdeias.includes(ideia.texto)
      )
      localStorage.setItem('ideias-storage', JSON.stringify(parsed))
    } catch (e) {
      console.error('Erro ao limpar ideias mockadas:', e)
    }
  }
  
  // Limpar dados mockados de finanças empresa
  const financasEmpresaStorage = localStorage.getItem('financas-empresa-storage')
  if (financasEmpresaStorage) {
    try {
      const parsed = JSON.parse(financasEmpresaStorage)
      const mockMetas = ['Meta de Faturamento Mensal', 'Reserva para Expansão', 'Investimento em Marketing']
      if (parsed.state.metas) {
        parsed.state.metas = parsed.state.metas.filter(
          (meta: any) => !mockMetas.includes(meta.descricao)
        )
      }
      if (parsed.state.transacoes) {
        parsed.state.transacoes = []
      }
      localStorage.setItem('financas-empresa-storage', JSON.stringify(parsed))
    } catch (e) {
      console.error('Erro ao limpar finanças empresa mockadas:', e)
    }
  }
}

/**
 * Executa limpeza completa imediata
 */
export const executeImmediateCleanup = () => {
  cleanLeadsPiracicamirimImmediate()
  cleanMockDataImmediate()
  // Forçar reload dos stores
  window.location.reload()
}

