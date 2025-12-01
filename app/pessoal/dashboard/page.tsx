'use client'

import { useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import StatCard from '@/components/ui/StatCard'
import { useFinancasPessoaisStore } from '@/stores/financasPessoaisStore'
import { useProjetosPessoaisStore } from '@/stores/projetosPessoaisStore'
import { useTarefasStore } from '@/stores/tarefasStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { formatCurrency } from '@/utils/formatCurrency'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CheckSquare,
  FolderKanban,
  Target,
  Eye,
  EyeOff,
  User,
  Activity,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPessoalPage() {
  const transacoes = useFinancasPessoaisStore((state) => state.transacoes)
  const saldoAtual = useFinancasPessoaisStore((state) => state.saldoAtual)
  const metas = useFinancasPessoaisStore((state) => state.metas)
  const calcularSaldo = useFinancasPessoaisStore((state) => state.calcularSaldo)
  const getEntradasMes = useFinancasPessoaisStore((state) => state.getEntradasMes)
  const getSaidasMes = useFinancasPessoaisStore((state) => state.getSaidasMes)
  const getPrevisaoMes = useFinancasPessoaisStore((state) => state.getPrevisaoMes)
  
  const projetos = useProjetosPessoaisStore((state) => state.projetos)
  const tarefas = useTarefasStore((state) => state.tarefas)
  
  const mostrarValores = usePreferencesStore((state) => state.mostrarValores)
  const toggleMostrarValores = usePreferencesStore((state) => state.toggleMostrarValores)

  useEffect(() => {
    calcularSaldo()
  }, [transacoes, calcularSaldo])

  const entradasMes = getEntradasMes()
  const saidasMes = getSaidasMes()
  const previsaoMes = getPrevisaoMes()

  // Estatísticas de tarefas
  const hoje = new Date().toISOString().split('T')[0]
  const tarefasHoje = tarefas.filter(t => t.data === hoje)
  const tarefasPendentes = tarefas.filter(t => !t.concluida).length
  const tarefasConcluidas = tarefas.filter(t => t.concluida).length
  const tarefasUrgentes = tarefas.filter(t => t.prioridade === 'Urgente' && !t.concluida).length
  const taxaConclusao = tarefas.length > 0 ? Math.round((tarefasConcluidas / tarefas.length) * 100) : 0

  // Estatísticas de projetos
  const projetosEmAndamento = projetos.filter(p => p.status === 'Em Andamento').length
  const projetosConcluidos = projetos.filter(p => p.status === 'Concluído').length
  const projetosPausados = projetos.filter(p => p.status === 'Pausado').length
  const progressoMedio = projetos.length > 0
    ? Math.round(projetos.reduce((acc, p) => acc + p.progresso, 0) / projetos.length)
    : 0

  // Estatísticas de metas
  const metasAtivas = metas.filter(m => {
    if (m.dataLimite) {
      return new Date(m.dataLimite) >= new Date()
    }
    return true
  }).length
  const metasCompletas = metas.filter(m => m.valorAtual >= m.valorMeta).length
  const totalMetas = metas.reduce((acc, m) => acc + m.valorMeta, 0)
  const totalAtual = metas.reduce((acc, m) => acc + m.valorAtual, 0)

  // Últimas transações
  const ultimasTransacoes = [...transacoes]
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 5)

  // Projetos recentes
  const projetosRecentes = [...projetos]
    .sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime())
    .slice(0, 3)

  // Tarefas prioritárias
  const tarefasPrioritarias = [...tarefas]
    .filter(t => !t.concluida)
    .sort((a, b) => {
      const prioridadeOrder = { Urgente: 4, Alta: 3, Média: 2, Baixa: 1 }
      return (prioridadeOrder[b.prioridade as keyof typeof prioridadeOrder] || 0) - 
             (prioridadeOrder[a.prioridade as keyof typeof prioridadeOrder] || 0)
    })
    .slice(0, 5)

  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto space-y-8 p-6">
        {/* Header Section */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="p-2 bg-accent-electric/20 rounded-lg border border-accent-electric/30">
              <User className="w-6 h-6 text-accent-electric" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">Dashboard Pessoal</h1>
            <button
              onClick={toggleMostrarValores}
              className="p-2 hover:bg-card-bg/50 rounded-lg transition-colors border border-card-border/50 hover:border-accent-electric/50"
              title={mostrarValores ? 'Ocultar valores' : 'Mostrar valores'}
            >
              {mostrarValores ? (
                <Eye className="w-5 h-5 text-accent-electric" />
              ) : (
                <EyeOff className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
          <p className="text-gray-400 text-base md:text-lg">
            Visão geral da sua gestão pessoal - finanças, projetos e produtividade
          </p>
        </div>

        {/* Financial Overview - Hero Section */}
        <div className="bg-gradient-to-br from-accent-electric/10 via-accent-cyan/5 to-transparent border border-accent-electric/20 rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Saldo Atual"
              value={formatCurrency(saldoAtual)}
              icon={Wallet}
              trend={{
                value: saldoAtual > 0 ? 10 : -10,
                isPositive: saldoAtual > 0,
              }}
              valueColor={saldoAtual > 0 ? 'text-emerald-400' : 'text-red-400'}
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
              icon={Activity}
              valueColor={previsaoMes > 0 ? 'text-emerald-400' : 'text-red-400'}
            />
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Tarefas Pendentes"
            value={tarefasPendentes}
            icon={CheckSquare}
            subtitle={`${tarefasConcluidas} concluídas`}
          />
          <StatCard
            title="Projetos Ativos"
            value={projetosEmAndamento}
            icon={FolderKanban}
            subtitle={`${progressoMedio}% progresso médio`}
          />
          <StatCard
            title="Metas Ativas"
            value={metasAtivas}
            icon={Target}
            subtitle={`${metasCompletas} completas`}
          />
          <StatCard
            title="Tarefas Urgentes"
            value={tarefasUrgentes}
            icon={AlertCircle}
            valueColor="text-red-400"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tarefas Prioritárias */}
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-accent-electric" />
                Tarefas Prioritárias
              </h2>
              <Link
                href="/pessoal/produtividade/tarefas"
                className="text-sm text-accent-electric hover:text-accent-cyan transition-colors"
              >
                Ver todas
              </Link>
            </div>
            {tarefasPrioritarias.length > 0 ? (
              <div className="space-y-3">
                {tarefasPrioritarias.map((tarefa) => (
                  <div
                    key={tarefa.id}
                    className="p-4 bg-dark-black/50 border border-card-border/50 rounded-lg hover:border-accent-electric/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{tarefa.titulo}</h3>
                        {tarefa.descricao && (
                          <p className="text-sm text-gray-400 mb-2">{tarefa.descricao}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs">
                          <span className={`px-2 py-1 rounded ${
                            tarefa.prioridade === 'Urgente' ? 'bg-red-500/20 text-red-400' :
                            tarefa.prioridade === 'Alta' ? 'bg-orange-500/20 text-orange-400' :
                            tarefa.prioridade === 'Média' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {tarefa.prioridade}
                          </span>
                          <span className="text-gray-500">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {new Date(tarefa.data).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckSquare className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400">Nenhuma tarefa prioritária</p>
              </div>
            )}
          </div>

          {/* Projetos Recentes */}
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-accent-electric" />
                Projetos Recentes
              </h2>
              <Link
                href="/pessoal/produtividade/projetos"
                className="text-sm text-accent-electric hover:text-accent-cyan transition-colors"
              >
                Ver todos
              </Link>
            </div>
            {projetosRecentes.length > 0 ? (
              <div className="space-y-3">
                {projetosRecentes.map((projeto) => (
                  <div
                    key={projeto.id}
                    className="p-4 bg-dark-black/50 border border-card-border/50 rounded-lg hover:border-accent-electric/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{projeto.nome}</h3>
                        <p className="text-sm text-gray-400 mb-3">{projeto.descricao}</p>
                        <div className="flex items-center gap-3 text-xs mb-2">
                          <span className={`px-2 py-1 rounded ${
                            projeto.status === 'Em Andamento' ? 'bg-blue-500/20 text-blue-400' :
                            projeto.status === 'Concluído' ? 'bg-emerald-500/20 text-emerald-400' :
                            projeto.status === 'Pausado' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {projeto.status}
                          </span>
                        </div>
                        <div className="w-full bg-dark-black rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-accent-electric to-accent-cyan h-2 rounded-full transition-all"
                            style={{ width: `${projeto.progresso}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{projeto.progresso}% concluído</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FolderKanban className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400">Nenhum projeto recente</p>
              </div>
            )}
          </div>
        </div>

        {/* Últimas Transações */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent-electric" />
              Últimas Transações
            </h2>
            <Link
              href="/pessoal/financeiro/controle"
              className="text-sm text-accent-electric hover:text-accent-cyan transition-colors"
            >
              Ver todas
            </Link>
          </div>
          {ultimasTransacoes.length > 0 ? (
            <div className="space-y-3">
              {ultimasTransacoes.map((transacao) => (
                <div
                  key={transacao.id}
                  className="flex items-center justify-between p-4 bg-dark-black/50 border border-card-border/50 rounded-lg hover:border-accent-electric/30 transition-colors"
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
                        ? 'text-emerald-400'
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
            <div className="text-center py-8">
              <Wallet className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400">Nenhuma transação registrada</p>
            </div>
          )}
        </div>

        {/* Metas Financeiras */}
        {metas.length > 0 && (
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-accent-electric" />
                Metas Financeiras
              </h2>
              <Link
                href="/pessoal/financeiro/objetivos"
                className="text-sm text-accent-electric hover:text-accent-cyan transition-colors"
              >
                Ver todas
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metas.slice(0, 3).map((meta) => {
                const percentual = meta.valorMeta > 0
                  ? Math.min((meta.valorAtual / meta.valorMeta) * 100, 100)
                  : 0
                return (
                  <div
                    key={meta.id}
                    className="p-4 bg-dark-black/50 border border-card-border/50 rounded-lg"
                  >
                    <h3 className="text-white font-semibold mb-2">{meta.descricao}</h3>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">
                          {formatCurrency(meta.valorAtual)} / {formatCurrency(meta.valorMeta)}
                        </span>
                        <span className="text-accent-electric font-semibold">
                          {Math.round(percentual)}%
                        </span>
                      </div>
                      <div className="w-full bg-dark-black rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-accent-electric to-accent-cyan h-2 rounded-full transition-all"
                          style={{ width: `${percentual}%` }}
                        />
                      </div>
                    </div>
                    {meta.dataLimite && (
                      <p className="text-xs text-gray-500">
                        Prazo: {new Date(meta.dataLimite).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

