'use client'

import { useState, useEffect, useMemo } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { useFinancasPessoaisStore } from '@/stores/financasPessoaisStore'
import { formatCurrency } from '@/utils/formatCurrency'
import { Shield, TrendingUp, AlertCircle, Target, LineChart, ArrowRight } from 'lucide-react'
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

interface ReservaEmergencia {
  id: string
  valorAtual: number
  meta: number
  descricao: string
  dataCriacao: string
  historico?: { data: string; valor: number }[]
}

export default function ReservaEmergenciaPessoalPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [reserva, setReserva] = useState<ReservaEmergencia>({
    id: 'reserva-1',
    valorAtual: 0,
    meta: 20000,
    descricao: 'Reserva de Emergência Pessoal',
    dataCriacao: new Date().toISOString(),
    historico: [],
  })

  const saldoAtual = useFinancasPessoaisStore((state) => state.saldoAtual)
  const getSaidasMes = useFinancasPessoaisStore((state) => state.getSaidasMes)

  useEffect(() => {
    const saved = localStorage.getItem('reserva-emergencia-pessoal')
    if (saved) {
      const parsed = JSON.parse(saved)
      setReserva({
        ...parsed,
        historico: parsed.historico || [],
      })
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('reserva-emergencia-pessoal', JSON.stringify(reserva))
  }, [reserva])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novoValor = parseFloat(formData.get('valorAtual') as string)
    const historicoAtual = reserva.historico || []
    
    // Adicionar ao histórico se o valor mudou
    if (novoValor !== reserva.valorAtual) {
      historicoAtual.push({
        data: new Date().toISOString().split('T')[0],
        valor: novoValor,
      })
    }
    
    setReserva({
      ...reserva,
      valorAtual: novoValor,
      meta: parseFloat(formData.get('meta') as string),
      descricao: formData.get('descricao') as string,
      historico: historicoAtual,
    })

    setIsModalOpen(false)
  }

  const percentual = reserva.meta > 0 ? (reserva.valorAtual / reserva.meta) * 100 : 0
  const faltante = reserva.meta - reserva.valorAtual
  const saidasMes = getSaidasMes()
  const mesesCobertos = reserva.valorAtual > 0 && saidasMes > 0 
    ? Math.floor(reserva.valorAtual / saidasMes) 
    : 0

  const dadosEvolucao = useMemo(() => {
    if (!reserva.historico || reserva.historico.length === 0) {
      return [
        { data: new Date().toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }), valor: reserva.valorAtual, meta: reserva.meta }
      ]
    }
    
    return reserva.historico
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
      .map(item => ({
        data: new Date(item.data).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
        valor: item.valor,
        meta: reserva.meta,
      }))
      .concat([{
        data: 'Hoje',
        valor: reserva.valorAtual,
        meta: reserva.meta,
      }])
  }, [reserva.historico, reserva.valorAtual, reserva.meta])

  const getStatus = () => {
    if (percentual >= 100) return { text: 'Meta Atingida', color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/20' }
    if (percentual >= 75) return { text: 'Bem próximo', color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/20' }
    if (percentual >= 50) return { text: 'Em andamento', color: 'text-yellow-400', bg: 'bg-yellow-500/15', border: 'border-yellow-500/20' }
    if (percentual >= 25) return { text: 'Iniciando', color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/20' }
    return { text: 'Precisa atenção', color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/20' }
  }

  const status = getStatus()
  const recomendacaoMeses = saidasMes > 0 ? Math.ceil((reserva.meta / saidasMes)) : 0

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Reserva de Emergência</h1>
            <p className="text-gray-400">Proteja-se com uma reserva financeira pessoal</p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Target className="w-5 h-5" />
            Configurar Reserva
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Valor Atual"
            value={formatCurrency(reserva.valorAtual)}
            icon={Shield}
            valueColor="text-emerald-400"
            className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20"
          />
          <StatCard
            title="Meta"
            value={formatCurrency(reserva.meta)}
            icon={Target}
            className="bg-gradient-to-br from-accent-electric/10 to-accent-cyan/5 border-accent-electric/20"
          />
          <StatCard
            title="Faltante"
            value={formatCurrency(faltante)}
            icon={TrendingUp}
            valueColor={faltante > 0 ? 'text-yellow-400' : 'text-emerald-400'}
            className="bg-gradient-to-br from-yellow-500/10 to-orange-600/5 border-yellow-500/20"
          />
          <StatCard
            title="Progresso"
            value={`${Math.round(percentual)}%`}
            icon={AlertCircle}
            valueColor={status.color}
            className={`bg-gradient-to-br ${status.bg} ${status.border}`}
          />
        </div>

        {/* Gráfico de Evolução */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LineChart className="w-5 h-5 text-accent-electric" />
              <h3 className="text-lg font-bold text-white">Evolução da Reserva</h3>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dadosEvolucao}>
              <defs>
                <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00D9FF" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorMeta" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="data" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Area type="monotone" dataKey="valor" stroke="#00D9FF" fillOpacity={1} fill="url(#colorValor)" name="Valor Atual" />
              <Area type="monotone" dataKey="meta" stroke="#10B981" strokeDasharray="5 5" fillOpacity={0.3} fill="url(#colorMeta)" name="Meta" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Card Principal */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6 sm:p-8">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Shield className="w-6 h-6 text-accent-electric" />
                {reserva.descricao}
              </h2>
              <span className={`px-4 py-2 rounded-lg font-semibold ${status.bg} ${status.color} border ${status.border}`}>
                {status.text}
              </span>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">
                  {formatCurrency(reserva.valorAtual)}
                </span>
                <span className="text-gray-400">
                  {formatCurrency(reserva.meta)}
                </span>
              </div>
              <div className="w-full bg-dark-black rounded-full h-5">
                <div
                  className={`h-5 rounded-full transition-all ${
                    percentual >= 100 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                    percentual >= 50 ? 'bg-gradient-to-r from-accent-electric to-accent-cyan' :
                    'bg-gradient-to-r from-yellow-500 to-orange-500'
                  }`}
                  style={{ width: `${Math.min(percentual, 100)}%` }}
                />
              </div>
            </div>
            <div className="text-center">
              <p className="text-4xl font-extrabold text-white mb-1">
                {Math.round(percentual)}%
              </p>
              <p className="text-gray-400 text-sm">da meta alcançada</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-5 bg-dark-black/50 border border-card-border/50 rounded-xl">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                Meses Cobertos
              </h3>
              <p className="text-3xl font-bold text-accent-electric mb-2">
                {mesesCobertos > 0 ? mesesCobertos : 'N/A'}
              </p>
              <p className="text-sm text-gray-400">
                {mesesCobertos > 0 
                  ? `Sua reserva cobre ${mesesCobertos} ${mesesCobertos === 1 ? 'mês' : 'meses'} de gastos`
                  : 'Calcule com base nas saídas mensais'
                }
              </p>
            </div>
            <div className="p-5 bg-dark-black/50 border border-card-border/50 rounded-xl">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Recomendação
              </h3>
              <p className="text-sm text-gray-300 mb-2">
                A reserva de emergência ideal deve cobrir de 3 a 6 meses de despesas pessoais.
              </p>
              {saidasMes > 0 && (
                <p className="text-xs text-gray-400">
                  Com base nas suas saídas mensais, você precisaria de {recomendacaoMeses} meses para atingir a meta.
                </p>
              )}
            </div>
            <div className="p-5 bg-dark-black/50 border border-card-border/50 rounded-xl">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                Próximo Passo
              </h3>
              {faltante > 0 ? (
                <div>
                  <p className="text-sm text-gray-300 mb-2">
                    Para atingir sua meta, você precisa economizar:
                  </p>
                  <p className="text-2xl font-bold text-blue-400 mb-1">
                    {formatCurrency(faltante)}
                  </p>
                  {saidasMes > 0 && (
                    <p className="text-xs text-gray-400">
                      Economizando {formatCurrency(saidasMes * 0.1)} por mês (10% das saídas), você atingirá a meta em {Math.ceil(faltante / (saidasMes * 0.1))} meses.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-emerald-400 font-semibold">
                  ✓ Parabéns! Você atingiu sua meta de reserva de emergência!
                </p>
              )}
            </div>
          </div>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Configurar Reserva de Emergência"
          size="lg"
          variant="info"
          icon={Shield}
          description="Configure sua reserva de emergência pessoal para garantir sua segurança financeira"
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
                  Valor Atual (R$) *
                </label>
                <input
                  type="number"
                  name="valorAtual"
                  required
                  step="0.01"
                  min="0"
                  defaultValue={reserva.valorAtual}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Meta (R$) *
                </label>
                <input
                  type="number"
                  name="meta"
                  required
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
      </div>
    </MainLayout>
  )
}
