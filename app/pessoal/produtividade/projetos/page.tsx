'use client'

import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { useProjetosPessoaisStore } from '@/stores/projetosPessoaisStore'
import { ProjetoPessoal, StatusProjetoPessoal } from '@/types'
import { Plus, FolderKanban, TrendingUp, Trash2, Edit2, Calendar } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

export default function ProjetosPessoaisPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProjeto, setEditingProjeto] = useState<ProjetoPessoal | null>(null)
  const [filtroStatus, setFiltroStatus] = useState<StatusProjetoPessoal | 'Todos'>('Todos')

  const projetos = useProjetosPessoaisStore((state) => state.projetos)
  const addProjeto = useProjetosPessoaisStore((state) => state.addProjeto)
  const updateProjeto = useProjetosPessoaisStore((state) => state.updateProjeto)
  const deleteProjeto = useProjetosPessoaisStore((state) => state.deleteProjeto)

  const projetosFiltrados = filtroStatus === 'Todos'
    ? projetos
    : projetos.filter((p) => p.status === filtroStatus)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novoProjeto: ProjetoPessoal = {
      id: editingProjeto?.id || uuidv4(),
      nome: formData.get('nome') as string,
      descricao: formData.get('descricao') as string,
      status: (formData.get('status') as StatusProjetoPessoal) || 'Planejamento',
      dataInicio: formData.get('dataInicio') as string || new Date().toISOString().split('T')[0],
      prazo: formData.get('prazo') as string || undefined,
      progresso: editingProjeto?.progresso || parseInt(formData.get('progresso') as string) || 0,
      tarefasVinculadas: editingProjeto?.tarefasVinculadas || [],
    }

    if (editingProjeto) {
      updateProjeto(editingProjeto.id, novoProjeto)
    } else {
      addProjeto(novoProjeto)
    }

    setIsModalOpen(false)
    setEditingProjeto(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      deleteProjeto(id)
    }
  }

  const projetosEmAndamento = projetos.filter(p => p.status === 'Em Andamento').length
  const projetosConcluidos = projetos.filter(p => p.status === 'Concluído').length
  const progressoMedio = projetos.length > 0
    ? Math.round(projetos.reduce((acc, p) => acc + p.progresso, 0) / projetos.length)
    : 0

  const getStatusColor = (status: StatusProjetoPessoal) => {
    switch (status) {
      case 'Em Andamento':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/20'
      case 'Concluído':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
      case 'Pausado':
        return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'
      case 'Cancelado':
        return 'bg-red-500/15 text-red-400 border-red-500/20'
      default:
        return 'bg-gray-500/15 text-gray-400 border-gray-500/20'
    }
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Projetos Pessoais</h1>
            <p className="text-gray-400">Gerencie seus projetos pessoais</p>
          </div>
          <Button
            onClick={() => {
              setEditingProjeto(null)
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Novo Projeto
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Projetos em Andamento"
            value={projetosEmAndamento}
            icon={FolderKanban}
            valueColor="text-blue-400"
          />
          <StatCard
            title="Projetos Concluídos"
            value={projetosConcluidos}
            icon={TrendingUp}
            valueColor="text-emerald-400"
          />
          <StatCard
            title="Progresso Médio"
            value={`${progressoMedio}%`}
            icon={FolderKanban}
            valueColor="text-accent-electric"
          />
        </div>

        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-4">
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as StatusProjetoPessoal | 'Todos')}
            className="px-4 py-2 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
          >
            <option value="Todos">Todos os Status</option>
            <option value="Planejamento">Planejamento</option>
            <option value="Em Andamento">Em Andamento</option>
            <option value="Pausado">Pausado</option>
            <option value="Concluído">Concluído</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>

        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-accent-electric" />
            Todos os Projetos
          </h2>
          {projetosFiltrados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projetosFiltrados.map((projeto) => (
                <div
                  key={projeto.id}
                  className="p-5 bg-dark-black/50 border border-card-border/50 rounded-xl hover:border-accent-electric/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-1">{projeto.nome}</h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{projeto.descricao}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingProjeto(projeto)
                          setIsModalOpen(true)
                        }}
                        className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(projeto.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className={`px-2.5 py-1 rounded-lg font-semibold border ${getStatusColor(projeto.status)}`}>
                        {projeto.status}
                      </span>
                      <span className="text-gray-400">{projeto.progresso}%</span>
                    </div>
                    <div className="w-full bg-dark-black rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-accent-electric to-accent-cyan h-2 rounded-full transition-all"
                        style={{ width: `${projeto.progresso}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Início: {new Date(projeto.dataInicio).toLocaleDateString('pt-BR')}</span>
                    {projeto.prazo && (
                      <>
                        <span>•</span>
                        <span>Prazo: {new Date(projeto.prazo).toLocaleDateString('pt-BR')}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <FolderKanban className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhum projeto encontrado</p>
              <p className="text-gray-500 text-sm mt-1">Comece criando seu primeiro projeto</p>
            </div>
          )}
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
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
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
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={editingProjeto?.status || 'Planejamento'}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="Planejamento">Planejamento</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Pausado">Pausado</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Progresso (%)
                </label>
                <input
                  type="number"
                  name="progresso"
                  min="0"
                  max="100"
                  defaultValue={editingProjeto?.progresso || 0}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
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
                  defaultValue={editingProjeto?.dataInicio}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
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
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingProjeto ? 'Salvar Alterações' : 'Criar Projeto'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingProjeto(null)
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

