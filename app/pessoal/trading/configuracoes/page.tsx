'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { useTradingStore } from '@/stores/tradingStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { formatCurrency } from '@/utils/formatCurrency'
import { ConfiguracaoTrading } from '@/types'
import { Settings, Shield, Target, AlertCircle } from 'lucide-react'

export default function ConfiguracoesTradingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const configuracao = useTradingStore((state) => state.configuracao)
  const setConfiguracao = useTradingStore((state) => state.setConfiguracao)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const capitalTotal = parseFloat(formData.get('capitalTotal') as string)
    const metaDiariaPercentual = parseFloat(formData.get('metaDiariaPercentual') as string)
    const stopGainPercentual = parseFloat(formData.get('stopGainPercentual') as string)
    const stopLossPercentual = parseFloat(formData.get('stopLossPercentual') as string)
    
    const novaConfig: ConfiguracaoTrading = {
      capitalTotal,
      metaDiariaPercentual,
      stopGainReais: (capitalTotal * stopGainPercentual) / 100,
      stopGainPercentual,
      stopLossReais: (capitalTotal * stopLossPercentual) / 100,
      stopLossPercentual,
      valorMaximoEntrada: parseFloat(formData.get('valorMaximoEntrada') as string),
      limiteOperacoesDia: parseInt(formData.get('limiteOperacoesDia') as string),
      dataInicio: configuracao?.dataInicio || new Date().toISOString().split('T')[0],
      diaAtual: new Date().toISOString().split('T')[0],
      bloqueado: false,
    }

    setConfiguracao(novaConfig)
    setIsModalOpen(false)
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Configurações Trading</h1>
            <p className="text-gray-400">Configure seus limites e parâmetros de trading</p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Settings className="w-5 h-5" />
            {configuracao ? 'Editar Configuração' : 'Criar Configuração'}
          </Button>
        </div>

        {configuracao ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Capital Total"
                value={formatCurrency(configuracao.capitalTotal)}
                icon={Target}
              />
              <StatCard
                title="Stop Gain"
                value={formatCurrency(configuracao.stopGainReais)}
                icon={Shield}
                valueColor="text-emerald-400"
              />
              <StatCard
                title="Stop Loss"
                value={formatCurrency(configuracao.stopLossReais)}
                icon={AlertCircle}
                valueColor="text-red-400"
              />
              <StatCard
                title="Limite Operações/Dia"
                value={configuracao.limiteOperacoesDia}
                icon={Target}
              />
            </div>

            <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Detalhes da Configuração</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-400 mb-1">Meta Diária</p>
                  <p className="text-white font-semibold text-lg">{configuracao.metaDiariaPercentual}%</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Valor Máximo por Entrada</p>
                  <p className="text-white font-semibold text-lg">
                    {formatCurrency(configuracao.valorMaximoEntrada)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Stop Gain Percentual</p>
                  <p className="text-white font-semibold text-lg">{configuracao.stopGainPercentual}%</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Stop Loss Percentual</p>
                  <p className="text-white font-semibold text-lg">{configuracao.stopLossPercentual}%</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-12 text-center">
            <Settings className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-medium mb-2">Nenhuma configuração definida</p>
            <p className="text-gray-500 text-sm mb-4">Configure seus parâmetros de trading para começar</p>
            <Button onClick={() => setIsModalOpen(true)}>
              Criar Configuração
            </Button>
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={configuracao ? 'Editar Configuração' : 'Nova Configuração'}
          size="lg"
          variant="warning"
          icon={Settings}
          description={configuracao ? 'Atualize os parâmetros de trading' : 'Configure seus limites, stops e parâmetros de trading para operar com segurança'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Capital Total (R$) *
              </label>
              <input
                type="number"
                name="capitalTotal"
                required
                step="0.01"
                min="0"
                defaultValue={configuracao?.capitalTotal}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Meta Diária (%)
                </label>
                <input
                  type="number"
                  name="metaDiariaPercentual"
                  step="0.01"
                  min="0"
                  defaultValue={configuracao?.metaDiariaPercentual}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Valor Máximo Entrada (R$)
                </label>
                <input
                  type="number"
                  name="valorMaximoEntrada"
                  step="0.01"
                  min="0"
                  defaultValue={configuracao?.valorMaximoEntrada}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stop Gain (%)
                </label>
                <input
                  type="number"
                  name="stopGainPercentual"
                  step="0.01"
                  min="0"
                  defaultValue={configuracao?.stopGainPercentual}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stop Loss (%)
                </label>
                <input
                  type="number"
                  name="stopLossPercentual"
                  step="0.01"
                  min="0"
                  defaultValue={configuracao?.stopLossPercentual}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Limite de Operações por Dia
              </label>
              <input
                type="number"
                name="limiteOperacoesDia"
                min="1"
                defaultValue={configuracao?.limiteOperacoesDia}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {configuracao ? 'Salvar Alterações' : 'Criar Configuração'}
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

