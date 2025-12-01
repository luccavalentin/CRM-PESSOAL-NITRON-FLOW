'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { useFinancasPessoaisStore } from '@/stores/financasPessoaisStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { formatCurrency } from '@/utils/formatCurrency'
import { TransacaoFinanceira } from '@/types'
import { Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

export default function ControleFinancasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tipoTransacao, setTipoTransacao] = useState<'entrada' | 'saida'>('entrada')

  const transacoes = useFinancasPessoaisStore((state) => state.transacoes)
  const saldoAtual = useFinancasPessoaisStore((state) => state.saldoAtual)
  const addTransacao = useFinancasPessoaisStore((state) => state.addTransacao)
  const calcularSaldo = useFinancasPessoaisStore((state) => state.calcularSaldo)
  const getEntradasMes = useFinancasPessoaisStore((state) => state.getEntradasMes)
  const getSaidasMes = useFinancasPessoaisStore((state) => state.getSaidasMes)
  const getPrevisaoMes = useFinancasPessoaisStore((state) => state.getPrevisaoMes)

  useEffect(() => {
    calcularSaldo()
  }, [transacoes, calcularSaldo])

  const entradasMes = getEntradasMes()
  const saidasMes = getSaidasMes()
  const previsaoMes = getPrevisaoMes()
  const mostrarValores = usePreferencesStore((state) => state.mostrarValores)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novaTransacao: TransacaoFinanceira = {
      id: uuidv4(),
      descricao: formData.get('descricao') as string,
      valor: parseFloat(formData.get('valor') as string),
      categoria: formData.get('categoria') as string,
      data: formData.get('data') as string,
      tipo: tipoTransacao,
    }

    addTransacao(novaTransacao)
    setIsModalOpen(false)
  }

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Controle de Finanças</h1>
            <p className="text-gray-400 text-sm">Gerencie suas finanças pessoais</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              onClick={() => {
                setTipoTransacao('entrada')
                setIsModalOpen(true)
              }}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="text-sm sm:text-base">Nova Entrada</span>
            </Button>
            <Button
              onClick={() => {
                setTipoTransacao('saida')
                setIsModalOpen(true)
              }}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="text-sm sm:text-base">Nova Saída</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Saldo Atual"
            value={formatCurrency(saldoAtual)}
            icon={Wallet}
            trend={{
              value: saldoAtual > 0 ? 10 : -10,
              isPositive: saldoAtual > 0,
            }}
          />
          <StatCard
            title="Entradas do Mês"
            value={formatCurrency(entradasMes)}
            icon={TrendingUp}
            valueColor="text-emerald-400"
          />
          <StatCard
            title="Saídas do Mês"
            value={formatCurrency(saidasMes)}
            icon={TrendingDown}
            valueColor="text-red-400"
          />
          <StatCard
            title="Previsão do Mês"
            value={formatCurrency(previsaoMes)}
            icon={Wallet}
          />
        </div>

        <div className="bg-card-bg border border-card-border rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">
            Últimas Transações
          </h2>
          {transacoes.length > 0 ? (
            <div className="space-y-3">
              {transacoes
                .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                .slice(0, 20)
                .map((transacao) => (
                  <div
                    key={transacao.id}
                    className="flex items-center justify-between p-4 bg-dark-black/50 border border-card-border rounded-lg hover:border-accent-electric/30 transition-colors"
                  >
                    <div>
                      <p className="text-white font-medium">{transacao.descricao}</p>
                      <p className="text-sm text-gray-400">
                        {transacao.categoria} • {new Date(transacao.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span
                      className={`text-lg font-semibold ${
                        transacao.tipo === 'entrada'
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {transacao.tipo === 'entrada' ? '+' : '-'}
                      {formatCurrency(transacao.valor)}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-400">Nenhuma transação registrada</p>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={tipoTransacao === 'entrada' ? 'Nova Entrada' : 'Nova Saída'}
        size="md"
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
              className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Valor (R$) *
            </label>
            <input
              type="number"
              name="valor"
              required
              step="0.01"
              min="0"
              className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Categoria *
            </label>
            <input
              type="text"
              name="categoria"
              required
              placeholder="Ex: Salário, Alimentação, Transporte..."
              className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
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
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
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

