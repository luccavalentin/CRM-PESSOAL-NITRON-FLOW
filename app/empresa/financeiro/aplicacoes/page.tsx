'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { formatCurrency } from '@/utils/formatCurrency'
import { Plus, TrendingUp, DollarSign, PieChart, Trash2, Edit2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface Aplicacao {
  id: string
  nome: string
  tipo: string
  valorInvestido: number
  valorAtual: number
  rentabilidade: number
  dataAplicacao: string
  observacoes?: string
}

export default function AplicacoesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAplicacao, setEditingAplicacao] = useState<Aplicacao | null>(null)
  const [aplicacoes, setAplicacoes] = useState<Aplicacao[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('aplicacoes-empresa')
    if (saved) {
      setAplicacoes(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('aplicacoes-empresa', JSON.stringify(aplicacoes))
  }, [aplicacoes])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const valorInvestido = parseFloat(formData.get('valorInvestido') as string)
    const valorAtual = parseFloat(formData.get('valorAtual') as string)
    const rentabilidade = valorInvestido > 0 
      ? ((valorAtual - valorInvestido) / valorInvestido) * 100 
      : 0

    const novaAplicacao: Aplicacao = {
      id: editingAplicacao?.id || uuidv4(),
      nome: formData.get('nome') as string,
      tipo: formData.get('tipo') as string,
      valorInvestido,
      valorAtual,
      rentabilidade,
      dataAplicacao: formData.get('dataAplicacao') as string,
      observacoes: formData.get('observacoes') as string || undefined,
    }

    if (editingAplicacao) {
      setAplicacoes(aplicacoes.map(a => a.id === editingAplicacao.id ? novaAplicacao : a))
    } else {
      setAplicacoes([...aplicacoes, novaAplicacao])
    }

    setIsModalOpen(false)
    setEditingAplicacao(null)
  }

  const handleEdit = (aplicacao: Aplicacao) => {
    setEditingAplicacao(aplicacao)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta aplicação?')) {
      setAplicacoes(aplicacoes.filter(a => a.id !== id))
    }
  }

  const totalInvestido = aplicacoes.reduce((acc, a) => acc + a.valorInvestido, 0)
  const totalAtual = aplicacoes.reduce((acc, a) => acc + a.valorAtual, 0)
  const lucroPrejuizo = totalAtual - totalInvestido
  const rentabilidadeGeral = totalInvestido > 0 ? ((totalAtual - totalInvestido) / totalInvestido) * 100 : 0

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Investimentos</h1>
            <p className="text-gray-400">Gerencie os investimentos da empresa</p>
          </div>
          <Button
            onClick={() => {
              setEditingAplicacao(null)
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Novo Investimento
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Investido"
            value={formatCurrency(totalInvestido)}
            icon={DollarSign}
          />
          <StatCard
            title="Valor Atual"
            value={formatCurrency(totalAtual)}
            icon={TrendingUp}
            valueColor="text-emerald-400"
          />
          <StatCard
            title="Lucro/Prejuízo"
            value={formatCurrency(lucroPrejuizo)}
            icon={PieChart}
            valueColor={lucroPrejuizo >= 0 ? 'text-emerald-400' : 'text-red-400'}
          />
          <StatCard
            title="Rentabilidade"
            value={`${rentabilidadeGeral.toFixed(2)}%`}
            icon={TrendingUp}
            valueColor={rentabilidadeGeral >= 0 ? 'text-emerald-400' : 'text-red-400'}
          />
        </div>

        {/* Lista de Aplicações */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-accent-electric" />
            Todas as Aplicações
          </h2>
          {aplicacoes.length > 0 ? (
            <div className="space-y-3">
              {aplicacoes.map((aplicacao) => (
                <div
                  key={aplicacao.id}
                  className="p-5 bg-dark-black/50 border border-card-border/50 rounded-xl hover:border-accent-electric/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold text-lg">{aplicacao.nome}</h3>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-accent-electric/15 text-accent-electric border border-accent-electric/20">
                          {aplicacao.tipo}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400 mb-1">Investido</p>
                          <p className="text-white font-semibold">
                            {formatCurrency(aplicacao.valorInvestido)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">Valor Atual</p>
                          <p className="text-white font-semibold">
                            {formatCurrency(aplicacao.valorAtual)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">Rentabilidade</p>
                          <p className={`font-semibold ${aplicacao.rentabilidade >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {aplicacao.rentabilidade >= 0 ? '+' : ''}{aplicacao.rentabilidade.toFixed(2)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">Data</p>
                          <p className="text-white font-semibold">
                            {new Date(aplicacao.dataAplicacao).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      {aplicacao.observacoes && (
                        <p className="text-sm text-gray-400 mt-3">{aplicacao.observacoes}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(aplicacao)}
                        className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(aplicacao.id)}
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
              <PieChart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhum investimento cadastrado</p>
              <p className="text-gray-500 text-sm mt-1">Comece registrando seus investimentos</p>
            </div>
          )}
        </div>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingAplicacao(null)
          }}
          title={editingAplicacao ? 'Editar Investimento' : 'Novo Investimento'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome do Investimento *
              </label>
              <input
                type="text"
                name="nome"
                required
                defaultValue={editingAplicacao?.nome}
                placeholder="Ex: Ações PETR4, CDB Banco X..."
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
                  defaultValue={editingAplicacao?.tipo}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="">Selecione</option>
                  <option value="Ações">Ações</option>
                  <option value="CDB">CDB</option>
                  <option value="LCI/LCA">LCI/LCA</option>
                  <option value="Tesouro Direto">Tesouro Direto</option>
                  <option value="Fundos">Fundos</option>
                  <option value="Criptomoedas">Criptomoedas</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data da Aplicação *
                </label>
                <input
                  type="date"
                  name="dataAplicacao"
                  required
                  defaultValue={editingAplicacao?.dataAplicacao}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Valor Investido (R$) *
                </label>
                <input
                  type="number"
                  name="valorInvestido"
                  required
                  step="0.01"
                  min="0"
                  defaultValue={editingAplicacao?.valorInvestido}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Valor Atual (R$) *
                </label>
                <input
                  type="number"
                  name="valorAtual"
                  required
                  step="0.01"
                  min="0"
                  defaultValue={editingAplicacao?.valorAtual}
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
                defaultValue={editingAplicacao?.observacoes}
                rows={3}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingAplicacao ? 'Salvar Alterações' : 'Criar Investimento'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingAplicacao(null)
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

