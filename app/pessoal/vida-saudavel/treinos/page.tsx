'use client'

import { useState, useEffect, useMemo } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { Plus, Dumbbell, Calendar, Trash2, Edit2, Target, Clock, BarChart3, PieChart as PieChartIcon, Search } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts'

const COLORS = ['#00D9FF', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

interface Treino {
  id: string
  data: string
  tipo: string
  exercicios: string
  duracao: number
  intensidade: 'Leve' | 'Moderada' | 'Intensa'
  observacoes?: string
}

export default function TreinosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTreino, setEditingTreino] = useState<Treino | null>(null)
  const [treinos, setTreinos] = useState<Treino[]>([])
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [filtroIntensidade, setFiltroIntensidade] = useState<string>('todas')
  const [filtroData, setFiltroData] = useState<string>('todas')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('treinos-pessoal')
    if (saved) {
      setTreinos(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('treinos-pessoal', JSON.stringify(treinos))
  }, [treinos])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novoTreino: Treino = {
      id: editingTreino?.id || uuidv4(),
      data: formData.get('data') as string,
      tipo: formData.get('tipo') as string,
      exercicios: formData.get('exercicios') as string,
      duracao: parseInt(formData.get('duracao') as string) || 0,
      intensidade: (formData.get('intensidade') as Treino['intensidade']) || 'Moderada',
      observacoes: formData.get('observacoes') as string || undefined,
    }

    if (editingTreino) {
      setTreinos(treinos.map(t => t.id === editingTreino.id ? novoTreino : t))
    } else {
      setTreinos([...treinos, novoTreino])
    }

    setIsModalOpen(false)
    setEditingTreino(null)
  }

  const hoje = new Date().toISOString().split('T')[0]
  const treinosHoje = treinos.filter(t => t.data === hoje)
  const treinosSemana = treinos.filter(t => {
    const dataTreino = new Date(t.data)
    const hoje = new Date()
    const diffTime = Math.abs(hoje.getTime() - dataTreino.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  }).length
  const totalMinutos = treinos.reduce((acc, t) => acc + t.duracao, 0)
  const totalHoras = Math.floor(totalMinutos / 60)
  const minutosRestantes = totalMinutos % 60
  const duracaoMedia = treinos.length > 0 ? Math.round(treinos.reduce((acc, t) => acc + t.duracao, 0) / treinos.length) : 0

  // Dados para gráficos
  const dadosTipo = useMemo(() => {
    const tiposMap = new Map<string, number>()
    treinos.forEach(t => {
      const atual = tiposMap.get(t.tipo) || 0
      tiposMap.set(t.tipo, atual + 1)
    })
    return Array.from(tiposMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [treinos])

  const dadosIntensidade = useMemo(() => {
    return [
      { name: 'Leve', value: treinos.filter(t => t.intensidade === 'Leve').length, color: '#10B981' },
      { name: 'Moderada', value: treinos.filter(t => t.intensidade === 'Moderada').length, color: '#F59E0B' },
      { name: 'Intensa', value: treinos.filter(t => t.intensidade === 'Intensa').length, color: '#EF4444' },
    ]
  }, [treinos])

  const dadosDuracaoDiaria = useMemo(() => {
    const diasMap = new Map<string, number>()
    treinos.forEach(t => {
      const data = new Date(t.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      const atual = diasMap.get(data) || 0
      diasMap.set(data, atual + t.duracao)
    })
    return Array.from(diasMap.entries())
      .map(([data, minutos]) => ({ data, minutos }))
      .sort((a, b) => {
        const [diaA, mesA] = a.data.split('/').map(Number)
        const [diaB, mesB] = b.data.split('/').map(Number)
        if (mesA !== mesB) return mesA - mesB
        return diaA - diaB
      })
      .slice(-14)
  }, [treinos])

  // Filtros
  const treinosFiltrados = useMemo(() => {
    return treinos.filter(treino => {
      const matchTipo = filtroTipo === 'todos' || treino.tipo === filtroTipo
      const matchIntensidade = filtroIntensidade === 'todas' || treino.intensidade === filtroIntensidade
      const matchData = filtroData === 'todas' || treino.data === filtroData
      const matchBusca = !busca || 
        treino.tipo.toLowerCase().includes(busca.toLowerCase()) ||
        treino.exercicios.toLowerCase().includes(busca.toLowerCase()) ||
        (treino.observacoes && treino.observacoes.toLowerCase().includes(busca.toLowerCase()))
      return matchTipo && matchIntensidade && matchData && matchBusca
    }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
  }, [treinos, filtroTipo, filtroIntensidade, filtroData, busca])

  const tiposUnicos = useMemo(() => {
    return Array.from(new Set(treinos.map(t => t.tipo))).sort()
  }, [treinos])

  const datasUnicas = useMemo(() => {
    return Array.from(new Set(treinos.map(t => t.data)))
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .slice(0, 30)
  }, [treinos])

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Treinos</h1>
            <p className="text-gray-400">Registre e acompanhe seus treinos com análises detalhadas</p>
          </div>
          <Button
            onClick={() => {
              setEditingTreino(null)
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Novo Treino
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Treinos Hoje"
            value={treinosHoje.length}
            icon={Dumbbell}
            className="bg-gradient-to-br from-accent-electric/10 to-accent-cyan/5 border-accent-electric/20"
          />
          <StatCard
            title="Treinos Esta Semana"
            value={treinosSemana}
            icon={Target}
            valueColor="text-blue-400"
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20"
          />
          <StatCard
            title="Total de Horas"
            value={totalMinutos > 0 ? `${totalHoras}h ${minutosRestantes}min` : '0 min'}
            icon={Clock}
            valueColor="text-emerald-400"
            className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20"
          />
          <StatCard
            title="Duração Média"
            value={`${duracaoMedia} min`}
            icon={BarChart3}
            valueColor="text-purple-400"
            className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20"
          />
        </div>

        {/* Gráficos */}
        {treinos.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <PieChartIcon className="w-5 h-5 text-accent-electric" />
                <h3 className="text-lg font-bold text-white">Treinos por Intensidade</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosIntensidade}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosIntensidade.map((entry, index) => (
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
                <h3 className="text-lg font-bold text-white">Treinos por Tipo</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosTipo}>
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
                    {dadosTipo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Gráfico de Duração Diária */}
        {dadosDuracaoDiaria.length > 0 && (
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <AreaChart className="w-5 h-5 text-accent-electric" />
              <h3 className="text-lg font-bold text-white">Duração Diária de Treinos (Últimas 2 Semanas)</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dadosDuracaoDiaria}>
                <defs>
                  <linearGradient id="colorDuracao" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00D9FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="data" 
                  stroke="#9CA3AF"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => `${value} min`}
                />
                <Area 
                  type="monotone" 
                  dataKey="minutos" 
                  stroke="#00D9FF" 
                  strokeWidth={2}
                  fill="url(#colorDuracao)"
                  name="Duração (min)"
                />
              </AreaChart>
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
                placeholder="Buscar por tipo, exercícios ou observações..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
              />
            </div>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
            >
              <option value="todos">Todos os Tipos</option>
              {tiposUnicos.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
            <select
              value={filtroIntensidade}
              onChange={(e) => setFiltroIntensidade(e.target.value)}
              className="px-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
            >
              <option value="todas">Todas as Intensidades</option>
              <option value="Leve">Leve</option>
              <option value="Moderada">Moderada</option>
              <option value="Intensa">Intensa</option>
            </select>
            <select
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
              className="px-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
            >
              <option value="todas">Todas as Datas</option>
              {datasUnicas.map(data => (
                <option key={data} value={data}>{new Date(data).toLocaleDateString('pt-BR')}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de Treinos */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-accent-electric" />
            Histórico de Treinos ({treinosFiltrados.length})
          </h2>
          {treinosFiltrados.length > 0 ? (
            <div className="space-y-3">
              {treinosFiltrados.map((treino) => {
                const isHoje = treino.data === hoje
                return (
                  <div
                    key={treino.id}
                    className={`p-5 bg-dark-black/50 border rounded-xl hover:border-accent-electric/30 transition-all group ${
                      isHoje ? 'border-accent-electric/50 bg-accent-electric/5' : 'border-card-border/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold text-lg">{treino.tipo}</h3>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                            isHoje 
                              ? 'bg-accent-electric/15 text-accent-electric border-accent-electric/20' 
                              : 'bg-gray-500/15 text-gray-400 border-gray-500/20'
                          }`}>
                            {new Date(treino.data).toLocaleDateString('pt-BR')}
                          </span>
                          {isHoje && (
                            <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                              Hoje
                            </span>
                          )}
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                            treino.intensidade === 'Intensa'
                              ? 'bg-red-500/15 text-red-400 border-red-500/20'
                              : treino.intensidade === 'Moderada'
                              ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'
                              : 'bg-green-500/15 text-green-400 border-green-500/20'
                          }`}>
                            {treino.intensidade}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{treino.exercicios}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{treino.duracao} minutos</span>
                          </div>
                        </div>
                        {treino.observacoes && (
                          <p className="text-sm text-gray-400 mt-2">{treino.observacoes}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingTreino(treino)
                            setIsModalOpen(true)
                          }}
                          className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir este treino?')) {
                              setTreinos(treinos.filter(t => t.id !== treino.id))
                            }
                          }}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Dumbbell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhum treino encontrado</p>
              <p className="text-gray-500 text-sm mt-1">Ajuste os filtros ou registre seu primeiro treino</p>
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingTreino(null)
          }}
          title={editingTreino ? 'Editar Treino' : 'Novo Treino'}
          size="lg"
          variant="success"
          icon={Dumbbell}
          description={editingTreino ? 'Atualize as informações do treino' : 'Registre um novo treino para acompanhar sua atividade física'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data
                </label>
                <input
                  type="date"
                  name="data"
                  defaultValue={editingTreino?.data || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Treino
                </label>
                <input
                  type="text"
                  name="tipo"
                  defaultValue={editingTreino?.tipo}
                  placeholder="Ex: Musculação, Cardio, Yoga..."
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Exercícios
              </label>
              <textarea
                name="exercicios"
                defaultValue={editingTreino?.exercicios}
                rows={4}
                placeholder="Descreva os exercícios realizados..."
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duração (minutos)
                </label>
                <input
                  type="number"
                  name="duracao"
                  min="1"
                  defaultValue={editingTreino?.duracao}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Intensidade
                </label>
                <select
                  name="intensidade"
                  defaultValue={editingTreino?.intensidade || 'Moderada'}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="Leve">Leve</option>
                  <option value="Moderada">Moderada</option>
                  <option value="Intensa">Intensa</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Observações
              </label>
              <textarea
                name="observacoes"
                defaultValue={editingTreino?.observacoes}
                rows={2}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingTreino ? 'Salvar Alterações' : 'Adicionar Treino'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingTreino(null)
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
