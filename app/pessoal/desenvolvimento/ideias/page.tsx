'use client'

import { useState, useMemo } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { useIdeiasStore } from '@/stores/ideiasStore'
import { Ideia, CategoriaIdeia, StatusIdeia } from '@/types'
import { Plus, Lightbulb, Trash2, Edit2, Sparkles, BarChart3, PieChart as PieChartIcon, Search, Filter } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const COLORS = ['#00D9FF', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

export default function IdeiasPessoaisPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingIdeia, setEditingIdeia] = useState<Ideia | null>(null)
  const [filtroStatus, setFiltroStatus] = useState<StatusIdeia | 'Todos'>('Todos')
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaIdeia | 'Todas'>('Todas')
  const [busca, setBusca] = useState('')

  const ideias = useIdeiasStore((state) => state.ideias)
  const addIdeia = useIdeiasStore((state) => state.addIdeia)
  const updateIdeia = useIdeiasStore((state) => state.updateIdeia)
  const deleteIdeia = useIdeiasStore((state) => state.deleteIdeia)

  // Filtros
  const ideiasFiltradas = useMemo(() => {
    return ideias.filter(ideia => {
      const matchStatus = filtroStatus === 'Todos' || ideia.status === filtroStatus
      const matchCategoria = filtroCategoria === 'Todas' || ideia.categoria === filtroCategoria
      const matchBusca = !busca || ideia.texto.toLowerCase().includes(busca.toLowerCase())
      return matchStatus && matchCategoria && matchBusca
    })
  }, [ideias, filtroStatus, filtroCategoria, busca])

  // Estatísticas
  const ideiasExplorando = ideias.filter(i => i.status === 'Explorando').length
  const ideiasEmAnalise = ideias.filter(i => i.status === 'Em Análise').length
  const ideiasExecutando = ideias.filter(i => i.status === 'Executando').length
  const potencialMedio = ideias.length > 0
    ? (ideias.reduce((acc, i) => acc + i.potencialFinanceiro, 0) / ideias.length).toFixed(1)
    : '0'

  // Dados para gráficos
  const dadosStatus = useMemo(() => {
    return [
      { name: 'Explorando', value: ideias.filter(i => i.status === 'Explorando').length, color: '#00D9FF' },
      { name: 'Em Análise', value: ideias.filter(i => i.status === 'Em Análise').length, color: '#F59E0B' },
      { name: 'Em Teste', value: ideias.filter(i => i.status === 'Em Teste').length, color: '#7C3AED' },
      { name: 'Executando', value: ideias.filter(i => i.status === 'Executando').length, color: '#10B981' },
      { name: 'Arquivada', value: ideias.filter(i => i.status === 'Arquivada').length, color: '#6B7280' },
    ]
  }, [ideias])

  const dadosCategoria = useMemo(() => {
    const categorias = Array.from(new Set(ideias.map(i => i.categoria)))
    return categorias.map(categoria => ({
      name: categoria,
      value: ideias.filter(i => i.categoria === categoria).length,
    }))
  }, [ideias])

  const dadosPotencial = useMemo(() => {
    return ideias
      .filter(i => i.potencialFinanceiro > 0)
      .sort((a, b) => b.potencialFinanceiro - a.potencialFinanceiro)
      .slice(0, 10)
      .map(ideia => ({
        nome: ideia.texto.length > 20 ? ideia.texto.substring(0, 20) + '...' : ideia.texto,
        potencial: ideia.potencialFinanceiro,
      }))
  }, [ideias])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novaIdeia: Ideia = {
      id: editingIdeia?.id || uuidv4(),
      texto: (formData.get('texto') as string) || 'Sem descrição',
      categoria: (formData.get('categoria') as CategoriaIdeia) || 'Negócio',
      status: (formData.get('status') as StatusIdeia) || 'Explorando',
      potencialFinanceiro: parseInt(formData.get('potencialFinanceiro') as string) || 5,
      dataCriacao: editingIdeia?.dataCriacao || new Date().toISOString().split('T')[0],
    }

    if (editingIdeia) {
      updateIdeia(editingIdeia.id, novaIdeia)
    } else {
      addIdeia(novaIdeia)
    }

    setIsModalOpen(false)
    setEditingIdeia(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta ideia?')) {
      deleteIdeia(id)
    }
  }

  const getStatusColor = (status: StatusIdeia) => {
    switch (status) {
      case 'Explorando':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/20'
      case 'Em Análise':
        return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'
      case 'Em Teste':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/20'
      case 'Executando':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
      case 'Arquivada':
        return 'bg-gray-500/15 text-gray-400 border-gray-500/20'
      default:
        return 'bg-gray-500/15 text-gray-400 border-gray-500/20'
    }
  }

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Ideias</h1>
            <p className="text-gray-400">Capture e desenvolva suas ideias pessoais com análise detalhada</p>
          </div>
          <Button
            onClick={() => {
              setEditingIdeia(null)
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Nova Ideia
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Total de Ideias"
            value={ideias.length}
            icon={Lightbulb}
            className="bg-gradient-to-br from-accent-electric/10 to-accent-cyan/5 border-accent-electric/20"
          />
          <StatCard
            title="Explorando"
            value={ideiasExplorando}
            icon={Sparkles}
            valueColor="text-blue-400"
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20"
          />
          <StatCard
            title="Executando"
            value={ideiasExecutando}
            icon={Lightbulb}
            valueColor="text-emerald-400"
            className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20"
          />
          <StatCard
            title="Potencial Médio"
            value={`${potencialMedio}/10`}
            icon={Sparkles}
            valueColor="text-yellow-400"
            className="bg-gradient-to-br from-yellow-500/10 to-orange-600/5 border-yellow-500/20"
          />
        </div>

        {/* Gráficos */}
        {ideias.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <PieChartIcon className="w-5 h-5 text-accent-electric" />
                <h3 className="text-lg font-bold text-white">Distribuição por Status</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-accent-electric" />
                <h3 className="text-lg font-bold text-white">Ideias por Categoria</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosCategoria}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {dadosCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Top Ideias por Potencial */}
        {dadosPotencial.length > 0 && (
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-accent-electric" />
              <h3 className="text-lg font-bold text-white">Top 10 Ideias por Potencial Financeiro</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosPotencial}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="nome" 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis stroke="#9CA3AF" domain={[0, 10]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => `${value}/10`}
                />
                <Bar dataKey="potencial" fill="#00D9FF" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar ideia..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
              />
            </div>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as StatusIdeia | 'Todos')}
              className="px-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
            >
              <option value="Todos">Todos os Status</option>
              <option value="Explorando">Explorando</option>
              <option value="Em Análise">Em Análise</option>
              <option value="Em Teste">Em Teste</option>
              <option value="Executando">Executando</option>
              <option value="Arquivada">Arquivada</option>
            </select>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value as CategoriaIdeia | 'Todas')}
              className="px-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
            >
              <option value="Todas">Todas as Categorias</option>
              <option value="Negócio">Negócio</option>
              <option value="Automação">Automação</option>
              <option value="Projeto">Projeto</option>
              <option value="Conteúdo">Conteúdo</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
        </div>

        {/* Lista de Ideias */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-accent-electric" />
            Todas as Ideias ({ideiasFiltradas.length})
          </h2>
          {ideiasFiltradas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ideiasFiltradas.map((ideia) => (
                <div
                  key={ideia.id}
                  className="p-5 bg-dark-black/50 border border-card-border/50 rounded-xl hover:border-accent-electric/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-white font-semibold mb-2 line-clamp-2">{ideia.texto}</p>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(ideia.status)}`}>
                          {ideia.status}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-accent-electric/15 text-accent-electric border border-accent-electric/20">
                          {ideia.categoria}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Potencial: <strong className="text-yellow-400">{ideia.potencialFinanceiro}/10</strong></span>
                        </div>
                        <span>•</span>
                        <span>{new Date(ideia.dataCriacao).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingIdeia(ideia)
                          setIsModalOpen(true)
                        }}
                        className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ideia.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Lightbulb className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhuma ideia encontrada</p>
              <p className="text-gray-500 text-sm mt-1">Ajuste os filtros ou crie sua primeira ideia</p>
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingIdeia(null)
          }}
          title={editingIdeia ? 'Editar Ideia' : 'Nova Ideia'}
          size="lg"
          variant="info"
          icon={Lightbulb}
          description={editingIdeia ? 'Atualize as informações da sua ideia' : 'Capture uma nova ideia para desenvolver e explorar'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ideia
              </label>
              <textarea
                name="texto"
                rows={4}
                defaultValue={editingIdeia?.texto}
                placeholder="Descreva sua ideia..."
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Categoria
                </label>
                <select
                  name="categoria"
                  defaultValue={editingIdeia?.categoria}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="Negócio">Negócio</option>
                  <option value="Automação">Automação</option>
                  <option value="Projeto">Projeto</option>
                  <option value="Conteúdo">Conteúdo</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Potencial Financeiro (1-10)
                </label>
                <input
                  type="number"
                  name="potencialFinanceiro"
                  min="1"
                  max="10"
                  defaultValue={editingIdeia?.potencialFinanceiro || 5}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                defaultValue={editingIdeia?.status || 'Explorando'}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              >
                <option value="Explorando">Explorando</option>
                <option value="Em Análise">Em Análise</option>
                <option value="Em Teste">Em Teste</option>
                <option value="Executando">Executando</option>
                <option value="Arquivada">Arquivada</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingIdeia ? 'Salvar Alterações' : 'Criar Ideia'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingIdeia(null)
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  )
}
