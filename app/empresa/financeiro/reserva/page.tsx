'use client'

import { useState, useEffect, useMemo } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { useFinancasEmpresaStore } from '@/stores/financasEmpresaStore'
import { formatCurrency } from '@/utils/formatCurrency'
import { Shield, TrendingUp, AlertCircle, Target, Plus, Edit2, Calendar, DollarSign, BarChart3, Info } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

interface ReservaEmergencia {
  id: string
  valorAtual: number
  meta: number
  descricao: string
  dataCriacao: string
  historico: { data: string; valor: number; tipo: 'deposito' | 'saque' }[]
}

export default function ReservaEmergenciaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isHistoricoModalOpen, setIsHistoricoModalOpen] = useState(false)
  const [tipoMovimentacao, setTipoMovimentacao] = useState<'deposito' | 'saque'>('deposito')
  const [reserva, setReserva] = useState<ReservaEmergencia>({
    id: 'reserva-1',
    valorAtual: 0,
    meta: 50000,
    descricao: 'Reserva de Emergência Empresarial',
    dataCriacao: new Date().toISOString(),
    historico: [],
  })

  const fluxoCaixa = useFinancasEmpresaStore((state) => state.fluxoCaixa)
  const transacoes = useFinancasEmpresaStore((state) => state.transacoes)

  useEffect(() => {
    const saved = localStorage.getItem('reserva-emergencia-empresa')
    if (saved) {
      const parsed = JSON.parse(saved)
      setReserva({
        ...parsed,
        historico: parsed.historico || [],
      })
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('reserva-emergencia-empresa', JSON.stringify(reserva))
  }, [reserva])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    setReserva({
      ...reserva,
      valorAtual: parseFloat(formData.get('valorAtual') as string) || 0,
      meta: parseFloat(formData.get('meta') as string) || 0,
      descricao: (formData.get('descricao') as string) || reserva.descricao,
    })

    setIsModalOpen(false)
  }

  const handleMovimentacao = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const valor = parseFloat(formData.get('valor') as string) || 0
    const descricao = (formData.get('descricao') as string) || 'Movimentação'

    if (tipoMovimentacao === 'deposito') {
      setReserva({
        ...reserva,
        valorAtual: reserva.valorAtual + valor,
        historico: [
          ...reserva.historico,
          {
            data: new Date().toISOString(),
            valor,
            tipo: 'deposito',
          },
        ],
      })
    } else {
      if (reserva.valorAtual >= valor) {
        setReserva({
          ...reserva,
          valorAtual: reserva.valorAtual - valor,
          historico: [
            ...reserva.historico,
            {
              data: new Date().toISOString(),
              valor,
              tipo: 'saque',
            },
          ],
        })
      } else {
        alert('Saldo insuficiente na reserva!')
        return
      }
    }

    setIsHistoricoModalOpen(false)
  }

  const percentual = reserva.meta > 0 ? (reserva.valorAtual / reserva.meta) * 100 : 0
  const faltante = Math.max(0, reserva.meta - reserva.valorAtual)
  const mesesGastos = fluxoCaixa < 0 ? Math.abs(fluxoCaixa) : 0
  const mesesCobertos = reserva.valorAtual > 0 && mesesGastos > 0 
    ? Math.floor(reserva.valorAtual / mesesGastos) 
    : 0

  // Cálculo de recomendações
  const gastoMedioMensal = useMemo(() => {
    const hoje = new Date()
    const mesAtual = hoje.getMonth()
    const anoAtual = hoje.getFullYear()
    const saidasMes = transacoes
      .filter(t => {
        const data = new Date(t.data)
        return data.getMonth() === mesAtual && 
               data.getFullYear() === anoAtual && 
               t.tipo === 'saida'
      })
      .reduce((acc, t) => acc + t.valor, 0)
    return saidasMes
  }, [transacoes])

  const reservaIdeal = gastoMedioMensal * 6 // 6 meses de despesas
  const percentualIdeal = reservaIdeal > 0 ? (reserva.valorAtual / reservaIdeal) * 100 : 0

  // Dados para gráfico de histórico
  const dadosGrafico = useMemo(() => {
    const ultimos30Dias = reserva.historico
      .filter(h => {
        const data = new Date(h.data)
        const hoje = new Date()
        const diffTime = Math.abs(hoje.getTime() - data.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays <= 30
      })
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())

    let saldoAcumulado = 0
    return ultimos30Dias.map(h => {
      if (h.tipo === 'deposito') {
        saldoAcumulado += h.valor
      } else {
        saldoAcumulado -= h.valor
      }
      return {
        data: new Date(h.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        valor: saldoAcumulado,
        deposito: h.tipo === 'deposito' ? h.valor : 0,
        saque: h.tipo === 'saque' ? h.valor : 0,
      }
    })
  }, [reserva.historico])

  const getStatus = () => {
    if (percentual >= 100) return { text: 'Meta Atingida ✓', color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' }
    if (percentual >= 75) return { text: 'Bem próximo', color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/30' }
    if (percentual >= 50) return { text: 'Em andamento', color: 'text-yellow-400', bg: 'bg-yellow-500/15', border: 'border-yellow-500/30' }
    if (percentual >= 25) return { text: 'Iniciando', color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/30' }
    return { text: 'Precisa atenção', color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30' }
  }

  const status = getStatus()

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Reserva de Emergência</h1>
            <p className="text-gray-400 text-sm">Proteja sua empresa com uma reserva financeira estratégica</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              onClick={() => {
                setTipoMovimentacao('deposito')
                setIsHistoricoModalOpen(true)
              }}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
            <Button
              onClick={() => {
                setTipoMovimentacao('saque')
                setIsHistoricoModalOpen(true)
              }}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Retirar
            </Button>
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="secondary"
              className="w-full sm:w-auto"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Configurar
            </Button>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Valor Atual"
            value={formatCurrency(reserva.valorAtual)}
            icon={Shield}
            valueColor="text-emerald-400"
          />
          <StatCard
            title="Meta Definida"
            value={formatCurrency(reserva.meta)}
            icon={Target}
          />
          <StatCard
            title="Faltante"
            value={formatCurrency(faltante)}
            icon={TrendingUp}
            valueColor={faltante > 0 ? 'text-yellow-400' : 'text-emerald-400'}
          />
          <StatCard
            title="Progresso"
            value={`${Math.round(percentual)}%`}
            icon={BarChart3}
            valueColor={status.color}
          />
        </div>

        {/* Card Principal de Progresso */}
        <div className="bg-card-bg/80 backdrop-blur-sm border-2 border-card-border/50 rounded-xl p-6 sm:p-8">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-accent-electric" />
                  {reserva.descricao}
                </h2>
                <p className="text-sm text-gray-400">{reserva.meta > 0 ? `Meta de ${formatCurrency(reserva.meta)}` : 'Configure uma meta para começar'}</p>
              </div>
              <span className={`px-4 py-2 rounded-lg font-semibold text-sm border ${status.bg} ${status.color} ${status.border}`}>
                {status.text}
              </span>
            </div>
            
            {/* Barra de Progresso */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-400 font-medium">
                  {formatCurrency(reserva.valorAtual)}
                </span>
                <span className="text-gray-400 font-medium">
                  {formatCurrency(reserva.meta)}
                </span>
              </div>
              <div className="w-full bg-dark-black rounded-full h-4 sm:h-5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    percentual >= 100 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                    percentual >= 50 ? 'bg-gradient-to-r from-blue-600 to-blue-700' :
                    'bg-gradient-to-r from-yellow-500 to-orange-500'
                  }`}
                  style={{ width: `${Math.min(percentual, 100)}%` }}
                />
              </div>
              <div className="text-center mt-3">
                <p className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
                  {Math.round(percentual)}%
                </p>
                <p className="text-gray-400 text-xs sm:text-sm">da meta alcançada</p>
              </div>
            </div>
          </div>

          {/* Cards de Informações */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-dark-black/50 border border-card-border/50 rounded-xl">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-yellow-400" />
                Meses Cobertos
              </h3>
              <p className="text-2xl font-bold text-accent-electric mb-1">
                {mesesCobertos > 0 ? mesesCobertos : 'N/A'}
              </p>
              <p className="text-xs text-gray-400">
                {mesesCobertos > 0 
                  ? `Cobre ${mesesCobertos} ${mesesCobertos === 1 ? 'mês' : 'meses'} de gastos`
                  : 'Baseado no fluxo de caixa'
                }
              </p>
            </div>
            
            <div className="p-4 bg-dark-black/50 border border-card-border/50 rounded-xl">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2 text-sm">
                <Target className="w-4 h-4 text-blue-400" />
                Reserva Ideal
              </h3>
              <p className="text-lg font-bold text-white mb-1">
                {formatCurrency(reservaIdeal)}
              </p>
              <p className="text-xs text-gray-400">
                {percentualIdeal.toFixed(0)}% da reserva ideal (6 meses)
              </p>
            </div>

            <div className="p-4 bg-dark-black/50 border border-card-border/50 rounded-xl">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Gasto Médio Mensal
              </h3>
              <p className="text-lg font-bold text-white mb-1">
                {formatCurrency(gastoMedioMensal)}
              </p>
              <p className="text-xs text-gray-400">
                Baseado nas contas a pagar do mês
              </p>
            </div>

            <div className="p-4 bg-dark-black/50 border border-card-border/50 rounded-xl">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2 text-sm">
                <Info className="w-4 h-4 text-purple-400" />
                Recomendação
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                A reserva ideal deve cobrir de 3 a 6 meses de despesas operacionais da empresa.
              </p>
            </div>
          </div>
        </div>

        {/* Gráfico de Histórico */}
        {reserva.historico.length > 0 && (
          <div className="bg-card-bg border border-card-border rounded-xl p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-accent-electric" />
              Evolução da Reserva (Últimos 30 dias)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dadosGrafico}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="data" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="valor" 
                  stroke="#00d4ff" 
                  strokeWidth={2}
                  name="Saldo da Reserva"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Histórico de Movimentações */}
        {reserva.historico.length > 0 && (
          <div className="bg-card-bg border border-card-border rounded-xl p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Histórico de Movimentações</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {reserva.historico
                .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                .slice(0, 10)
                .map((mov, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      mov.tipo === 'deposito'
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        mov.tipo === 'deposito'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {mov.tipo === 'deposito' ? (
                          <Plus className="w-4 h-4" />
                        ) : (
                          <DollarSign className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">
                          {mov.tipo === 'deposito' ? 'Depósito' : 'Saque'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(mov.data).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <span className={`font-bold ${
                      mov.tipo === 'deposito' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {mov.tipo === 'deposito' ? '+' : '-'}
                      {formatCurrency(mov.valor)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Configuração */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Configurar Reserva de Emergência"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descrição
            </label>
            <input
              type="text"
              name="descricao"
              defaultValue={reserva.descricao}
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Valor Atual (R$)
              </label>
              <input
                type="number"
                name="valorAtual"
                step="0.01"
                min="0"
                defaultValue={reserva.valorAtual}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Meta (R$)
              </label>
              <input
                type="number"
                name="meta"
                step="0.01"
                min="0"
                defaultValue={reserva.meta}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Salvar Configuração
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Movimentação */}
      <Modal
        isOpen={isHistoricoModalOpen}
        onClose={() => setIsHistoricoModalOpen(false)}
        title={tipoMovimentacao === 'deposito' ? 'Adicionar à Reserva' : 'Retirar da Reserva'}
        size="md"
      >
        <form onSubmit={handleMovimentacao} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Valor (R$)
            </label>
            <input
              type="number"
              name="valor"
              step="0.01"
              min="0"
              required
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descrição (opcional)
            </label>
            <input
              type="text"
              name="descricao"
              placeholder="Ex: Depósito mensal, Retirada para pagamento..."
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          {tipoMovimentacao === 'saque' && reserva.valorAtual > 0 && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-400">
                Saldo disponível: {formatCurrency(reserva.valorAtual)}
              </p>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1"
              style={{
                backgroundColor: tipoMovimentacao === 'deposito' ? '#059669' : '#dc2626'
              }}
            >
              {tipoMovimentacao === 'deposito' ? 'Adicionar' : 'Retirar'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsHistoricoModalOpen(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  )
}
