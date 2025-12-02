import { supabase } from '@/lib/supabase'

/**
 * Função utilitária para obter o ID do usuário atual
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const { data: session } = await supabase.auth.getSession()
    return session?.session?.user?.id || null
  } catch (error) {
    console.error('Erro ao obter ID do usuário:', error)
    return null
  }
}

/**
 * Salva uma transação financeira pessoal no Supabase
 */
export const saveTransacaoPessoal = async (transacao: any) => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return

    const { error } = await supabase
      .from('transacoes_financeiras_pessoais')
      .upsert({
        id: transacao.id,
        usuario_id: userId,
        descricao: transacao.descricao,
        valor: transacao.valor,
        categoria: transacao.categoria,
        data: transacao.data,
        tipo: transacao.tipo,
        recorrente: transacao.recorrente || false,
        tipo_recorrencia: transacao.tipoRecorrencia,
        data_fim: transacao.dataFim,
        quantidade_recorrencias: transacao.quantidadeRecorrencias,
        transacao_original_id: transacao.transacaoOriginalId,
        paga: transacao.paga,
        data_pagamento: transacao.dataPagamento,
        data_vencimento: transacao.dataVencimento,
        rolou_mes: transacao.rolouMes || false,
      }, {
        onConflict: 'id'
      })

    if (error) {
      console.error('Erro ao salvar transação pessoal no Supabase:', error)
    }
  } catch (error) {
    console.error('Erro ao salvar transação pessoal no Supabase:', error)
  }
}

/**
 * Salva uma transação financeira da empresa no Supabase
 */
export const saveTransacaoEmpresa = async (transacao: any) => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return

    const { error } = await supabase
      .from('transacoes_financeiras_empresa')
      .upsert({
        id: transacao.id,
        usuario_id: userId,
        descricao: transacao.descricao,
        valor: transacao.valor,
        categoria: transacao.categoria,
        data: transacao.data,
        tipo: transacao.tipo,
        recorrente: transacao.recorrente || false,
        tipo_recorrencia: transacao.tipoRecorrencia,
        data_fim: transacao.dataFim,
        quantidade_recorrencias: transacao.quantidadeRecorrencias,
        transacao_original_id: transacao.transacaoOriginalId,
        paga: transacao.paga,
        data_pagamento: transacao.dataPagamento,
        data_vencimento: transacao.dataVencimento,
        rolou_mes: transacao.rolouMes || false,
      }, {
        onConflict: 'id'
      })

    if (error) {
      console.error('Erro ao salvar transação empresa no Supabase:', error)
    }
  } catch (error) {
    console.error('Erro ao salvar transação empresa no Supabase:', error)
  }
}

/**
 * Deleta uma transação financeira pessoal do Supabase
 */
export const deleteTransacaoPessoal = async (id: string) => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return

    const { error } = await supabase
      .from('transacoes_financeiras_pessoais')
      .delete()
      .eq('id', id)
      .eq('usuario_id', userId)

    if (error) {
      console.error('Erro ao deletar transação pessoal no Supabase:', error)
    }
  } catch (error) {
    console.error('Erro ao deletar transação pessoal no Supabase:', error)
  }
}

/**
 * Deleta uma transação financeira da empresa do Supabase
 */
export const deleteTransacaoEmpresa = async (id: string) => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return

    const { error } = await supabase
      .from('transacoes_financeiras_empresa')
      .delete()
      .eq('id', id)
      .eq('usuario_id', userId)

    if (error) {
      console.error('Erro ao deletar transação empresa no Supabase:', error)
    }
  } catch (error) {
    console.error('Erro ao deletar transação empresa no Supabase:', error)
  }
}

/**
 * Salva uma tarefa no Supabase
 */
export const saveTarefa = async (tarefa: any) => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return

    const { error } = await supabase
      .from('tarefas')
      .upsert({
        id: tarefa.id,
        usuario_id: userId,
        titulo: tarefa.titulo,
        descricao: tarefa.descricao,
        prioridade: tarefa.prioridade,
        categoria: tarefa.categoria,
        data: tarefa.data,
        status: tarefa.status,
        concluida: tarefa.concluida || false,
        projeto_id: tarefa.projetoId,
        etiquetas: tarefa.etiquetas ? JSON.stringify(tarefa.etiquetas) : null,
        recorrente: tarefa.recorrente || false,
        tarefa_rapida: tarefa.tarefaRapida || false,
      }, {
        onConflict: 'id'
      })

    if (error) {
      console.error('Erro ao salvar tarefa no Supabase:', error)
    }
  } catch (error) {
    console.error('Erro ao salvar tarefa no Supabase:', error)
  }
}

/**
 * Deleta uma tarefa do Supabase
 */
export const deleteTarefa = async (id: string) => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return

    const { error } = await supabase
      .from('tarefas')
      .delete()
      .eq('id', id)
      .eq('usuario_id', userId)

    if (error) {
      console.error('Erro ao deletar tarefa no Supabase:', error)
    }
  } catch (error) {
    console.error('Erro ao deletar tarefa no Supabase:', error)
  }
}

/**
 * Salva um projeto no Supabase
 */
export const saveProjeto = async (projeto: any) => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return

    const { error } = await supabase
      .from('projetos')
      .upsert({
        id: projeto.id,
        usuario_id: userId,
        nome: projeto.nome,
        descricao: projeto.descricao,
        status: projeto.status,
        prioridade: projeto.prioridade,
        data_inicio: projeto.dataInicio,
        data_fim: projeto.dataFim,
        cliente_id: projeto.clienteId,
        valor: projeto.valor,
        progresso: projeto.progresso || 0,
      }, {
        onConflict: 'id'
      })

    if (error) {
      console.error('Erro ao salvar projeto no Supabase:', error)
    }
  } catch (error) {
    console.error('Erro ao salvar projeto no Supabase:', error)
  }
}

/**
 * Deleta um projeto do Supabase
 */
export const deleteProjeto = async (id: string) => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return

    const { error } = await supabase
      .from('projetos')
      .delete()
      .eq('id', id)
      .eq('usuario_id', userId)

    if (error) {
      console.error('Erro ao deletar projeto no Supabase:', error)
    }
  } catch (error) {
    console.error('Erro ao deletar projeto no Supabase:', error)
  }
}

/**
 * Salva um lead no Supabase
 */
export const saveLead = async (lead: any) => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return

    const { error } = await supabase
      .from('leads')
      .upsert({
        id: lead.id,
        usuario_id: userId,
        nome: lead.nome,
        email: lead.email,
        telefone: lead.telefone,
        estado: lead.estado,
        cidade: lead.cidade,
        bairro: lead.bairro,
        nicho: lead.nicho,
        observacoes: lead.observacoes,
        status: lead.status,
        origem: lead.origem,
        contactado: lead.contactado || false,
        data_contato: lead.dataContato,
        tem_site: lead.temSite || false,
        lead_quente: lead.leadQuente || false,
      }, {
        onConflict: 'id'
      })

    if (error) {
      console.error('Erro ao salvar lead no Supabase:', error)
    }
  } catch (error) {
    console.error('Erro ao salvar lead no Supabase:', error)
  }
}

/**
 * Deleta um lead do Supabase
 */
export const deleteLead = async (id: string) => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)
      .eq('usuario_id', userId)

    if (error) {
      console.error('Erro ao deletar lead no Supabase:', error)
    }
  } catch (error) {
    console.error('Erro ao deletar lead no Supabase:', error)
  }
}

/**
 * Salva um cliente no Supabase
 */
export const saveCliente = async (cliente: any) => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return

    const { error } = await supabase
      .from('clientes')
      .upsert({
        id: cliente.id,
        usuario_id: userId,
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone,
        empresa: cliente.empresa,
        endereco: cliente.endereco,
        cidade: cliente.cidade,
        estado: cliente.estado,
        status: cliente.status,
        valor_total: cliente.valorTotal || 0,
        ultima_interacao: cliente.ultimaInteracao,
        observacoes: cliente.observacoes,
        lead_id: cliente.leadId,
      }, {
        onConflict: 'id'
      })

    if (error) {
      console.error('Erro ao salvar cliente no Supabase:', error)
    }
  } catch (error) {
    console.error('Erro ao salvar cliente no Supabase:', error)
  }
}

/**
 * Deleta um cliente do Supabase
 */
export const deleteCliente = async (id: string) => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return

    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id)
      .eq('usuario_id', userId)

    if (error) {
      console.error('Erro ao deletar cliente no Supabase:', error)
    }
  } catch (error) {
    console.error('Erro ao deletar cliente no Supabase:', error)
  }
}

/**
 * Salva um item de lista de compras no Supabase
 */
export const saveItemCompra = async (item: any) => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return

    const { error } = await supabase
      .from('lista_compras')
      .upsert({
        id: item.id,
        usuario_id: userId,
        nome: item.nome,
        quantidade: item.quantidade || 1,
        valor_estimado: item.valorEstimado || 0,
        categoria: item.categoria || 'Diversas',
        status: item.status || 'Pendente',
        recorrencia_mensal: item.recorrenciaMensal || false,
      }, {
        onConflict: 'id'
      })

    if (error) {
      console.error('Erro ao salvar item de compra no Supabase:', error)
    }
  } catch (error) {
    console.error('Erro ao salvar item de compra no Supabase:', error)
  }
}

/**
 * Deleta um item de lista de compras do Supabase
 */
export const deleteItemCompra = async (id: string) => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return

    const { error } = await supabase
      .from('lista_compras')
      .delete()
      .eq('id', id)
      .eq('usuario_id', userId)

    if (error) {
      console.error('Erro ao deletar item de compra no Supabase:', error)
    }
  } catch (error) {
    console.error('Erro ao deletar item de compra no Supabase:', error)
  }
}

/**
 * Salva uma categoria financeira no Supabase
 */
export const saveCategoria = async (categoria: any) => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return

    const { error } = await supabase
      .from('categorias_financeiras')
      .upsert({
        id: categoria.id,
        usuario_id: userId,
        nome: categoria.nome,
        tipo: categoria.tipo,
        cor: categoria.cor,
        descricao: categoria.descricao,
      }, {
        onConflict: 'id'
      })

    if (error) {
      console.error('Erro ao salvar categoria no Supabase:', error)
    }
  } catch (error) {
    console.error('Erro ao salvar categoria no Supabase:', error)
  }
}

/**
 * Carrega todas as transações financeiras pessoais do Supabase
 */
export const loadTransacoesPessoais = async () => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return []

    const { data, error } = await supabase
      .from('transacoes_financeiras_pessoais')
      .select('*')
      .eq('usuario_id', userId)
      .order('data', { ascending: false })

    if (error) {
      console.error('Erro ao carregar transações pessoais do Supabase:', error)
      return []
    }

    return (data || []).map(t => ({
      id: t.id,
      descricao: t.descricao,
      valor: parseFloat(t.valor),
      categoria: t.categoria,
      data: t.data,
      tipo: t.tipo,
      recorrente: t.recorrente || false,
      tipoRecorrencia: t.tipo_recorrencia,
      dataFim: t.data_fim,
      quantidadeRecorrencias: t.quantidade_recorrencias,
      transacaoOriginalId: t.transacao_original_id,
      paga: t.paga,
      dataPagamento: t.data_pagamento,
      dataVencimento: t.data_vencimento,
      rolouMes: t.rolou_mes || false,
    }))
  } catch (error) {
    console.error('Erro ao carregar transações pessoais do Supabase:', error)
    return []
  }
}

/**
 * Carrega todas as transações financeiras da empresa do Supabase
 */
export const loadTransacoesEmpresa = async () => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return []

    const { data, error } = await supabase
      .from('transacoes_financeiras_empresa')
      .select('*')
      .eq('usuario_id', userId)
      .order('data', { ascending: false })

    if (error) {
      console.error('Erro ao carregar transações empresa do Supabase:', error)
      return []
    }

    return (data || []).map(t => ({
      id: t.id,
      descricao: t.descricao,
      valor: parseFloat(t.valor),
      categoria: t.categoria,
      data: t.data,
      tipo: t.tipo,
      recorrente: t.recorrente || false,
      tipoRecorrencia: t.tipo_recorrencia,
      dataFim: t.data_fim,
      quantidadeRecorrencias: t.quantidade_recorrencias,
      transacaoOriginalId: t.transacao_original_id,
      paga: t.paga,
      dataPagamento: t.data_pagamento,
      dataVencimento: t.data_vencimento,
      rolouMes: t.rolou_mes || false,
    }))
  } catch (error) {
    console.error('Erro ao carregar transações empresa do Supabase:', error)
    return []
  }
}

/**
 * Carrega todas as tarefas do Supabase
 */
export const loadTarefas = async () => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return []

    const { data, error } = await supabase
      .from('tarefas')
      .select('*')
      .eq('usuario_id', userId)
      .order('data', { ascending: false })

    if (error) {
      console.error('Erro ao carregar tarefas do Supabase:', error)
      return []
    }

    return (data || []).map(t => ({
      id: t.id,
      titulo: t.titulo,
      descricao: t.descricao,
      prioridade: t.prioridade,
      categoria: t.categoria,
      data: t.data,
      status: t.status,
      concluida: t.concluida || false,
      projetoId: t.projeto_id,
      etiquetas: t.etiquetas ? JSON.parse(t.etiquetas) : [],
      recorrente: t.recorrente || false,
      tarefaRapida: t.tarefa_rapida || false,
    }))
  } catch (error) {
    console.error('Erro ao carregar tarefas do Supabase:', error)
    return []
  }
}

/**
 * Carrega todos os projetos do Supabase
 */
export const loadProjetos = async () => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return []

    const { data, error } = await supabase
      .from('projetos')
      .select('*')
      .eq('usuario_id', userId)
      .order('data_inicio', { ascending: false })

    if (error) {
      console.error('Erro ao carregar projetos do Supabase:', error)
      return []
    }

    return (data || []).map(p => ({
      id: p.id,
      nome: p.nome,
      descricao: p.descricao,
      status: p.status,
      prioridade: p.prioridade,
      dataInicio: p.data_inicio,
      dataFim: p.data_fim,
      clienteId: p.cliente_id,
      valor: p.valor ? parseFloat(p.valor) : 0,
      progresso: p.progresso || 0,
      etapas: [], // Será carregado separadamente se necessário
      totalEtapas: 7,
      etapasConcluidas: 0,
    }))
  } catch (error) {
    console.error('Erro ao carregar projetos do Supabase:', error)
    return []
  }
}

/**
 * Carrega todos os leads do Supabase
 */
export const loadLeads = async () => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return []

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('usuario_id', userId)
      .order('data_criacao', { ascending: false })

    if (error) {
      console.error('Erro ao carregar leads do Supabase:', error)
      return []
    }

    return (data || []).map(l => ({
      id: l.id,
      nome: l.nome,
      email: l.email,
      telefone: l.telefone,
      estado: l.estado,
      cidade: l.cidade,
      bairro: l.bairro,
      nicho: l.nicho,
      observacoes: l.observacoes,
      status: l.status,
      dataCriacao: l.data_criacao || l.created_at,
      origem: l.origem,
      contactado: l.contactado || false,
      dataContato: l.data_contato,
      temSite: l.tem_site || false,
      leadQuente: l.lead_quente || false,
    }))
  } catch (error) {
    console.error('Erro ao carregar leads do Supabase:', error)
    return []
  }
}

/**
 * Carrega todos os clientes do Supabase
 */
export const loadClientes = async () => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return []

    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('usuario_id', userId)
      .order('data_cadastro', { ascending: false })

    if (error) {
      console.error('Erro ao carregar clientes do Supabase:', error)
      return []
    }

    return (data || []).map(c => ({
      id: c.id,
      nome: c.nome,
      email: c.email,
      telefone: c.telefone,
      empresa: c.empresa,
      endereco: c.endereco,
      cidade: c.cidade,
      estado: c.estado,
      status: c.status,
      valorTotal: parseFloat(c.valor_total) || 0,
      ultimaInteracao: c.ultima_interacao,
      observacoes: c.observacoes,
      leadId: c.lead_id,
      dataCadastro: c.data_cadastro || c.created_at,
    }))
  } catch (error) {
    console.error('Erro ao carregar clientes do Supabase:', error)
    return []
  }
}

/**
 * Carrega todos os itens de lista de compras do Supabase
 */
export const loadItensCompra = async () => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return []

    const { data, error } = await supabase
      .from('lista_compras')
      .select('*')
      .eq('usuario_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao carregar itens de compra do Supabase:', error)
      return []
    }

    return (data || []).map(i => ({
      id: i.id,
      nome: i.nome,
      quantidade: i.quantidade || 1,
      valorEstimado: parseFloat(i.valor_estimado) || 0,
      categoria: i.categoria || 'Diversas',
      status: i.status || 'Pendente',
      recorrenciaMensal: i.recorrencia_mensal || false,
    }))
  } catch (error) {
    console.error('Erro ao carregar itens de compra do Supabase:', error)
    return []
  }
}

/**
 * Salva uma ideia no Supabase
 */
export const saveIdeia = async (ideia: any) => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return

    // Mapear da interface Ideia para o banco de dados
    // texto -> titulo (primeira linha) e descricao (resto)
    // potencialFinanceiro -> prioridade (1-3 = Baixa, 4-7 = Média, 8-10 = Alta)
    const texto = ideia.texto || ''
    const linhas = texto.split('\n')
    const titulo = linhas[0] || ''
    const descricao = linhas.slice(1).join('\n') || texto
    
    let prioridade = 'Média'
    if (ideia.potencialFinanceiro !== undefined) {
      if (ideia.potencialFinanceiro >= 8) prioridade = 'Alta'
      else if (ideia.potencialFinanceiro >= 4) prioridade = 'Média'
      else prioridade = 'Baixa'
    }

    const { error } = await supabase
      .from('ideias')
      .upsert({
        id: ideia.id,
        usuario_id: userId,
        titulo: titulo,
        descricao: descricao,
        categoria: ideia.categoria,
        prioridade: prioridade,
        status: ideia.status,
        data_criacao: ideia.dataCriacao,
        tarefa_id: ideia.tarefaId,
        projeto_id: ideia.projetoId,
      }, {
        onConflict: 'id'
      })

    if (error) {
      console.error('Erro ao salvar ideia no Supabase:', error)
    }
  } catch (error) {
    console.error('Erro ao salvar ideia no Supabase:', error)
  }
}

/**
 * Deleta uma ideia do Supabase
 */
export const deleteIdeia = async (id: string) => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return

    const { error } = await supabase
      .from('ideias')
      .delete()
      .eq('id', id)
      .eq('usuario_id', userId)

    if (error) {
      console.error('Erro ao deletar ideia no Supabase:', error)
    }
  } catch (error) {
    console.error('Erro ao deletar ideia no Supabase:', error)
  }
}

/**
 * Salva um projeto pessoal no Supabase
 */
export const saveProjetoPessoal = async (projeto: any) => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return

    const { error } = await supabase
      .from('projetos_pessoais')
      .upsert({
        id: projeto.id,
        usuario_id: userId,
        nome: projeto.nome,
        descricao: projeto.descricao,
        status: projeto.status,
        data_inicio: projeto.dataInicio,
        data_fim: projeto.dataFim,
        progresso: projeto.progresso || 0,
      }, {
        onConflict: 'id'
      })

    if (error) {
      console.error('Erro ao salvar projeto pessoal no Supabase:', error)
    }
  } catch (error) {
    console.error('Erro ao salvar projeto pessoal no Supabase:', error)
  }
}

/**
 * Deleta um projeto pessoal do Supabase
 */
export const deleteProjetoPessoal = async (id: string) => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return

    const { error } = await supabase
      .from('projetos_pessoais')
      .delete()
      .eq('id', id)
      .eq('usuario_id', userId)

    if (error) {
      console.error('Erro ao deletar projeto pessoal no Supabase:', error)
    }
  } catch (error) {
    console.error('Erro ao deletar projeto pessoal no Supabase:', error)
  }
}

/**
 * Carrega todas as ideias do Supabase
 */
export const loadIdeias = async () => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return []

    const { data, error } = await supabase
      .from('ideias')
      .select('*')
      .eq('usuario_id', userId)
      .order('data_criacao', { ascending: false })

    if (error) {
      console.error('Erro ao carregar ideias do Supabase:', error)
      return []
    }

    return (data || []).map(i => {
      // Mapear do banco de dados para a interface Ideia
      // titulo + descricao -> texto
      // prioridade -> potencialFinanceiro (Alta=10, Média=5, Baixa=1)
      const texto = [i.titulo, i.descricao].filter(Boolean).join('\n') || ''
      
      let potencialFinanceiro = 5 // padrão Média
      if (i.prioridade === 'Alta') potencialFinanceiro = 10
      else if (i.prioridade === 'Média') potencialFinanceiro = 5
      else if (i.prioridade === 'Baixa') potencialFinanceiro = 1

      return {
        id: i.id,
        texto: texto,
        categoria: i.categoria,
        status: i.status,
        potencialFinanceiro: potencialFinanceiro,
        dataCriacao: i.data_criacao || i.created_at,
        tarefaId: i.tarefa_id,
        projetoId: i.projeto_id,
      }
    })
  } catch (error) {
    console.error('Erro ao carregar ideias do Supabase:', error)
    return []
  }
}

/**
 * Carrega todos os projetos pessoais do Supabase
 */
export const loadProjetosPessoais = async () => {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return []

    const { data, error } = await supabase
      .from('projetos_pessoais')
      .select('*')
      .eq('usuario_id', userId)
      .order('data_inicio', { ascending: false })

    if (error) {
      console.error('Erro ao carregar projetos pessoais do Supabase:', error)
      return []
    }

    return (data || []).map(p => ({
      id: p.id,
      nome: p.nome,
      descricao: p.descricao,
      status: p.status,
      dataInicio: p.data_inicio,
      dataFim: p.data_fim,
      progresso: p.progresso || 0,
    }))
  } catch (error) {
    console.error('Erro ao carregar projetos pessoais do Supabase:', error)
    return []
  }
}

