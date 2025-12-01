import { v4 as uuidv4 } from 'uuid'
import { Lead } from '@/stores/leadsStore'
import { Cliente } from '@/stores/clientesStore'
import { Tarefa, MetaFinanceira, TransacaoFinanceira, Projeto, Ideia } from '@/types'
import { criarEtapasPadrao } from '@/utils/projetoEtapas'

// Função para inicializar dados mockados
// DESABILITADA - Não inicializa mais dados mockados automaticamente
export const initializeMockData = () => {
  // Função desabilitada - dados mockados não são mais inicializados
  return

  // Mock Leads (3)
  const mockLeads: Lead[] = [
    {
      id: uuidv4(),
      nome: 'João Silva',
      email: 'joao.silva@email.com',
      telefone: '(11) 98765-4321',
      estado: 'SP',
      cidade: 'São Paulo',
      bairro: 'Centro',
      status: 'Novo',
      dataCriacao: new Date().toISOString().split('T')[0],
      origem: 'Site',
    },
    {
      id: uuidv4(),
      nome: 'Maria Santos',
      email: 'maria.santos@email.com',
      telefone: '(21) 99876-5432',
      estado: 'RJ',
      cidade: 'Rio de Janeiro',
      bairro: 'Copacabana',
      status: 'Contatado',
      dataCriacao: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      origem: 'Indicação',
    },
    {
      id: uuidv4(),
      nome: 'Pedro Oliveira',
      email: 'pedro.oliveira@email.com',
      telefone: '(31) 97654-3210',
      estado: 'MG',
      cidade: 'Belo Horizonte',
      bairro: 'Savassi',
      status: 'Qualificado',
      dataCriacao: new Date(Date.now() - 172800000).toISOString().split('T')[0],
      origem: 'Redes Sociais',
    },
  ]

  // Mock Tarefas (3)
  const mockTarefas: Tarefa[] = [
    {
      id: uuidv4(),
      titulo: 'Revisar proposta comercial',
      descricao: 'Analisar e revisar proposta para novo cliente',
      prioridade: 'Alta',
      categoria: 'Empresarial',
      data: new Date().toISOString().split('T')[0],
      status: 'Em Andamento',
      tarefaRapida: false,
      recorrente: false,
      concluida: false,
      etiquetas: [],
    },
    {
      id: uuidv4(),
      titulo: 'Atualizar documentação',
      descricao: 'Atualizar documentação do projeto',
      prioridade: 'Média',
      categoria: 'Projeto',
      data: new Date().toISOString().split('T')[0],
      status: 'Pendente',
      tarefaRapida: false,
      recorrente: false,
      concluida: false,
      etiquetas: [],
    },
    {
      id: uuidv4(),
      titulo: 'Reunião com equipe',
      descricao: 'Reunião semanal de alinhamento',
      prioridade: 'Urgente',
      categoria: 'Empresarial',
      data: new Date().toISOString().split('T')[0],
      status: 'Pendente',
      tarefaRapida: true,
      recorrente: true,
      concluida: false,
      etiquetas: [],
    },
  ]

  // Mock Clientes (3)
  const mockClientes: Cliente[] = [
    {
      id: uuidv4(),
      nome: 'Empresa ABC Ltda',
      email: 'contato@empresaabc.com',
      telefone: '(11) 3456-7890',
      empresa: 'Empresa ABC',
      cidade: 'São Paulo',
      estado: 'SP',
      status: 'Ativo',
      valorTotal: 50000,
      dataCadastro: new Date(Date.now() - 259200000).toISOString().split('T')[0],
    },
    {
      id: uuidv4(),
      nome: 'Tech Solutions',
      email: 'vendas@techsolutions.com',
      telefone: '(21) 2345-6789',
      empresa: 'Tech Solutions',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      status: 'Ativo',
      valorTotal: 75000,
      dataCadastro: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    },
    {
      id: uuidv4(),
      nome: 'Digital Marketing',
      email: 'contato@digitalmarketing.com',
      telefone: '(31) 1234-5678',
      empresa: 'Digital Marketing',
      cidade: 'Belo Horizonte',
      estado: 'MG',
      status: 'Prospecto',
      valorTotal: 0,
      dataCadastro: new Date().toISOString().split('T')[0],
    },
  ]

  // Salvar dados mockados
  const existingLeads = JSON.parse(localStorage.getItem('leads-storage') || '{"state":{"leads":[]}}')
  if (existingLeads.state.leads.length === 0) {
    existingLeads.state.leads = mockLeads
    localStorage.setItem('leads-storage', JSON.stringify(existingLeads))
  }

  const existingTarefas = JSON.parse(localStorage.getItem('tarefas-storage') || '{"state":{"tarefas":[]}}')
  if (existingTarefas.state.tarefas.length === 0) {
    existingTarefas.state.tarefas = mockTarefas
    localStorage.setItem('tarefas-storage', JSON.stringify(existingTarefas))
  }

  const existingClientes = JSON.parse(localStorage.getItem('clientes-storage') || '{"state":{"clientes":[]}}')
  if (existingClientes.state.clientes.length === 0) {
    existingClientes.state.clientes = mockClientes
    localStorage.setItem('clientes-storage', JSON.stringify(existingClientes))
  }

  // Mock Metas Financeiras Empresa (3)
  const existingFinancasEmpresa = JSON.parse(localStorage.getItem('financas-empresa-storage') || '{"state":{"metas":[],"transacoes":[]}}')
  if (!existingFinancasEmpresa.state.metas || existingFinancasEmpresa.state.metas.length === 0) {
    const mockMetasEmpresa: MetaFinanceira[] = [
      {
        id: uuidv4(),
        descricao: 'Meta de Faturamento Mensal',
        valorMeta: 100000,
        valorAtual: 75000,
        dataLimite: new Date(Date.now() + 2592000000).toISOString().split('T')[0],
      },
      {
        id: uuidv4(),
        descricao: 'Reserva para Expansão',
        valorMeta: 200000,
        valorAtual: 120000,
        dataLimite: new Date(Date.now() + 5184000000).toISOString().split('T')[0],
      },
      {
        id: uuidv4(),
        descricao: 'Investimento em Marketing',
        valorMeta: 50000,
        valorAtual: 30000,
        dataLimite: new Date(Date.now() + 1728000000).toISOString().split('T')[0],
      },
    ]
    existingFinancasEmpresa.state.metas = mockMetasEmpresa
  }

  if (!existingFinancasEmpresa.state.transacoes || existingFinancasEmpresa.state.transacoes.length === 0) {
    const mockTransacoesEmpresa: TransacaoFinanceira[] = [
      {
        id: uuidv4(),
        descricao: 'Venda de Produto A',
        valor: 5000,
        tipo: 'entrada',
        categoria: 'Vendas',
        data: new Date().toISOString().split('T')[0],
      },
      {
        id: uuidv4(),
        descricao: 'Pagamento de Fornecedor',
        valor: 2500,
        tipo: 'saida',
        categoria: 'Fornecedores',
        data: new Date().toISOString().split('T')[0],
      },
      {
        id: uuidv4(),
        descricao: 'Serviço Prestado',
        valor: 8000,
        tipo: 'entrada',
        categoria: 'Serviços',
        data: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      },
    ]
    existingFinancasEmpresa.state.transacoes = mockTransacoesEmpresa
  }
  localStorage.setItem('financas-empresa-storage', JSON.stringify(existingFinancasEmpresa))

  // Mock Projetos (3)
  const existingProjetos = JSON.parse(localStorage.getItem('projetos-storage') || '{"state":{"projetos":[]}}')
  if (existingProjetos.state.projetos.length === 0) {
    // Criar etapas para cada projeto mockado
    const etapasProjeto1 = criarEtapasPadrao()
    etapasProjeto1[0].concluida = true
    etapasProjeto1[1].concluida = true
    etapasProjeto1[2].concluida = true
    etapasProjeto1[3].concluida = true
    etapasProjeto1[4].concluida = true
    
    const etapasProjeto2 = criarEtapasPadrao()
    etapasProjeto2[0].concluida = true
    etapasProjeto2[1].concluida = true
    etapasProjeto2[2].concluida = true
    etapasProjeto2[3].concluida = true
    etapasProjeto2[4].concluida = true
    etapasProjeto2[5].concluida = true
    etapasProjeto2[6].concluida = true
    
    const etapasProjeto3 = criarEtapasPadrao()
    
    const mockProjetos: Projeto[] = [
      {
        id: uuidv4(),
        nome: 'Sistema de Gestão',
        descricao: 'Desenvolvimento de sistema completo',
        status: 'Andamento',
        etapas: etapasProjeto1,
        etapasConcluidas: 5,
        totalEtapas: 7,
        dataInicio: new Date(Date.now() - 2592000000).toISOString().split('T')[0],
        prazo: new Date(Date.now() + 5184000000).toISOString().split('T')[0],
        quantidadeAnexos: 3,
      },
      {
        id: uuidv4(),
        nome: 'Site Institucional',
        descricao: 'Criação de site para cliente',
        status: 'Revisão',
        etapas: etapasProjeto2,
        etapasConcluidas: 7,
        totalEtapas: 7,
        dataInicio: new Date(Date.now() - 1728000000).toISOString().split('T')[0],
        prazo: new Date(Date.now() + 864000000).toISOString().split('T')[0],
        quantidadeAnexos: 5,
      },
      {
        id: uuidv4(),
        nome: 'App Mobile',
        descricao: 'Desenvolvimento de aplicativo',
        status: 'Pendente',
        etapas: etapasProjeto3,
        etapasConcluidas: 0,
        totalEtapas: 7,
        dataInicio: new Date().toISOString().split('T')[0],
        prazo: new Date(Date.now() + 7776000000).toISOString().split('T')[0],
        quantidadeAnexos: 0,
      },
    ]
    existingProjetos.state.projetos = mockProjetos
    localStorage.setItem('projetos-storage', JSON.stringify(existingProjetos))
  }

  // Mock Ideias (3)
  const existingIdeias = JSON.parse(localStorage.getItem('ideias-storage') || '{"state":{"ideias":[]}}')
  if (existingIdeias.state.ideias.length === 0) {
    const mockIdeias: Ideia[] = [
      {
        id: uuidv4(),
        texto: 'Criar sistema de automação para vendas',
        categoria: 'Automação',
        status: 'Explorando',
        potencialFinanceiro: 8,
        dataCriacao: new Date().toISOString().split('T')[0],
      },
      {
        id: uuidv4(),
        texto: 'Plataforma de e-commerce integrada',
        categoria: 'Negócio',
        status: 'Em Análise',
        potencialFinanceiro: 9,
        dataCriacao: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      },
      {
        id: uuidv4(),
        texto: 'App de gestão financeira pessoal',
        categoria: 'Projeto',
        status: 'Em Teste',
        potencialFinanceiro: 7,
        dataCriacao: new Date(Date.now() - 172800000).toISOString().split('T')[0],
      },
    ]
    existingIdeias.state.ideias = mockIdeias
    localStorage.setItem('ideias-storage', JSON.stringify(existingIdeias))
  }

  // Marcar como inicializado
  localStorage.setItem('mock-data-initialized', 'true')
}
