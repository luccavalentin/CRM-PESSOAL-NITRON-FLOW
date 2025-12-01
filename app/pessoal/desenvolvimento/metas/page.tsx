'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { Plus, Target, Calendar, Trash2, Edit2, TrendingUp } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface MetaAnual {
  id: string
  titulo: string
  descricao: string
  categoria: string
  dataInicio: string
  dataFim: string
  progresso: number
  status: 'Planejamento' | 'Em Andamento' | 'Concluída' | 'Cancelada'
}

export default function MetasAnuaisPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMeta, setEditingMeta] = useState<MetaAnual | null>(null)
  const [metas, setMetas] = useState<MetaAnual[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('metas-anuais-pessoal')
    if (saved) {
      setMetas(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('metas-anuais-pessoal', JSON.stringify(metas))
  }, [metas])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novaMeta: MetaAnual = {
      id: editingMeta?.id || uuidv4(),
      titulo: formData.get('titulo') as string,
      descricao: formData.get('descricao') as string,
      categoria: formData.get('categoria') as string,
      dataInicio: formData.get('dataInicio') as string,
      dataFim: formData.get('dataFim') as string,
      progresso: parseInt(formData.get('progresso') as string) || 0,
      status: (formData.get('status') as MetaAnual['status']) || 'Planejamento',
    }

    if (editingMeta) {
      setMetas(metas.map(m => m.id === editingMeta.id ? novaMeta : m))
    } else {
      setMetas([...metas, novaMeta])
    }

    setIsModalOpen(false)
    setEditingMeta(null)
  }

  const metasAtivas = metas.filter(m => m.status === 'Em Andamento').length
  const metasConcluidas = metas.filter(m => m.status === 'Concluída').length
  const progressoMedio = metas.length > 0
    ? Math.round(metas.reduce((acc, m) => acc + m.progresso, 0) / metas.length)
    : 0

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Metas Anuais</h1>
            <p className="text-gray-400">Defina e acompanhe suas metas para o ano</p>
          </div>
          <Button
            onClick={() => {
              setEditingMeta(null)
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Nova Meta
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Metas Ativas"
            value={metasAtivas}
            icon={Target}
            valueColor="text-blue-400"
          />
          <StatCard
            title="Metas Concluídas"
            value={metasConcluidas}
            icon={TrendingUp}
            valueColor="text-emerald-400"
          />
          <StatCard
            title="Progresso Médio"
            value={`${progressoMedio}%`}
            icon={Target}
            valueColor="text-accent-electric"
          />
        </div>

        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-accent-electric" />
            Todas as Metas
          </h2>
          {metas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metas.map((meta) => (
                <div
                  key={meta.id}
                  className="p-5 bg-dark-black/50 border border-card-border/50 rounded-xl hover:border-accent-electric/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-1">{meta.titulo}</h3>
                      <p className="text-gray-400 text-sm mb-2">{meta.descricao}</p>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-accent-electric/15 text-accent-electric border border-accent-electric/20">
                        {meta.categoria}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingMeta(meta)
                          setIsModalOpen(true)
                        }}
                        className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Tem certeza que deseja excluir esta meta?')) {
                            setMetas(metas.filter(m => m.id !== meta.id))
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
                      <span className="text-accent-electric font-semibold">{meta.progresso}%</span>
                    </div>
                    <div className="w-full bg-dark-black rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-accent-electric to-accent-cyan h-2 rounded-full transition-all"
                        style={{ width: `${meta.progresso}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(meta.dataInicio).toLocaleDateString('pt-BR')} - {new Date(meta.dataFim).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhuma meta cadastrada</p>
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingMeta(null)
          }}
          title={editingMeta ? 'Editar Meta' : 'Nova Meta'}
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
                defaultValue={editingMeta?.titulo}
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
                defaultValue={editingMeta?.descricao}
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
                  defaultValue={editingMeta?.categoria}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
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
                  defaultValue={editingMeta?.progresso || 0}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data Início *
                </label>
                <input
                  type="date"
                  name="dataInicio"
                  required
                  defaultValue={editingMeta?.dataInicio}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data Fim *
                </label>
                <input
                  type="date"
                  name="dataFim"
                  required
                  defaultValue={editingMeta?.dataFim}
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
                defaultValue={editingMeta?.status || 'Planejamento'}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              >
                <option value="Planejamento">Planejamento</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Concluída">Concluída</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingMeta ? 'Salvar Alterações' : 'Criar Meta'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingMeta(null)
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

