'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { useTradingStore } from '@/stores/tradingStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { formatCurrency } from '@/utils/formatCurrency'
import { OperacaoTrading, TipoOperacao, ResultadoOperacao } from '@/types'
import { Plus, TrendingUp, TrendingDown, Trash2, Edit2, Calendar } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

export default function SessaoTradingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOperacao, setEditingOperacao] = useState<OperacaoTrading | null>(null)

  const operacoes = useTradingStore((state) => state.operacoes)
  const addOperacao = useTradingStore((state) => state.addOperacao)
  const updateOperacao = useTradingStore((state) => state.updateOperacao)
  const deleteOperacao = useTradingStore((state) => state.deleteOperacao)
  const getOperacoesDoDia = useTradingStore((state) => state.getOperacoesDoDia)
  const getLucroPrejuizoDia = useTradingStore((state) => state.getLucroPrejuizoDia)

  const operacoesHoje = getOperacoesDoDia()
  const lucroPrejuizoHoje = getLucroPrejuizoDia()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novaOperacao: OperacaoTrading = {
      id: editingOperacao?.id || uuidv4(),
      ativo: formData.get('ativo') as string,
      tipo: formData.get('tipo') as TipoOperacao,
      resultado: formData.get('resultado') as ResultadoOperacao,
      valorEntrada: parseFloat(formData.get('valorEntrada') as string),
      lucroPrejuizo: parseFloat(formData.get('lucroPrejuizo') as string),
      urlPrint: formData.get('urlPrint') as string || undefined,
      observacoes: formData.get('observacoes') as string || undefined,
      dataHora: editingOperacao?.dataHora || new Date().toISOString(),
    }

    if (editingOperacao) {
      updateOperacao(editingOperacao.id, novaOperacao)
    } else {
      addOperacao(novaOperacao)
    }

    setIsModalOpen(false)
    setEditingOperacao(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta operação?')) {
      deleteOperacao(id)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Sessão de Trading</h1>
            <p className="text-gray-400">Registre suas operações</p>
          </div>
          <Button
            onClick={() => {
              setEditingOperacao(null)
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Nova Operação
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            title="Operações Hoje"
            value={operacoesHoje.length}
            icon={TrendingUp}
          />
          <StatCard
            title="Resultado Hoje"
            value={formatCurrency(lucroPrejuizoHoje)}
            icon={TrendingDown}
            valueColor={lucroPrejuizoHoje >= 0 ? 'text-emerald-400' : 'text-red-400'}
          />
        </div>

        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Operações do Dia</h2>
          {operacoesHoje.length > 0 ? (
            <div className="space-y-3">
              {operacoesHoje
                .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime())
                .map((operacao) => (
                  <div
                    key={operacao.id}
                    className="p-5 bg-dark-black/50 border border-card-border/50 rounded-xl hover:border-accent-electric/30 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold text-lg">{operacao.ativo}</h3>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                            operacao.resultado === 'Gain'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                              : 'bg-red-500/15 text-red-400 border-red-500/20'
                          }`}>
                            {operacao.resultado}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-accent-electric/15 text-accent-electric border border-accent-electric/20">
                            {operacao.tipo}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400 mb-1">Valor Entrada</p>
                            <p className="text-white font-semibold">
                              {formatCurrency(operacao.valorEntrada)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 mb-1">Lucro/Prejuízo</p>
                            <p className={`font-semibold ${operacao.lucroPrejuizo >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {operacao.lucroPrejuizo >= 0 ? '+' : ''}{formatCurrency(operacao.lucroPrejuizo)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 mb-1">Data/Hora</p>
                            <p className="text-white font-semibold">
                              {new Date(operacao.dataHora).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        {operacao.observacoes && (
                          <p className="text-sm text-gray-400 mt-2">{operacao.observacoes}</p>
                        )}
                        {operacao.urlPrint && (
                          <a
                            href={operacao.urlPrint}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-accent-electric hover:text-accent-cyan mt-2 inline-block"
                          >
                            Ver print
                          </a>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => {
                            setEditingOperacao(operacao)
                            setIsModalOpen(true)
                          }}
                          className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(operacao.id)}
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
              <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhuma operação registrada hoje</p>
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingOperacao(null)
          }}
          title={editingOperacao ? 'Editar Operação' : 'Nova Operação'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ativo *
                </label>
                <input
                  type="text"
                  name="ativo"
                  required
                  defaultValue={editingOperacao?.ativo}
                  placeholder="Ex: PETR4, USD/BRL..."
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo *
                </label>
                <select
                  name="tipo"
                  required
                  defaultValue={editingOperacao?.tipo}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="Compra">Compra</option>
                  <option value="Venda">Venda</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Valor Entrada (R$) *
                </label>
                <input
                  type="number"
                  name="valorEntrada"
                  required
                  step="0.01"
                  min="0"
                  defaultValue={editingOperacao?.valorEntrada}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Resultado *
                </label>
                <select
                  name="resultado"
                  required
                  defaultValue={editingOperacao?.resultado}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="Gain">Gain</option>
                  <option value="Loss">Loss</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Lucro/Prejuízo (R$) *
              </label>
              <input
                type="number"
                name="lucroPrejuizo"
                required
                step="0.01"
                defaultValue={editingOperacao?.lucroPrejuizo}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                URL do Print
              </label>
              <input
                type="url"
                name="urlPrint"
                defaultValue={editingOperacao?.urlPrint}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Observações
              </label>
              <textarea
                name="observacoes"
                defaultValue={editingOperacao?.observacoes}
                rows={3}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingOperacao ? 'Salvar Alterações' : 'Registrar Operação'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingOperacao(null)
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

