'use client'

import { useState, useMemo } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import TaskBoard from '@/components/ui/TaskBoard'
import { useTarefasStore } from '@/stores/tarefasStore'
import { Tarefa, Prioridade, CategoriaTarefa, StatusTarefa } from '@/types'
import { Plus, Filter, Search, Calendar, TrendingUp, CheckCircle2, Clock, AlertCircle, BarChart3, Zap } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

export default function TarefasPage() {
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
    return tarefas.filter(t => {
      const matchBusca = busca === '' || 
        t.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        t.descricao?.toLowerCase().includes(busca.toLowerCase())
      const matchCategoria = filtroCategoria === 'Todas' || t.categoria === filtroCategoria
      const matchPrioridade = filtroPrioridade === 'Todas' || t.prioridade === filtroPrioridade
      return matchBusca && matchCategoria && matchPrioridade
    })
  }, [tarefas, busca, filtroCategoria, filtroPrioridade])

  // Estatísticas
  const tarefasPendentes = tarefas.filter(t => t.status === 'Pendente' && !t.concluida).length
  const tarefasEmAndamento = tarefas.filter(t => t.status === 'Em Andamento').length
  const tarefasConcluidas = tarefas.filter(t => t.concluida || t.status === 'Concluída').length
  const tarefasRapidas = tarefas.filter(t => t.tarefaRapida).length
  const taxaConclusao = tarefas.length > 0 ? Math.round((tarefasConcluidas / tarefas.length) * 100) : 0

  // Dados para gráficos
  const dadosStatus = useMemo(() => {
    const statusCount = tarefas.reduce((acc, t) => {
      const status = t.concluida ? 'Concluída' : t.status
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return Object.entries(statusCount).map(([name, value]) => ({ name, value }))
  }, [tarefas])

  const dadosPrioridade = useMemo(() => {
    const prioridadeCount = tarefas.reduce((acc, t) => {
      acc[t.prioridade] = (acc[t.prioridade] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return Object.entries(prioridadeCount).map(([name, value]) => ({ name, value }))
  }, [tarefas])

  const coresStatus = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444']
  const coresPrioridade = ['#ef4444', '#f59e0b', '#eab308', '#3b82f6']

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novaTarefa: Tarefa = {
      id: editingTarefa?.id || uuidv4(),
      titulo: (formData.get('titulo') as string) || 'Sem título',
      descricao: formData.get('descricao') as string || undefined,
      prioridade: (formData.get('prioridade') as Prioridade) || 'Média',
      categoria: (formData.get('categoria') as CategoriaTarefa) || 'Empresarial',
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
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Gestão de Tarefas</h1>
            <p className="text-gray-400 text-sm">Controle completo e profissional de todas as suas tarefas</p>
          </div>
          <Button 
            onClick={() => {
              setNewTaskStatus('Pendente')
              setEditingTarefa(null)
              setIsModalOpen(true)
            }}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Nova Tarefa
          </Button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          <StatCard
            title="Pendentes"
            value={tarefasPendentes}
            icon={Clock}
            valueColor="text-yellow-400"
          />
          <StatCard
            title="Em Andamento"
            value={tarefasEmAndamento}
            icon={TrendingUp}
            valueColor="text-blue-400"
          />
          <StatCard
            title="Concluídas"
            value={tarefasConcluidas}
            icon={CheckCircle2}
            valueColor="text-emerald-400"
          />
          <StatCard
            title="Rápidas"
            value={tarefasRapidas}
            icon={Zap}
            valueColor="text-purple-400"
          />
          <StatCard
            title="Taxa Conclusão"
            value={`${taxaConclusao}%`}
            icon={BarChart3}
            valueColor="text-accent-electric"
          />
        </div>

        {/* Filtros */}
        <div className="bg-card-bg border border-card-border rounded-xl p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar tarefas..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-black border border-card-border rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-accent-electric focus:ring-1 focus:ring-accent-electric/30"
              />
            </div>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value as CategoriaTarefa | 'Todas')}
              className="px-4 py-2 bg-dark-black border border-card-border rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric focus:ring-1 focus:ring-accent-electric/30"
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
              className="px-4 py-2 bg-dark-black border border-card-border rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric focus:ring-1 focus:ring-accent-electric/30"
            >
              <option value="Todas">Todas as Prioridades</option>
              <option value="Urgente">Urgente</option>
              <option value="Alta">Alta</option>
              <option value="Média">Média</option>
              <option value="Baixa">Baixa</option>
            </select>
          </div>
        </div>

        {/* Gráficos */}
        {tarefas.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-card-bg border border-card-border rounded-xl p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-accent-electric" />
                Distribuição por Status
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Legend />
                  <Pie
                    data={dadosStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={coresStatus[index % coresStatus.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card-bg border border-card-border rounded-xl p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-accent-electric" />
                Distribuição por Prioridade
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dadosPrioridade}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="value" fill="#00d4ff" name="Quantidade" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Task Board */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-4 sm:p-6 overflow-x-auto">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent-electric" />
              Quadro de Tarefas ({tarefasFiltradas.length})
            </h2>
          </div>
          <TaskBoard
            tarefas={tarefasFiltradas}
            onAddTask={handleAddTask}
            onUpdateTask={updateTarefa}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
          />
        </div>
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
                defaultValue={editingTarefa?.prioridade || 'Média'}
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
                defaultValue={editingTarefa?.categoria || 'Empresarial'}
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
    </MainLayout>
  )
}
