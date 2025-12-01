'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { Plus, Rocket, CheckCircle2, XCircle, Clock, Trash2, Edit2, Link2, ListTodo } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useTarefasStore } from '@/stores/tarefasStore'
import { Tarefa, Prioridade, CategoriaTarefa, StatusTarefa } from '@/types'

interface Deploy {
  id: string
  versao: string
  ambiente: string
  descricao: string
  responsavel: string
  data: string
  status: 'Sucesso' | 'Falha' | 'Em Andamento'
  observacoes?: string
}

export default function DeploysPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTarefaModalOpen, setIsTarefaModalOpen] = useState(false)
  const [editingDeploy, setEditingDeploy] = useState<Deploy | null>(null)
  const [deployParaTarefa, setDeployParaTarefa] = useState<Deploy | null>(null)
  const [deploys, setDeploys] = useState<Deploy[]>([])
  
  const addTarefa = useTarefasStore((state) => state.addTarefa)
  const tarefas = useTarefasStore((state) => state.tarefas)

  useEffect(() => {
    const saved = localStorage.getItem('deploys-empresa')
    if (saved) {
      setDeploys(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('deploys-empresa', JSON.stringify(deploys))
  }, [deploys])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novoDeploy: Deploy = {
      id: editingDeploy?.id || uuidv4(),
      versao: formData.get('versao') as string,
      ambiente: formData.get('ambiente') as string,
      descricao: formData.get('descricao') as string,
      responsavel: formData.get('responsavel') as string,
      data: formData.get('data') as string,
      status: (formData.get('status') as Deploy['status']) || 'Em Andamento',
      observacoes: formData.get('observacoes') as string || undefined,
    }

    if (editingDeploy) {
      setDeploys(deploys.map(d => d.id === editingDeploy.id ? novoDeploy : d))
    } else {
      setDeploys([...deploys, novoDeploy])
    }

    setIsModalOpen(false)
    setEditingDeploy(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este deploy?')) {
      setDeploys(deploys.filter(d => d.id !== id))
    }
  }

  const handleVincularTarefa = (deploy: Deploy) => {
    setDeployParaTarefa(deploy)
    setIsTarefaModalOpen(true)
  }

  const handleSubmitTarefa = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!deployParaTarefa) return

    const formData = new FormData(e.currentTarget)
    const novaTarefa: Tarefa = {
      id: uuidv4(),
      titulo: (formData.get('titulo') as string) || `Tarefa - Deploy v${deployParaTarefa.versao}`,
      descricao: formData.get('descricao') as string || undefined,
      prioridade: (formData.get('prioridade') as Prioridade) || 'Média',
      categoria: 'Empresarial' as CategoriaTarefa,
      data: (formData.get('data') as string) || new Date().toISOString().split('T')[0],
      status: 'Pendente' as StatusTarefa,
      tarefaRapida: formData.get('tarefaRapida') === 'on',
      recorrente: false,
      concluida: false,
      etiquetas: [`Deploy: v${deployParaTarefa.versao}`],
      projetoId: undefined,
    }

    addTarefa(novaTarefa)
    setIsTarefaModalOpen(false)
    setDeployParaTarefa(null)
  }

  const deploysSucesso = deploys.filter(d => d.status === 'Sucesso').length
  const deploysFalha = deploys.filter(d => d.status === 'Falha').length
  const taxaSucesso = deploys.length > 0 ? Math.round((deploysSucesso / deploys.length) * 100) : 0

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Deploys</h1>
            <p className="text-gray-400">Controle de deploys e versões</p>
          </div>
          <Button
            onClick={() => {
              setEditingDeploy(null)
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Novo Deploy
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Deploys"
            value={deploys.length}
            icon={Rocket}
          />
          <StatCard
            title="Sucessos"
            value={deploysSucesso}
            icon={CheckCircle2}
            valueColor="text-emerald-400"
          />
          <StatCard
            title="Taxa de Sucesso"
            value={`${taxaSucesso}%`}
            icon={Rocket}
            valueColor="text-accent-electric"
          />
        </div>

        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-accent-electric" />
            Histórico de Deploys
          </h2>
          {deploys.length > 0 ? (
            <div className="space-y-3">
              {deploys
                .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                .map((deploy) => (
                  <div
                    key={deploy.id}
                    className="p-5 bg-dark-black/50 border border-card-border/50 rounded-xl hover:border-accent-electric/30 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold text-lg">v{deploy.versao}</h3>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                            deploy.status === 'Sucesso' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' :
                            deploy.status === 'Falha' ? 'bg-red-500/15 text-red-400 border-red-500/20' :
                            'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'
                          }`}>
                            {deploy.status}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-accent-electric/15 text-accent-electric border border-accent-electric/20">
                            {deploy.ambiente}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{deploy.descricao}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Responsável: {deploy.responsavel}</span>
                          <span>•</span>
                          <span>{new Date(deploy.data).toLocaleDateString('pt-BR')}</span>
                        </div>
                        {deploy.observacoes && (
                          <p className="text-sm text-gray-400 mt-2">{deploy.observacoes}</p>
                        )}
                      </div>
                      {tarefas.filter(t => 
                        t.etiquetas?.some(e => e.includes(`v${deploy.versao}`))
                      ).length > 0 && (
                        <div className="mb-3 p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                          <div className="flex items-center gap-2 text-xs text-purple-400">
                            <ListTodo className="w-3 h-3" />
                            <span>
                              {tarefas.filter(t => 
                                t.etiquetas?.some(e => e.includes(`v${deploy.versao}`))
                              ).length} tarefa(s) vinculada(s)
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleVincularTarefa(deploy)}
                          className="p-2 text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                          title="Vincular Tarefa"
                        >
                          <Link2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingDeploy(deploy)
                            setIsModalOpen(true)
                          }}
                          className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(deploy.id)}
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
              <Rocket className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhum deploy registrado</p>
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingDeploy(null)
          }}
          title={editingDeploy ? 'Editar Deploy' : 'Novo Deploy'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Versão *
                </label>
                <input
                  type="text"
                  name="versao"
                  defaultValue={editingDeploy?.versao}
                  placeholder="Ex: 1.0.0"
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ambiente *
                </label>
                <select
                  name="ambiente"
                  defaultValue={editingDeploy?.ambiente}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="">Selecione</option>
                  <option value="Produção">Produção</option>
                  <option value="Homologação">Homologação</option>
                  <option value="Desenvolvimento">Desenvolvimento</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição *
              </label>
              <textarea
                name="descricao"
                defaultValue={editingDeploy?.descricao}
                rows={3}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Responsável *
                </label>
                <input
                  type="text"
                  name="responsavel"
                  defaultValue={editingDeploy?.responsavel}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data *
                </label>
                <input
                  type="date"
                  name="data"
                  defaultValue={editingDeploy?.data}
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
                defaultValue={editingDeploy?.status || 'Em Andamento'}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              >
                <option value="Em Andamento">Em Andamento</option>
                <option value="Sucesso">Sucesso</option>
                <option value="Falha">Falha</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Observações
              </label>
              <textarea
                name="observacoes"
                defaultValue={editingDeploy?.observacoes}
                rows={2}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingDeploy ? 'Salvar Alterações' : 'Criar Deploy'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingDeploy(null)
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


