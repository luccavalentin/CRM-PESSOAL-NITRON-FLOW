'use client'

import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import TaskBoard from '@/components/ui/TaskBoard'
import { useTarefasStore } from '@/stores/tarefasStore'
import { Tarefa, Prioridade, CategoriaTarefa, StatusTarefa } from '@/types'
import { Plus } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

export default function TarefasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTarefa, setEditingTarefa] = useState<Tarefa | null>(null)
  const [newTaskStatus, setNewTaskStatus] = useState<StatusTarefa>('Pendente')

  const tarefas = useTarefasStore((state) => state.tarefas)
  const addTarefa = useTarefasStore((state) => state.addTarefa)
  const updateTarefa = useTarefasStore((state) => state.updateTarefa)
  const deleteTarefa = useTarefasStore((state) => state.deleteTarefa)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novaTarefa: Tarefa = {
      id: editingTarefa?.id || uuidv4(),
      titulo: formData.get('titulo') as string,
      descricao: formData.get('descricao') as string || undefined,
      prioridade: formData.get('prioridade') as Prioridade,
      categoria: formData.get('categoria') as CategoriaTarefa,
      data: formData.get('data') as string,
      status: editingTarefa?.status || (formData.get('status') as StatusTarefa) || newTaskStatus,
      tarefaRapida: formData.get('tarefaRapida') === 'on',
      recorrente: formData.get('recorrente') === 'on',
      concluida: editingTarefa?.concluida || false,
      etiquetas: [],
    }

    if (editingTarefa) {
      updateTarefa(editingTarefa.id, novaTarefa)
    } else {
      addTarefa(novaTarefa)
    }

    setIsModalOpen(false)
    setEditingTarefa(null)
  }

  const handleAddTask = (status: StatusTarefa) => {
    setNewTaskStatus(status)
    setEditingTarefa(null)
    setIsModalOpen(true)
  }

  const handleEditTask = (tarefa: Tarefa) => {
    setEditingTarefa(tarefa)
    setIsModalOpen(true)
  }

  const handleDeleteTask = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      deleteTarefa(id)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Tarefas</h1>
            <p className="text-gray-400">Gerencie todas as suas tarefas (pessoais e empresariais)</p>
          </div>
          <Button 
            onClick={() => {
              setNewTaskStatus('Pendente')
              setEditingTarefa(null)
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Nova Tarefa
          </Button>
        </div>

        {/* Task Board */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6 overflow-x-auto">
          <TaskBoard
            tarefas={tarefas}
            onAddTask={handleAddTask}
            onUpdateTask={updateTarefa}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
          />
        </div>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingTarefa(null)
          }}
          title={editingTarefa ? 'Editar Tarefa' : 'Nova Tarefa'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Título *
              </label>
              <input
                type="text"
                name="titulo"
                required
                defaultValue={editingTarefa?.titulo}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                name="descricao"
                defaultValue={editingTarefa?.descricao}
                rows={3}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Prioridade *
                </label>
                <select
                  name="prioridade"
                  required
                  defaultValue={editingTarefa?.prioridade}
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
                  Categoria *
                </label>
                <select
                  name="categoria"
                  required
                  defaultValue={editingTarefa?.categoria}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="Pessoal">Pessoal</option>
                  <option value="Empresarial">Empresarial</option>
                  <option value="Projeto">Projeto</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data *
                </label>
                <input
                  type="date"
                  name="data"
                  required
                  defaultValue={editingTarefa?.data || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={editingTarefa?.status || newTaskStatus}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Em Revisão">Em Revisão</option>
                  <option value="Concluída">Concluída</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="tarefaRapida"
                  defaultChecked={editingTarefa?.tarefaRapida}
                  className="w-4 h-4 rounded border-card-border bg-card-bg text-accent-electric focus:ring-accent-electric"
                />
                <span className="text-sm text-gray-300">Tarefa Rápida (2 min)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="recorrente"
                  defaultChecked={editingTarefa?.recorrente}
                  className="w-4 h-4 rounded border-card-border bg-card-bg text-accent-electric focus:ring-accent-electric"
                />
                <span className="text-sm text-gray-300">Recorrente</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingTarefa(null)
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  )
}
