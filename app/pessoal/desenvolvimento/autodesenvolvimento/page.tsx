'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { Plus, Brain, Target, Trash2, Edit2, Calendar } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface AtividadeDesenvolvimento {
  id: string
  titulo: string
  descricao: string
  categoria: string
  data: string
  status: 'Planejada' | 'Em Andamento' | 'Concluída'
  progresso: number
  observacoes?: string
}

export default function AutodesenvolvimentoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAtividade, setEditingAtividade] = useState<AtividadeDesenvolvimento | null>(null)
  const [atividades, setAtividades] = useState<AtividadeDesenvolvimento[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('autodesenvolvimento-pessoal')
    if (saved) {
      setAtividades(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('autodesenvolvimento-pessoal', JSON.stringify(atividades))
  }, [atividades])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novaAtividade: AtividadeDesenvolvimento = {
      id: editingAtividade?.id || uuidv4(),
      titulo: formData.get('titulo') as string,
      descricao: formData.get('descricao') as string,
      categoria: formData.get('categoria') as string,
      data: formData.get('data') as string,
      status: (formData.get('status') as AtividadeDesenvolvimento['status']) || 'Planejada',
      progresso: parseInt(formData.get('progresso') as string) || 0,
      observacoes: formData.get('observacoes') as string || undefined,
    }

    if (editingAtividade) {
      setAtividades(atividades.map(a => a.id === editingAtividade.id ? novaAtividade : a))
    } else {
      setAtividades([...atividades, novaAtividade])
    }

    setIsModalOpen(false)
    setEditingAtividade(null)
  }

  const atividadesConcluidas = atividades.filter(a => a.status === 'Concluída').length
  const atividadesEmAndamento = atividades.filter(a => a.status === 'Em Andamento').length

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Autodesenvolvimento</h1>
            <p className="text-gray-400">Acompanhe seu crescimento pessoal</p>
          </div>
          <Button
            onClick={() => {
              setEditingAtividade(null)
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Nova Atividade
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total de Atividades"
            value={atividades.length}
            icon={Brain}
          />
          <StatCard
            title="Em Andamento"
            value={atividadesEmAndamento}
            icon={Target}
            valueColor="text-blue-400"
          />
          <StatCard
            title="Concluídas"
            value={atividadesConcluidas}
            icon={Target}
            valueColor="text-emerald-400"
          />
        </div>

        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent-electric" />
            Todas as Atividades
          </h2>
          {atividades.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {atividades.map((atividade) => (
                <div
                  key={atividade.id}
                  className="p-5 bg-dark-black/50 border border-card-border/50 rounded-xl hover:border-accent-electric/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-1">{atividade.titulo}</h3>
                      <p className="text-gray-400 text-sm mb-2">{atividade.descricao}</p>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-accent-electric/15 text-accent-electric border border-accent-electric/20">
                        {atividade.categoria}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingAtividade(atividade)
                          setIsModalOpen(true)
                        }}
                        className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Tem certeza que deseja excluir esta atividade?')) {
                            setAtividades(atividades.filter(a => a.id !== atividade.id))
                          }
                        }}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Progresso</span>
                      <span className="text-accent-electric font-semibold">{atividade.progresso}%</span>
                    </div>
                    <div className="w-full bg-dark-black rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-accent-electric to-accent-cyan h-2 rounded-full transition-all"
                        style={{ width: `${atividade.progresso}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(atividade.data).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhuma atividade cadastrada</p>
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingAtividade(null)
          }}
          title={editingAtividade ? 'Editar Atividade' : 'Nova Atividade'}
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
                defaultValue={editingAtividade?.titulo}
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
                defaultValue={editingAtividade?.descricao}
                rows={3}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Categoria *
                </label>
                <input
                  type="text"
                  name="categoria"
                  required
                  defaultValue={editingAtividade?.categoria}
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
                  required
                  defaultValue={editingAtividade?.data}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={editingAtividade?.status || 'Planejada'}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="Planejada">Planejada</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Concluída">Concluída</option>
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
                  defaultValue={editingAtividade?.progresso || 0}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Observações
              </label>
              <textarea
                name="observacoes"
                defaultValue={editingAtividade?.observacoes}
                rows={2}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingAtividade ? 'Salvar Alterações' : 'Criar Atividade'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingAtividade(null)
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

