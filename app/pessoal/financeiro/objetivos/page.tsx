'use client'

import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { useFinancasPessoaisStore } from '@/stores/financasPessoaisStore'
import { MetaFinanceira } from '@/types'
import { formatCurrency } from '@/utils/formatCurrency'
import { Plus, Target, TrendingUp, Calendar, Trash2, Edit2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

export default function ObjetivosFinanceirosPessoaisPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMeta, setEditingMeta] = useState<MetaFinanceira | null>(null)

  const metas = useFinancasPessoaisStore((state) => state.metas)
  const addMeta = useFinancasPessoaisStore((state) => state.addMeta)
  const updateMeta = useFinancasPessoaisStore((state) => state.updateMeta)
  const deleteMeta = useFinancasPessoaisStore((state) => state.deleteMeta)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novaMeta: MetaFinanceira = {
      id: editingMeta?.id || uuidv4(),
      descricao: formData.get('descricao') as string,
      valorMeta: parseFloat(formData.get('valorMeta') as string),
      valorAtual: editingMeta?.valorAtual || parseFloat(formData.get('valorAtual') as string) || 0,
      dataLimite: formData.get('dataLimite') as string || undefined,
    }

    if (editingMeta) {
      updateMeta(editingMeta.id, novaMeta)
    } else {
      addMeta(novaMeta)
    }

    setIsModalOpen(false)
    setEditingMeta(null)
  }

  const handleEdit = (meta: MetaFinanceira) => {
    setEditingMeta(meta)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
      deleteMeta(id)
    }
  }

  const metasAtivas = metas.filter(m => {
    if (m.dataLimite) {
      return new Date(m.dataLimite) >= new Date()
    }
    return true
  })

  const metasCompletas = metas.filter(m => m.valorAtual >= m.valorMeta)
  const totalMetas = metas.reduce((acc, m) => acc + m.valorMeta, 0)
  const totalAtual = metas.reduce((acc, m) => acc + m.valorAtual, 0)
  const percentualGeral = totalMetas > 0 ? (totalAtual / totalMetas) * 100 : 0

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Objetivos Financeiros</h1>
            <p className="text-gray-400">Gerencie suas metas financeiras pessoais</p>
          </div>
          <Button
            onClick={() => {
              setEditingMeta(null)
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Novo Objetivo
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Metas Ativas"
            value={metasAtivas.length}
            icon={Target}
          />
          <StatCard
            title="Metas Completas"
            value={metasCompletas.length}
            icon={TrendingUp}
            valueColor="text-emerald-400"
          />
          <StatCard
            title="Total em Metas"
            value={formatCurrency(totalMetas)}
            icon={Target}
          />
          <StatCard
            title="Progresso Geral"
            value={`${Math.round(percentualGeral)}%`}
            icon={TrendingUp}
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
              {metas.map((meta) => {
                const percentual = meta.valorMeta > 0
                  ? Math.min((meta.valorAtual / meta.valorMeta) * 100, 100)
                  : 0
                const isCompleta = meta.valorAtual >= meta.valorMeta
                const isVencida = meta.dataLimite ? new Date(meta.dataLimite) < new Date() : false
                
                return (
                  <div
                    key={meta.id}
                    className={`p-5 bg-dark-black/50 border rounded-xl transition-all hover:border-accent-electric/30 ${
                      isCompleta ? 'border-emerald-500/30 bg-emerald-500/5' :
                      isVencida ? 'border-red-500/30 bg-red-500/5' :
                      'border-card-border/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg mb-1">{meta.descricao}</h3>
                        <div className="flex items-center gap-4 text-sm mb-3">
                          <span className="text-gray-400">
                            {formatCurrency(meta.valorAtual)} / {formatCurrency(meta.valorMeta)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(meta)}
                          className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(meta.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className={`font-semibold ${
                          isCompleta ? 'text-emerald-400' :
                          isVencida ? 'text-red-400' :
                          'text-accent-electric'
                        }`}>
                          {Math.round(percentual)}% concluído
                        </span>
                        {isCompleta && (
                          <span className="text-emerald-400 font-bold">✓ Completa</span>
                        )}
                        {isVencida && !isCompleta && (
                          <span className="text-red-400 font-bold">Vencida</span>
                        )}
                      </div>
                      <div className="w-full bg-dark-black rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            isCompleta ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                            isVencida ? 'bg-gradient-to-r from-red-500 to-red-400' :
                            'bg-gradient-to-r from-accent-electric to-accent-cyan'
                          }`}
                          style={{ width: `${percentual}%` }}
                        />
                      </div>
                    </div>
                    {meta.dataLimite && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>Prazo: {new Date(meta.dataLimite).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhuma meta cadastrada</p>
              <p className="text-gray-500 text-sm mt-1">Comece criando seu primeiro objetivo financeiro</p>
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingMeta(null)
          }}
          title={editingMeta ? 'Editar Objetivo' : 'Novo Objetivo'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição *
              </label>
              <input
                type="text"
                name="descricao"
                required
                defaultValue={editingMeta?.descricao}
                placeholder="Ex: Meta de economia mensal"
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Valor Meta (R$) *
                </label>
                <input
                  type="number"
                  name="valorMeta"
                  required
                  step="0.01"
                  min="0"
                  defaultValue={editingMeta?.valorMeta}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Valor Atual (R$)
                </label>
                <input
                  type="number"
                  name="valorAtual"
                  step="0.01"
                  min="0"
                  defaultValue={editingMeta?.valorAtual || 0}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data Limite
              </label>
              <input
                type="date"
                name="dataLimite"
                defaultValue={editingMeta?.dataLimite}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingMeta ? 'Salvar Alterações' : 'Criar Objetivo'}
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

