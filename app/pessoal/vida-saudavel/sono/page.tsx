'use client'

import { useState, useEffect, useMemo } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { Plus, Moon, Calendar, Trash2, Edit2, Clock, TrendingUp, BarChart3, PieChart as PieChartIcon, Search } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, LineChart, Line } from 'recharts'

const COLORS = ['#00D9FF', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

interface RegistroSono {
  id: string
  data: string
  horaDormir: string
  horaAcordar: string
  qualidade: 'Excelente' | 'Boa' | 'Regular' | 'Ruim'
  observacoes?: string
}

export default function SonoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRegistro, setEditingRegistro] = useState<RegistroSono | null>(null)
  const [registros, setRegistros] = useState<RegistroSono[]>([])
  const [filtroQualidade, setFiltroQualidade] = useState<string>('todas')
  const [filtroData, setFiltroData] = useState<string>('todas')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('sono-pessoal')
    if (saved) {
      setRegistros(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('sono-pessoal', JSON.stringify(registros))
  }, [registros])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novoRegistro: RegistroSono = {
      id: editingRegistro?.id || uuidv4(),
      data: formData.get('data') as string,
      horaDormir: formData.get('horaDormir') as string,
      horaAcordar: formData.get('horaAcordar') as string,
      qualidade: (formData.get('qualidade') as RegistroSono['qualidade']) || 'Boa',
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

  const calcularHorasSono = (horaDormir: string, horaAcordar: string) => {
    const [hDormir, mDormir] = horaDormir.split(':').map(Number)
    const [hAcordar, mAcordar] = horaAcordar.split(':').map(Number)
    const dormir = hDormir * 60 + mDormir
    const acordar = hAcordar * 60 + mAcordar
    let diff = acordar - dormir
    if (diff < 0) diff += 24 * 60
    return Math.floor(diff / 60) + (diff % 60) / 60
  }

  const registrosSemana = registros.filter(r => {
    const dataRegistro = new Date(r.data)
    const hoje = new Date()
    const diffTime = Math.abs(hoje.getTime() - dataRegistro.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  })
  
  const horasMedias = registrosSemana.length > 0
    ? (registrosSemana.reduce((acc, r) => acc + calcularHorasSono(r.horaDormir, r.horaAcordar), 0) / registrosSemana.length).toFixed(1)
    : '0'

  const totalRegistros = registros.length
  const horasMediasTotal = registros.length > 0
    ? (registros.reduce((acc, r) => acc + calcularHorasSono(r.horaDormir, r.horaAcordar), 0) / registros.length).toFixed(1)
    : '0'

  // Dados para gráficos
  const dadosQualidade = useMemo(() => {
    return [
      { name: 'Excelente', value: registros.filter(r => r.qualidade === 'Excelente').length, color: '#10B981' },
      { name: 'Boa', value: registros.filter(r => r.qualidade === 'Boa').length, color: '#00D9FF' },
      { name: 'Regular', value: registros.filter(r => r.qualidade === 'Regular').length, color: '#F59E0B' },
      { name: 'Ruim', value: registros.filter(r => r.qualidade === 'Ruim').length, color: '#EF4444' },
    ]
  }, [registros])

  const dadosHorasDiarias = useMemo(() => {
    return registros
      .map(r => ({
        data: new Date(r.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        horas: calcularHorasSono(r.horaDormir, r.horaAcordar),
        dataCompleta: r.data,
      }))
      .sort((a, b) => {
        const [diaA, mesA] = a.data.split('/').map(Number)
        const [diaB, mesB] = b.data.split('/').map(Number)
        if (mesA !== mesB) return mesA - mesB
        return diaA - diaB
      })
      .slice(-14)
  }, [registros])

  const dadosHorasMedias = useMemo(() => {
    const diasMap = new Map<string, { total: number, count: number }>()
    registros.forEach(r => {
      const data = new Date(r.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      const horas = calcularHorasSono(r.horaDormir, r.horaAcordar)
      const atual = diasMap.get(data) || { total: 0, count: 0 }
      diasMap.set(data, {
        total: atual.total + horas,
        count: atual.count + 1,
      })
    })
    return Array.from(diasMap.entries())
      .map(([data, dados]) => ({
        data,
        media: dados.total / dados.count,
      }))
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
      const matchQualidade = filtroQualidade === 'todas' || registro.qualidade === filtroQualidade
      const matchData = filtroData === 'todas' || registro.data === filtroData
      const matchBusca = !busca || 
        (registro.observacoes && registro.observacoes.toLowerCase().includes(busca.toLowerCase()))
      return matchQualidade && matchData && matchBusca
    }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
  }, [registros, filtroQualidade, filtroData, busca])

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
            <h1 className="text-3xl font-bold text-white mb-2">Sono</h1>
            <p className="text-gray-400">Acompanhe a qualidade do seu sono com análises detalhadas</p>
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
            title="Registros Esta Semana"
            value={registrosSemana.length}
            icon={Moon}
            className="bg-gradient-to-br from-accent-electric/10 to-accent-cyan/5 border-accent-electric/20"
          />
          <StatCard
            title="Média de Horas (Semana)"
            value={`${horasMedias}h`}
            icon={Clock}
            valueColor="text-emerald-400"
            className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20"
          />
          <StatCard
            title="Média Total de Horas"
            value={`${horasMediasTotal}h`}
            icon={TrendingUp}
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
                <h3 className="text-lg font-bold text-white">Distribuição por Qualidade</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosQualidade}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosQualidade.map((entry, index) => (
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
                <h3 className="text-lg font-bold text-white">Horas de Sono Diárias (Últimas 2 Semanas)</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosHorasDiarias}>
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
                    domain={[0, 12]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => `${value.toFixed(1)}h`}
                  />
                  <Bar dataKey="horas" fill="#00D9FF" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Gráfico de Evolução */}
        {dadosHorasMedias.length > 0 && (
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <LineChart className="w-5 h-5 text-accent-electric" />
              <h3 className="text-lg font-bold text-white">Evolução das Horas de Sono (Últimas 2 Semanas)</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dadosHorasMedias}>
                <defs>
                  <linearGradient id="colorHoras" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
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
                  domain={[0, 12]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => `${value.toFixed(1)}h`}
                />
                <Area 
                  type="monotone" 
                  dataKey="media" 
                  stroke="#7C3AED" 
                  strokeWidth={2}
                  fill="url(#colorHoras)"
                  name="Horas de Sono"
                />
                <Line 
                  type="monotone" 
                  dataKey="media" 
                  stroke="#7C3AED" 
                  strokeWidth={2}
                  dot={{ fill: '#7C3AED', r: 4 }}
                  activeDot={{ r: 6 }}
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
                placeholder="Buscar por observações..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
              />
            </div>
            <select
              value={filtroQualidade}
              onChange={(e) => setFiltroQualidade(e.target.value)}
              className="px-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
            >
              <option value="todas">Todas as Qualidades</option>
              <option value="Excelente">Excelente</option>
              <option value="Boa">Boa</option>
              <option value="Regular">Regular</option>
              <option value="Ruim">Ruim</option>
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
            <Moon className="w-5 h-5 text-accent-electric" />
            Histórico de Sono ({registrosFiltrados.length})
          </h2>
          {registrosFiltrados.length > 0 ? (
            <div className="space-y-3">
              {registrosFiltrados.map((registro) => {
                const horasSono = calcularHorasSono(registro.horaDormir, registro.horaAcordar)
                const isHoje = registro.data === new Date().toISOString().split('T')[0]
                
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
                          <h3 className="text-white font-semibold text-lg">
                            {new Date(registro.data).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </h3>
                          {isHoje && (
                            <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                              Hoje
                            </span>
                          )}
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                            registro.qualidade === 'Excelente'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                              : registro.qualidade === 'Boa'
                              ? 'bg-blue-500/15 text-blue-400 border-blue-500/20'
                              : registro.qualidade === 'Regular'
                              ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'
                              : 'bg-red-500/15 text-red-400 border-red-500/20'
                          }`}>
                            {registro.qualidade}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-2">
                          <div className="flex items-center gap-1">
                            <Moon className="w-4 h-4" />
                            <span>Dormiu: {registro.horaDormir}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Acordou: {registro.horaAcordar}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            <span className="font-semibold text-accent-electric">{horasSono.toFixed(1)}h de sono</span>
                          </div>
                        </div>
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
              <Moon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhum registro encontrado</p>
              <p className="text-gray-500 text-sm mt-1">Ajuste os filtros ou registre seu primeiro sono</p>
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
          variant="info"
          icon={Moon}
          description={editingRegistro ? 'Atualize o registro de sono' : 'Registre informações sobre seu sono para acompanhar a qualidade'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data
              </label>
              <input
                type="date"
                name="data"
                defaultValue={editingRegistro?.data || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hora de Dormir
                </label>
                <input
                  type="time"
                  name="horaDormir"
                  defaultValue={editingRegistro?.horaDormir}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hora de Acordar
                </label>
                <input
                  type="time"
                  name="horaAcordar"
                  defaultValue={editingRegistro?.horaAcordar}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Qualidade do Sono
              </label>
              <select
                name="qualidade"
                defaultValue={editingRegistro?.qualidade || 'Boa'}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              >
                <option value="Excelente">Excelente</option>
                <option value="Boa">Boa</option>
                <option value="Regular">Regular</option>
                <option value="Ruim">Ruim</option>
              </select>
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
