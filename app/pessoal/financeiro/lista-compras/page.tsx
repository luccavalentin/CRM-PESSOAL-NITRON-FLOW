'use client'

import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { useListaComprasStore } from '@/stores/listaComprasStore'
import { ItemCompra, CategoriaCompra } from '@/types'
import { formatCurrency } from '@/utils/formatCurrency'
import { Plus, ShoppingCart, CheckCircle2, Circle, Trash2, Edit2, DollarSign } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

export default function ListaComprasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ItemCompra | null>(null)
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaCompra | 'Todas'>('Todas')

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

  const itensFiltrados = itens.filter(item => {
    return filtroCategoria === 'Todas' || item.categoria === filtroCategoria
  })

  const itensPendentes = getItensPendentes()
  const valorTotal = getValorTotal()
  const itensComprados = itens.filter(i => i.status === 'Comprado').length

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Lista de Compras</h1>
            <p className="text-gray-400">Organize suas compras pessoais</p>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Itens Pendentes"
            value={itensPendentes.length}
            icon={ShoppingCart}
          />
          <StatCard
            title="Valor Total"
            value={formatCurrency(valorTotal)}
            icon={DollarSign}
            valueColor="text-emerald-400"
          />
          <StatCard
            title="Itens Comprados"
            value={itensComprados}
            icon={CheckCircle2}
            valueColor="text-blue-400"
          />
        </div>

        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-4">
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value as CategoriaCompra | 'Todas')}
            className="px-4 py-2 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
          >
            <option value="Todas">Todas as Categorias</option>
            <option value="Mercado">Mercado</option>
            <option value="Diversas">Diversas</option>
          </select>
        </div>

        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-accent-electric" />
            Itens da Lista
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
                        className={`mt-1 p-1 rounded-lg transition-colors ${
                          item.status === 'Comprado'
                            ? 'text-emerald-400'
                            : 'text-gray-400 hover:text-accent-electric'
                        }`}
                      >
                        {item.status === 'Comprado' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                      <div className="flex-1">
                        <h3 className={`text-white font-semibold text-lg mb-1 ${item.status === 'Comprado' ? 'line-through' : ''}`}>
                          {item.nome}
                        </h3>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-400">
                            Quantidade: <span className="text-white font-semibold">{item.quantidade}</span>
                          </span>
                          <span className="text-gray-400">
                            Valor: <span className="text-white font-semibold">
                              {formatCurrency(item.valorEstimado * item.quantidade)}
                            </span>
                          </span>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            item.categoria === 'Mercado'
                              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                              : 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
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
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
              <p className="text-gray-400 text-lg font-medium">Nenhum item na lista</p>
              <p className="text-gray-500 text-sm mt-1">Comece adicionando itens à sua lista</p>
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

