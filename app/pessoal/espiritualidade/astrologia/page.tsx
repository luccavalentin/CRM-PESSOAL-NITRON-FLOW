'use client'

import { useState, useEffect, useMemo } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { Plus, Star, Trash2, Edit2, Calendar, BarChart3, PieChart as PieChartIcon, Search } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const COLORS = ['#00D9FF', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899']

interface RegistroAstrologia {
  id: string
  data: string
  tipo: 'Lua Nova' | 'Lua Cheia' | 'Eclipse' | 'Retrogradação' | 'Outro'
  signo: string
  descricao: string
  observacoes?: string
}

const SIGNOS = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes']

export default function AstrologiaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRegistro, setEditingRegistro] = useState<RegistroAstrologia | null>(null)
  const [registros, setRegistros] = useState<RegistroAstrologia[]>([])
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [filtroSigno, setFiltroSigno] = useState<string>('todos')
  const [filtroData, setFiltroData] = useState<string>('todas')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('astrologia-pessoal')
    if (saved) {
      setRegistros(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('astrologia-pessoal', JSON.stringify(registros))
  }, [registros])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novoRegistro: RegistroAstrologia = {
      id: editingRegistro?.id || uuidv4(),
      data: formData.get('data') as string,
      tipo: (formData.get('tipo') as RegistroAstrologia['tipo']) || 'Outro',
      signo: formData.get('signo') as string,
      descricao: formData.get('descricao') as string,
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

  const totalRegistros = registros.length
  const registrosEsteMes = registros.filter(r => {
    const dataRegistro = new Date(r.data)
    const hoje = new Date()
    return dataRegistro.getMonth() === hoje.getMonth() && dataRegistro.getFullYear() === hoje.getFullYear()
  }).length

  // Filtros
  const registrosFiltrados = useMemo(() => {
    return registros.filter(registro => {
      const matchTipo = filtroTipo === 'todos' || registro.tipo === filtroTipo
      const matchSigno = filtroSigno === 'todos' || registro.signo === filtroSigno
      const matchData = filtroData === 'todas' || registro.data === filtroData
      const matchBusca = !busca || 
        registro.descricao.toLowerCase().includes(busca.toLowerCase()) ||
        registro.tipo.toLowerCase().includes(busca.toLowerCase()) ||
        registro.signo.toLowerCase().includes(busca.toLowerCase()) ||
        (registro.observacoes && registro.observacoes.toLowerCase().includes(busca.toLowerCase()))
      return matchTipo && matchSigno && matchData && matchBusca
    }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
  }, [registros, filtroTipo, filtroSigno, filtroData, busca])

  const datasUnicas = useMemo(() => {
    return Array.from(new Set(registros.map(r => r.data)))
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .slice(0, 30)
  }, [registros])

  // Dados para gráficos
  const dadosTipo = useMemo(() => {
    const tiposMap = new Map<string, number>()
    registros.forEach(r => {
      const atual = tiposMap.get(r.tipo) || 0
      tiposMap.set(r.tipo, atual + 1)
    })
    return Array.from(tiposMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [registros])

  const dadosSigno = useMemo(() => {
    const signosMap = new Map<string, number>()
    registros.forEach(r => {
      const atual = signosMap.get(r.signo) || 0
      signosMap.set(r.signo, atual + 1)
    })
    return SIGNOS.map(signo => ({
      name: signo,
      value: signosMap.get(signo) || 0,
    })).filter(d => d.value > 0)
  }, [registros])

  const getTipoColor = (tipo: RegistroAstrologia['tipo']) => {
    switch (tipo) {
      case 'Lua Nova':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/20'
      case 'Lua Cheia':
        return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'
      case 'Eclipse':
        return 'bg-red-500/15 text-red-400 border-red-500/20'
      case 'Retrogradação':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/20'
      default:
        return 'bg-gray-500/15 text-gray-400 border-gray-500/20'
    }
  }

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Astrologia</h1>
            <p className="text-gray-400">Registre eventos astrológicos e observações com análises detalhadas</p>
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
            title="Total de Registros"
            value={totalRegistros}
            icon={Star}
            className="bg-gradient-to-br from-accent-electric/10 to-accent-cyan/5 border-accent-electric/20"
          />
          <StatCard
            title="Registros Este Mês"
            value={registrosEsteMes}
            icon={Calendar}
            valueColor="text-blue-400"
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20"
          />
          <StatCard
            title="Tipos Diferentes"
            value={dadosTipo.length}
            icon={BarChart3}
            valueColor="text-purple-400"
            className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20"
          />
          <StatCard
            title="Signos Registrados"
            value={dadosSigno.length}
            icon={PieChartIcon}
            valueColor="text-emerald-400"
            className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20"
          />
        </div>

        {/* Gráficos */}
        {registros.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <PieChartIcon className="w-5 h-5 text-accent-electric" />
                <h3 className="text-lg font-bold text-white">Registros por Tipo</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosTipo}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosTipo.map((entry, index) => (
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
                <h3 className="text-lg font-bold text-white">Registros por Signo</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosSigno}>
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
                    {dadosSigno.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por tipo, signo, descrição ou observações..."
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
              <option value="Lua Nova">Lua Nova</option>
              <option value="Lua Cheia">Lua Cheia</option>
              <option value="Eclipse">Eclipse</option>
              <option value="Retrogradação">Retrogradação</option>
              <option value="Outro">Outro</option>
            </select>
            <select
              value={filtroSigno}
              onChange={(e) => setFiltroSigno(e.target.value)}
              className="px-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
            >
              <option value="todos">Todos os Signos</option>
              {SIGNOS.map(signo => (
                <option key={signo} value={signo}>{signo}</option>
              ))}
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
            <Star className="w-5 h-5 text-accent-electric" />
            Registros Astrológicos ({registrosFiltrados.length})
          </h2>
          {registrosFiltrados.length > 0 ? (
            <div className="space-y-3">
              {registrosFiltrados.map((registro) => (
                <div
                  key={registro.id}
                  className="p-5 bg-dark-black/50 border border-card-border/50 rounded-xl hover:border-accent-electric/30 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold text-lg">{registro.tipo}</h3>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getTipoColor(registro.tipo)}`}>
                          {registro.tipo}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-accent-electric/15 text-accent-electric border border-accent-electric/20">
                          {registro.signo}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/20">
                          {new Date(registro.data).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2 line-clamp-2">{registro.descricao}</p>
                      {registro.observacoes && (
                        <p className="text-sm text-gray-400 line-clamp-2">{registro.observacoes}</p>
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
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhum registro encontrado</p>
              <p className="text-gray-500 text-sm mt-1">Ajuste os filtros ou registre seu primeiro evento astrológico</p>
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
          icon={Star}
          description={editingRegistro ? 'Atualize o registro astrológico' : 'Registre um evento astrológico ou observação importante'}
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
                  defaultValue={editingRegistro?.data}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo
                </label>
                <select
                  name="tipo"
                  defaultValue={editingRegistro?.tipo}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="Lua Nova">Lua Nova</option>
                  <option value="Lua Cheia">Lua Cheia</option>
                  <option value="Eclipse">Eclipse</option>
                  <option value="Retrogradação">Retrogradação</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Signo
              </label>
              <select
                name="signo"
                defaultValue={editingRegistro?.signo}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              >
                <option value="">Selecione</option>
                {SIGNOS.map(signo => (
                  <option key={signo} value={signo}>{signo}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                name="descricao"
                rows={4}
                defaultValue={editingRegistro?.descricao}
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
                {editingRegistro ? 'Salvar Alterações' : 'Criar Registro'}
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
