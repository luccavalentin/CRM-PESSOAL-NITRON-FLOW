'use client'

import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { useIdeiasStore } from '@/stores/ideiasStore'
import { Ideia, CategoriaIdeia, StatusIdeia } from '@/types'
import { Plus, Lightbulb, Trash2, Edit2, Sparkles } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

export default function IdeiasPessoaisPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingIdeia, setEditingIdeia] = useState<Ideia | null>(null)

  const ideias = useIdeiasStore((state) => state.ideias)
  const addIdeia = useIdeiasStore((state) => state.addIdeia)
  const updateIdeia = useIdeiasStore((state) => state.updateIdeia)
  const deleteIdeia = useIdeiasStore((state) => state.deleteIdeia)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novaIdeia: Ideia = {
      id: editingIdeia?.id || uuidv4(),
      texto: formData.get('texto') as string,
      categoria: formData.get('categoria') as CategoriaIdeia,
      status: (formData.get('status') as StatusIdeia) || 'Explorando',
      potencialFinanceiro: parseInt(formData.get('potencialFinanceiro') as string) || 5,
      dataCriacao: editingIdeia?.dataCriacao || new Date().toISOString().split('T')[0],
    }

    if (editingIdeia) {
      updateIdeia(editingIdeia.id, novaIdeia)
    } else {
      addIdeia(novaIdeia)
    }

    setIsModalOpen(false)
    setEditingIdeia(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta ideia?')) {
      deleteIdeia(id)
    }
  }

  const getStatusColor = (status: StatusIdeia) => {
    switch (status) {
      case 'Explorando':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/20'
      case 'Em Análise':
        return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'
      case 'Em Teste':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/20'
      case 'Executando':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
      case 'Arquivada':
        return 'bg-gray-500/15 text-gray-400 border-gray-500/20'
      default:
        return 'bg-gray-500/15 text-gray-400 border-gray-500/20'
    }
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Ideias</h1>
            <p className="text-gray-400">Capture e desenvolva suas ideias pessoais</p>
          </div>
          <Button
            onClick={() => {
              setEditingIdeia(null)
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Nova Ideia
          </Button>
        </div>

        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-accent-electric" />
            Todas as Ideias
          </h2>
          {ideias.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ideias.map((ideia) => (
                <div
                  key={ideia.id}
                  className="p-5 bg-dark-black/50 border border-card-border/50 rounded-xl hover:border-accent-electric/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-white font-semibold mb-2">{ideia.texto}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(ideia.status)}`}>
                          {ideia.status}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-accent-electric/15 text-accent-electric border border-accent-electric/20">
                          {ideia.categoria}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Sparkles className="w-3 h-3" />
                        <span>Potencial: {ideia.potencialFinanceiro}/10</span>
                        <span>•</span>
                        <span>{new Date(ideia.dataCriacao).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingIdeia(ideia)
                          setIsModalOpen(true)
                        }}
                        className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ideia.id)}
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
              <Lightbulb className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhuma ideia cadastrada</p>
            </div>
          )}
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
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
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
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
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
                  Potencial Financeiro (1-10)
                </label>
                <input
                  type="number"
                  name="potencialFinanceiro"
                  min="1"
                  max="10"
                  defaultValue={editingIdeia?.potencialFinanceiro || 5}
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
                defaultValue={editingIdeia?.status || 'Explorando'}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              >
                <option value="Explorando">Explorando</option>
                <option value="Em Análise">Em Análise</option>
                <option value="Em Teste">Em Teste</option>
                <option value="Executando">Executando</option>
                <option value="Arquivada">Arquivada</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingIdeia ? 'Salvar Alterações' : 'Criar Ideia'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingIdeia(null)
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

