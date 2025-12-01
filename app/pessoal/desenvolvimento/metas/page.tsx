'use client'

import { useState, useEffect, useMemo } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { Plus, Target, Calendar, Trash2, Edit2, TrendingUp, BarChart3, PieChart as PieChartIcon, Search } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts'

const COLORS = ['#00D9FF', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

interface MetaAnual {
  id: string
  titulo: string
  descricao: string
  categoria: string
  dataInicio: string
  dataFim: string
  progresso: number
  status: 'Planejamento' | 'Em Andamento' | 'Concluída' | 'Cancelada'
}

export default function MetasAnuaisPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMeta, setEditingMeta] = useState<MetaAnual | null>(null)
  const [metas, setMetas] = useState<MetaAnual[]>([])
  const [filtroStatus, setFiltroStatus] = useState<'Todos' | 'Planejamento' | 'Em Andamento' | 'Concluída' | 'Cancelada'>('Todos')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('metas-anuais-pessoal')
    if (saved) {
      setMetas(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('metas-anuais-pessoal', JSON.stringify(metas))
  }, [metas])

  // Filtros
  const metasFiltradas = useMemo(() => {
    return metas.filter(meta => {
      const matchStatus = filtroStatus === 'Todos' || meta.status === filtroStatus
      const matchCategoria = filtroCategoria === 'todas' || meta.categoria === filtroCategoria
      const matchBusca = !busca || meta.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                        meta.descricao.toLowerCase().includes(busca.toLowerCase())
      return matchStatus && matchCategoria && matchBusca
    })
  }, [metas, filtroStatus, filtroCategoria, busca])

  const categoriasUnicas = useMemo(() => {
    return Array.from(new Set(metas.map(m => m.categoria))).sort()
  }, [metas])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novaMeta: MetaAnual = {
      id: editingMeta?.id || uuidv4(),
      titulo: formData.get('titulo') as string,
      descricao: formData.get('descricao') as string,
      categoria: formData.get('categoria') as string,
      dataInicio: formData.get('dataInicio') as string,
      dataFim: formData.get('dataFim') as string,
      progresso: parseInt(formData.get('progresso') as string) || 0,
      status: (formData.get('status') as MetaAnual['status']) || 'Planejamento',
    }

    if (editingMeta) {
      setMetas(metas.map(m => m.id === editingMeta.id ? novaMeta : m))
    } else {
      setMetas([...metas, novaMeta])
    }

    setIsModalOpen(false)
    setEditingMeta(null)
  }

  const metasAtivas = metas.filter(m => m.status === 'Em Andamento').length
  const metasConcluidas = metas.filter(m => m.status === 'Concluída').length
  const metasPlanejamento = metas.filter(m => m.status === 'Planejamento').length
  const progressoMedio = metas.length > 0
    ? Math.round(metas.reduce((acc, m) => acc + m.progresso, 0) / metas.length)
    : 0

  // Dados para gráficos
  const dadosStatus = useMemo(() => {
    return [
      { name: 'Planejamento', value: metasPlanejamento, color: '#7C3AED' },
      { name: 'Em Andamento', value: metasAtivas, color: '#00D9FF' },
      { name: 'Concluída', value: metasConcluidas, color: '#10B981' },
      { name: 'Cancelada', value: metas.filter(m => m.status === 'Cancelada').length, color: '#EF4444' },
    ]
  }, [metas, metasPlanejamento, metasAtivas, metasConcluidas])

  const dadosCategoria = useMemo(() => {
    const categoriasMap = new Map<string, number>()
    metas.forEach(m => {
      const atual = categoriasMap.get(m.categoria) || 0
      categoriasMap.set(m.categoria, atual + 1)
    })
    return Array.from(categoriasMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [metas])

  const dadosProgresso = useMemo(() => {
    return metas
      .sort((a, b) => b.progresso - a.progresso)
      .slice(0, 10)
      .map(meta => ({
        nome: meta.titulo.length > 15 ? meta.titulo.substring(0, 15) + '...' : meta.titulo,
        progresso: meta.progresso,
      }))
  }, [metas])

  const getStatusColor = (status: MetaAnual['status']) => {
    switch (status) {
      case 'Concluída':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
      case 'Em Andamento':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/20'
      case 'Planejamento':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/20'
      case 'Cancelada':
        return 'bg-red-500/15 text-red-400 border-red-500/20'
      default:
        return 'bg-gray-500/15 text-gray-400 border-gray-500/20'
    }
  }

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Metas Anuais</h1>
            <p className="text-gray-400">Defina e acompanhe suas metas para o ano com análises detalhadas</p>
          </div>
          <Button
            onClick={() => {
              setEditingMeta(null)
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Nova Meta
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Metas Ativas"
            value={metasAtivas}
            icon={Target}
            valueColor="text-blue-400"
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20"
          />
          <StatCard
            title="Metas Concluídas"
            value={metasConcluidas}
            icon={TrendingUp}
            valueColor="text-emerald-400"
            className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20"
          />
          <StatCard
            title="Progresso Médio"
            value={`${progressoMedio}%`}
            icon={Target}
            valueColor="text-accent-electric"
            className="bg-gradient-to-br from-accent-electric/10 to-accent-cyan/5 border-accent-electric/20"
          />
          <StatCard
            title="Total"
            value={metas.length}
            icon={Target}
            className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20"
          />
        </div>

        {/* Gráficos */}
        {metas.length > 0 && (
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
                <h3 className="text-lg font-bold text-white">Metas por Categoria</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosCategoria}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF" 
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
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

        {/* Top 10 por Progresso */}
        {dadosProgresso.length > 0 && (
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-accent-electric" />
              <h3 className="text-lg font-bold text-white">Top 10 Metas por Progresso</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosProgresso}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="nome" 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis stroke="#9CA3AF" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => `${value}%`}
                />
                <Bar dataKey="progresso" fill="#00D9FF" radius={[8, 8, 0, 0]} />
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
                placeholder="Buscar meta..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
              />
            </div>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as 'Todos' | 'Planejamento' | 'Em Andamento' | 'Concluída' | 'Cancelada')}
              className="px-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
            >
              <option value="Todos">Todos os Status</option>
              <option value="Planejamento">Planejamento</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Concluída">Concluída</option>
              <option value="Cancelada">Cancelada</option>
            </select>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="px-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
            >
              <option value="todas">Todas as Categorias</option>
              {categoriasUnicas.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de Metas */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-accent-electric" />
            Todas as Metas ({metasFiltradas.length})
          </h2>
          {metasFiltradas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metasFiltradas.map((meta) => {
                const isVencida = new Date(meta.dataFim) < new Date() && meta.status !== 'Concluída'
                
                return (
                  <div
                    key={meta.id}
                    className={`p-5 bg-dark-black/50 border rounded-xl hover:border-accent-electric/30 transition-all group ${
                      isVencida ? 'border-red-500/30 bg-red-500/5' : 'border-card-border/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg mb-1">{meta.titulo}</h3>
                        <p className="text-gray-400 text-sm mb-2 line-clamp-2">{meta.descricao}</p>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(meta.status)}`}>
                            {meta.status}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-accent-electric/15 text-accent-electric border border-accent-electric/20">
                            {meta.categoria}
                          </span>
                          {isVencida && (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/20">
                              Vencida
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingMeta(meta)
                            setIsModalOpen(true)
                          }}
                          className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir esta meta?')) {
                              setMetas(metas.filter(m => m.id !== meta.id))
                            }
                          }}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Progresso</span>
                        <span className={`font-semibold ${
                          meta.progresso >= 100 ? 'text-emerald-400' :
                          meta.progresso >= 50 ? 'text-accent-electric' :
                          'text-yellow-400'
                        }`}>
                          {meta.progresso}%
                        </span>
                      </div>
                      <div className="w-full bg-dark-black rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            meta.progresso >= 100 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                            meta.progresso >= 50 ? 'bg-gradient-to-r from-accent-electric to-accent-cyan' :
                            'bg-gradient-to-r from-yellow-500 to-orange-500'
                          }`}
                          style={{ width: `${Math.min(meta.progresso, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(meta.dataInicio).toLocaleDateString('pt-BR')} - {new Date(meta.dataFim).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhuma meta encontrada</p>
              <p className="text-gray-500 text-sm mt-1">Ajuste os filtros ou crie sua primeira meta anual</p>
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingMeta(null)
          }}
          title={editingMeta ? 'Editar Meta' : 'Nova Meta'}
          size="lg"
          variant="info"
          icon={Target}
          description={editingMeta ? 'Atualize as informações da sua meta anual' : 'Crie uma nova meta anual para acompanhar seu progresso'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Título
              </label>
              <input
                type="text"
                name="titulo"
                defaultValue={editingMeta?.titulo}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                name="descricao"
                defaultValue={editingMeta?.descricao}
                rows={3}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Categoria
                </label>
                <input
                  type="text"
                  name="categoria"
                  defaultValue={editingMeta?.categoria}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Progresso (%)
                </label>
                <input
                  type="number"
                  name="progresso"
                  min="0"
                  max="100"
                  defaultValue={editingMeta?.progresso || 0}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data Início
                </label>
                <input
                  type="date"
                  name="dataInicio"
                  defaultValue={editingMeta?.dataInicio}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data Fim
                </label>
                <input
                  type="date"
                  name="dataFim"
                  defaultValue={editingMeta?.dataFim}
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
                defaultValue={editingMeta?.status || 'Planejamento'}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              >
                <option value="Planejamento">Planejamento</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Concluída">Concluída</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingMeta ? 'Salvar Alterações' : 'Criar Meta'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingMeta(null)
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
