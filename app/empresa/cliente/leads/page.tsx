'use client'

import { useState, useMemo } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { useLeadsStore, Lead } from '@/stores/leadsStore'
import { useTarefasStore } from '@/stores/tarefasStore'
import { estadosBrasil, getCidadesByEstado, getEstadoNome } from '@/utils/estadosCidades'
import { bairrosPiracicaba, isPiracicaba } from '@/utils/bairrosPiracicaba'
import { v4 as uuidv4 } from 'uuid'
import { Plus, Search, MapPin, User, Mail, Phone, Trash2, Edit2, Filter, CheckCircle, Flame, Link2, ListTodo, TrendingUp, Target, BarChart3, Building2, Calendar, Sparkles, ArrowRight, Eye } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { useClientesStore } from '@/stores/clientesStore'
import { Tarefa, Prioridade, CategoriaTarefa, StatusTarefa } from '@/types'

export default function LeadsPage() {
  const { leads, addLead, updateLead, deleteLead } = useLeadsStore()
  const { addCliente, getClienteByLeadId } = useClientesStore()
  const addTarefa = useTarefasStore((state) => state.addTarefa)
  const tarefas = useTarefasStore((state) => state.tarefas)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTarefaModalOpen, setIsTarefaModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingLead, setViewingLead] = useState<Lead | null>(null)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [leadParaTarefa, setLeadParaTarefa] = useState<Lead | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<string>('')
  const [filtroCidade, setFiltroCidade] = useState<string>('')
  const [filtroStatus, setFiltroStatus] = useState<Lead['status'] | ''>('')
  const [estadoSelecionado, setEstadoSelecionado] = useState<string>('')
  const [cidadeSelecionada, setCidadeSelecionada] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const contactado = formData.get('contactado') === 'on'
    let dataContato: string | undefined = undefined
    
    if (contactado) {
      if (editingLead?.contactado) {
        dataContato = editingLead.dataContato
      } else {
        dataContato = new Date().toISOString().split('T')[0]
      }
    }
    
    const temSiteValue = formData.get('temSite') as string
    const temSite = temSiteValue === 'sim'
    const leadQuente = temSiteValue === 'nao'
    
    const novoLead: Lead = {
      id: editingLead?.id || uuidv4(),
      nome: (formData.get('nome') as string) || 'Sem nome',
      email: formData.get('email') as string || undefined,
      telefone: formData.get('telefone') as string || undefined,
      estado: (formData.get('estado') as string) || 'SP',
      cidade: (formData.get('cidade') as string) || 'Não informado',
      bairro: (formData.get('bairro') as string) || 'Não informado',
      nicho: formData.get('nicho') as string || undefined,
      observacoes: formData.get('observacoes') as string || undefined,
      status: (formData.get('status') as Lead['status']) || 'Novo',
      dataCriacao: editingLead?.dataCriacao || new Date().toISOString().split('T')[0],
      origem: formData.get('origem') as string || undefined,
      contactado: contactado,
      dataContato: dataContato,
      temSite: temSite ?? undefined,
      leadQuente: leadQuente,
    }

    if (editingLead) {
      updateLead(editingLead.id, novoLead)
    } else {
      addLead(novoLead)
    }

    setIsModalOpen(false)
    setEditingLead(null)
    setEstadoSelecionado('')
    setCidadeSelecionada('')
  }

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead)
    setEstadoSelecionado(lead.estado)
    setCidadeSelecionada(lead.cidade)
    setIsModalOpen(true)
  }

  const handleView = (lead: Lead) => {
    setViewingLead(lead)
    setIsViewModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lead?')) {
      deleteLead(id)
    }
  }

  const handleConverterCliente = (lead: Lead) => {
    if (confirm(`Deseja converter o lead "${lead.nome}" em cliente?`)) {
      const clienteExistente = getClienteByLeadId(lead.id)
      
      if (clienteExistente) {
        alert('Este lead já foi convertido em cliente!')
        return
      }

      addCliente({
        id: uuidv4(),
        nome: lead.nome,
        email: lead.email,
        telefone: lead.telefone,
        cidade: lead.cidade,
        estado: lead.estado,
        endereco: lead.bairro,
        status: 'Prospecto',
        valorTotal: 0,
        observacoes: lead.observacoes,
        leadId: lead.id,
        dataCadastro: new Date().toISOString().split('T')[0],
      })

      updateLead(lead.id, { status: 'Convertido' })
      alert('Lead convertido em cliente com sucesso!')
    }
  }

  const handleVincularTarefa = (lead: Lead) => {
    setLeadParaTarefa(lead)
    setIsTarefaModalOpen(true)
  }

  const handleSubmitTarefa = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!leadParaTarefa) return

    const formData = new FormData(e.currentTarget)
    const novaTarefa: Tarefa = {
      id: uuidv4(),
      titulo: (formData.get('titulo') as string) || `Tarefa - ${leadParaTarefa.nome}`,
      descricao: formData.get('descricao') as string || undefined,
      prioridade: (formData.get('prioridade') as Prioridade) || 'Média',
      categoria: 'Empresarial' as CategoriaTarefa,
      data: (formData.get('data') as string) || new Date().toISOString().split('T')[0],
      status: 'Pendente' as StatusTarefa,
      tarefaRapida: formData.get('tarefaRapida') === 'on',
      recorrente: false,
      concluida: false,
      etiquetas: [`Lead: ${leadParaTarefa.nome}`],
      projetoId: undefined,
    }

    addTarefa(novaTarefa)
    setIsTarefaModalOpen(false)
    setLeadParaTarefa(null)
  }

  const handleEstadoChange = (estado: string) => {
    setEstadoSelecionado(estado)
    setCidadeSelecionada('')
  }

  const cidadesDisponiveis = estadoSelecionado ? getCidadesByEstado(estadoSelecionado) : []

  // Filtros
  const leadsFiltrados = useMemo(() => {
    return leads.filter(lead => {
      const matchSearch = searchTerm === '' || 
        lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.telefone?.includes(searchTerm) ||
        lead.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.bairro.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.nicho?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchEstado = filtroEstado === '' || lead.estado === filtroEstado
      const matchCidade = filtroCidade === '' || lead.cidade === filtroCidade
      const matchStatus = filtroStatus === '' || lead.status === filtroStatus

      return matchSearch && matchEstado && matchCidade && matchStatus
    })
  }, [leads, searchTerm, filtroEstado, filtroCidade, filtroStatus])

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'Novo':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-blue-500/20'
      case 'Contatado':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 shadow-yellow-500/20'
      case 'Qualificado':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30 shadow-purple-500/20'
      case 'Convertido':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-emerald-500/20'
      case 'Perdido':
        return 'bg-red-500/20 text-red-400 border-red-500/30 shadow-red-500/20'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  // Estatísticas
  const leadsNovos = leads.filter(l => l.status === 'Novo').length
  const leadsContatados = leads.filter(l => l.status === 'Contatado').length
  const leadsQualificados = leads.filter(l => l.status === 'Qualificado').length
  const leadsConvertidos = leads.filter(l => l.status === 'Convertido').length
  const leadsQuentes = leads.filter(l => l.leadQuente).length
  const taxaConversao = leads.length > 0 ? Math.round((leadsConvertidos / leads.length) * 100) : 0

  // Dados para gráficos
  const dadosStatus = useMemo(() => {
    const statusCount = leads.reduce((acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return Object.entries(statusCount).map(([name, value]) => ({ name, value }))
  }, [leads])

  const coresStatus = ['#3b82f6', '#eab308', '#8b5cf6', '#22c55e', '#ef4444']

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Premium */}
        <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 border-2 border-blue-500/30 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                  <Target className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-1">Gestão de Leads</h1>
                  <p className="text-gray-300 text-sm sm:text-base">Sistema profissional de captação e qualificação de oportunidades</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingLead(null)
                setEstadoSelecionado('')
                setCidadeSelecionada('')
                setIsModalOpen(true)
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-600/50"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Novo Lead
            </Button>
          </div>
        </div>

        {/* Cards de Resumo Premium */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
          <StatCard
            title="Total Leads"
            value={leads.length}
            icon={Target}
            valueColor="text-blue-400"
          />
          <StatCard
            title="Novos"
            value={leadsNovos}
            icon={Sparkles}
            valueColor="text-blue-400"
          />
          <StatCard
            title="Contatados"
            value={leadsContatados}
            icon={Phone}
            valueColor="text-yellow-400"
          />
          <StatCard
            title="Qualificados"
            value={leadsQualificados}
            icon={TrendingUp}
            valueColor="text-purple-400"
          />
          <StatCard
            title="Convertidos"
            value={leadsConvertidos}
            icon={CheckCircle}
            valueColor="text-emerald-400"
          />
          <StatCard
            title="Taxa Conversão"
            value={`${taxaConversao}%`}
            icon={BarChart3}
            valueColor="text-cyan-400"
          />
        </div>

        {/* Filtros Avançados */}
        <div className="bg-card-bg/90 backdrop-blur-sm border-2 border-card-border/50 rounded-xl p-4 sm:p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-accent-electric" />
            <h3 className="text-lg font-bold text-white">Filtros Avançados</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, email, telefone, cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-dark-black/80 border-2 border-card-border/50 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/30 transition-all"
              />
            </div>
            <select
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value)
                setFiltroCidade('')
              }}
              className="px-4 py-3 bg-dark-black/80 border-2 border-card-border/50 rounded-xl text-white text-sm focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/30 transition-all"
            >
              <option value="">Todos os Estados</option>
              {estadosBrasil.map((estado) => (
                <option key={estado.sigla} value={estado.sigla}>
                  {estado.nome}
                </option>
              ))}
            </select>
            <select
              value={filtroCidade}
              onChange={(e) => setFiltroCidade(e.target.value)}
              className="px-4 py-3 bg-dark-black/80 border-2 border-card-border/50 rounded-xl text-white text-sm focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/30 transition-all disabled:opacity-50"
              disabled={!filtroEstado}
            >
              <option value="">Todas as Cidades</option>
              {filtroEstado && getCidadesByEstado(filtroEstado).map((cidade) => (
                <option key={cidade} value={cidade}>
                  {cidade}
                </option>
              ))}
            </select>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as Lead['status'] | '')}
              className="px-4 py-3 bg-dark-black/80 border-2 border-card-border/50 rounded-xl text-white text-sm focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/30 transition-all"
            >
              <option value="">Todos os Status</option>
              <option value="Novo">Novo</option>
              <option value="Contatado">Contatado</option>
              <option value="Qualificado">Qualificado</option>
              <option value="Convertido">Convertido</option>
              <option value="Perdido">Perdido</option>
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-accent-electric/20 text-accent-electric border-2 border-accent-electric/30 shadow-lg shadow-accent-electric/20'
                  : 'bg-dark-black/50 text-gray-400 border-2 border-card-border/50 hover:border-accent-electric/30'
              }`}
            >
              Grade
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-accent-electric/20 text-accent-electric border-2 border-accent-electric/30 shadow-lg shadow-accent-electric/20'
                  : 'bg-dark-black/50 text-gray-400 border-2 border-card-border/50 hover:border-accent-electric/30'
              }`}
            >
              Lista
            </button>
          </div>
        </div>

        {/* Gráfico Premium */}
        {leads.length > 0 && (
          <div className="bg-card-bg/90 backdrop-blur-sm border-2 border-card-border/50 rounded-xl p-4 sm:p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-accent-electric" />
              Análise de Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '2px solid #374151',
                    borderRadius: '12px',
                    color: '#fff',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                  }}
                />
                <Legend />
                <Pie
                  data={dadosStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={coresStatus[index % coresStatus.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Lista de Leads Premium */}
        <div className="bg-card-bg/90 backdrop-blur-sm border-2 border-card-border/50 rounded-xl p-4 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-accent-electric/20 rounded-lg border border-accent-electric/30">
                <Target className="w-6 h-6 text-accent-electric" />
              </div>
              Leads Encontrados ({leadsFiltrados.length})
            </h2>
            {leadsQuentes > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-xl">
                <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
                <span className="text-orange-400 font-bold">{leadsQuentes} Leads Quentes</span>
              </div>
            )}
          </div>
          {leadsFiltrados.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
              : 'space-y-4'
            }>
              {leadsFiltrados.map((lead) => {
                const tarefasLead = tarefas.filter(t => 
                  t.etiquetas?.some(e => e.includes(lead.nome))
                )
                const diasDesdeCriacao = Math.floor(
                  (new Date().getTime() - new Date(lead.dataCriacao).getTime()) / (1000 * 60 * 60 * 24)
                )
                return (
                  <div
                    key={lead.id}
                    className={`group relative p-6 bg-gradient-to-br from-dark-black/80 to-dark-black/40 border-2 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                      lead.leadQuente 
                        ? 'border-orange-500/50 shadow-orange-500/20 ring-2 ring-orange-500/30' 
                        : 'border-card-border/50 hover:border-accent-electric/50'
                    } ${viewMode === 'list' ? 'flex items-start justify-between' : ''}`}
                  >
                    {/* Badge de Lead Quente */}
                    {lead.leadQuente && (
                      <div className="absolute -top-3 -right-3 px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        QUENTE
                      </div>
                    )}

                    <div className={`flex-1 ${viewMode === 'list' ? 'pr-4' : ''}`}>
                      {/* Header do Card */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-3 rounded-xl border-2 ${
                              lead.leadQuente 
                                ? 'bg-orange-500/20 border-orange-500/30' 
                                : 'bg-blue-500/20 border-blue-500/30'
                            }`}>
                              <User className={`w-5 h-5 ${
                                lead.leadQuente ? 'text-orange-400' : 'text-blue-400'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-bold text-white mb-1 truncate">{lead.nome}</h3>
                              <p className="text-xs text-gray-400">
                                Criado há {diasDesdeCriacao} {diasDesdeCriacao === 1 ? 'dia' : 'dias'}
                              </p>
                            </div>
                          </div>
                          
                          {/* Status e Badges */}
                          <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 shadow-lg ${getStatusColor(lead.status)}`}>
                              {lead.status}
                            </span>
                            {lead.contactado && (
                              <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/30 shadow-lg flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Contactado
                              </span>
                            )}
                            {lead.leadQuente && (
                              <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-500/20 text-orange-400 border-2 border-orange-500/30 shadow-lg flex items-center gap-1.5 animate-pulse">
                                <Flame className="w-3.5 h-3.5" />
                                LEAD QUENTE
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Ações Rápidas - Grid */}
                        {viewMode === 'grid' && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleView(lead)}
                              className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors border border-blue-500/20"
                              title="Visualizar"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleVincularTarefa(lead)}
                              className="p-2 text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors border border-purple-500/20"
                              title="Vincular Tarefa"
                            >
                              <Link2 className="w-4 h-4" />
                            </button>
                            {lead.status !== 'Convertido' && (
                              <button
                                onClick={() => handleConverterCliente(lead)}
                                className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors border border-emerald-500/20"
                                title="Converter em Cliente"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(lead)}
                              className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors border border-accent-electric/20"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(lead.id)}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Informações de Contato */}
                      <div className="space-y-2.5 mb-4 p-4 bg-dark-black/30 rounded-xl border border-card-border/30">
                        {lead.email && (
                          <div className="flex items-center gap-3 text-sm">
                            <div className="p-1.5 bg-blue-500/20 rounded-lg">
                              <Mail className="w-4 h-4 text-blue-400" />
                            </div>
                            <span className="text-gray-300 truncate">{lead.email}</span>
                          </div>
                        )}
                        {lead.telefone && (
                          <div className="flex items-center gap-3 text-sm">
                            <div className="p-1.5 bg-green-500/20 rounded-lg">
                              <Phone className="w-4 h-4 text-green-400" />
                            </div>
                            <span className="text-gray-300">{lead.telefone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-3 text-sm">
                          <div className="p-1.5 bg-purple-500/20 rounded-lg">
                            <MapPin className="w-4 h-4 text-purple-400" />
                          </div>
                          <span className="text-gray-300">
                            {getEstadoNome(lead.estado)} - {lead.cidade} - {lead.bairro}
                          </span>
                        </div>
                        {lead.nicho && (
                          <div className="flex items-center gap-3 text-sm">
                            <div className="p-1.5 bg-cyan-500/20 rounded-lg">
                              <Building2 className="w-4 h-4 text-cyan-400" />
                            </div>
                            <span className="text-gray-300">
                              <span className="font-semibold text-accent-electric">Nicho:</span> {lead.nicho}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Informações Adicionais */}
                      {lead.origem && (
                        <div className="mb-4 p-3 bg-blue-500/10 border-2 border-blue-500/20 rounded-xl">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-blue-300 font-semibold">Origem: {lead.origem}</span>
                          </div>
                        </div>
                      )}

                      {/* Tarefas Vinculadas */}
                      {tarefasLead.length > 0 && (
                        <div className="mb-4 p-3 bg-purple-500/10 border-2 border-purple-500/20 rounded-xl">
                          <div className="flex items-center gap-2">
                            <ListTodo className="w-4 h-4 text-purple-400" />
                            <span className="text-sm text-purple-300 font-semibold">
                              {tarefasLead.length} tarefa(s) vinculada(s)
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Observações */}
                      {lead.observacoes && (
                        <div className="mb-4 p-3 bg-dark-black/30 rounded-xl border border-card-border/30">
                          <p className="text-sm text-gray-300 line-clamp-2">{lead.observacoes}</p>
                        </div>
                      )}

                      {/* Ações - Grid */}
                      {viewMode === 'grid' && (
                        <div className="flex gap-2 pt-4 border-t border-card-border/30">
                          <button
                            onClick={() => handleVincularTarefa(lead)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border-2 border-purple-500/30 rounded-xl transition-all hover:scale-105"
                          >
                            <Link2 className="w-4 h-4" />
                            Vincular Tarefa
                          </button>
                          {lead.status !== 'Convertido' && (
                            <button
                              onClick={() => handleConverterCliente(lead)}
                              className="px-4 py-2.5 text-sm font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border-2 border-emerald-500/30 rounded-xl transition-all hover:scale-105"
                              title="Converter em Cliente"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(lead)}
                            className="px-4 py-2.5 text-sm font-semibold bg-accent-electric/20 hover:bg-accent-electric/30 text-accent-electric border-2 border-accent-electric/30 rounded-xl transition-all hover:scale-105"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Ações - Lista */}
                    {viewMode === 'list' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(lead)}
                          className="p-2.5 text-blue-400 hover:bg-blue-500/10 rounded-xl transition-colors border border-blue-500/20"
                          title="Visualizar"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleVincularTarefa(lead)}
                          className="p-2.5 text-purple-400 hover:bg-purple-500/10 rounded-xl transition-colors border border-purple-500/20"
                          title="Vincular Tarefa"
                        >
                          <Link2 className="w-5 h-5" />
                        </button>
                        {lead.status !== 'Convertido' && (
                          <button
                            onClick={() => handleConverterCliente(lead)}
                            className="p-2.5 text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-colors border border-emerald-500/20"
                            title="Converter em Cliente"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(lead)}
                          className="p-2.5 text-accent-electric hover:bg-accent-electric/10 rounded-xl transition-colors border border-accent-electric/20"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="p-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors border border-red-500/20"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="p-6 bg-blue-500/10 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center border-2 border-blue-500/30">
                <Target className="w-12 h-12 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Nenhum lead encontrado</h3>
              <p className="text-gray-400 mb-6">Comece adicionando seu primeiro lead para começar a captar oportunidades</p>
              <Button
                onClick={() => {
                  setEditingLead(null)
                  setEstadoSelecionado('')
                  setCidadeSelecionada('')
                  setIsModalOpen(true)
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600"
              >
                <Plus className="w-5 h-5 mr-2" />
                Criar Primeiro Lead
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Visualização Premium */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setViewingLead(null)
        }}
        title={`Detalhes do Lead - ${viewingLead?.nome || ''}`}
        size="lg"
      >
        {viewingLead && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">Nome</p>
                <p className="text-lg font-bold text-white">{viewingLead.nome}</p>
              </div>
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold border-2 ${getStatusColor(viewingLead.status)}`}>
                  {viewingLead.status}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {viewingLead.email && (
                <div className="p-4 bg-dark-black/50 border border-card-border rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <p className="text-xs text-gray-400">Email</p>
                  </div>
                  <p className="text-sm font-semibold text-white">{viewingLead.email}</p>
                </div>
              )}
              {viewingLead.telefone && (
                <div className="p-4 bg-dark-black/50 border border-card-border rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-green-400" />
                    <p className="text-xs text-gray-400">Telefone</p>
                  </div>
                  <p className="text-sm font-semibold text-white">{viewingLead.telefone}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-dark-black/50 border border-card-border rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                <p className="text-xs text-gray-400">Localização</p>
              </div>
              <p className="text-sm font-semibold text-white">
                {getEstadoNome(viewingLead.estado)} - {viewingLead.cidade} - {viewingLead.bairro}
              </p>
            </div>

            {viewingLead.nicho && (
              <div className="p-4 bg-dark-black/50 border border-card-border rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  <p className="text-xs text-gray-400">Nicho</p>
                </div>
                <p className="text-sm font-semibold text-white">{viewingLead.nicho}</p>
              </div>
            )}

            {viewingLead.observacoes && (
              <div className="p-4 bg-dark-black/50 border border-card-border rounded-xl">
                <p className="text-xs text-gray-400 mb-2">Observações</p>
                <p className="text-sm text-gray-300 whitespace-pre-line">{viewingLead.observacoes}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  setIsViewModalOpen(false)
                  handleVincularTarefa(viewingLead)
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <Link2 className="w-4 h-4 mr-2" />
                Vincular Tarefa
              </Button>
              {viewingLead.status !== 'Convertido' && (
                <Button
                  onClick={() => {
                    setIsViewModalOpen(false)
                    handleConverterCliente(viewingLead)
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Converter em Cliente
                </Button>
              )}
              <Button
                onClick={() => {
                  setIsViewModalOpen(false)
                  handleEdit(viewingLead)
                }}
                variant="secondary"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Lead */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingLead(null)
          setEstadoSelecionado('')
          setCidadeSelecionada('')
        }}
        title={editingLead ? 'Editar Lead' : 'Novo Lead'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nome
            </label>
            <input
              type="text"
              name="nome"
              defaultValue={editingLead?.nome}
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                defaultValue={editingLead?.email}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Telefone
              </label>
              <input
                type="tel"
                name="telefone"
                defaultValue={editingLead?.telefone}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Estado
            </label>
            <select
              name="estado"
              value={estadoSelecionado}
              onChange={(e) => handleEstadoChange(e.target.value)}
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            >
              <option value="">Selecione o Estado</option>
              {estadosBrasil.map((estado) => (
                <option key={estado.sigla} value={estado.sigla}>
                  {estado.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cidade
            </label>
            <select
              name="cidade"
              value={cidadeSelecionada}
              onChange={(e) => setCidadeSelecionada(e.target.value)}
              disabled={!estadoSelecionado}
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Selecione a Cidade</option>
              {cidadesDisponiveis.map((cidade) => (
                <option key={cidade} value={cidade}>
                  {cidade}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bairro
            </label>
            {cidadeSelecionada && isPiracicaba(cidadeSelecionada) ? (
              <select
                name="bairro"
                defaultValue={editingLead?.bairro || ''}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              >
                <option value="">Selecione o Bairro</option>
                {bairrosPiracicaba.map((bairro) => (
                  <option key={bairro} value={bairro}>
                    {bairro}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name="bairro"
                defaultValue={editingLead?.bairro}
                placeholder="Digite o bairro"
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nicho
            </label>
            <input
              type="text"
              name="nicho"
              defaultValue={editingLead?.nicho}
              placeholder="Ex: Tecnologia, Alimentação, Varejo..."
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                defaultValue={editingLead?.status || 'Novo'}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              >
                <option value="Novo">Novo</option>
                <option value="Contatado">Contatado</option>
                <option value="Qualificado">Qualificado</option>
                <option value="Convertido">Convertido</option>
                <option value="Perdido">Perdido</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Origem
              </label>
              <input
                type="text"
                name="origem"
                defaultValue={editingLead?.origem}
                placeholder="Ex: Site, Facebook, Indicação..."
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              A empresa tem site?
            </label>
            <select
              name="temSite"
              defaultValue={editingLead?.temSite === true ? 'sim' : editingLead?.temSite === false ? 'nao' : ''}
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            >
              <option value="">Selecione</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
            {editingLead?.leadQuente && (
              <p className="mt-2 text-sm text-orange-400 font-semibold flex items-center gap-2">
                <span className="px-2 py-1 bg-orange-500/15 border border-orange-500/20 rounded text-xs">🔥 LEAD QUENTE</span>
                <span className="text-gray-400">Empresa sem site identificada</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Observações
            </label>
            <textarea
              name="observacoes"
              defaultValue={editingLead?.observacoes}
              rows={3}
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-card-bg/50 border border-card-border rounded-xl">
            <input
              type="checkbox"
              id="contactado"
              name="contactado"
              defaultChecked={editingLead?.contactado || false}
              className="w-5 h-5 rounded border-gray-600 bg-card-bg text-accent-electric focus:ring-accent-electric focus:ring-2 cursor-pointer"
            />
            <label htmlFor="contactado" className="text-sm font-medium text-gray-300 cursor-pointer flex-1">
              Contactado
            </label>
            {editingLead?.dataContato && (
              <span className="text-xs text-gray-400">
                Data: {new Date(editingLead.dataContato).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingLead ? 'Salvar Alterações' : 'Criar Lead'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false)
                setEditingLead(null)
                setEstadoSelecionado('')
                setCidadeSelecionada('')
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Vincular Tarefa */}
      <Modal
        isOpen={isTarefaModalOpen}
        onClose={() => {
          setIsTarefaModalOpen(false)
          setLeadParaTarefa(null)
        }}
        title={`Vincular Tarefa - ${leadParaTarefa?.nome || ''}`}
        size="md"
      >
        <form onSubmit={handleSubmitTarefa} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título da Tarefa
            </label>
            <input
              type="text"
              name="titulo"
              defaultValue={`Tarefa - ${leadParaTarefa?.nome || ''}`}
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descrição
            </label>
            <textarea
              name="descricao"
              rows={3}
              placeholder="Descreva a tarefa relacionada a este lead..."
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prioridade
              </label>
              <select
                name="prioridade"
                defaultValue="Média"
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data
              </label>
              <input
                type="date"
                name="data"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="tarefaRapida"
                className="w-4 h-4 rounded border-card-border bg-card-bg text-accent-electric focus:ring-accent-electric"
              />
              <span className="text-sm text-gray-300">Tarefa Rápida (2 min)</span>
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              <Link2 className="w-4 h-4 mr-2" />
              Vincular Tarefa
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsTarefaModalOpen(false)
                setLeadParaTarefa(null)
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  )
}
