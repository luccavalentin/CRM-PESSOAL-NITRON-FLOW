'use client'

import { useState, useMemo } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { useClientesStore, Cliente } from '@/stores/clientesStore'
import { useTarefasStore } from '@/stores/tarefasStore'
import { formatCurrency } from '@/utils/formatCurrency'
import { Plus, Users, TrendingUp, DollarSign, Phone, Mail, MapPin, Trash2, Edit2, Search, Filter, Building2, Calendar, Link2, ListTodo, X, Eye, Sparkles, BarChart3, Target, Award } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { Tarefa, Prioridade, CategoriaTarefa, StatusTarefa } from '@/types'
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

export default function CRMPage() {
  const { clientes, addCliente, updateCliente, deleteCliente } = useClientesStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTarefaModalOpen, setIsTarefaModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingCliente, setViewingCliente] = useState<Cliente | null>(null)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [clienteParaTarefa, setClienteParaTarefa] = useState<Cliente | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const addTarefa = useTarefasStore((state) => state.addTarefa)
  const tarefas = useTarefasStore((state) => state.tarefas)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novoCliente: Cliente = {
      id: editingCliente?.id || uuidv4(),
      nome: (formData.get('nome') as string) || 'Sem nome',
      email: formData.get('email') as string || undefined,
      telefone: formData.get('telefone') as string || undefined,
      empresa: formData.get('empresa') as string || undefined,
      endereco: formData.get('endereco') as string || undefined,
      cidade: formData.get('cidade') as string || undefined,
      estado: formData.get('estado') as string || undefined,
      status: (formData.get('status') as Cliente['status']) || 'Prospecto',
      valorTotal: parseFloat(formData.get('valorTotal') as string) || 0,
      ultimaInteracao: formData.get('ultimaInteracao') as string || undefined,
      observacoes: formData.get('observacoes') as string || undefined,
      leadId: editingCliente?.leadId,
      dataCadastro: editingCliente?.dataCadastro || new Date().toISOString().split('T')[0],
    }

    if (editingCliente) {
      updateCliente(editingCliente.id, novoCliente)
    } else {
      addCliente(novoCliente)
    }

    setIsModalOpen(false)
    setEditingCliente(null)
  }

  const handleView = (cliente: Cliente) => {
    setViewingCliente(cliente)
    setIsViewModalOpen(true)
  }

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setIsModalOpen(true)
    setIsViewModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      deleteCliente(id)
    }
  }

  const handleVincularTarefa = (cliente: Cliente) => {
    setClienteParaTarefa(cliente)
    setIsTarefaModalOpen(true)
  }

  const handleSubmitTarefa = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!clienteParaTarefa) return

    const formData = new FormData(e.currentTarget)
    const novaTarefa: Tarefa = {
      id: uuidv4(),
      titulo: (formData.get('titulo') as string) || `Tarefa - ${clienteParaTarefa.nome}`,
      descricao: formData.get('descricao') as string || undefined,
      prioridade: (formData.get('prioridade') as Prioridade) || 'Média',
      categoria: 'Empresarial' as CategoriaTarefa,
      data: (formData.get('data') as string) || new Date().toISOString().split('T')[0],
      status: 'Pendente' as StatusTarefa,
      tarefaRapida: formData.get('tarefaRapida') === 'on',
      recorrente: false,
      concluida: false,
      etiquetas: [`Cliente: ${clienteParaTarefa.nome}`],
      projetoId: undefined,
    }

    addTarefa(novaTarefa)
    setIsTarefaModalOpen(false)
    setClienteParaTarefa(null)
  }

  const clientesFiltrados = useMemo(() => {
    return clientes.filter(cliente => {
      const matchSearch = searchTerm === '' || 
        cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.empresa?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatus = filtroStatus === '' || cliente.status === filtroStatus
      return matchSearch && matchStatus
    })
  }, [clientes, searchTerm, filtroStatus])

  const clientesAtivos = clientes.filter(c => c.status === 'Ativo').length
  const totalFaturamento = clientes.reduce((acc, c) => acc + c.valorTotal, 0)
  const leadsConvertidos = clientes.filter(c => c.leadId).length
  const clientesProspecto = clientes.filter(c => c.status === 'Prospecto').length
  const ticketMedio = clientesAtivos > 0 ? totalFaturamento / clientesAtivos : 0

  // Dados para gráficos
  const dadosStatus = useMemo(() => {
    const statusCount = clientes.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return Object.entries(statusCount).map(([name, value]) => ({ name, value }))
  }, [clientes])

  const dadosFaturamento = useMemo(() => {
    return clientes
      .filter(c => c.valorTotal > 0)
      .sort((a, b) => b.valorTotal - a.valorTotal)
      .slice(0, 10)
      .map(c => ({
        nome: c.nome.length > 15 ? c.nome.substring(0, 15) + '...' : c.nome,
        valor: c.valorTotal,
      }))
  }, [clientes])

  const coresStatus = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']

  const getStatusColor = (status: Cliente['status']) => {
    switch (status) {
      case 'Ativo':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-emerald-500/20'
      case 'Inativo':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      case 'Prospecto':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-blue-500/20'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Premium */}
        <div className="bg-gradient-to-r from-emerald-600/20 via-blue-600/20 to-cyan-600/20 border-2 border-emerald-500/30 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-1">Gestão de Clientes</h1>
                  <p className="text-gray-300 text-sm sm:text-base">CRM profissional para gerenciar relacionamentos e vendas</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingCliente(null)
                setIsModalOpen(true)
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-600/50"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Novo Cliente
            </Button>
          </div>
        </div>

        {/* Cards de Resumo Premium */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          <StatCard
            title="Total de Clientes"
            value={clientes.length}
            icon={Users}
            valueColor="text-blue-400"
          />
          <StatCard
            title="Clientes Ativos"
            value={clientesAtivos}
            icon={TrendingUp}
            valueColor="text-emerald-400"
          />
          <StatCard
            title="Total Faturamento"
            value={formatCurrency(totalFaturamento)}
            icon={DollarSign}
            valueColor="text-accent-electric"
          />
          <StatCard
            title="Ticket Médio"
            value={formatCurrency(ticketMedio)}
            icon={Award}
            valueColor="text-cyan-400"
          />
          <StatCard
            title="Prospectos"
            value={clientesProspecto}
            icon={Target}
            valueColor="text-yellow-400"
          />
        </div>

        {/* Filtros Avançados */}
        <div className="bg-card-bg/90 backdrop-blur-sm border-2 border-card-border/50 rounded-xl p-4 sm:p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-accent-electric" />
            <h3 className="text-lg font-bold text-white">Filtros Avançados</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email, empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-dark-black/80 border-2 border-card-border/50 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/30 transition-all"
                />
              </div>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="px-4 py-3 bg-dark-black/80 border-2 border-card-border/50 rounded-xl text-white text-sm focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/30 transition-all"
              >
                <option value="">Todos os Status</option>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Prospecto">Prospecto</option>
              </select>
            </div>
            <div className="flex gap-2">
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
        </div>

        {/* Gráficos Premium */}
        {clientes.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-card-bg/90 backdrop-blur-sm border-2 border-card-border/50 rounded-xl p-4 sm:p-6 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Filter className="w-6 h-6 text-accent-electric" />
                Distribuição por Status
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
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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

            <div className="bg-card-bg/90 backdrop-blur-sm border-2 border-card-border/50 rounded-xl p-4 sm:p-6 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-accent-electric" />
                Top 10 Faturamento
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosFaturamento}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="nome" stroke="#9CA3AF" fontSize={12} angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '2px solid #374151',
                      borderRadius: '12px',
                      color: '#fff',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="valor" fill="#00d4ff" name="Faturamento" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Lista de Clientes Premium */}
        <div className="bg-card-bg/90 backdrop-blur-sm border-2 border-card-border/50 rounded-xl p-4 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                <Users className="w-6 h-6 text-emerald-400" />
              </div>
              Clientes ({clientesFiltrados.length})
            </h2>
          </div>
          {clientesFiltrados.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
              : 'space-y-4'
            }>
              {clientesFiltrados.map((cliente) => {
                const tarefasCliente = tarefas.filter(t => 
                  t.etiquetas?.some(e => e.includes(cliente.nome))
                )
                const diasDesdeCadastro = Math.floor(
                  (new Date().getTime() - new Date(cliente.dataCadastro).getTime()) / (1000 * 60 * 60 * 24)
                )
                return (
                  <div
                    key={cliente.id}
                    className={`group relative p-6 bg-gradient-to-br from-dark-black/80 to-dark-black/40 border-2 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                      cliente.status === 'Ativo'
                        ? 'border-emerald-500/50 shadow-emerald-500/20'
                        : 'border-card-border/50 hover:border-accent-electric/50'
                    } ${viewMode === 'list' ? 'flex items-start justify-between' : ''}`}
                  >
                    <div className={`flex-1 ${viewMode === 'list' ? 'pr-4' : ''}`}>
                      {/* Header do Card */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-3 rounded-xl border-2 ${
                              cliente.status === 'Ativo'
                                ? 'bg-emerald-500/20 border-emerald-500/30'
                                : 'bg-blue-500/20 border-blue-500/30'
                            }`}>
                              <Building2 className={`w-5 h-5 ${
                                cliente.status === 'Ativo' ? 'text-emerald-400' : 'text-blue-400'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-bold text-white mb-1 truncate">{cliente.nome}</h3>
                              {cliente.empresa && (
                                <p className="text-sm text-gray-400 truncate">{cliente.empresa}</p>
                              )}
                            </div>
                          </div>
                          
                          {/* Status */}
                          <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold border-2 shadow-lg mb-3 ${getStatusColor(cliente.status)}`}>
                            {cliente.status}
                          </span>
                        </div>
                        
                        {/* Ações Rápidas - Grid */}
                        {viewMode === 'grid' && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleView(cliente)}
                              className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors border border-blue-500/20"
                              title="Visualizar"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleVincularTarefa(cliente)}
                              className="p-2 text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors border border-purple-500/20"
                              title="Vincular Tarefa"
                            >
                              <Link2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingCliente(cliente)
                                setIsModalOpen(true)
                              }}
                              className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors border border-accent-electric/20"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(cliente.id)}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Informações de Contato */}
                      <div className="space-y-2.5 mb-4 p-4 bg-dark-black/30 rounded-xl border border-card-border/30">
                        {cliente.email && (
                          <div className="flex items-center gap-3 text-sm">
                            <div className="p-1.5 bg-blue-500/20 rounded-lg">
                              <Mail className="w-4 h-4 text-blue-400" />
                            </div>
                            <span className="text-gray-300 truncate">{cliente.email}</span>
                          </div>
                        )}
                        {cliente.telefone && (
                          <div className="flex items-center gap-3 text-sm">
                            <div className="p-1.5 bg-green-500/20 rounded-lg">
                              <Phone className="w-4 h-4 text-green-400" />
                            </div>
                            <span className="text-gray-300">{cliente.telefone}</span>
                          </div>
                        )}
                        {(cliente.cidade || cliente.estado) && (
                          <div className="flex items-center gap-3 text-sm">
                            <div className="p-1.5 bg-purple-500/20 rounded-lg">
                              <MapPin className="w-4 h-4 text-purple-400" />
                            </div>
                            <span className="text-gray-300">
                              {cliente.cidade}{cliente.estado ? ` - ${cliente.estado}` : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Faturamento */}
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-accent-electric/10 to-cyan-500/10 border-2 border-accent-electric/30 rounded-xl mb-4">
                        <div>
                          <span className="text-xs text-gray-400 block mb-1">Faturamento Total</span>
                          <span className="text-2xl font-extrabold text-accent-electric">
                            {formatCurrency(cliente.valorTotal)}
                          </span>
                        </div>
                        {cliente.valorTotal > 0 && (
                          <div className="p-3 bg-accent-electric/20 rounded-xl border border-accent-electric/30">
                            <DollarSign className="w-6 h-6 text-accent-electric" />
                          </div>
                        )}
                      </div>

                      {/* Informações Adicionais */}
                      {cliente.ultimaInteracao && (
                        <div className="mb-4 p-3 bg-blue-500/10 border-2 border-blue-500/20 rounded-xl">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-blue-300 font-semibold">
                              Última interação: {new Date(cliente.ultimaInteracao).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Tarefas Vinculadas */}
                      {tarefasCliente.length > 0 && (
                        <div className="mb-4 p-3 bg-purple-500/10 border-2 border-purple-500/20 rounded-xl">
                          <div className="flex items-center gap-2">
                            <ListTodo className="w-4 h-4 text-purple-400" />
                            <span className="text-sm text-purple-300 font-semibold">
                              {tarefasCliente.length} tarefa(s) vinculada(s)
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Observações */}
                      {cliente.observacoes && (
                        <div className="mb-4 p-3 bg-dark-black/30 rounded-xl border border-card-border/30">
                          <p className="text-sm text-gray-300 line-clamp-2">{cliente.observacoes}</p>
                        </div>
                      )}

                      {/* Ações - Grid */}
                      {viewMode === 'grid' && (
                        <div className="flex gap-2 pt-4 border-t border-card-border/30">
                          <button
                            onClick={() => handleVincularTarefa(cliente)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border-2 border-purple-500/30 rounded-xl transition-all hover:scale-105"
                          >
                            <Link2 className="w-4 h-4" />
                            Vincular Tarefa
                          </button>
                          <button
                            onClick={() => {
                              setEditingCliente(cliente)
                              setIsModalOpen(true)
                            }}
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
                          onClick={() => handleView(cliente)}
                          className="p-2.5 text-blue-400 hover:bg-blue-500/10 rounded-xl transition-colors border border-blue-500/20"
                          title="Visualizar"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleVincularTarefa(cliente)}
                          className="p-2.5 text-purple-400 hover:bg-purple-500/10 rounded-xl transition-colors border border-purple-500/20"
                          title="Vincular Tarefa"
                        >
                          <Link2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingCliente(cliente)
                            setIsModalOpen(true)
                          }}
                          className="p-2.5 text-accent-electric hover:bg-accent-electric/10 rounded-xl transition-colors border border-accent-electric/20"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cliente.id)}
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
              <div className="p-6 bg-emerald-500/10 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center border-2 border-emerald-500/30">
                <Users className="w-12 h-12 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Nenhum cliente encontrado</h3>
              <p className="text-gray-400 mb-6">Comece adicionando seu primeiro cliente para gerenciar relacionamentos</p>
              <Button
                onClick={() => {
                  setEditingCliente(null)
                  setIsModalOpen(true)
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600"
              >
                <Plus className="w-5 h-5 mr-2" />
                Criar Primeiro Cliente
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
          setViewingCliente(null)
        }}
        title={`Detalhes do Cliente`}
        description={viewingCliente?.nome}
        size="lg"
        variant="info"
        icon={Eye}
      >
        {viewingCliente && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">Nome</p>
                <p className="text-lg font-bold text-white">{viewingCliente.nome}</p>
              </div>
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold border-2 ${getStatusColor(viewingCliente.status)}`}>
                  {viewingCliente.status}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {viewingCliente.email && (
                <div className="p-4 bg-dark-black/50 border border-card-border rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <p className="text-xs text-gray-400">Email</p>
                  </div>
                  <p className="text-sm font-semibold text-white">{viewingCliente.email}</p>
                </div>
              )}
              {viewingCliente.telefone && (
                <div className="p-4 bg-dark-black/50 border border-card-border rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-green-400" />
                    <p className="text-xs text-gray-400">Telefone</p>
                  </div>
                  <p className="text-sm font-semibold text-white">{viewingCliente.telefone}</p>
                </div>
              )}
            </div>

            {viewingCliente.empresa && (
              <div className="p-4 bg-dark-black/50 border border-card-border rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  <p className="text-xs text-gray-400">Empresa</p>
                </div>
                <p className="text-sm font-semibold text-white">{viewingCliente.empresa}</p>
              </div>
            )}

            <div className="p-4 bg-gradient-to-r from-accent-electric/10 to-cyan-500/10 border-2 border-accent-electric/30 rounded-xl">
              <p className="text-xs text-gray-400 mb-1">Faturamento Total</p>
              <p className="text-3xl font-extrabold text-accent-electric">
                {formatCurrency(viewingCliente.valorTotal)}
              </p>
            </div>

            {viewingCliente.observacoes && (
              <div className="p-4 bg-dark-black/50 border border-card-border rounded-xl">
                <p className="text-xs text-gray-400 mb-2">Observações</p>
                <p className="text-sm text-gray-300 whitespace-pre-line">{viewingCliente.observacoes}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  setIsViewModalOpen(false)
                  handleVincularTarefa(viewingCliente)
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <Link2 className="w-4 h-4 mr-2" />
                Vincular Tarefa
              </Button>
              <Button
                onClick={() => {
                  setIsViewModalOpen(false)
                  handleEdit(viewingCliente)
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

      {/* Modal de Cliente */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingCliente(null)
        }}
        title={editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
        description={editingCliente ? 'Atualize as informações do cliente' : 'Cadastre um novo cliente no sistema'}
        size="lg"
        variant="default"
        icon={editingCliente ? Edit2 : Users}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nome
            </label>
            <input
              type="text"
              name="nome"
              defaultValue={editingCliente?.nome}
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
                defaultValue={editingCliente?.email}
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
                defaultValue={editingCliente?.telefone}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Empresa
              </label>
              <input
                type="text"
                name="empresa"
                defaultValue={editingCliente?.empresa}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                defaultValue={editingCliente?.status || 'Prospecto'}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              >
                <option value="Prospecto">Prospecto</option>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cidade
              </label>
              <input
                type="text"
                name="cidade"
                defaultValue={editingCliente?.cidade}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estado
              </label>
              <input
                type="text"
                name="estado"
                defaultValue={editingCliente?.estado}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Endereço
            </label>
            <input
              type="text"
              name="endereco"
              defaultValue={editingCliente?.endereco}
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Valor Total (R$)
              </label>
              <input
                type="number"
                name="valorTotal"
                step="0.01"
                min="0"
                defaultValue={editingCliente?.valorTotal || 0}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Última Interação
              </label>
              <input
                type="date"
                name="ultimaInteracao"
                defaultValue={editingCliente?.ultimaInteracao}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Observações
            </label>
            <textarea
              name="observacoes"
              defaultValue={editingCliente?.observacoes}
              rows={3}
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingCliente ? 'Salvar Alterações' : 'Criar Cliente'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false)
                setEditingCliente(null)
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
          setClienteParaTarefa(null)
        }}
        title="Vincular Tarefa"
        description={`Criar tarefa relacionada ao cliente ${clienteParaTarefa?.nome || ''}`}
        size="md"
        variant="default"
        icon={Link2}
      >
        <form onSubmit={handleSubmitTarefa} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título da Tarefa
            </label>
            <input
              type="text"
              name="titulo"
              defaultValue={`Tarefa - ${clienteParaTarefa?.nome || ''}`}
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
              placeholder="Descreva a tarefa relacionada a este cliente..."
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
                setClienteParaTarefa(null)
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
