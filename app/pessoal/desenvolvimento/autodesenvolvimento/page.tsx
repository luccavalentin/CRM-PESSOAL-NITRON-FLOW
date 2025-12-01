'use client'

import { useState, useEffect, useMemo } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { Plus, Brain, Target, Trash2, Edit2, Calendar, BarChart3, PieChart as PieChartIcon, Search, Filter } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const COLORS = ['#00D9FF', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

interface AtividadeDesenvolvimento {
  id: string
  titulo: string
  descricao: string
  categoria: string
  data: string
  status: 'Planejada' | 'Em Andamento' | 'Concluída'
  progresso: number
  observacoes?: string
}

export default function AutodesenvolvimentoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAtividade, setEditingAtividade] = useState<AtividadeDesenvolvimento | null>(null)
  const [atividades, setAtividades] = useState<AtividadeDesenvolvimento[]>([])
  const [filtroStatus, setFiltroStatus] = useState<'Todos' | 'Planejada' | 'Em Andamento' | 'Concluída'>('Todos')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('autodesenvolvimento-pessoal')
    if (saved) {
      setAtividades(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('autodesenvolvimento-pessoal', JSON.stringify(atividades))
  }, [atividades])

  // Filtros
  const atividadesFiltradas = useMemo(() => {
    return atividades.filter(atividade => {
      const matchStatus = filtroStatus === 'Todos' || atividade.status === filtroStatus
      const matchCategoria = filtroCategoria === 'todas' || atividade.categoria === filtroCategoria
      const matchBusca = !busca || atividade.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                        (atividade.descricao && atividade.descricao.toLowerCase().includes(busca.toLowerCase()))
      return matchStatus && matchCategoria && matchBusca
    })
  }, [atividades, filtroStatus, filtroCategoria, busca])

  const categoriasUnicas = useMemo(() => {
    return Array.from(new Set(atividades.map(a => a.categoria))).sort()
  }, [atividades])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novaAtividade: AtividadeDesenvolvimento = {
      id: editingAtividade?.id || uuidv4(),
      titulo: formData.get('titulo') as string,
      descricao: formData.get('descricao') as string,
      categoria: formData.get('categoria') as string,
      data: formData.get('data') as string,
      status: (formData.get('status') as AtividadeDesenvolvimento['status']) || 'Planejada',
      progresso: parseInt(formData.get('progresso') as string) || 0,
      observacoes: formData.get('observacoes') as string || undefined,
    }

    if (editingAtividade) {
      setAtividades(atividades.map(a => a.id === editingAtividade.id ? novaAtividade : a))
    } else {
      setAtividades([...atividades, novaAtividade])
    }

    setIsModalOpen(false)
    setEditingAtividade(null)
  }

  const atividadesConcluidas = atividades.filter(a => a.status === 'Concluída').length
  const atividadesEmAndamento = atividades.filter(a => a.status === 'Em Andamento').length
  const atividadesPlanejadas = atividades.filter(a => a.status === 'Planejada').length
  const progressoMedio = atividades.length > 0
    ? Math.round(atividades.reduce((acc, a) => acc + a.progresso, 0) / atividades.length)
    : 0

  // Dados para gráficos
  const dadosStatus = useMemo(() => {
    return [
      { name: 'Planejadas', value: atividadesPlanejadas, color: '#7C3AED' },
      { name: 'Em Andamento', value: atividadesEmAndamento, color: '#00D9FF' },
      { name: 'Concluídas', value: atividadesConcluidas, color: '#10B981' },
    ]
  }, [atividades, atividadesPlanejadas, atividadesEmAndamento, atividadesConcluidas])

  const dadosCategoria = useMemo(() => {
    const categoriasMap = new Map<string, number>()
    atividades.forEach(a => {
      const atual = categoriasMap.get(a.categoria) || 0
      categoriasMap.set(a.categoria, atual + 1)
    })
    return Array.from(categoriasMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [atividades])

  const dadosProgresso = useMemo(() => {
    return atividades
      .sort((a, b) => b.progresso - a.progresso)
      .slice(0, 10)
      .map(atividade => ({
        nome: atividade.titulo.length > 15 ? atividade.titulo.substring(0, 15) + '...' : atividade.titulo,
        progresso: atividade.progresso,
      }))
  }, [atividades])

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Autodesenvolvimento</h1>
            <p className="text-gray-400">Acompanhe seu crescimento pessoal com métricas detalhadas</p>
          </div>
          <Button
            onClick={() => {
              setEditingAtividade(null)
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Nova Atividade
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Total de Atividades"
            value={atividades.length}
            icon={Brain}
            className="bg-gradient-to-br from-accent-electric/10 to-accent-cyan/5 border-accent-electric/20"
          />
          <StatCard
            title="Em Andamento"
            value={atividadesEmAndamento}
            icon={Target}
            valueColor="text-blue-400"
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20"
          />
          <StatCard
            title="Concluídas"
            value={atividadesConcluidas}
            icon={Target}
            valueColor="text-emerald-400"
            className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20"
          />
          <StatCard
            title="Progresso Médio"
            value={`${progressoMedio}%`}
            icon={Brain}
            valueColor="text-purple-400"
            className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20"
          />
        </div>

        {/* Gráficos */}
        {atividades.length > 0 && (
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
                <h3 className="text-lg font-bold text-white">Atividades por Categoria</h3>
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
              <h3 className="text-lg font-bold text-white">Top 10 Atividades por Progresso</h3>
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
                placeholder="Buscar atividade..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
              />
            </div>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as 'Todos' | 'Planejada' | 'Em Andamento' | 'Concluída')}
              className="px-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
            >
              <option value="Todos">Todos os Status</option>
              <option value="Planejada">Planejada</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Concluída">Concluída</option>
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

        {/* Lista de Atividades */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent-electric" />
            Todas as Atividades ({atividadesFiltradas.length})
          </h2>
          {atividadesFiltradas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {atividadesFiltradas.map((atividade) => {
                const getStatusColor = (status: AtividadeDesenvolvimento['status']) => {
                  switch (status) {
                    case 'Concluída':
                      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                    case 'Em Andamento':
                      return 'bg-blue-500/15 text-blue-400 border-blue-500/20'
                    default:
                      return 'bg-purple-500/15 text-purple-400 border-purple-500/20'
                  }
                }
                
                return (
                  <div
                    key={atividade.id}
                    className="p-5 bg-dark-black/50 border border-card-border/50 rounded-xl hover:border-accent-electric/30 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg mb-1">{atividade.titulo}</h3>
                        <p className="text-gray-400 text-sm mb-2 line-clamp-2">{atividade.descricao}</p>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(atividade.status)}`}>
                            {atividade.status}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-accent-electric/15 text-accent-electric border border-accent-electric/20">
                            {atividade.categoria}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingAtividade(atividade)
                            setIsModalOpen(true)
                          }}
                          className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir esta atividade?')) {
                              setAtividades(atividades.filter(a => a.id !== atividade.id))
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
                        <span className="text-accent-electric font-semibold">{atividade.progresso}%</span>
                      </div>
                      <div className="w-full bg-dark-black rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            atividade.progresso >= 100 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                            atividade.progresso >= 50 ? 'bg-gradient-to-r from-accent-electric to-accent-cyan' :
                            'bg-gradient-to-r from-yellow-500 to-orange-500'
                          }`}
                          style={{ width: `${Math.min(atividade.progresso, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(atividade.data).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {atividade.observacoes && (
                      <p className="text-xs text-gray-400 mt-2 line-clamp-2">{atividade.observacoes}</p>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhuma atividade encontrada</p>
              <p className="text-gray-500 text-sm mt-1">Ajuste os filtros ou crie sua primeira atividade</p>
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingAtividade(null)
          }}
          title={editingAtividade ? 'Editar Atividade' : 'Nova Atividade'}
          size="lg"
          variant="info"
          icon={Brain}
          description={editingAtividade ? 'Atualize as informações da atividade de autodesenvolvimento' : 'Crie uma nova atividade para acompanhar seu crescimento pessoal'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Título
              </label>
              <input
                type="text"
                name="titulo"
                defaultValue={editingAtividade?.titulo}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                name="descricao"
                defaultValue={editingAtividade?.descricao}
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
                  defaultValue={editingAtividade?.categoria}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data
                </label>
                <input
                  type="date"
                  name="data"
                  defaultValue={editingAtividade?.data}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={editingAtividade?.status || 'Planejada'}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="Planejada">Planejada</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Concluída">Concluída</option>
                </select>
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
                  defaultValue={editingAtividade?.progresso || 0}
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
                defaultValue={editingAtividade?.observacoes}
                rows={2}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingAtividade ? 'Salvar Alterações' : 'Criar Atividade'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingAtividade(null)
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
