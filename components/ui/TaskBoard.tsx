'use client'

import { useState } from 'react'
import { Tarefa, StatusTarefa } from '@/types'
import { Plus, MoreVertical, Calendar, Clock, AlertCircle, CheckCircle2, Edit2, Trash2, Zap, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'

interface TaskBoardProps {
  tarefas: Tarefa[]
  onAddTask: (status: StatusTarefa) => void
  onUpdateTask: (id: string, updates: Partial<Tarefa>) => void
  onDeleteTask: (id: string) => void
  onEditTask: (tarefa: Tarefa) => void
}

const statusColumns: { status: StatusTarefa; label: string; color: string; bgColor: string; icon: any }[] = [
  { status: 'Pendente', label: 'Pendente', color: 'text-gray-400', bgColor: 'bg-gray-500/20 border-gray-500/30', icon: Clock },
  { status: 'Em Andamento', label: 'Em Andamento', color: 'text-blue-400', bgColor: 'bg-blue-500/20 border-blue-500/30', icon: AlertCircle },
  { status: 'Em Revisão', label: 'Em Revisão', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20 border-yellow-500/30', icon: RotateCcw },
  { status: 'Concluída', label: 'Concluída', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20 border-emerald-500/30', icon: CheckCircle2 },
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
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/50',
          text: 'text-red-400',
          icon: '🔥',
          glow: 'shadow-red-500/30'
        }
      case 'Alta':
        return {
          bg: 'bg-orange-500/20',
          border: 'border-orange-500/50',
          text: 'text-orange-400',
          icon: '⚡',
          glow: 'shadow-orange-500/30'
        }
      case 'Média':
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/50',
          text: 'text-yellow-400',
          icon: '📌',
          glow: 'shadow-yellow-500/30'
        }
      default:
        return {
          bg: 'bg-blue-500/20',
          border: 'border-blue-500/50',
          text: 'text-blue-400',
          icon: '📋',
          glow: 'shadow-blue-500/30'
        }
    }
  }

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'Pessoal':
        return { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/30' }
      case 'Empresarial':
        return { bg: 'bg-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-500/30' }
      case 'Projeto':
        return { bg: 'bg-pink-500/15', text: 'text-pink-300', border: 'border-pink-500/30' }
      default:
        return { bg: 'bg-gray-500/15', text: 'text-gray-300', border: 'border-gray-500/30' }
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '600px' }}>
      {statusColumns.map((column) => {
        const columnTasks = tarefas.filter((t) => t.status === column.status)
        const isHovered = hoveredColumn === column.status
        const Icon = column.icon

        return (
          <div
            key={column.status}
            className={`flex-shrink-0 w-80 bg-gradient-to-b from-card-bg/80 to-card-bg/40 backdrop-blur-sm border-2 rounded-xl transition-all ${
              isHovered
                ? `${column.bgColor} border-accent-electric shadow-2xl shadow-accent-electric/30 scale-[1.02]`
                : `${column.bgColor} border-card-border/30`
            }`}
            onDragOver={(e) => handleDragOver(e, column.status)}
            onDrop={(e) => handleDrop(e, column.status)}
            onDragLeave={() => setHoveredColumn(null)}
          >
            {/* Column Header */}
            <div className={`p-4 border-b ${column.bgColor} rounded-t-xl`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${column.bgColor} border ${column.color.replace('text-', 'border-')}/30`}>
                    <Icon className={`w-4 h-4 ${column.color}`} />
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${column.color}`}>{column.label}</h3>
                    <span className="text-xs text-gray-500">{columnTasks.length} tarefa{columnTasks.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <button
                  onClick={() => onAddTask(column.status)}
                  className="p-2 hover:bg-accent-electric/10 rounded-lg transition-all text-gray-400 hover:text-accent-electric hover:scale-110"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Column Tasks */}
            <div className="p-3 space-y-3 min-h-[500px]">
              {columnTasks.map((tarefa) => {
                const prioridadeStyle = getPrioridadeColor(tarefa.prioridade)
                const categoriaStyle = getCategoriaColor(tarefa.categoria)
                const isUrgente = tarefa.prioridade === 'Urgente'
                const isAlta = tarefa.prioridade === 'Alta'

                return (
                  <motion.div
                    key={tarefa.id}
                    draggable
                    onDragStart={() => handleDragStart(tarefa.id)}
                    onDragEnd={handleDragEnd}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className={`group relative bg-gradient-to-br from-dark-black/80 to-dark-black/60 border-2 rounded-xl p-4 transition-all cursor-move ${
                      isUrgente 
                        ? `${prioridadeStyle.border} ${prioridadeStyle.glow} shadow-lg` 
                        : isAlta
                        ? `${prioridadeStyle.border} ${prioridadeStyle.glow} shadow-md`
                        : 'border-card-border/50 hover:border-accent-electric/50'
                    } hover:shadow-xl hover:shadow-accent-electric/20`}
                  >
                    {/* Priority Indicator Bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${prioridadeStyle.bg.replace('/20', '')}`} />

                    {/* Task Menu */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setTaskMenuOpen(taskMenuOpen === tarefa.id ? null : tarefa.id)
                          }
                          className="p-2 hover:bg-card-hover/80 rounded-lg text-gray-400 hover:text-white backdrop-blur-sm transition-all"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {taskMenuOpen === tarefa.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setTaskMenuOpen(null)}
                            />
                            <div className="absolute right-0 mt-1 w-40 bg-card-bg/95 backdrop-blur-xl border border-card-border rounded-lg shadow-2xl z-20">
                              <button
                                onClick={() => {
                                  onEditTask(tarefa)
                                  setTaskMenuOpen(null)
                                }}
                                className="w-full px-3 py-2.5 text-left text-sm text-gray-300 hover:bg-accent-electric/10 hover:text-accent-electric flex items-center gap-2 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                Editar
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                                    onDeleteTask(tarefa.id)
                                  }
                                  setTaskMenuOpen(null)
                                }}
                                className="w-full px-3 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Excluir
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Task Content */}
                    <div className="pr-10">
                      {/* Title with Priority Icon */}
                      <div className="flex items-start gap-2 mb-2">
                        {isUrgente && <span className="text-lg">{prioridadeStyle.icon}</span>}
                        <h4 className={`font-bold text-sm line-clamp-2 flex-1 ${
                          isUrgente ? 'text-red-300' : isAlta ? 'text-orange-300' : 'text-white'
                        }`}>
                          {tarefa.titulo}
                        </h4>
                      </div>

                      {/* Description */}
                      {tarefa.descricao && (
                        <p className="text-gray-400 text-xs mb-3 line-clamp-2 leading-relaxed">
                          {tarefa.descricao}
                        </p>
                      )}

                      {/* Task Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${prioridadeStyle.bg} ${prioridadeStyle.border} ${prioridadeStyle.text} flex items-center gap-1`}
                        >
                          <span>{prioridadeStyle.icon}</span>
                          {tarefa.prioridade}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${categoriaStyle.bg} ${categoriaStyle.border} ${categoriaStyle.text}`}
                        >
                          {tarefa.categoria}
                        </span>
                        {tarefa.tarefaRapida && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-accent-electric/20 border border-accent-electric/40 text-accent-electric flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            2min
                          </span>
                        )}
                        {tarefa.recorrente && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/20 border border-purple-500/40 text-purple-300">
                            🔄 Recorrente
                          </span>
                        )}
                      </div>

                      {/* Task Footer */}
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-card-border/30">
                        {tarefa.data && (
                          <div className="flex items-center gap-1.5 text-gray-400">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="font-medium">
                              {new Date(tarefa.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          {tarefa.status === 'Concluída' && (
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-xs font-semibold border border-emerald-500/30">
                              ✓ Concluída
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}

              {/* Empty State */}
              {columnTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500 text-sm border-2 border-dashed border-card-border/30 rounded-lg m-2">
                  <Plus className="w-6 h-6 mb-2 opacity-50" />
                  <span className="text-xs">Arraste tarefas aqui</span>
                  <span className="text-xs text-gray-600 mt-1">ou clique no + acima</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

