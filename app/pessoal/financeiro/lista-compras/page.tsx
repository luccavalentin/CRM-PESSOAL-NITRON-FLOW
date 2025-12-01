'use client'

import { useState, useMemo } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { useListaComprasStore } from '@/stores/listaComprasStore'
import { ItemCompra, CategoriaCompra } from '@/types'
import { formatCurrency } from '@/utils/formatCurrency'
import { Plus, ShoppingCart, CheckCircle2, Circle, Trash2, Edit2, DollarSign, Filter, Search, BarChart3, PieChart as PieChartIcon } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const COLORS = ['#00D9FF', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

export default function ListaComprasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ItemCompra | null>(null)
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaCompra | 'Todas'>('Todas')
  const [filtroStatus, setFiltroStatus] = useState<'Todos' | 'Pendente' | 'Comprado'>('Todos')
  const [busca, setBusca] = useState('')

  const itens = useListaComprasStore((state) => state.itens)
  const addItem = useListaComprasStore((state) => state.addItem)
  const updateItem = useListaComprasStore((state) => state.updateItem)
  const deleteItem = useListaComprasStore((state) => state.deleteItem)
  const toggleStatus = useListaComprasStore((state) => state.toggleStatus)
  const getValorTotal = useListaComprasStore((state) => state.getValorTotal)
  const getItensPendentes = useListaComprasStore((state) => state.getItensPendentes)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novoItem: ItemCompra = {
      id: editingItem?.id || uuidv4(),
      nome: formData.get('nome') as string,
      quantidade: parseInt(formData.get('quantidade') as string),
      valorEstimado: parseFloat(formData.get('valorEstimado') as string),
      categoria: formData.get('categoria') as CategoriaCompra,
      status: editingItem?.status || 'Pendente',
      recorrenciaMensal: formData.get('recorrenciaMensal') === 'on',
    }

    if (editingItem) {
      updateItem(editingItem.id, novoItem)
    } else {
      addItem(novoItem)
    }

    setIsModalOpen(false)
    setEditingItem(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      deleteItem(id)
    }
  }

  const itensFiltrados = useMemo(() => {
    return itens.filter(item => {
      const matchCategoria = filtroCategoria === 'Todas' || item.categoria === filtroCategoria
      const matchStatus = filtroStatus === 'Todos' || item.status === filtroStatus
      const matchBusca = !busca || item.nome.toLowerCase().includes(busca.toLowerCase())
      return matchCategoria && matchStatus && matchBusca
    })
  }, [itens, filtroCategoria, filtroStatus, busca])

  const itensPendentes = getItensPendentes()
  const valorTotal = getValorTotal()
  const valorPendente = itensPendentes.reduce((acc, item) => acc + (item.valorEstimado * item.quantidade), 0)
  const itensComprados = itens.filter(i => i.status === 'Comprado').length
  const valorComprado = itens.filter(i => i.status === 'Comprado').reduce((acc, item) => acc + (item.valorEstimado * item.quantidade), 0)

  // Dados para gráficos
  const dadosCategorias = useMemo(() => {
    const categoriasMap = new Map<string, number>()
    
    itensFiltrados
      .filter(i => i.status === 'Pendente')
      .forEach(item => {
        const atual = categoriasMap.get(item.categoria) || 0
        categoriasMap.set(item.categoria, atual + (item.valorEstimado * item.quantidade))
      })
    
    return Array.from(categoriasMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [itensFiltrados])

  const dadosStatus = useMemo(() => {
    return [
      { name: 'Pendentes', value: itensPendentes.length, color: '#F59E0B' },
      { name: 'Comprados', value: itensComprados, color: '#10B981' },
    ]
  }, [itensPendentes.length, itensComprados])

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Lista de Compras</h1>
            <p className="text-gray-400">Organize suas compras pessoais de forma inteligente</p>
          </div>
          <Button
            onClick={() => {
              setEditingItem(null)
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Novo Item
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Itens Pendentes"
            value={itensPendentes.length}
            icon={ShoppingCart}
            valueColor="text-yellow-400"
            className="bg-gradient-to-br from-yellow-500/10 to-orange-600/5 border-yellow-500/20"
          />
          <StatCard
            title="Valor Pendente"
            value={formatCurrency(valorPendente)}
            icon={DollarSign}
            valueColor="text-yellow-400"
            className="bg-gradient-to-br from-yellow-500/10 to-orange-600/5 border-yellow-500/20"
          />
          <StatCard
            title="Itens Comprados"
            value={itensComprados}
            icon={CheckCircle2}
            valueColor="text-emerald-400"
            className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20"
          />
          <StatCard
            title="Valor Total"
            value={formatCurrency(valorTotal)}
            icon={DollarSign}
            valueColor="text-blue-400"
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20"
          />
        </div>

        {/* Gráficos */}
        {itens.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <PieChartIcon className="w-5 h-5 text-accent-electric" />
                <h3 className="text-lg font-bold text-white">Gastos por Categoria</h3>
              </div>
              {dadosCategorias.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={dadosCategorias}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dadosCategorias.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center">
                  <p className="text-gray-400">Nenhum item pendente</p>
                </div>
              )}
            </div>

            <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-accent-electric" />
                <h3 className="text-lg font-bold text-white">Status dos Itens</h3>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dadosStatus}>
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
                    {dadosStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
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
                placeholder="Buscar item..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
              />
            </div>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value as CategoriaCompra | 'Todas')}
              className="px-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
            >
              <option value="Todas">Todas as Categorias</option>
              <option value="Mercado">Mercado</option>
              <option value="Diversas">Diversas</option>
            </select>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as 'Todos' | 'Pendente' | 'Comprado')}
              className="px-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
            >
              <option value="Todos">Todos os Status</option>
              <option value="Pendente">Pendentes</option>
              <option value="Comprado">Comprados</option>
            </select>
          </div>
        </div>

        {/* Lista de Itens */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-accent-electric" />
            Itens da Lista ({itensFiltrados.length})
          </h2>
          {itensFiltrados.length > 0 ? (
            <div className="space-y-3">
              {itensFiltrados.map((item) => (
                <div
                  key={item.id}
                  className={`p-5 bg-dark-black/50 border border-card-border/50 rounded-xl hover:border-accent-electric/30 transition-all ${
                    item.status === 'Comprado' ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <button
                        onClick={() => toggleStatus(item.id)}
                        className={`mt-1 p-1.5 rounded-lg transition-colors ${
                          item.status === 'Comprado'
                            ? 'text-emerald-400 hover:text-emerald-300'
                            : 'text-gray-400 hover:text-accent-electric'
                        }`}
                      >
                        {item.status === 'Comprado' ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <Circle className="w-6 h-6" />
                        )}
                      </button>
                      <div className="flex-1">
                        <h3 className={`text-white font-semibold text-lg mb-2 ${item.status === 'Comprado' ? 'line-through' : ''}`}>
                          {item.nome}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <span className="text-gray-400">
                            Quantidade: <span className="text-white font-semibold">{item.quantidade}</span>
                          </span>
                          <span className="text-gray-400">
                            Valor Unitário: <span className="text-white font-semibold">
                              {formatCurrency(item.valorEstimado)}
                            </span>
                          </span>
                          <span className="text-gray-400">
                            Total: <span className="text-white font-semibold text-emerald-400">
                              {formatCurrency(item.valorEstimado * item.quantidade)}
                            </span>
                          </span>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                            item.categoria === 'Mercado'
                              ? 'bg-blue-500/15 text-blue-400 border-blue-500/20'
                              : 'bg-purple-500/15 text-purple-400 border-purple-500/20'
                          }`}>
                            {item.categoria}
                          </span>
                          {item.recorrenciaMensal && (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-accent-electric/15 text-accent-electric border border-accent-electric/20">
                              Recorrente
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          setEditingItem(item)
                          setIsModalOpen(true)
                        }}
                        className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
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
              <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhum item encontrado</p>
              <p className="text-gray-500 text-sm mt-1">Ajuste os filtros ou adicione um novo item</p>
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingItem(null)
          }}
          title={editingItem ? 'Editar Item' : 'Novo Item'}
          size="lg"
          variant="default"
          icon={ShoppingCart}
          description={editingItem ? 'Atualize as informações do item da lista' : 'Adicione um novo item à sua lista de compras'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome do Item *
              </label>
              <input
                type="text"
                name="nome"
                required
                defaultValue={editingItem?.nome}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Quantidade *
                </label>
                <input
                  type="number"
                  name="quantidade"
                  required
                  min="1"
                  defaultValue={editingItem?.quantidade || 1}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Valor Estimado (R$) *
                </label>
                <input
                  type="number"
                  name="valorEstimado"
                  required
                  step="0.01"
                  min="0"
                  defaultValue={editingItem?.valorEstimado}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Categoria *
                </label>
                <select
                  name="categoria"
                  required
                  defaultValue={editingItem?.categoria}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="Mercado">Mercado</option>
                  <option value="Diversas">Diversas</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="recorrenciaMensal"
                    defaultChecked={editingItem?.recorrenciaMensal}
                    className="w-4 h-4 rounded border-card-border bg-card-bg text-accent-electric focus:ring-accent-electric"
                  />
                  <span className="text-sm text-gray-300">Recorrência Mensal</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingItem ? 'Salvar Alterações' : 'Adicionar Item'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingItem(null)
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
