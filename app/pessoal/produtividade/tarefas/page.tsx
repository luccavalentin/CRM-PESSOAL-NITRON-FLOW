'use client'

import { useState, useMemo } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import TaskBoard from '@/components/ui/TaskBoard'
import StatCard from '@/components/ui/StatCard'
import { useTarefasStore } from '@/stores/tarefasStore'
import { Tarefa, Prioridade, CategoriaTarefa, StatusTarefa } from '@/types'
import { Plus, CheckSquare, Clock, AlertCircle, BarChart3, PieChart as PieChartIcon, Filter, Search } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const COLORS = ['#00D9FF', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

export default function TarefasPessoaisPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTarefa, setEditingTarefa] = useState<Tarefa | null>(null)
  const [newTaskStatus, setNewTaskStatus] = useState<StatusTarefa>('Pendente')
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaTarefa | 'Todas'>('Todas')
  const [filtroPrioridade, setFiltroPrioridade] = useState<Prioridade | 'Todas'>('Todas')
  const [busca, setBusca] = useState('')

  const tarefas = useTarefasStore((state) => state.tarefas)
  const addTarefa = useTarefasStore((state) => state.addTarefa)
  const updateTarefa = useTarefasStore((state) => state.updateTarefa)
  const deleteTarefa = useTarefasStore((state) => state.deleteTarefa)

  // Filtros
  const tarefasFiltradas = useMemo(() => {
    return tarefas.filter(tarefa => {
      const matchCategoria = filtroCategoria === 'Todas' || tarefa.categoria === filtroCategoria
      const matchPrioridade = filtroPrioridade === 'Todas' || tarefa.prioridade === filtroPrioridade
      const matchBusca = !busca || tarefa.titulo.toLowerCase().includes(busca.toLowerCase()) || 
                        (tarefa.descricao && tarefa.descricao.toLowerCase().includes(busca.toLowerCase()))
      return matchCategoria && matchPrioridade && matchBusca
    })
  }, [tarefas, filtroCategoria, filtroPrioridade, busca])

  // Estatísticas
  const tarefasPendentes = tarefas.filter(t => t.status === 'Pendente').length
  const tarefasEmAndamento = tarefas.filter(t => t.status === 'Em Andamento').length
  const tarefasConcluidas = tarefas.filter(t => t.status === 'Concluída').length
  const tarefasRapidas = tarefas.filter(t => t.tarefaRapida).length
  const tarefasRecorrentes = tarefas.filter(t => t.recorrente).length

  // Dados para gráficos
  const dadosStatus = useMemo(() => {
    return [
      { name: 'Pendentes', value: tarefasPendentes, color: '#F59E0B' },
      { name: 'Em Andamento', value: tarefasEmAndamento, color: '#00D9FF' },
      { name: 'Concluídas', value: tarefasConcluidas, color: '#10B981' },
      { name: 'Em Revisão', value: tarefas.filter(t => t.status === 'Em Revisão').length, color: '#7C3AED' },
    ]
  }, [tarefas, tarefasPendentes, tarefasEmAndamento, tarefasConcluidas])

  const dadosPrioridade = useMemo(() => {
    const prioridades = ['Urgente', 'Alta', 'Média', 'Baixa']
    return prioridades.map(prioridade => ({
      name: prioridade,
      value: tarefas.filter(t => t.prioridade === prioridade).length,
    }))
  }, [tarefas])

  const dadosCategoria = useMemo(() => {
    const categorias = Array.from(new Set(tarefas.map(t => t.categoria)))
    return categorias.map(categoria => ({
      name: categoria,
      value: tarefas.filter(t => t.categoria === categoria).length,
    }))
  }, [tarefas])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novaTarefa: Tarefa = {
      id: editingTarefa?.id || uuidv4(),
      titulo: (formData.get('titulo') as string) || 'Sem título',
      descricao: formData.get('descricao') as string || undefined,
      prioridade: (formData.get('prioridade') as Prioridade) || 'Média',
      categoria: (formData.get('categoria') as CategoriaTarefa) || 'Pessoal',
      data: (formData.get('data') as string) || new Date().toISOString().split('T')[0],
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
      <div className="max-w-[1600px] mx-auto space-y-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Tarefas</h1>
            <p className="text-gray-400">Gerencie todas as suas tarefas pessoais e empresariais</p>
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

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          <StatCard
            title="Pendentes"
            value={tarefasPendentes}
            icon={Clock}
            valueColor="text-yellow-400"
            className="bg-gradient-to-br from-yellow-500/10 to-orange-600/5 border-yellow-500/20"
          />
          <StatCard
            title="Em Andamento"
            value={tarefasEmAndamento}
            icon={AlertCircle}
            valueColor="text-blue-400"
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20"
          />
          <StatCard
            title="Concluídas"
            value={tarefasConcluidas}
            icon={CheckSquare}
            valueColor="text-emerald-400"
            className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20"
          />
          <StatCard
            title="Rápidas"
            value={tarefasRapidas}
            icon={Clock}
            valueColor="text-purple-400"
            className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20"
          />
          <StatCard
            title="Total"
            value={tarefas.length}
            icon={CheckSquare}
            className="bg-gradient-to-br from-accent-electric/10 to-accent-cyan/5 border-accent-electric/20"
          />
        </div>

        {/* Gráficos */}
        {tarefas.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <PieChartIcon className="w-5 h-5 text-accent-electric" />
                <h3 className="text-lg font-bold text-white">Distribuição por Status</h3>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={dadosStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-accent-electric" />
                <h3 className="text-lg font-bold text-white">Tarefas por Prioridade</h3>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dadosPrioridade}>
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
                    {dadosPrioridade.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                placeholder="Buscar tarefa..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
              />
            </div>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value as CategoriaTarefa | 'Todas')}
              className="px-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
            >
              <option value="Todas">Todas as Categorias</option>
              <option value="Pessoal">Pessoal</option>
              <option value="Empresarial">Empresarial</option>
              <option value="Projeto">Projeto</option>
              <option value="Outro">Outro</option>
            </select>
            <select
              value={filtroPrioridade}
              onChange={(e) => setFiltroPrioridade(e.target.value as Prioridade | 'Todas')}
              className="px-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
            >
              <option value="Todas">Todas as Prioridades</option>
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Alta">Alta</option>
              <option value="Urgente">Urgente</option>
            </select>
          </div>
        </div>

        {/* Task Board */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6 overflow-x-auto">
          <TaskBoard
            tarefas={tarefasFiltradas}
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
          variant="info"
          icon={CheckSquare}
          description={editingTarefa ? 'Atualize as informações da tarefa' : 'Crie uma nova tarefa para organizar suas atividades'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Título
              </label>
              <input
                type="text"
                name="titulo"
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
                  Prioridade
                </label>
                <select
                  name="prioridade"
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
                  Categoria
                </label>
                <select
                  name="categoria"
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
                  Data
                </label>
                <input
                  type="date"
                  name="data"
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
