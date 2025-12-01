'use client'

import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { useIdeiasStore } from '@/stores/ideiasStore'
import { Ideia, CategoriaIdeia, StatusIdeia } from '@/types'
import { Plus, Edit, Trash2, Lightbulb, TrendingUp, Link2, ListTodo, Sparkles } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useTarefasStore } from '@/stores/tarefasStore'
import { Tarefa, Prioridade, CategoriaTarefa, StatusTarefa } from '@/types'

export default function IdeiasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTarefaModalOpen, setIsTarefaModalOpen] = useState(false)
  const [editingIdeia, setEditingIdeia] = useState<Ideia | null>(null)
  const [ideiaParaTarefa, setIdeiaParaTarefa] = useState<Ideia | null>(null)
  const [filtroStatus, setFiltroStatus] = useState<StatusIdeia | 'Todos'>('Todos')

  const ideias = useIdeiasStore((state) => state.ideias)
  const addIdeia = useIdeiasStore((state) => state.addIdeia)
  const updateIdeia = useIdeiasStore((state) => state.updateIdeia)
  const deleteIdeia = useIdeiasStore((state) => state.deleteIdeia)
  
  const addTarefa = useTarefasStore((state) => state.addTarefa)
  const tarefas = useTarefasStore((state) => state.tarefas)

  const ideiasFiltradas = filtroStatus === 'Todos'
    ? ideias
    : ideias.filter((i) => i.status === filtroStatus)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novaIdeia: Ideia = {
      id: editingIdeia?.id || uuidv4(),
      texto: (formData.get('texto') as string) || 'Sem descrição',
      categoria: (formData.get('categoria') as CategoriaIdeia) || 'Negócio',
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

  const handleVincularTarefa = (ideia: Ideia) => {
    setIdeiaParaTarefa(ideia)
    setIsTarefaModalOpen(true)
  }

  const handleSubmitTarefa = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!ideiaParaTarefa) return

    const formData = new FormData(e.currentTarget)
    const novaTarefa: Tarefa = {
      id: uuidv4(),
      titulo: (formData.get('titulo') as string) || `Tarefa - ${ideiaParaTarefa.texto.substring(0, 30)}`,
      descricao: formData.get('descricao') as string || undefined,
      prioridade: (formData.get('prioridade') as Prioridade) || 'Média',
      categoria: 'Empresarial' as CategoriaTarefa,
      data: (formData.get('data') as string) || new Date().toISOString().split('T')[0],
      status: 'Pendente' as StatusTarefa,
      tarefaRapida: formData.get('tarefaRapida') === 'on',
      recorrente: false,
      concluida: false,
      etiquetas: [`Ideia: ${ideiaParaTarefa.texto.substring(0, 30)}`],
      projetoId: undefined,
    }

    addTarefa(novaTarefa)
    setIsTarefaModalOpen(false)
    setIdeiaParaTarefa(null)
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
                        onClick={() => handleVincularTarefa(ideia)}
                        className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded transition-colors"
                        title="Vincular Tarefa"
                      >
                        <Link2 className="w-4 h-4" />
                      </button>
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

                  {tarefas.filter(t => 
                    t.etiquetas?.some(e => e.includes(ideia.texto.substring(0, 30)))
                  ).length > 0 && (
                    <div className="mb-3 p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <div className="flex items-center gap-2 text-xs text-purple-400">
                        <ListTodo className="w-3 h-3" />
                        <span>
                          {tarefas.filter(t => 
                            t.etiquetas?.some(e => e.includes(ideia.texto.substring(0, 30)))
                          ).length} tarefa(s) vinculada(s)
                        </span>
                      </div>
                    </div>
                  )}

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
                  
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleVincularTarefa(ideia)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 rounded-lg transition-colors"
                    >
                      <Link2 className="w-3 h-3" />
                      Vincular Tarefa
                    </button>
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
        description={editingIdeia ? 'Atualize os detalhes da ideia' : 'Registre uma nova ideia para desenvolvimento'}
        size="lg"
        variant="default"
        icon={editingIdeia ? Edit : Lightbulb}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ideia
            </label>
            <textarea
              name="texto"
              rows={4}
              defaultValue={editingIdeia?.texto}
              placeholder="Descreva sua ideia..."
              className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Categoria
              </label>
              <select
                name="categoria"
                defaultValue={editingIdeia?.categoria || 'Negócio'}
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
                Status
              </label>
              <select
                name="status"
                defaultValue={editingIdeia?.status || 'Explorando'}
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
              Potencial Financeiro (1-10)
            </label>
            <input
              type="number"
              name="potencialFinanceiro"
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

      {/* Modal de Vincular Tarefa */}
      <Modal
        isOpen={isTarefaModalOpen}
        onClose={() => {
          setIsTarefaModalOpen(false)
          setIdeiaParaTarefa(null)
        }}
        title="Vincular Tarefa"
        description={`Criar tarefa relacionada à ideia: ${ideiaParaTarefa?.texto.substring(0, 30) || ''}...`}
        size="md"
        variant="default"
        icon={Link2}
      >
        <form onSubmit={handleSubmitTarefa} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título da Tarefa
            </label>
            <input
              type="text"
              name="titulo"
              defaultValue={`Tarefa - ${ideiaParaTarefa?.texto.substring(0, 30) || ''}...`}
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descrição
            </label>
            <textarea
              name="descricao"
              rows={3}
              placeholder="Descreva a tarefa relacionada a esta ideia..."
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prioridade
              </label>
              <select
                name="prioridade"
                defaultValue="Média"
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data
              </label>
              <input
                type="date"
                name="data"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="tarefaRapida"
                className="w-4 h-4 rounded border-card-border bg-card-bg text-accent-electric focus:ring-accent-electric"
              />
              <span className="text-sm text-gray-300">Tarefa Rápida (2 min)</span>
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              <Link2 className="w-4 h-4 mr-2" />
              Vincular Tarefa
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsTarefaModalOpen(false)
                setIdeiaParaTarefa(null)
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  )
}

