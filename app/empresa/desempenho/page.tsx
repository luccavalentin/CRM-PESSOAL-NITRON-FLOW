'use client'

import MainLayout from '@/components/layout/MainLayout'
import StatCard from '@/components/ui/StatCard'
import { useTarefasStore } from '@/stores/tarefasStore'
import { useProjetosStore } from '@/stores/projetosStore'
import { useFinancasEmpresaStore } from '@/stores/financasEmpresaStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { formatCurrency } from '@/utils/formatCurrency'
import { TrendingUp, Target, CheckCircle2, DollarSign, Activity, BarChart3 } from 'lucide-react'

export default function DesempenhoPage() {
  const tarefas = useTarefasStore((state) => state.tarefas)
  const projetos = useProjetosStore((state) => state.projetos)
  const transacoes = useFinancasEmpresaStore((state) => state.transacoes)
  const fluxoCaixa = useFinancasEmpresaStore((state) => state.fluxoCaixa)

  const hoje = new Date()
  const mesAtual = hoje.getMonth()
  const anoAtual = hoje.getFullYear()

  // Estatísticas de Tarefas
  const tarefasConcluidas = tarefas.filter(t => t.concluida).length
  const taxaConclusaoTarefas = tarefas.length > 0 
    ? Math.round((tarefasConcluidas / tarefas.length) * 100) 
    : 0

  // Estatísticas de Projetos
  const projetosConcluidos = projetos.filter(p => p.status === 'Entregue').length
  const taxaConclusaoProjetos = projetos.length > 0 
    ? Math.round((projetosConcluidos / projetos.length) * 100) 
    : 0

  // Estatísticas Financeiras
  const transacoesMes = transacoes.filter(t => {
    const data = new Date(t.data)
    return data.getMonth() === mesAtual && data.getFullYear() === anoAtual
  })
  const entradasMes = transacoesMes
    .filter(t => t.tipo === 'entrada')
    .reduce((acc, t) => acc + t.valor, 0)
  const saidasMes = transacoesMes
    .filter(t => t.tipo === 'saida')
    .reduce((acc, t) => acc + t.valor, 0)

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Desempenho</h1>
          <p className="text-gray-400">Métricas e indicadores de performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Taxa de Conclusão - Tarefas"
            value={`${taxaConclusaoTarefas}%`}
            icon={CheckCircle2}
            valueColor={taxaConclusaoTarefas >= 80 ? 'text-emerald-400' : taxaConclusaoTarefas >= 60 ? 'text-yellow-400' : 'text-red-400'}
          />
          <StatCard
            title="Taxa de Conclusão - Projetos"
            value={`${taxaConclusaoProjetos}%`}
            icon={Target}
            valueColor={taxaConclusaoProjetos >= 80 ? 'text-emerald-400' : taxaConclusaoProjetos >= 60 ? 'text-yellow-400' : 'text-red-400'}
          />
          <StatCard
            title="Entradas do Mês"
            value={formatCurrency(entradasMes)}
            icon={DollarSign}
            valueColor="text-emerald-400"
          />
          <StatCard
            title="Fluxo de Caixa"
            value={formatCurrency(fluxoCaixa)}
            icon={Activity}
            valueColor={fluxoCaixa > 0 ? 'text-emerald-400' : 'text-red-400'}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-accent-electric" />
              Resumo de Tarefas
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Total de Tarefas</span>
                  <span className="text-white font-semibold">{tarefas.length}</span>
                </div>
                <div className="w-full bg-dark-black rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-accent-electric to-accent-cyan h-2 rounded-full"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Tarefas Concluídas</span>
                  <span className="text-emerald-400 font-semibold">{tarefasConcluidas}</span>
                </div>
                <div className="w-full bg-dark-black rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full"
                    style={{ width: `${taxaConclusaoTarefas}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent-electric" />
              Resumo Financeiro
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Entradas do Mês</span>
                  <span className="text-emerald-400 font-semibold">
                    {formatCurrency(entradasMes)}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Contas a Pagar do Mês</span>
                  <span className="text-red-400 font-semibold">
                    {formatCurrency(saidasMes)}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Saldo Líquido</span>
                  <span className={`font-semibold ${fluxoCaixa > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(fluxoCaixa)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

