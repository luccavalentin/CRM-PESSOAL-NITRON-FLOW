/**
 * EXEMPLO DE USO DO SUPABASE
 * 
 * Este arquivo mostra como usar o Supabase com os stores existentes.
 * Você pode adaptar seus stores para usar Supabase em vez de localStorage.
 */

import { supabase } from './supabase'
import { Lead } from '@/stores/leadsStore'

// ============================================
// EXEMPLO: Leads Store com Supabase
// ============================================

export const leadsSupabaseService = {
  // Buscar todos os leads
  async getAllLeads(): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar leads:', error)
      throw error
    }

    // Converter formato do banco para formato do store
    return (data || []).map((lead) => ({
      id: lead.id,
      nome: lead.nome,
      email: lead.email || undefined,
      telefone: lead.telefone || undefined,
      estado: lead.estado,
      cidade: lead.cidade,
      bairro: lead.bairro,
      nicho: lead.nicho || undefined,
      observacoes: lead.observacoes || undefined,
      status: lead.status,
      dataCriacao: lead.data_criacao,
      origem: lead.origem || undefined,
      contactado: lead.contactado || false,
      dataContato: lead.data_contato || undefined,
      temSite: lead.tem_site || false,
      leadQuente: lead.lead_quente || false,
    }))
  },

  // Adicionar novo lead
  async addLead(lead: Lead): Promise<Lead> {
    const { data, error } = await supabase
      .from('leads')
      .insert({
        id: lead.id,
        nome: lead.nome,
        email: lead.email || null,
        telefone: lead.telefone || null,
        estado: lead.estado,
        cidade: lead.cidade,
        bairro: lead.bairro,
        nicho: lead.nicho || null,
        observacoes: lead.observacoes || null,
        status: lead.status,
        data_criacao: lead.dataCriacao,
        origem: lead.origem || null,
        contactado: lead.contactado || false,
        data_contato: lead.dataContato || null,
        tem_site: lead.temSite || null,
        lead_quente: lead.leadQuente || false,
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao adicionar lead:', error)
      throw error
    }

    return {
      id: data.id,
      nome: data.nome,
      email: data.email || undefined,
      telefone: data.telefone || undefined,
      estado: data.estado,
      cidade: data.cidade,
      bairro: data.bairro,
      nicho: data.nicho || undefined,
      observacoes: data.observacoes || undefined,
      status: data.status,
      dataCriacao: data.data_criacao,
      origem: data.origem || undefined,
      contactado: data.contactado || false,
      dataContato: data.data_contato || undefined,
      temSite: data.tem_site || false,
      leadQuente: data.lead_quente || false,
    }
  },

  // Atualizar lead
  async updateLead(id: string, updates: Partial<Lead>): Promise<void> {
    const updateData: any = {}

    if (updates.nome !== undefined) updateData.nome = updates.nome
    if (updates.email !== undefined) updateData.email = updates.email || null
    if (updates.telefone !== undefined) updateData.telefone = updates.telefone || null
    if (updates.estado !== undefined) updateData.estado = updates.estado
    if (updates.cidade !== undefined) updateData.cidade = updates.cidade
    if (updates.bairro !== undefined) updateData.bairro = updates.bairro
    if (updates.nicho !== undefined) updateData.nicho = updates.nicho || null
    if (updates.observacoes !== undefined) updateData.observacoes = updates.observacoes || null
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.dataCriacao !== undefined) updateData.data_criacao = updates.dataCriacao
    if (updates.origem !== undefined) updateData.origem = updates.origem || null
    if (updates.contactado !== undefined) updateData.contactado = updates.contactado
    if (updates.dataContato !== undefined) updateData.data_contato = updates.dataContato || null
    if (updates.temSite !== undefined) updateData.tem_site = updates.temSite || null
    if (updates.leadQuente !== undefined) updateData.lead_quente = updates.leadQuente

    const { error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Erro ao atualizar lead:', error)
      throw error
    }
  },

  // Deletar lead
  async deleteLead(id: string): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar lead:', error)
      throw error
    }
  },

  // Buscar leads por estado
  async getLeadsByEstado(estado: string): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('estado', estado)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar leads por estado:', error)
      throw error
    }

    return (data || []).map((lead) => ({
      id: lead.id,
      nome: lead.nome,
      email: lead.email || undefined,
      telefone: lead.telefone || undefined,
      estado: lead.estado,
      cidade: lead.cidade,
      bairro: lead.bairro,
      nicho: lead.nicho || undefined,
      observacoes: lead.observacoes || undefined,
      status: lead.status,
      dataCriacao: lead.data_criacao,
      origem: lead.origem || undefined,
      contactado: lead.contactado || false,
      dataContato: lead.data_contato || undefined,
      temSite: lead.tem_site || false,
      leadQuente: lead.lead_quente || false,
    }))
  },
}

// ============================================
// EXEMPLO: Tarefas Store com Supabase
// ============================================

export const tarefasSupabaseService = {
  // Buscar todas as tarefas
  async getAllTarefas() {
    const { data, error } = await supabase
      .from('tarefas')
      .select('*')
      .order('data', { ascending: true })

    if (error) {
      console.error('Erro ao buscar tarefas:', error)
      throw error
    }

    return data || []
  },

  // Adicionar tarefa
  async addTarefa(tarefa: any) {
    const { data, error } = await supabase
      .from('tarefas')
      .insert(tarefa)
      .select()
      .single()

    if (error) {
      console.error('Erro ao adicionar tarefa:', error)
      throw error
    }

    return data
  },
}

