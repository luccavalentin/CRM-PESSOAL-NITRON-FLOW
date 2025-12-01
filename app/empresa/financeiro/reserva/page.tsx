'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { useFinancasEmpresaStore } from '@/stores/financasEmpresaStore'
import { formatCurrency } from '@/utils/formatCurrency'
import { Shield, TrendingUp, AlertCircle, Target } from 'lucide-react'

interface ReservaEmergencia {
  id: string
  valorAtual: number
  meta: number
  descricao: string
  dataCriacao: string
}

export default function ReservaEmergenciaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [reserva, setReserva] = useState<ReservaEmergencia>({
    id: 'reserva-1',
    valorAtual: 0,
    meta: 50000,
    descricao: 'Reserva de Emergência',
    dataCriacao: new Date().toISOString(),
  })

  const fluxoCaixa = useFinancasEmpresaStore((state) => state.fluxoCaixa)
  const transacoes = useFinancasEmpresaStore((state) => state.transacoes)

  useEffect(() => {
    const saved = localStorage.getItem('reserva-emergencia-empresa')
    if (saved) {
      setReserva(JSON.parse(saved))
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
      valorAtual: parseFloat(formData.get('valorAtual') as string),
      meta: parseFloat(formData.get('meta') as string),
      descricao: formData.get('descricao') as string,
    })

    setIsModalOpen(false)
  }

  const percentual = reserva.meta > 0 ? (reserva.valorAtual / reserva.meta) * 100 : 0
  const faltante = reserva.meta - reserva.valorAtual
  const mesesGastos = fluxoCaixa < 0 ? Math.abs(fluxoCaixa) : 0
  const mesesCobertos = reserva.valorAtual > 0 && mesesGastos > 0 
    ? Math.floor(reserva.valorAtual / mesesGastos) 
    : 0

  const getStatus = () => {
    if (percentual >= 100) return { text: 'Meta Atingida', color: 'text-emerald-400', bg: 'bg-emerald-500/15' }
    if (percentual >= 75) return { text: 'Bem próximo', color: 'text-blue-400', bg: 'bg-blue-500/15' }
    if (percentual >= 50) return { text: 'Em andamento', color: 'text-yellow-400', bg: 'bg-yellow-500/15' }
    if (percentual >= 25) return { text: 'Iniciando', color: 'text-orange-400', bg: 'bg-orange-500/15' }
    return { text: 'Precisa atenção', color: 'text-red-400', bg: 'bg-red-500/15' }
  }

  const status = getStatus()

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Reserva de Emergência</h1>
            <p className="text-gray-400">Proteja sua empresa com uma reserva financeira</p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Target className="w-5 h-5" />
            Configurar Reserva
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Valor Atual"
            value={formatCurrency(reserva.valorAtual)}
            icon={Shield}
            valueColor="text-emerald-400"
          />
          <StatCard
            title="Meta"
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
            icon={AlertCircle}
            valueColor={status.color}
          />
        </div>

        {/* Progress Card */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Shield className="w-6 h-6 text-accent-electric" />
                {reserva.descricao}
              </h2>
              <span className={`px-4 py-2 rounded-lg font-semibold ${status.bg} ${status.color} border ${status.color.replace('text-', 'border-').replace('-400', '-500/20')}`}>
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
              <div className="w-full bg-dark-black rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all ${
                    percentual >= 100 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                    percentual >= 50 ? 'bg-gradient-to-r from-accent-electric to-accent-cyan' :
                    'bg-gradient-to-r from-yellow-500 to-orange-500'
                  }`}
                  style={{ width: `${Math.min(percentual, 100)}%` }}
                />
              </div>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold text-white mb-1">
                {Math.round(percentual)}%
              </p>
              <p className="text-gray-400 text-sm">da meta alcançada</p>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-dark-black/50 border border-card-border/50 rounded-xl">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                Meses Cobertos
              </h3>
              <p className="text-2xl font-bold text-accent-electric">
                {mesesCobertos > 0 ? mesesCobertos : 'N/A'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {mesesCobertos > 0 
                  ? `Sua reserva cobre ${mesesCobertos} ${mesesCobertos === 1 ? 'mês' : 'meses'} de gastos`
                  : 'Calcule com base no fluxo de caixa'
                }
              </p>
            </div>
            <div className="p-4 bg-dark-black/50 border border-card-border/50 rounded-xl">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Recomendação
              </h3>
              <p className="text-sm text-gray-300">
                A reserva de emergência ideal deve cobrir de 3 a 6 meses de despesas operacionais da empresa.
              </p>
            </div>
          </div>
        </div>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Configurar Reserva de Emergência"
          size="lg"
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

