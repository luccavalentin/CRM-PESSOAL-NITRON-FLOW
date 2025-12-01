'use client'

import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { useIdeiasStore } from '@/stores/ideiasStore'
import { Ideia, CategoriaIdeia, StatusIdeia } from '@/types'
import { Plus, Edit, Trash2, Lightbulb, TrendingUp } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

export default function IdeiasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingIdeia, setEditingIdeia] = useState<Ideia | null>(null)
  const [filtroStatus, setFiltroStatus] = useState<StatusIdeia | 'Todos'>('Todos')

  const ideias = useIdeiasStore((state) => state.ideias)
  const addIdeia = useIdeiasStore((state) => state.addIdeia)
  const updateIdeia = useIdeiasStore((state) => state.updateIdeia)
  const deleteIdeia = useIdeiasStore((state) => state.deleteIdeia)

  const ideiasFiltradas = filtroStatus === 'Todos'
    ? ideias
    : ideias.filter((i) => i.status === filtroStatus)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novaIdeia: Ideia = {
      id: editingIdeia?.id || uuidv4(),
      texto: formData.get('texto') as string,
      categoria: formData.get('categoria') as CategoriaIdeia,
      status: (formData.get('status') as StatusIdeia) || 'Explorando',
      potencialFinanceiro: parseInt(formData.get('potencialFinanceiro') as string) || 5,
      dataCriacao: editingIdeia?.dataCriacao || new Date().toISOString(),
    }

    if (editingIdeia) {
      updateIdeia(editingIdeia.id, novaIdeia)
    } else {
      addIdeia(novaIdeia)
    }

    setIsModalOpen(false)
    setEditingIdeia(null)
  }

  const getPotencialColor = (potencial: number) => {
    if (potencial >= 8) return 'bg-green-500/20 text-green-400'
    if (potencial >= 5) return 'bg-yellow-500/20 text-yellow-400'
    return 'bg-red-500/20 text-red-400'
  }

  const getStatusColor = (status: StatusIdeia) => {
    switch (status) {
      case 'Executando':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'Em Teste':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'Em Análise':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'Arquivada':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
      default:
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50'
    }
  }

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Ideias</h1>
            <p className="text-gray-400 text-sm">Registre e gerencie suas ideias</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="text-sm sm:text-base">Nova Ideia</span>
          </Button>
        </div>

        <div className="flex gap-4">
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as StatusIdeia | 'Todos')}
            className="px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
          >
            <option value="Todos">Todos os Status</option>
            <option value="Explorando">Explorando</option>
            <option value="Em Análise">Em Análise</option>
            <option value="Em Teste">Em Teste</option>
            <option value="Executando">Executando</option>
            <option value="Arquivada">Arquivada</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {ideiasFiltradas.length > 0 ? (
            ideiasFiltradas
              .sort((a, b) => b.potencialFinanceiro - a.potencialFinanceiro)
              .map((ideia) => (
                <div
                  key={ideia.id}
                  className="bg-card-bg border-2 border-card-border rounded-xl p-6 hover:border-accent-electric/50 hover:shadow-lg hover:shadow-accent-electric/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-5 h-5 text-accent-electric" />
                        <span className="text-sm text-gray-400">{ideia.categoria}</span>
                      </div>
                      <p className="text-white text-lg mb-3">{ideia.texto}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingIdeia(ideia)
                          setIsModalOpen(true)
                        }}
                        className="p-2 text-gray-400 hover:text-white hover:bg-dark-lighter rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Tem certeza que deseja excluir esta ideia?')) {
                            deleteIdeia(ideia.id)
                          }
                        }}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-dark-lighter">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded border text-xs ${getStatusColor(
                          ideia.status
                        )}`}
                      >
                        {ideia.status}
                      </span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${getPotencialColor(
                            ideia.potencialFinanceiro
                          )}`}
                        >
                          Potencial: {ideia.potencialFinanceiro}/10
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(ideia.dataCriacao).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400">Nenhuma ideia encontrada</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingIdeia(null)
        }}
        title={editingIdeia ? 'Editar Ideia' : 'Nova Ideia'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ideia *
            </label>
            <textarea
              name="texto"
              required
              rows={4}
              defaultValue={editingIdeia?.texto}
              placeholder="Descreva sua ideia..."
              className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Categoria *
              </label>
              <select
                name="categoria"
                required
                defaultValue={editingIdeia?.categoria}
                className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              >
                <option value="Negócio">Negócio</option>
                <option value="Automação">Automação</option>
                <option value="Projeto">Projeto</option>
                <option value="Conteúdo">Conteúdo</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status *
              </label>
              <select
                name="status"
                required
                defaultValue={editingIdeia?.status}
                className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              >
                <option value="Explorando">Explorando</option>
                <option value="Em Análise">Em Análise</option>
                <option value="Em Teste">Em Teste</option>
                <option value="Executando">Executando</option>
                <option value="Arquivada">Arquivada</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Potencial Financeiro (1-10) *
            </label>
            <input
              type="number"
              name="potencialFinanceiro"
              required
              min="1"
              max="10"
              defaultValue={editingIdeia?.potencialFinanceiro || 5}
              className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsModalOpen(false)
                setEditingIdeia(null)
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

