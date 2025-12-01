'use client'

import { useState, useEffect, useMemo } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { Plus, Scale, TrendingDown, TrendingUp, Calendar, Trash2, Edit2, Award, BarChart3, Search } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts'

interface RegistroPeso {
  id: string
  data: string
  peso: number
  observacoes?: string
}

export default function PesoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRegistro, setEditingRegistro] = useState<RegistroPeso | null>(null)
  const [registros, setRegistros] = useState<RegistroPeso[]>([])
  const [busca, setBusca] = useState('')
  const [periodoGrafico, setPeriodoGrafico] = useState<'7' | '30' | '90' | 'todos'>('30')

  useEffect(() => {
    const saved = localStorage.getItem('peso-pessoal')
    if (saved) {
      setRegistros(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('peso-pessoal', JSON.stringify(registros))
  }, [registros])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const pesoValue = formData.get('peso') as string
    const dataValue = formData.get('data') as string
    
    const novoRegistro: RegistroPeso = {
      id: editingRegistro?.id || uuidv4(),
      data: dataValue || hoje,
      peso: parseFloat(pesoValue) || 0,
      observacoes: formData.get('observacoes') as string || undefined,
    }

    const registroExistente = registros.find(r => r.data === novoRegistro.data && r.id !== editingRegistro?.id)
    if (registroExistente) {
      if (confirm('Já existe um registro para esta data. Deseja substituir?')) {
        setRegistros(registros.map(r => r.id === registroExistente.id ? novoRegistro : r))
      } else {
        return
      }
    } else if (editingRegistro) {
      setRegistros(registros.map(r => r.id === editingRegistro.id ? novoRegistro : r))
    } else {
      setRegistros([...registros, novoRegistro])
    }

    setIsModalOpen(false)
    setEditingRegistro(null)
  }

  const registrosOrdenados = useMemo(() => {
    return [...registros].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
  }, [registros])

  const pesoAtual = registrosOrdenados.length > 0 ? registrosOrdenados[registrosOrdenados.length - 1].peso : 0
  const pesoInicial = registrosOrdenados.length > 0 ? registrosOrdenados[0].peso : 0
  const pesoMaximo = registros.length > 0 ? Math.max(...registros.map(r => r.peso)) : 0
  const pesoMinimo = registros.length > 0 ? Math.min(...registros.map(r => r.peso)) : 0
  const diferencaPeso = pesoAtual - pesoInicial
  const percentualVariacao = pesoInicial > 0 ? ((diferencaPeso / pesoInicial) * 100) : 0
  const mediaPeso = registros.length > 0 ? registros.reduce((acc, r) => acc + r.peso, 0) / registros.length : 0

  const calcularPerdaPeso = (dias: number) => {
    if (registrosOrdenados.length < 2) return null
    
    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() - dias)
    
    const registrosNoPeriodo = registrosOrdenados.filter(r => new Date(r.data) >= dataLimite)
    if (registrosNoPeriodo.length < 2) return null
    
    const pesoMaisAntigo = registrosNoPeriodo[0].peso
    const pesoMaisRecente = registrosNoPeriodo[registrosNoPeriodo.length - 1].peso
    const diferenca = pesoMaisRecente - pesoMaisAntigo
    
    return {
      diferenca,
      pesoInicial: pesoMaisAntigo,
      pesoFinal: pesoMaisRecente,
      dias,
    }
  }

  const perda7Dias = calcularPerdaPeso(7)
  const perda30Dias = calcularPerdaPeso(30)
  const perda90Dias = calcularPerdaPeso(90)

  // Dados para gráficos
  const dadosGrafico = useMemo(() => {
    let dadosFiltrados = registrosOrdenados
    
    if (periodoGrafico !== 'todos') {
      const dias = parseInt(periodoGrafico)
      const dataLimite = new Date()
      dataLimite.setDate(dataLimite.getDate() - dias)
      dadosFiltrados = registrosOrdenados.filter(r => new Date(r.data) >= dataLimite)
    }
    
    return dadosFiltrados.map(r => ({
      data: new Date(r.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      peso: r.peso,
      dataCompleta: r.data,
    }))
  }, [registrosOrdenados, periodoGrafico])

  // Dados mensais para análise
  const dadosMensais = useMemo(() => {
    const mesesMap = new Map<string, { total: number, count: number }>()
    
    registros.forEach(r => {
      const data = new Date(r.data)
      const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`
      const atual = mesesMap.get(mesAno) || { total: 0, count: 0 }
      mesesMap.set(mesAno, {
        total: atual.total + r.peso,
        count: atual.count + 1,
      })
    })
    
    return Array.from(mesesMap.entries())
      .map(([mes, dados]) => ({
        mes,
        media: dados.total / dados.count,
      }))
      .sort((a, b) => {
        const [mesA, anoA] = a.mes.split('/').map(Number)
        const [mesB, anoB] = b.mes.split('/').map(Number)
        if (anoA !== anoB) return anoA - anoB
        return mesA - mesB
      })
      .slice(-6)
  }, [registros])

  // Filtros
  const registrosFiltrados = useMemo(() => {
    return registrosOrdenados.filter(r => {
      const matchBusca = !busca || 
        r.peso.toString().includes(busca) ||
        new Date(r.data).toLocaleDateString('pt-BR').includes(busca) ||
        (r.observacoes && r.observacoes.toLowerCase().includes(busca.toLowerCase()))
      return matchBusca
    })
  }, [registrosOrdenados, busca])

  const hoje = new Date().toISOString().split('T')[0]
  const registroHoje = registros.find(r => r.data === hoje)

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Controle de Peso</h1>
            <p className="text-gray-400">Registre e acompanhe sua evolução de peso com análises detalhadas</p>
          </div>
          <Button
            onClick={() => {
              setEditingRegistro(null)
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Registrar Peso
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Peso Atual"
            value={pesoAtual > 0 ? `${pesoAtual.toFixed(1)} kg` : '--'}
            icon={Scale}
            valueColor="text-accent-electric"
            className="bg-gradient-to-br from-accent-electric/10 to-accent-cyan/5 border-accent-electric/20"
          />
          <StatCard
            title="Variação Total"
            value={diferencaPeso !== 0 ? `${diferencaPeso >= 0 ? '+' : ''}${diferencaPeso.toFixed(1)} kg` : '0 kg'}
            icon={diferencaPeso < 0 ? TrendingDown : TrendingUp}
            valueColor={diferencaPeso < 0 ? 'text-emerald-400' : diferencaPeso > 0 ? 'text-red-400' : 'text-gray-400'}
            className={diferencaPeso < 0 ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20' : 'bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20'}
          />
          <StatCard
            title="Peso Médio"
            value={mediaPeso > 0 ? `${mediaPeso.toFixed(1)} kg` : '--'}
            icon={BarChart3}
            valueColor="text-blue-400"
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20"
          />
          <StatCard
            title="Total Registros"
            value={registros.length}
            icon={Calendar}
            className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20"
          />
        </div>

        {/* Cards de Perda de Peso */}
        {(perda7Dias || perda30Dias || perda90Dias) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {perda7Dias && (
              <div className={`p-4 sm:p-6 rounded-xl border-2 ${
                perda7Dias.diferenca < 0 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : perda7Dias.diferenca > 0
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-gray-500/10 border-gray-500/30'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${
                    perda7Dias.diferenca < 0 
                      ? 'bg-emerald-500/20' 
                      : perda7Dias.diferenca > 0
                      ? 'bg-red-500/20'
                      : 'bg-gray-500/20'
                  }`}>
                    <Award className={`w-5 h-5 ${
                      perda7Dias.diferenca < 0 
                        ? 'text-emerald-400' 
                        : perda7Dias.diferenca > 0
                        ? 'text-red-400'
                        : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-300">Últimos 7 dias</h3>
                    <p className="text-xs text-gray-500">Período de uma semana</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl sm:text-3xl font-bold ${
                      perda7Dias.diferenca < 0 
                        ? 'text-emerald-400' 
                        : perda7Dias.diferenca > 0
                        ? 'text-red-400'
                        : 'text-gray-400'
                    }`}>
                      {perda7Dias.diferenca < 0 ? '' : '+'}{perda7Dias.diferenca.toFixed(1)} kg
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400">
                    De {perda7Dias.pesoInicial.toFixed(1)} kg para {perda7Dias.pesoFinal.toFixed(1)} kg
                  </p>
                </div>
              </div>
            )}

            {perda30Dias && (
              <div className={`p-4 sm:p-6 rounded-xl border-2 ${
                perda30Dias.diferenca < 0 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : perda30Dias.diferenca > 0
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-gray-500/10 border-gray-500/30'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${
                    perda30Dias.diferenca < 0 
                      ? 'bg-emerald-500/20' 
                      : perda30Dias.diferenca > 0
                      ? 'bg-red-500/20'
                      : 'bg-gray-500/20'
                  }`}>
                    <Award className={`w-5 h-5 ${
                      perda30Dias.diferenca < 0 
                        ? 'text-emerald-400' 
                        : perda30Dias.diferenca > 0
                        ? 'text-red-400'
                        : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-300">Últimos 30 dias</h3>
                    <p className="text-xs text-gray-500">Período de um mês</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl sm:text-3xl font-bold ${
                      perda30Dias.diferenca < 0 
                        ? 'text-emerald-400' 
                        : perda30Dias.diferenca > 0
                        ? 'text-red-400'
                        : 'text-gray-400'
                    }`}>
                      {perda30Dias.diferenca < 0 ? '' : '+'}{perda30Dias.diferenca.toFixed(1)} kg
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400">
                    De {perda30Dias.pesoInicial.toFixed(1)} kg para {perda30Dias.pesoFinal.toFixed(1)} kg
                  </p>
                </div>
              </div>
            )}

            {perda90Dias && (
              <div className={`p-4 sm:p-6 rounded-xl border-2 ${
                perda90Dias.diferenca < 0 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : perda90Dias.diferenca > 0
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-gray-500/10 border-gray-500/30'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${
                    perda90Dias.diferenca < 0 
                      ? 'bg-emerald-500/20' 
                      : perda90Dias.diferenca > 0
                      ? 'bg-red-500/20'
                      : 'bg-gray-500/20'
                  }`}>
                    <Award className={`w-5 h-5 ${
                      perda90Dias.diferenca < 0 
                        ? 'text-emerald-400' 
                        : perda90Dias.diferenca > 0
                        ? 'text-red-400'
                        : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-300">Últimos 90 dias</h3>
                    <p className="text-xs text-gray-500">Período de 3 meses</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl sm:text-3xl font-bold ${
                      perda90Dias.diferenca < 0 
                        ? 'text-emerald-400' 
                        : perda90Dias.diferenca > 0
                        ? 'text-red-400'
                        : 'text-gray-400'
                    }`}>
                      {perda90Dias.diferenca < 0 ? '' : '+'}{perda90Dias.diferenca.toFixed(1)} kg
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400">
                    De {perda90Dias.pesoInicial.toFixed(1)} kg para {perda90Dias.pesoFinal.toFixed(1)} kg
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Gráficos */}
        {registrosOrdenados.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-accent-electric" />
                  <h3 className="text-lg font-bold text-white">Evolução do Peso</h3>
                </div>
                <select
                  value={periodoGrafico}
                  onChange={(e) => setPeriodoGrafico(e.target.value as '7' | '30' | '90' | 'todos')}
                  className="px-3 py-1.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50"
                >
                  <option value="7">7 dias</option>
                  <option value="30">30 dias</option>
                  <option value="90">90 dias</option>
                  <option value="todos">Todos</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dadosGrafico}>
                  <defs>
                    <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
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
                    label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: number) => `${value.toFixed(1)} kg`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="peso" 
                    stroke="#00D9FF" 
                    strokeWidth={2}
                    fill="url(#colorPeso)"
                    name="Peso (kg)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {dadosMensais.length > 0 && (
              <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-accent-electric" />
                  <h3 className="text-lg font-bold text-white">Média Mensal de Peso</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dadosMensais}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="mes" 
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
                      formatter={(value: number) => `${value.toFixed(1)} kg`}
                    />
                    <Bar dataKey="media" fill="#00D9FF" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Filtros */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por peso, data ou observações..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
              />
            </div>
          </div>
        </div>

        {/* Lista de Registros */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-accent-electric" />
            Registros de Peso ({registrosFiltrados.length})
          </h2>
          {registrosFiltrados.length > 0 ? (
            <div className="space-y-3">
              {registrosFiltrados
                .slice()
                .reverse()
                .map((registro) => {
                  const isHoje = registro.data === hoje
                  return (
                    <div
                      key={registro.id}
                      className={`p-4 sm:p-5 bg-dark-black/50 border rounded-xl hover:border-accent-electric/30 transition-all group ${
                        isHoje ? 'border-accent-electric/50 bg-accent-electric/5' : 'border-card-border/50'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                            <h3 className="text-base sm:text-lg font-semibold text-white">
                              {registro.peso.toFixed(1)} kg
                            </h3>
                            <span className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                              isHoje 
                                ? 'bg-accent-electric/15 text-accent-electric border-accent-electric/20' 
                                : 'bg-gray-500/15 text-gray-400 border-gray-500/20'
                            }`}>
                              {new Date(registro.data).toLocaleDateString('pt-BR', { 
                                weekday: 'long', 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </span>
                            {isHoje && (
                              <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                Hoje
                              </span>
                            )}
                          </div>
                          {registro.observacoes && (
                            <p className="text-xs sm:text-sm text-gray-400 mt-2">{registro.observacoes}</p>
                          )}
                        </div>
                        <div className="flex gap-2 sm:ml-4 self-start sm:self-auto opacity-0 group-hover:opacity-100 transition-opacity">
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
              <Scale className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhum registro encontrado</p>
              <p className="text-gray-500 text-sm mt-1">Ajuste os filtros ou comece registrando seu peso diário</p>
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingRegistro(null)
          }}
          title={editingRegistro ? 'Editar Registro de Peso' : 'Registrar Peso'}
          size="md"
          variant="info"
          icon={Scale}
          description={editingRegistro ? 'Atualize as informações do registro de peso' : 'Registre seu peso para acompanhar sua evolução'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  Peso (kg)
                </label>
                <input
                  type="number"
                  name="peso"
                  step="0.1"
                  min="0"
                  max="500"
                  defaultValue={editingRegistro?.peso}
                  placeholder="Ex: 75.5"
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
                defaultValue={editingRegistro?.observacoes}
                rows={3}
                placeholder="Ex: Após treino, pela manhã..."
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingRegistro ? 'Salvar Alterações' : 'Registrar Peso'}
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
