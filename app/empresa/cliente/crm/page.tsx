'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { useClientesStore, Cliente } from '@/stores/clientesStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { formatCurrency } from '@/utils/formatCurrency'
import { Plus, Users, TrendingUp, DollarSign, Phone, Mail, MapPin, Trash2, Edit2, Search } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

export default function CRMPage() {
  const { clientes, addCliente, updateCliente, deleteCliente } = useClientesStore()
  const mostrarValores = usePreferencesStore((state) => state.mostrarValores)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novoCliente: Cliente = {
      id: editingCliente?.id || uuidv4(),
      nome: formData.get('nome') as string,
      email: formData.get('email') as string || undefined,
      telefone: formData.get('telefone') as string || undefined,
      empresa: formData.get('empresa') as string || undefined,
      endereco: formData.get('endereco') as string || undefined,
      cidade: formData.get('cidade') as string || undefined,
      estado: formData.get('estado') as string || undefined,
      status: (formData.get('status') as Cliente['status']) || 'Prospecto',
      valorTotal: parseFloat(formData.get('valorTotal') as string) || 0,
      ultimaInteracao: formData.get('ultimaInteracao') as string || undefined,
      observacoes: formData.get('observacoes') as string || undefined,
      leadId: editingCliente?.leadId,
      dataCadastro: editingCliente?.dataCadastro || new Date().toISOString().split('T')[0],
    }

    if (editingCliente) {
      updateCliente(editingCliente.id, novoCliente)
    } else {
      addCliente(novoCliente)
    }

    setIsModalOpen(false)
    setEditingCliente(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      deleteCliente(id)
    }
  }

  const clientesFiltrados = clientes.filter(cliente => {
    const matchSearch = searchTerm === '' || 
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.empresa?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = filtroStatus === '' || cliente.status === filtroStatus
    return matchSearch && matchStatus
  })

  const clientesAtivos = clientes.filter(c => c.status === 'Ativo').length
  const totalFaturamento = clientes.reduce((acc, c) => acc + c.valorTotal, 0)
  const leadsConvertidos = clientes.filter(c => c.leadId).length

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">CRM</h1>
            <p className="text-gray-400">Gerencie seus clientes e relacionamentos</p>
          </div>
          <Button
            onClick={() => {
              setEditingCliente(null)
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Novo Cliente
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Clientes Ativos"
            value={clientesAtivos}
            icon={Users}
            valueColor="text-emerald-400"
          />
          <StatCard
            title="Total Faturamento"
            value={formatCurrency(totalFaturamento)}
            icon={DollarSign}
          />
          <StatCard
            title="Leads Convertidos"
            value={leadsConvertidos}
            icon={TrendingUp}
            valueColor="text-accent-electric"
          />
        </div>

        {/* Filtros */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-black/50 border border-card-border/50 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
              />
            </div>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-4 py-2 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
            >
              <option value="">Todos os Status</option>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
              <option value="Prospecto">Prospecto</option>
            </select>
          </div>
        </div>

        {/* Lista de Clientes */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-accent-electric" />
            Todos os Clientes
          </h2>
          {clientesFiltrados.length > 0 ? (
            <div className="space-y-3">
              {clientesFiltrados.map((cliente) => (
                <div
                  key={cliente.id}
                  className="p-5 bg-dark-black/50 border border-card-border/50 rounded-xl hover:border-accent-electric/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold text-lg">{cliente.nome}</h3>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                          cliente.status === 'Ativo' 
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' 
                            : cliente.status === 'Inativo'
                            ? 'bg-gray-500/15 text-gray-400 border-gray-500/20'
                            : 'bg-blue-500/15 text-blue-400 border-blue-500/20'
                        }`}>
                          {cliente.status}
                        </span>
                      </div>
                      {cliente.empresa && (
                        <p className="text-gray-400 text-sm mb-2">Empresa: {cliente.empresa}</p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {cliente.email && (
                          <div className="flex items-center gap-2 text-gray-400">
                            <Mail className="w-4 h-4" />
                            <span>{cliente.email}</span>
                          </div>
                        )}
                        {cliente.telefone && (
                          <div className="flex items-center gap-2 text-gray-400">
                            <Phone className="w-4 h-4" />
                            <span>{cliente.telefone}</span>
                          </div>
                        )}
                        {(cliente.cidade || cliente.estado) && (
                          <div className="flex items-center gap-2 text-gray-400">
                            <MapPin className="w-4 h-4" />
                            <span>{cliente.cidade}{cliente.estado ? ` - ${cliente.estado}` : ''}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <span className="text-gray-400">
                          Faturamento Total: <span className="text-white font-semibold">
                            {formatCurrency(cliente.valorTotal)}
                          </span>
                        </span>
                        {cliente.ultimaInteracao && (
                          <span className="text-gray-500">
                            Última interação: {new Date(cliente.ultimaInteracao).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                      {cliente.observacoes && (
                        <p className="text-sm text-gray-400 mt-2">{cliente.observacoes}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          setEditingCliente(cliente)
                          setIsModalOpen(true)
                        }}
                        className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cliente.id)}
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
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhum cliente encontrado</p>
              <p className="text-gray-500 text-sm mt-1">Comece adicionando seu primeiro cliente</p>
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingCliente(null)
          }}
          title={editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome *
              </label>
              <input
                type="text"
                name="nome"
                required
                defaultValue={editingCliente?.nome}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editingCliente?.email}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  name="telefone"
                  defaultValue={editingCliente?.telefone}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Empresa
                </label>
                <input
                  type="text"
                  name="empresa"
                  defaultValue={editingCliente?.empresa}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={editingCliente?.status || 'Prospecto'}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="Prospecto">Prospecto</option>
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cidade
                </label>
                <input
                  type="text"
                  name="cidade"
                  defaultValue={editingCliente?.cidade}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estado
                </label>
                <input
                  type="text"
                  name="estado"
                  defaultValue={editingCliente?.estado}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Endereço
              </label>
              <input
                type="text"
                name="endereco"
                defaultValue={editingCliente?.endereco}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Valor Total (R$)
                </label>
                <input
                  type="number"
                  name="valorTotal"
                  step="0.01"
                  min="0"
                  defaultValue={editingCliente?.valorTotal || 0}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Última Interação
                </label>
                <input
                  type="date"
                  name="ultimaInteracao"
                  defaultValue={editingCliente?.ultimaInteracao}
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
                defaultValue={editingCliente?.observacoes}
                rows={3}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingCliente ? 'Salvar Alterações' : 'Criar Cliente'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingCliente(null)
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

