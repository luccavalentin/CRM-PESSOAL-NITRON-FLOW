'use client'

import { useState, useEffect, useMemo } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { VicioHabito, TipoVicio, StatusVicio } from '@/types'
import { Plus, Target, CheckCircle2, XCircle, Trash2, Edit2, Calendar, BarChart3, PieChart as PieChartIcon, Search } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts'

const COLORS = ['#00D9FF', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

export default function HabitosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHabito, setEditingHabito] = useState<VicioHabito | null>(null)
  const [habitos, setHabitos] = useState<VicioHabito[]>([])
  const [filtroStatus, setFiltroStatus] = useState<StatusVicio | 'Todos'>('Todos')
  const [filtroTipo, setFiltroTipo] = useState<TipoVicio | 'Todos'>('Todos')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('habitos-pessoal')
    if (saved) {
      setHabitos(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('habitos-pessoal', JSON.stringify(habitos))
  }, [habitos])

  // Filtros
  const habitosFiltrados = useMemo(() => {
    return habitos.filter(habito => {
      const matchStatus = filtroStatus === 'Todos' || habito.status === filtroStatus
      const matchTipo = filtroTipo === 'Todos' || habito.tipo === filtroTipo
      const matchBusca = !busca || habito.nome.toLowerCase().includes(busca.toLowerCase()) ||
                        (habito.descricao && habito.descricao.toLowerCase().includes(busca.toLowerCase()))
      return matchStatus && matchTipo && matchBusca
    })
  }, [habitos, filtroStatus, filtroTipo, busca])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const estrategias = (formData.get('estrategias') as string)
      .split('\n')
      .filter(s => s.trim() !== '')
    
    const novoHabito: VicioHabito = {
      id: editingHabito?.id || uuidv4(),
      nome: formData.get('nome') as string,
      descricao: formData.get('descricao') as string || undefined,
      tipo: formData.get('tipo') as TipoVicio,
      dataInicioControle: formData.get('dataInicioControle') as string,
      status: (formData.get('status') as StatusVicio) || 'Ativo',
      estrategiasSuperacao: estrategias,
    }

    if (editingHabito) {
      setHabitos(habitos.map(h => h.id === editingHabito.id ? novoHabito : h))
    } else {
      setHabitos([...habitos, novoHabito])
    }

    setIsModalOpen(false)
    setEditingHabito(null)
  }

  const habitosAtivos = habitos.filter(h => h.status === 'Ativo').length
  const habitosSuperados = habitos.filter(h => h.status === 'Superado').length
  const diasMedioControle = habitos.length > 0
    ? Math.round(habitos.reduce((acc, h) => {
        const dias = Math.floor(
          (new Date().getTime() - new Date(h.dataInicioControle).getTime()) / (1000 * 60 * 60 * 24)
        )
        return acc + dias
      }, 0) / habitos.length)
    : 0

  // Dados para gráficos
  const dadosStatus = useMemo(() => {
    return [
      { name: 'Ativos', value: habitosAtivos, color: '#F59E0B' },
      { name: 'Superados', value: habitosSuperados, color: '#10B981' },
    ]
  }, [habitosAtivos, habitosSuperados])

  const dadosTipo = useMemo(() => {
    const tipos = Array.from(new Set(habitos.map(h => h.tipo)))
    return tipos.map(tipo => ({
      name: tipo,
      value: habitos.filter(h => h.tipo === tipo).length,
    }))
  }, [habitos])

  const dadosDiasControle = useMemo(() => {
    return habitos
      .map(habito => {
        const dias = Math.floor(
          (new Date().getTime() - new Date(habito.dataInicioControle).getTime()) / (1000 * 60 * 60 * 24)
        )
        return {
          nome: habito.nome.length > 15 ? habito.nome.substring(0, 15) + '...' : habito.nome,
          dias: dias,
        }
      })
      .sort((a, b) => b.dias - a.dias)
      .slice(0, 10)
  }, [habitos])

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Hábitos</h1>
            <p className="text-gray-400">Gerencie seus hábitos e vícios com acompanhamento detalhado</p>
          </div>
          <Button
            onClick={() => {
              setEditingHabito(null)
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Novo Hábito
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Total de Hábitos"
            value={habitos.length}
            icon={Target}
            className="bg-gradient-to-br from-accent-electric/10 to-accent-cyan/5 border-accent-electric/20"
          />
          <StatCard
            title="Hábitos Ativos"
            value={habitosAtivos}
            icon={Target}
            valueColor="text-yellow-400"
            className="bg-gradient-to-br from-yellow-500/10 to-orange-600/5 border-yellow-500/20"
          />
          <StatCard
            title="Hábitos Superados"
            value={habitosSuperados}
            icon={CheckCircle2}
            valueColor="text-emerald-400"
            className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20"
          />
          <StatCard
            title="Dias Médio Controle"
            value={diasMedioControle}
            icon={Calendar}
            valueColor="text-blue-400"
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20"
          />
        </div>

        {/* Gráficos */}
        {habitos.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <PieChartIcon className="w-5 h-5 text-accent-electric" />
                <h3 className="text-lg font-bold text-white">Status dos Hábitos</h3>
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
                <h3 className="text-lg font-bold text-white">Hábitos por Tipo</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosTipo}>
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
                    {dadosTipo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Top 10 por Dias de Controle */}
        {dadosDiasControle.length > 0 && (
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-accent-electric" />
              <h3 className="text-lg font-bold text-white">Top 10 Hábitos por Dias de Controle</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosDiasControle}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="nome" 
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
                  formatter={(value: number) => `${value} dias`}
                />
                <Bar dataKey="dias" fill="#00D9FF" radius={[8, 8, 0, 0]} />
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
                placeholder="Buscar hábito..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
              />
            </div>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as StatusVicio | 'Todos')}
              className="px-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
            >
              <option value="Todos">Todos os Status</option>
              <option value="Ativo">Ativo</option>
              <option value="Superado">Superado</option>
            </select>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as TipoVicio | 'Todos')}
              className="px-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
            >
              <option value="Todos">Todos os Tipos</option>
              <option value="Vício">Vício</option>
              <option value="Hábito">Hábito</option>
              <option value="Mania">Mania</option>
            </select>
          </div>
        </div>

        {/* Lista de Hábitos */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-accent-electric" />
            Todos os Hábitos ({habitosFiltrados.length})
          </h2>
          {habitosFiltrados.length > 0 ? (
            <div className="space-y-3">
              {habitosFiltrados.map((habito) => {
                const diasControle = Math.floor(
                  (new Date().getTime() - new Date(habito.dataInicioControle).getTime()) / (1000 * 60 * 60 * 24)
                )
                
                return (
                  <div
                    key={habito.id}
                    className="p-5 bg-dark-black/50 border border-card-border/50 rounded-xl hover:border-accent-electric/30 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold text-lg">{habito.nome}</h3>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                            habito.status === 'Superado'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                              : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'
                          }`}>
                            {habito.status}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-accent-electric/15 text-accent-electric border border-accent-electric/20">
                            {habito.tipo}
                          </span>
                        </div>
                        {habito.descricao && (
                          <p className="text-gray-400 text-sm mb-3">{habito.descricao}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm mb-3">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span className="font-semibold text-accent-electric">{diasControle} dias</span>
                            <span className="text-gray-500">de controle</span>
                          </div>
                          <span className="text-gray-500">
                            Desde {new Date(habito.dataInicioControle).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        {habito.estrategiasSuperacao.length > 0 && (
                          <div className="mt-3 p-3 bg-dark-black/30 border border-card-border/30 rounded-lg">
                            <p className="text-xs text-gray-500 mb-2 font-semibold">Estratégias de superação:</p>
                            <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                              {habito.estrategiasSuperacao.map((estrategia, idx) => (
                                <li key={idx}>{estrategia}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingHabito(habito)
                            setIsModalOpen(true)
                          }}
                          className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir este hábito?')) {
                              setHabitos(habitos.filter(h => h.id !== habito.id))
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
              <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhum hábito encontrado</p>
              <p className="text-gray-500 text-sm mt-1">Ajuste os filtros ou registre seu primeiro hábito</p>
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingHabito(null)
          }}
          title={editingHabito ? 'Editar Hábito' : 'Novo Hábito'}
          size="lg"
          variant="warning"
          icon={Target}
          description={editingHabito ? 'Atualize as informações do hábito' : 'Registre um novo hábito ou vício para acompanhar seu controle'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome
              </label>
              <input
                type="text"
                name="nome"
                defaultValue={editingHabito?.nome}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                name="descricao"
                defaultValue={editingHabito?.descricao}
                rows={2}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo
                </label>
                <select
                  name="tipo"
                  defaultValue={editingHabito?.tipo}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="Vício">Vício</option>
                  <option value="Hábito">Hábito</option>
                  <option value="Mania">Mania</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data Início Controle
                </label>
                <input
                  type="date"
                  name="dataInicioControle"
                  defaultValue={editingHabito?.dataInicioControle}
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
                defaultValue={editingHabito?.status || 'Ativo'}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              >
                <option value="Ativo">Ativo</option>
                <option value="Superado">Superado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estratégias de Superação (uma por linha)
              </label>
              <textarea
                name="estrategias"
                rows={4}
                defaultValue={editingHabito?.estrategiasSuperacao.join('\n')}
                placeholder="Ex: Evitar situações de gatilho&#10;Praticar meditação diária&#10;Buscar apoio profissional"
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingHabito ? 'Salvar Alterações' : 'Criar Hábito'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingHabito(null)
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
