'use client'

import { useState, useEffect, useMemo } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { Plus, Sparkles, Trash2, Edit2, Calendar, BarChart3, PieChart as PieChartIcon, Search, Target } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const COLORS = ['#00D9FF', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899']

interface Afirmacao {
  id: string
  texto: string
  categoria: string
  dataCriacao: string
  frequencia: number
  status: 'Ativa' | 'Arquivada'
}

export default function LeiAtracaoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAfirmacao, setEditingAfirmacao] = useState<Afirmacao | null>(null)
  const [afirmacoes, setAfirmacoes] = useState<Afirmacao[]>([])
  const [filtroStatus, setFiltroStatus] = useState<'Todas' | 'Ativa' | 'Arquivada'>('Todas')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('lei-atracao-pessoal')
    if (saved) {
      setAfirmacoes(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('lei-atracao-pessoal', JSON.stringify(afirmacoes))
  }, [afirmacoes])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novaAfirmacao: Afirmacao = {
      id: editingAfirmacao?.id || uuidv4(),
      texto: formData.get('texto') as string,
      categoria: formData.get('categoria') as string,
      dataCriacao: editingAfirmacao?.dataCriacao || new Date().toISOString().split('T')[0],
      frequencia: parseInt(formData.get('frequencia') as string) || 1,
      status: (formData.get('status') as Afirmacao['status']) || 'Ativa',
    }

    if (editingAfirmacao) {
      setAfirmacoes(afirmacoes.map(a => a.id === editingAfirmacao.id ? novaAfirmacao : a))
    } else {
      setAfirmacoes([...afirmacoes, novaAfirmacao])
    }

    setIsModalOpen(false)
    setEditingAfirmacao(null)
  }

  const afirmacoesAtivas = afirmacoes.filter(a => a.status === 'Ativa')
  const afirmacoesArquivadas = afirmacoes.filter(a => a.status === 'Arquivada')
  const totalFrequencia = afirmacoesAtivas.reduce((acc, a) => acc + a.frequencia, 0)
  const categoriasUnicas = useMemo(() => {
    return Array.from(new Set(afirmacoes.map(a => a.categoria))).sort()
  }, [afirmacoes])

  // Filtros
  const afirmacoesFiltradas = useMemo(() => {
    return afirmacoes.filter(afirmacao => {
      const matchStatus = filtroStatus === 'Todas' || afirmacao.status === filtroStatus
      const matchCategoria = filtroCategoria === 'todas' || afirmacao.categoria === filtroCategoria
      const matchBusca = !busca || 
        afirmacao.texto.toLowerCase().includes(busca.toLowerCase()) ||
        afirmacao.categoria.toLowerCase().includes(busca.toLowerCase())
      return matchStatus && matchCategoria && matchBusca
    })
  }, [afirmacoes, filtroStatus, filtroCategoria, busca])

  // Dados para gráficos
  const dadosCategoria = useMemo(() => {
    const categoriasMap = new Map<string, number>()
    afirmacoes.filter(a => a.status === 'Ativa').forEach(a => {
      const atual = categoriasMap.get(a.categoria) || 0
      categoriasMap.set(a.categoria, atual + 1)
    })
    return Array.from(categoriasMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [afirmacoes])

  const dadosStatus = useMemo(() => {
    return [
      { name: 'Ativas', value: afirmacoesAtivas.length, color: '#10B981' },
      { name: 'Arquivadas', value: afirmacoesArquivadas.length, color: '#6B7280' },
    ]
  }, [afirmacoes, afirmacoesAtivas.length, afirmacoesArquivadas.length])

  const dadosFrequencia = useMemo(() => {
    return afirmacoesAtivas
      .sort((a, b) => b.frequencia - a.frequencia)
      .slice(0, 10)
      .map(afirmacao => ({
        texto: afirmacao.texto.length > 20 ? afirmacao.texto.substring(0, 20) + '...' : afirmacao.texto,
        frequencia: afirmacao.frequencia,
      }))
  }, [afirmacoes])

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Lei da Atração</h1>
            <p className="text-gray-400">Afirmações e manifestações com análises detalhadas</p>
          </div>
          <Button
            onClick={() => {
              setEditingAfirmacao(null)
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Nova Afirmação
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Afirmações Ativas"
            value={afirmacoesAtivas.length}
            icon={Sparkles}
            valueColor="text-emerald-400"
            className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20"
          />
          <StatCard
            title="Afirmações Arquivadas"
            value={afirmacoesArquivadas.length}
            icon={Target}
            valueColor="text-gray-400"
            className="bg-gradient-to-br from-gray-500/10 to-gray-600/5 border-gray-500/20"
          />
          <StatCard
            title="Total de Repetições/Dia"
            value={totalFrequencia}
            icon={BarChart3}
            valueColor="text-accent-electric"
            className="bg-gradient-to-br from-accent-electric/10 to-accent-cyan/5 border-accent-electric/20"
          />
          <StatCard
            title="Total de Categorias"
            value={categoriasUnicas.length}
            icon={PieChartIcon}
            valueColor="text-purple-400"
            className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20"
          />
        </div>

        {/* Gráficos */}
        {afirmacoes.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <PieChartIcon className="w-5 h-5 text-accent-electric" />
                <h3 className="text-lg font-bold text-white">Status das Afirmações</h3>
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
                <h3 className="text-lg font-bold text-white">Afirmações Ativas por Categoria</h3>
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

        {/* Top 10 por Frequência */}
        {dadosFrequencia.length > 0 && (
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-accent-electric" />
              <h3 className="text-lg font-bold text-white">Top 10 Afirmações por Frequência Diária</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosFrequencia}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="texto" 
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
                  formatter={(value: number) => `${value}x/dia`}
                />
                <Bar dataKey="frequencia" fill="#00D9FF" radius={[8, 8, 0, 0]} />
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
                placeholder="Buscar por texto ou categoria..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
              />
            </div>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as 'Todas' | 'Ativa' | 'Arquivada')}
              className="px-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
            >
              <option value="Todas">Todas</option>
              <option value="Ativa">Ativas</option>
              <option value="Arquivada">Arquivadas</option>
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

        {/* Lista de Afirmações */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-electric" />
            Afirmações ({afirmacoesFiltradas.length})
          </h2>
          {afirmacoesFiltradas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {afirmacoesFiltradas.map((afirmacao) => (
                <div
                  key={afirmacao.id}
                  className={`p-5 rounded-xl border transition-all group ${
                    afirmacao.status === 'Ativa'
                      ? 'bg-gradient-to-br from-accent-electric/10 to-accent-cyan/5 border-accent-electric/20 hover:border-accent-electric/50'
                      : 'bg-dark-black/50 border-card-border/50 hover:border-gray-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-white font-semibold text-lg mb-2 line-clamp-3">{afirmacao.texto}</p>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                          afirmacao.status === 'Ativa'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                            : 'bg-gray-500/15 text-gray-400 border-gray-500/20'
                        }`}>
                          {afirmacao.status}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-accent-electric/15 text-accent-electric border border-accent-electric/20">
                          {afirmacao.categoria}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/20">
                          {afirmacao.frequencia}x/dia
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingAfirmacao(afirmacao)
                          setIsModalOpen(true)
                        }}
                        className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Tem certeza que deseja excluir esta afirmação?')) {
                            setAfirmacoes(afirmacoes.filter(a => a.id !== afirmacao.id))
                          }
                        }}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Criada em {new Date(afirmacao.dataCriacao).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhuma afirmação encontrada</p>
              <p className="text-gray-500 text-sm mt-1">Ajuste os filtros ou crie sua primeira afirmação</p>
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingAfirmacao(null)
          }}
          title={editingAfirmacao ? 'Editar Afirmação' : 'Nova Afirmação'}
          size="lg"
          variant="info"
          icon={Sparkles}
          description={editingAfirmacao ? 'Atualize sua afirmação da lei da atração' : 'Crie uma nova afirmação positiva para manifestar seus desejos'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Afirmação
              </label>
              <textarea
                name="texto"
                rows={4}
                defaultValue={editingAfirmacao?.texto}
                placeholder="Ex: Eu sou bem-sucedido e próspero..."
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
                  defaultValue={editingAfirmacao?.categoria}
                  placeholder="Ex: Prosperidade, Saúde, Amor..."
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Frequência (vezes/dia)
                </label>
                <input
                  type="number"
                  name="frequencia"
                  min="1"
                  defaultValue={editingAfirmacao?.frequencia || 1}
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
                defaultValue={editingAfirmacao?.status || 'Ativa'}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              >
                <option value="Ativa">Ativa</option>
                <option value="Arquivada">Arquivada</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingAfirmacao ? 'Salvar Alterações' : 'Criar Afirmação'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingAfirmacao(null)
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
