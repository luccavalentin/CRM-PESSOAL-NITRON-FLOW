'use client'

import { useState, useEffect, useMemo } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { Plus, BookOpen, CheckCircle2, Clock, Trash2, Edit2, Star, BarChart3, PieChart as PieChartIcon, Search } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const COLORS = ['#00D9FF', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

interface Livro {
  id: string
  titulo: string
  autor: string
  genero: string
  status: 'Quero Ler' | 'Lendo' | 'Lido' | 'Abandonado'
  dataInicio?: string
  dataFim?: string
  nota?: number
  resenha?: string
}

export default function LivrosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLivro, setEditingLivro] = useState<Livro | null>(null)
  const [livros, setLivros] = useState<Livro[]>([])
  const [filtroStatus, setFiltroStatus] = useState<'Todos' | 'Quero Ler' | 'Lendo' | 'Lido' | 'Abandonado'>('Todos')
  const [filtroGenero, setFiltroGenero] = useState<string>('todos')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('livros-pessoal')
    if (saved) {
      setLivros(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('livros-pessoal', JSON.stringify(livros))
  }, [livros])

  // Filtros
  const livrosFiltrados = useMemo(() => {
    return livros.filter(livro => {
      const matchStatus = filtroStatus === 'Todos' || livro.status === filtroStatus
      const matchGenero = filtroGenero === 'todos' || livro.genero === filtroGenero
      const matchBusca = !busca || livro.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                        livro.autor.toLowerCase().includes(busca.toLowerCase())
      return matchStatus && matchGenero && matchBusca
    })
  }, [livros, filtroStatus, filtroGenero, busca])

  const generosUnicos = useMemo(() => {
    return Array.from(new Set(livros.map(l => l.genero))).sort()
  }, [livros])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novoLivro: Livro = {
      id: editingLivro?.id || uuidv4(),
      titulo: formData.get('titulo') as string,
      autor: formData.get('autor') as string,
      genero: formData.get('genero') as string,
      status: (formData.get('status') as Livro['status']) || 'Quero Ler',
      dataInicio: formData.get('dataInicio') as string || undefined,
      dataFim: formData.get('dataFim') as string || undefined,
      nota: formData.get('nota') ? parseInt(formData.get('nota') as string) : undefined,
      resenha: formData.get('resenha') as string || undefined,
    }

    if (editingLivro) {
      setLivros(livros.map(l => l.id === editingLivro.id ? novoLivro : l))
    } else {
      setLivros([...livros, novoLivro])
    }

    setIsModalOpen(false)
    setEditingLivro(null)
  }

  const livrosLidos = livros.filter(l => l.status === 'Lido').length
  const livrosLendo = livros.filter(l => l.status === 'Lendo').length
  const livrosQueroLer = livros.filter(l => l.status === 'Quero Ler').length
  const notaMedia = livros.filter(l => l.nota).length > 0
    ? (livros.filter(l => l.nota).reduce((acc, l) => acc + (l.nota || 0), 0) / livros.filter(l => l.nota).length).toFixed(1)
    : '0'

  // Dados para gráficos
  const dadosStatus = useMemo(() => {
    return [
      { name: 'Quero Ler', value: livrosQueroLer, color: '#F59E0B' },
      { name: 'Lendo', value: livrosLendo, color: '#00D9FF' },
      { name: 'Lido', value: livrosLidos, color: '#10B981' },
      { name: 'Abandonado', value: livros.filter(l => l.status === 'Abandonado').length, color: '#6B7280' },
    ]
  }, [livros, livrosQueroLer, livrosLendo, livrosLidos])

  const dadosGenero = useMemo(() => {
    const generosMap = new Map<string, number>()
    livros.forEach(l => {
      const atual = generosMap.get(l.genero) || 0
      generosMap.set(l.genero, atual + 1)
    })
    return Array.from(generosMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
  }, [livros])

  const dadosNotas = useMemo(() => {
    return livros
      .filter(l => l.nota)
      .sort((a, b) => (b.nota || 0) - (a.nota || 0))
      .slice(0, 10)
      .map(livro => ({
        nome: livro.titulo.length > 20 ? livro.titulo.substring(0, 20) + '...' : livro.titulo,
        nota: livro.nota || 0,
      }))
  }, [livros])

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Livros</h1>
            <p className="text-gray-400">Gerencie sua biblioteca pessoal com análises detalhadas</p>
          </div>
          <Button
            onClick={() => {
              setEditingLivro(null)
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Novo Livro
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Livros Lidos"
            value={livrosLidos}
            icon={CheckCircle2}
            valueColor="text-emerald-400"
            className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20"
          />
          <StatCard
            title="Lendo Agora"
            value={livrosLendo}
            icon={BookOpen}
            valueColor="text-blue-400"
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20"
          />
          <StatCard
            title="Quero Ler"
            value={livrosQueroLer}
            icon={Clock}
            valueColor="text-yellow-400"
            className="bg-gradient-to-br from-yellow-500/10 to-orange-600/5 border-yellow-500/20"
          />
          <StatCard
            title="Nota Média"
            value={`${notaMedia}/5`}
            icon={Star}
            valueColor="text-yellow-400"
            className="bg-gradient-to-br from-yellow-500/10 to-orange-600/5 border-yellow-500/20"
          />
        </div>

        {/* Gráficos */}
        {livros.length > 0 && (
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
                <h3 className="text-lg font-bold text-white">Livros por Gênero</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosGenero}>
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
                    {dadosGenero.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Top 10 por Nota */}
        {dadosNotas.length > 0 && (
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-accent-electric" />
              <h3 className="text-lg font-bold text-white">Top 10 Livros por Nota</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosNotas}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="nome" 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis stroke="#9CA3AF" domain={[0, 5]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => `${value}/5`}
                />
                <Bar dataKey="nota" fill="#F59E0B" radius={[8, 8, 0, 0]} />
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
                placeholder="Buscar por título ou autor..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
              />
            </div>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as 'Todos' | 'Quero Ler' | 'Lendo' | 'Lido' | 'Abandonado')}
              className="px-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
            >
              <option value="Todos">Todos os Status</option>
              <option value="Quero Ler">Quero Ler</option>
              <option value="Lendo">Lendo</option>
              <option value="Lido">Lido</option>
              <option value="Abandonado">Abandonado</option>
            </select>
            <select
              value={filtroGenero}
              onChange={(e) => setFiltroGenero(e.target.value)}
              className="px-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
            >
              <option value="todos">Todos os Gêneros</option>
              {generosUnicos.map(genero => (
                <option key={genero} value={genero}>{genero}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de Livros */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent-electric" />
            Todos os Livros ({livrosFiltrados.length})
          </h2>
          {livrosFiltrados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {livrosFiltrados.map((livro) => (
                <div
                  key={livro.id}
                  className="p-5 bg-dark-black/50 border border-card-border/50 rounded-xl hover:border-accent-electric/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-1">{livro.titulo}</h3>
                      <p className="text-gray-400 text-sm mb-2">por {livro.autor}</p>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                          livro.status === 'Lido' 
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' 
                            : livro.status === 'Lendo'
                            ? 'bg-blue-500/15 text-blue-400 border-blue-500/20'
                            : livro.status === 'Quero Ler'
                            ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'
                            : 'bg-gray-500/15 text-gray-400 border-gray-500/20'
                        }`}>
                          {livro.status}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-accent-electric/15 text-accent-electric border border-accent-electric/20">
                          {livro.genero}
                        </span>
                        {livro.nota && (
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="text-xs font-semibold">{livro.nota}/5</span>
                          </div>
                        )}
                      </div>
                      {livro.dataInicio && (
                        <p className="text-xs text-gray-500 mb-1">
                          Início: {new Date(livro.dataInicio).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                      {livro.dataFim && (
                        <p className="text-xs text-gray-500">
                          Fim: {new Date(livro.dataFim).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingLivro(livro)
                          setIsModalOpen(true)
                        }}
                        className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Tem certeza que deseja excluir este livro?')) {
                            setLivros(livros.filter(l => l.id !== livro.id))
                          }
                        }}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {livro.resenha && (
                    <p className="text-sm text-gray-400 mt-3 line-clamp-2">{livro.resenha}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhum livro encontrado</p>
              <p className="text-gray-500 text-sm mt-1">Ajuste os filtros ou adicione seu primeiro livro</p>
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingLivro(null)
          }}
          title={editingLivro ? 'Editar Livro' : 'Novo Livro'}
          size="lg"
          variant="info"
          icon={BookOpen}
          description={editingLivro ? 'Atualize as informações do livro' : 'Adicione um novo livro à sua biblioteca pessoal'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Título
              </label>
              <input
                type="text"
                name="titulo"
                defaultValue={editingLivro?.titulo}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Autor
                </label>
                <input
                  type="text"
                  name="autor"
                  defaultValue={editingLivro?.autor}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gênero
                </label>
                <input
                  type="text"
                  name="genero"
                  defaultValue={editingLivro?.genero}
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
                  defaultValue={editingLivro?.status || 'Quero Ler'}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="Quero Ler">Quero Ler</option>
                  <option value="Lendo">Lendo</option>
                  <option value="Lido">Lido</option>
                  <option value="Abandonado">Abandonado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nota (1-5)
                </label>
                <input
                  type="number"
                  name="nota"
                  min="1"
                  max="5"
                  defaultValue={editingLivro?.nota}
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
                  defaultValue={editingLivro?.dataInicio}
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
                  defaultValue={editingLivro?.dataFim}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Resenha
              </label>
              <textarea
                name="resenha"
                defaultValue={editingLivro?.resenha}
                rows={3}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingLivro ? 'Salvar Alterações' : 'Adicionar Livro'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingLivro(null)
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
