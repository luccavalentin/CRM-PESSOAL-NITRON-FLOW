'use client'

import MainLayout from '@/components/layout/MainLayout'
import StatCard from '@/components/ui/StatCard'
import { useTarefasStore } from '@/stores/tarefasStore'
import { useProjetosStore } from '@/stores/projetosStore'
import { useFinancasEmpresaStore } from '@/stores/financasEmpresaStore'
import { useIdeiasStore } from '@/stores/ideiasStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { formatCurrency } from '@/utils/formatCurrency'
import {
  CheckSquare,
  FolderKanban,
  Lightbulb,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  LayoutDashboard,
} from 'lucide-react'
import { useEffect } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const tarefas = useTarefasStore((state) => state.getTarefasDoDia())
  const projetos = useProjetosStore((state) => state.projetos)
  const fluxoCaixa = useFinancasEmpresaStore((state) => state.fluxoCaixa)
  const transacoes = useFinancasEmpresaStore((state) => state.transacoes)
  const calcularFluxoCaixa = useFinancasEmpresaStore((state) => state.calcularFluxoCaixa)
  const ideias = useIdeiasStore((state) => state.getIdeiasRecentes(5))
  const mostrarValores = usePreferencesStore((state) => state.mostrarValores)

  useEffect(() => {
    calcularFluxoCaixa()
  }, [calcularFluxoCaixa])

  const hoje = new Date()
  const mesAtual = hoje.getMonth()
  const anoAtual = hoje.getFullYear()
  
  const transacoesMes = transacoes.filter(t => {
    const dataTransacao = new Date(t.data)
    return dataTransacao.getMonth() === mesAtual && dataTransacao.getFullYear() === anoAtual
  })

  const entradasMes = transacoesMes
    .filter(t => t.tipo === 'entrada')
    .reduce((acc, t) => acc + t.valor, 0)

  const saidasMes = transacoesMes
    .filter(t => t.tipo === 'saida')
    .reduce((acc, t) => acc + t.valor, 0)

  const saldoLiquido = entradasMes - saidasMes

  const tarefasPendentes = tarefas.filter((t) => !t.concluida).length
  const tarefasConcluidas = tarefas.filter((t) => t.concluida).length
  const tarefasUrgentes = tarefas.filter((t) => t.prioridade === 'Urgente' && !t.concluida).length
  const projetosEmAndamento = projetos.filter((p) => p.status === 'Andamento').length
  const taxaConclusaoTarefas = tarefas.length > 0 ? Math.round((tarefasConcluidas / tarefas.length) * 100) : 0

  const tarefasOrdenadas = [...tarefas]
    .sort((a, b) => {
      const prioridadeOrder = { Urgente: 3, Alta: 2, Normal: 1 }
      return (prioridadeOrder[b.prioridade as keyof typeof prioridadeOrder] || 0) - 
             (prioridadeOrder[a.prioridade as keyof typeof prioridadeOrder] || 0)
    })
    .slice(0, 3)

  const projetosRecentes = projetos
    .filter(p => p.status === 'Andamento')
    .slice(0, 3)

  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto space-y-8 p-6">
        {/* Header Section */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="p-2 bg-accent-electric/20 rounded-lg border border-accent-electric/30">
              <LayoutDashboard className="w-6 h-6 text-accent-electric" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">Dashboard Empresarial</h1>
          </div>
          <p className="text-gray-400 text-base md:text-lg">
            Visão geral da sua empresa - finanças, projetos e operações
          </p>
        </div>
        
        {/* Financial Overview - Hero Section */}
        <div className="bg-gradient-to-br from-accent-electric/10 via-accent-cyan/5 to-transparent border border-accent-electric/20 rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Fluxo de Caixa */}
            <div className="md:col-span-1 space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="p-3 bg-accent-electric/20 rounded-xl">
                  <Activity className="w-6 h-6 text-accent-electric" />
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Fluxo de Caixa</h3>
                  <p className="text-xs text-gray-500">Saldo Atual</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-extrabold text-white">
                  {formatCurrency(fluxoCaixa)}
                </p>
              </div>
            </div>

            {/* Entradas */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Entradas</h3>
                  <p className="text-xs text-gray-500">Este Mês</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-emerald-400">
                  {formatCurrency(entradasMes)}
                </p>
              </div>
            </div>

            {/* Saídas */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="p-3 bg-red-500/20 rounded-xl">
                  <TrendingDown className="w-6 h-6 text-red-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Saídas</h3>
                  <p className="text-xs text-gray-500">Este Mês</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-red-400">
                  {formatCurrency(saidasMes)}
                </p>
              </div>
            </div>
          </div>

          {/* Saldo Líquido */}
          <div className="mt-6 pt-6 border-t border-card-border/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${saldoLiquido >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                  <DollarSign className={`w-5 h-5 ${saldoLiquido >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-400">Saldo Líquido do Mês</p>
                  <p className={`text-2xl font-bold ${saldoLiquido >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(Math.abs(saldoLiquido))}
                  </p>
                </div>
              </div>
              <Link 
                href="/empresa/financeiro/fluxo-caixa" 
                className="flex items-center gap-2 px-4 py-2 bg-accent-electric/10 hover:bg-accent-electric/20 border border-accent-electric/30 rounded-lg text-accent-electric font-semibold transition-colors"
              >
                Ver Detalhes <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Tarefas Pendentes"
            value={tarefasPendentes}
            icon={Clock}
            subtitle={`${tarefasConcluidas} concluídas`}
            valueColor="text-orange-400"
          />
          <StatCard
            title="Urgentes"
            value={tarefasUrgentes}
            icon={AlertCircle}
            subtitle="Atenção necessária"
            valueColor="text-red-400"
          />
          <StatCard
            title="Projetos Ativos"
            value={projetosEmAndamento}
            icon={FolderKanban}
            subtitle={`${projetos.length} total`}
            valueColor="text-blue-400"
          />
          <StatCard
            title="Ideias"
            value={ideias.length}
            icon={Lightbulb}
            subtitle="Registradas"
            valueColor="text-yellow-400"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Tarefas */}
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <CheckSquare className="w-5 h-5 text-orange-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Tarefas</h2>
              </div>
              <Link href="/empresa/tarefas" className="text-sm text-accent-electric hover:text-accent-cyan font-semibold flex items-center gap-1">
                Ver todas <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-400">Progresso</span>
                <span className="text-sm font-bold text-white">{taxaConclusaoTarefas}%</span>
              </div>
              <div className="w-full bg-dark-black/50 rounded-full h-2">
                <div
                  className="h-full bg-gradient-to-r from-accent-electric to-accent-cyan rounded-full transition-all duration-500"
                  style={{ width: `${taxaConclusaoTarefas}%` }}
                />
              </div>
            </div>

            {/* Task List */}
            {tarefasOrdenadas.length > 0 ? (
              <div className="space-y-3">
                {tarefasOrdenadas.map((tarefa) => (
                  <div
                    key={tarefa.id}
                    className="flex items-center gap-4 p-4 bg-dark-black/40 border border-card-border/30 rounded-lg hover:border-accent-electric/30 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${
                      tarefa.prioridade === 'Urgente' ? 'bg-red-500/20' :
                      tarefa.prioridade === 'Alta' ? 'bg-orange-500/20' :
                      'bg-blue-500/20'
                    }`}>
                      <CheckSquare className={`w-4 h-4 ${
                        tarefa.prioridade === 'Urgente' ? 'text-red-400' :
                        tarefa.prioridade === 'Alta' ? 'text-orange-400' :
                        'text-blue-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm mb-1 truncate">{tarefa.titulo}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{tarefa.categoria}</span>
                        {tarefa.data && (
                          <>
                            <span>•</span>
                            <span>{new Date(tarefa.data).toLocaleDateString('pt-BR')}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      tarefa.prioridade === 'Urgente'
                        ? 'bg-red-500/15 text-red-400'
                        : tarefa.prioridade === 'Alta'
                        ? 'bg-orange-500/15 text-orange-400'
                        : 'bg-blue-500/15 text-blue-400'
                    }`}>
                      {tarefa.prioridade}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">Todas as tarefas concluídas!</p>
              </div>
            )}
          </div>

          {/* Projetos */}
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <FolderKanban className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Projetos em Andamento</h2>
              </div>
              <Link href="/empresa/projetos" className="text-sm text-accent-electric hover:text-accent-cyan font-semibold flex items-center gap-1">
                Ver todos <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            {projetosRecentes.length > 0 ? (
              <div className="space-y-4">
                {projetosRecentes.map((projeto) => {
                  const progresso = projeto.totalEtapas > 0 
                    ? Math.round((projeto.etapasConcluidas / projeto.totalEtapas) * 100) 
                    : 0
                  
                  return (
                    <div
                      key={projeto.id}
                      className="p-4 bg-dark-black/40 border border-card-border/30 rounded-lg hover:border-accent-electric/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm mb-1 truncate">{projeto.nome}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{projeto.etapasConcluidas}/{projeto.totalEtapas} etapas</span>
                            {projeto.cliente && (
                              <>
                                <span>•</span>
                                <span>{projeto.cliente}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-dark-black/50 rounded-full h-1.5 mb-2">
                        <div
                          className="h-full bg-gradient-to-r from-accent-electric to-accent-cyan rounded-full transition-all duration-500"
                          style={{ width: `${progresso}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{progresso}% concluído</span>
                        <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded text-xs font-semibold">
                          {projeto.status}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <FolderKanban className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">Nenhum projeto em andamento</p>
              </div>
            )}
          </div>
        </div>

        {/* Ideias Section */}
        {ideias.length > 0 && (
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Ideias Recentes</h2>
              </div>
              <Link href="/empresa/ideias" className="text-sm text-accent-electric hover:text-accent-cyan font-semibold flex items-center gap-1">
                Ver todas <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ideias.map((ideia, index) => (
                <div
                  key={ideia.id || index}
                  className="p-4 bg-dark-black/40 border border-card-border/30 rounded-lg hover:border-accent-electric/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm mb-1">
                        {typeof ideia === 'string' ? ideia : ideia.titulo || ideia.nome || 'Ideia'}
                      </p>
                      {typeof ideia === 'object' && ideia.descricao && (
                        <p className="text-xs text-gray-400 line-clamp-2">{ideia.descricao}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
