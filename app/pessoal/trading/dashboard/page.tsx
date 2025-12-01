'use client'

import { useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import StatCard from '@/components/ui/StatCard'
import { useTradingStore } from '@/stores/tradingStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { formatCurrency } from '@/utils/formatCurrency'
import { TrendingUp, TrendingDown, DollarSign, Activity, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function TradingDashboardPage() {
  const operacoes = useTradingStore((state) => state.operacoes)
  const configuracao = useTradingStore((state) => state.configuracao)
  const getOperacoesDoDia = useTradingStore((state) => state.getOperacoesDoDia)
  const getLucroPrejuizoDia = useTradingStore((state) => state.getLucroPrejuizoDia)
  const getEstatisticas = useTradingStore((state) => state.getEstatisticas)

  const operacoesHoje = getOperacoesDoDia()
  const lucroPrejuizoHoje = getLucroPrejuizoDia()
  const estatisticas = getEstatisticas()

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Trading</h1>
          <p className="text-gray-400">Visão geral das suas operações</p>
        </div>

        {configuracao?.bloqueado && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-red-400 font-semibold">Sistema Bloqueado</p>
                <p className="text-gray-400 text-sm">
                  Motivo: {
                    configuracao.motivoBloqueio === 'stop_gain' ? 'Stop Gain atingido' :
                    configuracao.motivoBloqueio === 'stop_loss' ? 'Stop Loss atingido' :
                    'Limite de operações atingido'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total de Operações"
            value={estatisticas.totalOperacoes}
            icon={Activity}
          />
          <StatCard
            title="Win Rate"
            value={`${estatisticas.winRate.toFixed(1)}%`}
            icon={CheckCircle2}
            valueColor={estatisticas.winRate >= 50 ? 'text-emerald-400' : 'text-red-400'}
          />
          <StatCard
            title="Lucro Total"
            value={formatCurrency(estatisticas.lucroTotal)}
            icon={DollarSign}
            valueColor={estatisticas.lucroTotal >= 0 ? 'text-emerald-400' : 'text-red-400'}
          />
          <StatCard
            title="Hoje"
            value={formatCurrency(lucroPrejuizoHoje)}
            icon={TrendingUp}
            valueColor={lucroPrejuizoHoje >= 0 ? 'text-emerald-400' : 'text-red-400'}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Ganhos
            </h2>
            <p className="text-3xl font-extrabold text-emerald-400">
              {estatisticas.ganhos}
            </p>
          </div>
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-400" />
              Perdas
            </h2>
            <p className="text-3xl font-extrabold text-red-400">
              {estatisticas.perdas}
            </p>
          </div>
        </div>

        {configuracao && (
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Configuração Atual</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-400 mb-1">Capital Total</p>
                <p className="text-white font-semibold">
                  {formatCurrency(configuracao.capitalTotal)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Stop Gain</p>
                <p className="text-white font-semibold">
                  {formatCurrency(configuracao.stopGainReais)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Stop Loss</p>
                <p className="text-white font-semibold">
                  {formatCurrency(configuracao.stopLossReais)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

