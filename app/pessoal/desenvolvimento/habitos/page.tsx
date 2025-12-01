'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { VicioHabito, TipoVicio, StatusVicio } from '@/types'
import { Plus, Target, CheckCircle2, XCircle, Trash2, Edit2, Calendar } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

export default function HabitosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHabito, setEditingHabito] = useState<VicioHabito | null>(null)
  const [habitos, setHabitos] = useState<VicioHabito[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('habitos-pessoal')
    if (saved) {
      setHabitos(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('habitos-pessoal', JSON.stringify(habitos))
  }, [habitos])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const estrategias = (formData.get('estrategias') as string)
      .split('\n')
      .filter(s => s.trim() !== '')
    
    const novoHabito: VicioHabito = {
      id: editingHabito?.id || uuidv4(),
      nome: formData.get('nome') as string,
      descricao: formData.get('descricao') as string || undefined,
      tipo: formData.get('tipo') as TipoVicio,
      dataInicioControle: formData.get('dataInicioControle') as string,
      status: (formData.get('status') as StatusVicio) || 'Ativo',
      estrategiasSuperacao: estrategias,
    }

    if (editingHabito) {
      setHabitos(habitos.map(h => h.id === editingHabito.id ? novoHabito : h))
    } else {
      setHabitos([...habitos, novoHabito])
    }

    setIsModalOpen(false)
    setEditingHabito(null)
  }

  const habitosAtivos = habitos.filter(h => h.status === 'Ativo').length
  const habitosSuperados = habitos.filter(h => h.status === 'Superado').length

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Hábitos</h1>
            <p className="text-gray-400">Gerencie seus hábitos e vícios</p>
          </div>
          <Button
            onClick={() => {
              setEditingHabito(null)
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Novo Hábito
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            title="Hábitos Ativos"
            value={habitosAtivos}
            icon={Target}
            valueColor="text-yellow-400"
          />
          <StatCard
            title="Hábitos Superados"
            value={habitosSuperados}
            icon={CheckCircle2}
            valueColor="text-emerald-400"
          />
        </div>

        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-accent-electric" />
            Todos os Hábitos
          </h2>
          {habitos.length > 0 ? (
            <div className="space-y-3">
              {habitos.map((habito) => {
                const diasControle = Math.floor(
                  (new Date().getTime() - new Date(habito.dataInicioControle).getTime()) / (1000 * 60 * 60 * 24)
                )
                
                return (
                  <div
                    key={habito.id}
                    className="p-5 bg-dark-black/50 border border-card-border/50 rounded-xl hover:border-accent-electric/30 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold text-lg">{habito.nome}</h3>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                            habito.status === 'Superado'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                              : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'
                          }`}>
                            {habito.status}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-accent-electric/15 text-accent-electric border border-accent-electric/20">
                            {habito.tipo}
                          </span>
                        </div>
                        {habito.descricao && (
                          <p className="text-gray-400 text-sm mb-3">{habito.descricao}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm mb-3">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>{diasControle} dias de controle</span>
                          </div>
                          <span className="text-gray-500">
                            Desde {new Date(habito.dataInicioControle).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        {habito.estrategiasSuperacao.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Estratégias de superação:</p>
                            <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                              {habito.estrategiasSuperacao.map((estrategia, idx) => (
                                <li key={idx}>{estrategia}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => {
                            setEditingHabito(habito)
                            setIsModalOpen(true)
                          }}
                          className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir este hábito?')) {
                              setHabitos(habitos.filter(h => h.id !== habito.id))
                            }
                          }}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhum hábito cadastrado</p>
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingHabito(null)
          }}
          title={editingHabito ? 'Editar Hábito' : 'Novo Hábito'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome *
              </label>
              <input
                type="text"
                name="nome"
                required
                defaultValue={editingHabito?.nome}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                name="descricao"
                defaultValue={editingHabito?.descricao}
                rows={2}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo *
                </label>
                <select
                  name="tipo"
                  required
                  defaultValue={editingHabito?.tipo}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="Vício">Vício</option>
                  <option value="Hábito">Hábito</option>
                  <option value="Mania">Mania</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data Início Controle *
                </label>
                <input
                  type="date"
                  name="dataInicioControle"
                  required
                  defaultValue={editingHabito?.dataInicioControle}
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
                defaultValue={editingHabito?.status || 'Ativo'}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              >
                <option value="Ativo">Ativo</option>
                <option value="Superado">Superado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estratégias de Superação (uma por linha)
              </label>
              <textarea
                name="estrategias"
                rows={4}
                defaultValue={editingHabito?.estrategiasSuperacao.join('\n')}
                placeholder="Ex: Evitar situações de gatilho&#10;Praticar meditação diária&#10;Buscar apoio profissional"
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingHabito ? 'Salvar Alterações' : 'Criar Hábito'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingHabito(null)
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

