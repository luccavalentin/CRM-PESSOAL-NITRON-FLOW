'use client'

import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { useProjetosStore } from '@/stores/projetosStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { formatCurrency } from '@/utils/formatCurrency'
import { Projeto, StatusProjeto } from '@/types'
import { Plus, Edit, Trash2, TrendingUp } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

export default function ProjetosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProjeto, setEditingProjeto] = useState<Projeto | null>(null)
  const [filtroStatus, setFiltroStatus] = useState<StatusProjeto | 'Todos'>('Todos')

  const projetos = useProjetosStore((state) => state.projetos)
  const addProjeto = useProjetosStore((state) => state.addProjeto)
  const updateProjeto = useProjetosStore((state) => state.updateProjeto)
  const deleteProjeto = useProjetosStore((state) => state.deleteProjeto)

  const projetosFiltrados = filtroStatus === 'Todos'
    ? projetos
    : projetos.filter((p) => p.status === filtroStatus)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novoProjeto: Projeto = {
      id: editingProjeto?.id || uuidv4(),
      nome: formData.get('nome') as string,
      descricao: formData.get('descricao') as string,
      status: (formData.get('status') as StatusProjeto) || 'Pendente',
      cliente: formData.get('cliente') as string || undefined,
      valor: formData.get('valor') ? parseFloat(formData.get('valor') as string) : undefined,
      etapasConcluidas: editingProjeto?.etapasConcluidas || 0,
      totalEtapas: parseInt(formData.get('totalEtapas') as string) || 1,
      dataInicio: formData.get('dataInicio') as string || new Date().toISOString().split('T')[0],
      prazo: formData.get('prazo') as string || undefined,
      quantidadeAnexos: editingProjeto?.quantidadeAnexos || 0,
    }

    if (editingProjeto) {
      updateProjeto(editingProjeto.id, novoProjeto)
    } else {
      addProjeto(novoProjeto)
    }

    setIsModalOpen(false)
    setEditingProjeto(null)
  }

  const handleEdit = (projeto: Projeto) => {
    setEditingProjeto(projeto)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      deleteProjeto(id)
    }
  }

  const getProgresso = (projeto: Projeto) => {
    if (projeto.totalEtapas === 0) return 0
    return Math.round((projeto.etapasConcluidas / projeto.totalEtapas) * 100)
  }

  const getStatusColor = (status: StatusProjeto) => {
    switch (status) {
      case 'Andamento':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'Revisão':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'Entregue':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'Arquivado':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
      default:
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50'
    }
  }

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Projetos Empresariais</h1>
            <p className="text-gray-400 text-sm">Gerencie seus projetos e acompanhamentos</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="text-sm sm:text-base">Novo Projeto</span>
          </Button>
        </div>

        <div className="flex gap-4">
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as StatusProjeto | 'Todos')}
            className="px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
          >
            <option value="Todos">Todos os Status</option>
            <option value="Pendente">Pendente</option>
            <option value="Andamento">Em Andamento</option>
            <option value="Revisão">Em Revisão</option>
            <option value="Entregue">Entregue</option>
            <option value="Arquivado">Arquivado</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {projetosFiltrados.length > 0 ? (
            projetosFiltrados.map((projeto) => {
              const progresso = getProgresso(projeto)
              return (
                <div
                  key={projeto.id}
                  className="bg-card-bg border-2 border-card-border rounded-xl p-6 hover:border-accent-electric/50 hover:shadow-lg hover:shadow-accent-electric/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {projeto.nome}
                      </h3>
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                        {projeto.descricao}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(projeto)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-dark-lighter rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(projeto.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Progresso</span>
                        <span className="text-sm font-medium text-white">{progresso}%</span>
                      </div>
                      <div className="w-full bg-dark-gray rounded-full h-2">
                        <div
                          className="bg-accent-electric h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progresso}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {projeto.etapasConcluidas} de {projeto.totalEtapas} etapas
                      </p>
                    </div>

                    {projeto.cliente && (
                      <div className="text-sm">
                        <span className="text-gray-400">Cliente: </span>
                        <span className="text-white">{projeto.cliente}</span>
                      </div>
                    )}

                    {projeto.valor && (
                      <div className="text-sm">
                        <span className="text-gray-400">Valor: </span>
                        <span className="text-accent-electric font-semibold">
                          {formatCurrency(projeto.valor)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-dark-lighter">
                      <span
                        className={`px-3 py-1 rounded border text-xs ${getStatusColor(
                          projeto.status
                        )}`}
                      >
                        {projeto.status}
                      </span>
                      {projeto.prazo && (
                        <span className="text-xs text-gray-400">
                          Prazo: {new Date(projeto.prazo).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400">Nenhum projeto encontrado</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingProjeto(null)
        }}
        title={editingProjeto ? 'Editar Projeto' : 'Novo Projeto'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nome do Projeto *
            </label>
            <input
              type="text"
              name="nome"
              required
              defaultValue={editingProjeto?.nome}
              className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descrição *
            </label>
            <textarea
              name="descricao"
              required
              defaultValue={editingProjeto?.descricao}
              rows={4}
              className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status *
              </label>
              <select
                name="status"
                required
                defaultValue={editingProjeto?.status}
                className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              >
                <option value="Pendente">Pendente</option>
                <option value="Andamento">Em Andamento</option>
                <option value="Revisão">Em Revisão</option>
                <option value="Entregue">Entregue</option>
                <option value="Arquivado">Arquivado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Total de Etapas *
              </label>
              <input
                type="number"
                name="totalEtapas"
                required
                min="1"
                defaultValue={editingProjeto?.totalEtapas || 1}
                className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cliente
              </label>
              <input
                type="text"
                name="cliente"
                defaultValue={editingProjeto?.cliente}
                className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Valor (R$)
              </label>
              <input
                type="number"
                name="valor"
                step="0.01"
                defaultValue={editingProjeto?.valor}
                className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data de Início
              </label>
              <input
                type="date"
                name="dataInicio"
                defaultValue={editingProjeto?.dataInicio || new Date().toISOString().split('T')[0]}
                className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prazo
              </label>
              <input
                type="date"
                name="prazo"
                defaultValue={editingProjeto?.prazo}
                className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsModalOpen(false)
                setEditingProjeto(null)
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  )
}

