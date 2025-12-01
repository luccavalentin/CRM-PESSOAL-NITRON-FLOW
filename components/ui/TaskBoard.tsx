'use client'

import { useState } from 'react'
import { Tarefa, StatusTarefa } from '@/types'
import { Plus, MoreVertical, Calendar, User, Tag, Edit2, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface TaskBoardProps {
  tarefas: Tarefa[]
  onAddTask: (status: StatusTarefa) => void
  onUpdateTask: (id: string, updates: Partial<Tarefa>) => void
  onDeleteTask: (id: string) => void
  onEditTask: (tarefa: Tarefa) => void
}

const statusColumns: { status: StatusTarefa; label: string; color: string }[] = [
  { status: 'Pendente', label: 'Pendente', color: 'bg-gray-500' },
  { status: 'Em Andamento', label: 'Em Andamento', color: 'bg-blue-500' },
  { status: 'Em Revisão', label: 'Em Revisão', color: 'bg-yellow-500' },
  { status: 'Concluída', label: 'Concluída', color: 'bg-emerald-500' },
]

export default function TaskBoard({
  tarefas,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onEditTask,
}: TaskBoardProps) {
  const [draggedTask, setDraggedTask] = useState<string | null>(null)
  const [hoveredColumn, setHoveredColumn] = useState<StatusTarefa | null>(null)
  const [taskMenuOpen, setTaskMenuOpen] = useState<string | null>(null)

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId)
  }

  const handleDragOver = (e: React.DragEvent, status: StatusTarefa) => {
    e.preventDefault()
    setHoveredColumn(status)
  }

  const handleDrop = (e: React.DragEvent, newStatus: StatusTarefa) => {
    e.preventDefault()
    if (draggedTask) {
      onUpdateTask(draggedTask, { status: newStatus })
      setDraggedTask(null)
      setHoveredColumn(null)
    }
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
    setHoveredColumn(null)
  }

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'Urgente':
        return 'bg-red-500'
      case 'Alta':
        return 'bg-orange-500'
      case 'Média':
        return 'bg-yellow-500'
      default:
        return 'bg-blue-500'
    }
  }

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'Pessoal':
        return 'bg-purple-500'
      case 'Empresarial':
        return 'bg-cyan-500'
      case 'Projeto':
        return 'bg-pink-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '600px' }}>
      {statusColumns.map((column) => {
        const columnTasks = tarefas.filter((t) => t.status === column.status)
        const isHovered = hoveredColumn === column.status

        return (
          <div
            key={column.status}
            className={`flex-shrink-0 w-80 bg-card-bg/50 border-2 rounded-xl transition-all ${
              isHovered
                ? 'border-accent-electric shadow-lg shadow-accent-electric/20'
                : 'border-card-border/50'
            }`}
            onDragOver={(e) => handleDragOver(e, column.status)}
            onDrop={(e) => handleDrop(e, column.status)}
            onDragLeave={() => setHoveredColumn(null)}
          >
            {/* Column Header */}
            <div className="p-4 border-b border-card-border/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${column.color}`} />
                  <h3 className="text-white font-bold text-sm">{column.label}</h3>
                  <span className="px-2 py-0.5 bg-dark-black/50 rounded-full text-xs text-gray-400">
                    {columnTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => onAddTask(column.status)}
                  className="p-1.5 hover:bg-card-hover rounded-lg transition-colors text-gray-400 hover:text-accent-electric"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Column Tasks */}
            <div className="p-3 space-y-3 min-h-[500px]">
              {columnTasks.map((tarefa) => (
                <motion.div
                  key={tarefa.id}
                  draggable
                  onDragStart={() => handleDragStart(tarefa.id)}
                  onDragEnd={handleDragEnd}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative bg-dark-black/60 border border-card-border/50 rounded-lg p-4 hover:border-accent-electric/50 hover:shadow-lg transition-all cursor-move"
                >
                  {/* Task Menu */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setTaskMenuOpen(taskMenuOpen === tarefa.id ? null : tarefa.id)
                        }
                        className="p-1.5 hover:bg-card-hover rounded-lg text-gray-400 hover:text-white"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {taskMenuOpen === tarefa.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setTaskMenuOpen(null)}
                          />
                          <div className="absolute right-0 mt-1 w-40 bg-card-bg border border-card-border rounded-lg shadow-xl z-20">
                            <button
                              onClick={() => {
                                onEditTask(tarefa)
                                setTaskMenuOpen(null)
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-card-hover flex items-center gap-2"
                            >
                              <Edit2 className="w-3 h-3" />
                              Editar
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                                  onDeleteTask(tarefa.id)
                                }
                                setTaskMenuOpen(null)
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-card-hover flex items-center gap-2"
                            >
                              <Trash2 className="w-3 h-3" />
                              Excluir
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Task Content */}
                  <div className="pr-8">
                    <h4 className="text-white font-semibold text-sm mb-2 line-clamp-2">
                      {tarefa.titulo}
                    </h4>
                    {tarefa.descricao && (
                      <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                        {tarefa.descricao}
                      </p>
                    )}

                    {/* Task Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold text-white ${getPrioridadeColor(
                          tarefa.prioridade
                        )}`}
                      >
                        {tarefa.prioridade}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold text-white ${getCategoriaColor(
                          tarefa.categoria
                        )}`}
                      >
                        {tarefa.categoria}
                      </span>
                    </div>

                    {/* Task Footer */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      {tarefa.data && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(tarefa.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                        </div>
                      )}
                      {tarefa.tarefaRapida && (
                        <span className="px-2 py-0.5 bg-accent-electric/20 text-accent-electric rounded text-xs font-semibold">
                          2min
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Empty State */}
              {columnTasks.length === 0 && (
                <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
                  Arraste tarefas aqui
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

