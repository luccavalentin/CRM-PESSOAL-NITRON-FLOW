'use client'

import { useState, useEffect, useMemo } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { Plus, Apple, Calendar, Trash2, Edit2, Target, BarChart3, PieChart as PieChartIcon, Search } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts'

const COLORS = ['#00D9FF', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

interface RegistroAlimentacao {
  id: string
  data: string
  refeicao: string
  alimentos: string
  calorias?: number
  observacoes?: string
}

export default function AlimentacaoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRegistro, setEditingRegistro] = useState<RegistroAlimentacao | null>(null)
  const [registros, setRegistros] = useState<RegistroAlimentacao[]>([])
  const [filtroRefeicao, setFiltroRefeicao] = useState<string>('todas')
  const [filtroData, setFiltroData] = useState<string>('todas')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('alimentacao-pessoal')
    if (saved) {
      setRegistros(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('alimentacao-pessoal', JSON.stringify(registros))
  }, [registros])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novoRegistro: RegistroAlimentacao = {
      id: editingRegistro?.id || uuidv4(),
      data: formData.get('data') as string,
      refeicao: formData.get('refeicao') as string,
      alimentos: formData.get('alimentos') as string,
      calorias: formData.get('calorias') ? parseFloat(formData.get('calorias') as string) : undefined,
      observacoes: formData.get('observacoes') as string || undefined,
    }

    if (editingRegistro) {
      setRegistros(registros.map(r => r.id === editingRegistro.id ? novoRegistro : r))
    } else {
      setRegistros([...registros, novoRegistro])
    }

    setIsModalOpen(false)
    setEditingRegistro(null)
  }

  const hoje = new Date().toISOString().split('T')[0]
  const registrosHoje = registros.filter(r => r.data === hoje)
  const caloriasHoje = registrosHoje.reduce((acc, r) => acc + (r.calorias || 0), 0)
  const totalRegistros = registros.length
  const caloriasMedias = registros.filter(r => r.calorias).length > 0
    ? Math.round(registros.filter(r => r.calorias).reduce((acc, r) => acc + (r.calorias || 0), 0) / registros.filter(r => r.calorias).length)
    : 0
  const totalCalorias = registros.reduce((acc, r) => acc + (r.calorias || 0), 0)

  // Dados para gráficos
  const dadosRefeicao = useMemo(() => {
    const refeicoesMap = new Map<string, number>()
    registros.forEach(r => {
      const atual = refeicoesMap.get(r.refeicao) || 0
      refeicoesMap.set(r.refeicao, atual + 1)
    })
    return Array.from(refeicoesMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [registros])

  const dadosCaloriasRefeicao = useMemo(() => {
    const refeicoesMap = new Map<string, { total: number, count: number }>()
    registros.filter(r => r.calorias).forEach(r => {
      const atual = refeicoesMap.get(r.refeicao) || { total: 0, count: 0 }
      refeicoesMap.set(r.refeicao, {
        total: atual.total + (r.calorias || 0),
        count: atual.count + 1,
      })
    })
    return Array.from(refeicoesMap.entries())
      .map(([name, dados]) => ({
        name,
        media: Math.round(dados.total / dados.count),
      }))
      .sort((a, b) => b.media - a.media)
  }, [registros])

  const dadosCaloriasDiarias = useMemo(() => {
    const diasMap = new Map<string, number>()
    registros.filter(r => r.calorias).forEach(r => {
      const data = new Date(r.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      const atual = diasMap.get(data) || 0
      diasMap.set(data, atual + (r.calorias || 0))
    })
    return Array.from(diasMap.entries())
      .map(([data, calorias]) => ({ data, calorias }))
      .sort((a, b) => {
        const [diaA, mesA] = a.data.split('/').map(Number)
        const [diaB, mesB] = b.data.split('/').map(Number)
        if (mesA !== mesB) return mesA - mesB
        return diaA - diaB
      })
      .slice(-14)
  }, [registros])

  // Filtros
  const registrosFiltrados = useMemo(() => {
    return registros.filter(registro => {
      const matchRefeicao = filtroRefeicao === 'todas' || registro.refeicao === filtroRefeicao
      const matchData = filtroData === 'todas' || registro.data === filtroData
      const matchBusca = !busca || 
        registro.alimentos.toLowerCase().includes(busca.toLowerCase()) ||
        registro.refeicao.toLowerCase().includes(busca.toLowerCase()) ||
        (registro.observacoes && registro.observacoes.toLowerCase().includes(busca.toLowerCase()))
      return matchRefeicao && matchData && matchBusca
    }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
  }, [registros, filtroRefeicao, filtroData, busca])

  const datasUnicas = useMemo(() => {
    return Array.from(new Set(registros.map(r => r.data)))
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .slice(0, 30)
  }, [registros])

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Alimentação</h1>
            <p className="text-gray-400">Registre e acompanhe sua alimentação com análises detalhadas</p>
          </div>
          <Button
            onClick={() => {
              setEditingRegistro(null)
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Novo Registro
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Registros Hoje"
            value={registrosHoje.length}
            icon={Apple}
            className="bg-gradient-to-br from-accent-electric/10 to-accent-cyan/5 border-accent-electric/20"
          />
          <StatCard
            title="Calorias Hoje"
            value={`${caloriasHoje} kcal`}
            icon={Target}
            valueColor="text-emerald-400"
            className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20"
          />
          <StatCard
            title="Média de Calorias"
            value={`${caloriasMedias} kcal`}
            icon={BarChart3}
            valueColor="text-blue-400"
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20"
          />
          <StatCard
            title="Total Registros"
            value={totalRegistros}
            icon={Calendar}
            className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20"
          />
        </div>

        {/* Gráficos */}
        {registros.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <PieChartIcon className="w-5 h-5 text-accent-electric" />
                <h3 className="text-lg font-bold text-white">Registros por Refeição</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosRefeicao}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosRefeicao.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                <h3 className="text-lg font-bold text-white">Média de Calorias por Refeição</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosCaloriasRefeicao}>
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
                    formatter={(value: number) => `${value} kcal`}
                  />
                  <Bar dataKey="media" fill="#00D9FF" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Gráfico de Calorias Diárias */}
        {dadosCaloriasDiarias.length > 0 && (
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <AreaChart className="w-5 h-5 text-accent-electric" />
              <h3 className="text-lg font-bold text-white">Calorias Diárias (Últimas 2 Semanas)</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dadosCaloriasDiarias}>
                <defs>
                  <linearGradient id="colorCalorias" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
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
                  formatter={(value: number) => `${value} kcal`}
                />
                <Area 
                  type="monotone" 
                  dataKey="calorias" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  fill="url(#colorCalorias)"
                  name="Calorias (kcal)"
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
                placeholder="Buscar por alimentos, refeição ou observações..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
              />
            </div>
            <select
              value={filtroRefeicao}
              onChange={(e) => setFiltroRefeicao(e.target.value)}
              className="px-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
            >
              <option value="todas">Todas as Refeições</option>
              <option value="Café da Manhã">Café da Manhã</option>
              <option value="Lanche da Manhã">Lanche da Manhã</option>
              <option value="Almoço">Almoço</option>
              <option value="Lanche da Tarde">Lanche da Tarde</option>
              <option value="Jantar">Jantar</option>
              <option value="Ceia">Ceia</option>
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

        {/* Lista de Registros */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Apple className="w-5 h-5 text-accent-electric" />
            Registros de Alimentação ({registrosFiltrados.length})
          </h2>
          {registrosFiltrados.length > 0 ? (
            <div className="space-y-3">
              {registrosFiltrados.map((registro) => {
                const isHoje = registro.data === hoje
                return (
                  <div
                    key={registro.id}
                    className={`p-5 bg-dark-black/50 border rounded-xl hover:border-accent-electric/30 transition-all group ${
                      isHoje ? 'border-accent-electric/50 bg-accent-electric/5' : 'border-card-border/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold text-lg">{registro.refeicao}</h3>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                            isHoje 
                              ? 'bg-accent-electric/15 text-accent-electric border-accent-electric/20' 
                              : 'bg-gray-500/15 text-gray-400 border-gray-500/20'
                          }`}>
                            {new Date(registro.data).toLocaleDateString('pt-BR')}
                          </span>
                          {isHoje && (
                            <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                              Hoje
                            </span>
                          )}
                          {registro.calorias && (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                              {registro.calorias} kcal
                            </span>
                          )}
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{registro.alimentos}</p>
                        {registro.observacoes && (
                          <p className="text-sm text-gray-400">{registro.observacoes}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingRegistro(registro)
                            setIsModalOpen(true)
                          }}
                          className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir este registro?')) {
                              setRegistros(registros.filter(r => r.id !== registro.id))
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
              <Apple className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhum registro encontrado</p>
              <p className="text-gray-500 text-sm mt-1">Ajuste os filtros ou registre sua primeira refeição</p>
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingRegistro(null)
          }}
          title={editingRegistro ? 'Editar Registro' : 'Novo Registro'}
          size="lg"
          variant="success"
          icon={Apple}
          description={editingRegistro ? 'Atualize o registro de alimentação' : 'Registre uma nova refeição para acompanhar sua alimentação'}
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
                  defaultValue={editingRegistro?.data || hoje}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Refeição
                </label>
                <select
                  name="refeicao"
                  defaultValue={editingRegistro?.refeicao}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="">Selecione</option>
                  <option value="Café da Manhã">Café da Manhã</option>
                  <option value="Lanche da Manhã">Lanche da Manhã</option>
                  <option value="Almoço">Almoço</option>
                  <option value="Lanche da Tarde">Lanche da Tarde</option>
                  <option value="Jantar">Jantar</option>
                  <option value="Ceia">Ceia</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Alimentos
              </label>
              <textarea
                name="alimentos"
                defaultValue={editingRegistro?.alimentos}
                rows={3}
                placeholder="Descreva os alimentos consumidos..."
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Calorias (kcal)
              </label>
              <input
                type="number"
                name="calorias"
                min="0"
                defaultValue={editingRegistro?.calorias}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Observações
              </label>
              <textarea
                name="observacoes"
                defaultValue={editingRegistro?.observacoes}
                rows={2}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingRegistro ? 'Salvar Alterações' : 'Adicionar Registro'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingRegistro(null)
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
