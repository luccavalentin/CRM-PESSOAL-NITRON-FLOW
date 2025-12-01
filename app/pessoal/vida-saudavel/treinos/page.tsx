'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { Plus, Dumbbell, Calendar, Trash2, Edit2, Target, Clock } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface Treino {
  id: string
  data: string
  tipo: string
  exercicios: string
  duracao: number
  intensidade: 'Leve' | 'Moderada' | 'Intensa'
  observacoes?: string
}

export default function TreinosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTreino, setEditingTreino] = useState<Treino | null>(null)
  const [treinos, setTreinos] = useState<Treino[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('treinos-pessoal')
    if (saved) {
      setTreinos(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('treinos-pessoal', JSON.stringify(treinos))
  }, [treinos])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novoTreino: Treino = {
      id: editingTreino?.id || uuidv4(),
      data: formData.get('data') as string,
      tipo: formData.get('tipo') as string,
      exercicios: formData.get('exercicios') as string,
      duracao: parseInt(formData.get('duracao') as string),
      intensidade: (formData.get('intensidade') as Treino['intensidade']) || 'Moderada',
      observacoes: formData.get('observacoes') as string || undefined,
    }

    if (editingTreino) {
      setTreinos(treinos.map(t => t.id === editingTreino.id ? novoTreino : t))
    } else {
      setTreinos([...treinos, novoTreino])
    }

    setIsModalOpen(false)
    setEditingTreino(null)
  }

  const hoje = new Date().toISOString().split('T')[0]
  const treinosHoje = treinos.filter(t => t.data === hoje)
  const treinosSemana = treinos.filter(t => {
    const dataTreino = new Date(t.data)
    const hoje = new Date()
    const diffTime = Math.abs(hoje.getTime() - dataTreino.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  }).length
  const totalMinutos = treinos.reduce((acc, t) => acc + t.duracao, 0)

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Treinos</h1>
            <p className="text-gray-400">Registre e acompanhe seus treinos</p>
          </div>
          <Button
            onClick={() => {
              setEditingTreino(null)
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Novo Treino
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Treinos Hoje"
            value={treinosHoje.length}
            icon={Dumbbell}
          />
          <StatCard
            title="Treinos Esta Semana"
            value={treinosSemana}
            icon={Target}
            valueColor="text-blue-400"
          />
          <StatCard
            title="Total de Minutos"
            value={`${totalMinutos} min`}
            icon={Clock}
            valueColor="text-emerald-400"
          />
        </div>

        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-accent-electric" />
            Histórico de Treinos
          </h2>
          {treinos.length > 0 ? (
            <div className="space-y-3">
              {treinos
                .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                .map((treino) => (
                  <div
                    key={treino.id}
                    className="p-5 bg-dark-black/50 border border-card-border/50 rounded-xl hover:border-accent-electric/30 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold text-lg">{treino.tipo}</h3>
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-accent-electric/15 text-accent-electric border border-accent-electric/20">
                            {new Date(treino.data).toLocaleDateString('pt-BR')}
                          </span>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                            treino.intensidade === 'Intensa'
                              ? 'bg-red-500/15 text-red-400 border-red-500/20'
                              : treino.intensidade === 'Moderada'
                              ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'
                              : 'bg-green-500/15 text-green-400 border-green-500/20'
                          }`}>
                            {treino.intensidade}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{treino.exercicios}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{treino.duracao} minutos</span>
                          </div>
                        </div>
                        {treino.observacoes && (
                          <p className="text-sm text-gray-400 mt-2">{treino.observacoes}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => {
                            setEditingTreino(treino)
                            setIsModalOpen(true)
                          }}
                          className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir este treino?')) {
                              setTreinos(treinos.filter(t => t.id !== treino.id))
                            }
                          }}
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
              <Dumbbell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhum treino registrado</p>
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingTreino(null)
          }}
          title={editingTreino ? 'Editar Treino' : 'Novo Treino'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data *
                </label>
                <input
                  type="date"
                  name="data"
                  required
                  defaultValue={editingTreino?.data || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Treino *
                </label>
                <input
                  type="text"
                  name="tipo"
                  required
                  defaultValue={editingTreino?.tipo}
                  placeholder="Ex: Musculação, Cardio, Yoga..."
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Exercícios *
              </label>
              <textarea
                name="exercicios"
                required
                defaultValue={editingTreino?.exercicios}
                rows={4}
                placeholder="Descreva os exercícios realizados..."
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duração (minutos) *
                </label>
                <input
                  type="number"
                  name="duracao"
                  required
                  min="1"
                  defaultValue={editingTreino?.duracao}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Intensidade
                </label>
                <select
                  name="intensidade"
                  defaultValue={editingTreino?.intensidade || 'Moderada'}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="Leve">Leve</option>
                  <option value="Moderada">Moderada</option>
                  <option value="Intensa">Intensa</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Observações
              </label>
              <textarea
                name="observacoes"
                defaultValue={editingTreino?.observacoes}
                rows={2}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingTreino ? 'Salvar Alterações' : 'Adicionar Treino'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingTreino(null)
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

