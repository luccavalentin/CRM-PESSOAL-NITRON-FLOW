'use client'

import { useEffect, useMemo } from 'react'
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
  ArrowRight,
  BarChart3,
  PieChart,
  LineChart,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart } from 'recharts'

const COLORS = ['#00D9FF', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

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
  const percentualGeralMetas = totalMetas > 0 ? (totalAtual / totalMetas) * 100 : 0

  // Dados para gráficos
  const dadosFluxoCaixa = useMemo(() => {
    const ultimos6Meses = []
    const hoje = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      const mes = data.toLocaleDateString('pt-BR', { month: 'short' })
      const ano = data.getFullYear()
      
      const entradas = transacoes
        .filter(t => {
          const transacaoData = new Date(t.data)
          return transacaoData.getMonth() === data.getMonth() &&
                 transacaoData.getFullYear() === data.getFullYear() &&
                 t.tipo === 'entrada'
        })
        .reduce((acc, t) => acc + t.valor, 0)
      
      const saidas = transacoes
        .filter(t => {
          const transacaoData = new Date(t.data)
          return transacaoData.getMonth() === data.getMonth() &&
                 transacaoData.getFullYear() === data.getFullYear() &&
                 t.tipo === 'saida'
        })
        .reduce((acc, t) => acc + t.valor, 0)
      
      ultimos6Meses.push({
        mes: `${mes}/${ano}`,
        Entradas: entradas,
        'Contas a Pagar': saidas,
        Saldo: entradas - saidas,
      })
    }
    
    return ultimos6Meses
  }, [transacoes])

  const dadosCategorias = useMemo(() => {
    const categoriasMap = new Map<string, number>()
    
    transacoes
      .filter(t => t.tipo === 'saida')
      .forEach(t => {
        const atual = categoriasMap.get(t.categoria) || 0
        categoriasMap.set(t.categoria, atual + t.valor)
      })
    
    return Array.from(categoriasMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [transacoes])

  const dadosStatusProjetos = useMemo(() => {
    const statusMap = new Map<string, number>()
    
    projetos.forEach(p => {
      const atual = statusMap.get(p.status) || 0
      statusMap.set(p.status, atual + 1)
    })
    
    return Array.from(statusMap.entries()).map(([name, value]) => ({
      name,
      value,
      color: name === 'Em Andamento' ? '#00D9FF' :
             name === 'Concluído' ? '#10B981' :
             name === 'Pausado' ? '#F59E0B' :
             name === 'Cancelado' ? '#EF4444' : '#6B7280'
    }))
  }, [projetos])

  const dadosPrioridadeTarefas = useMemo(() => {
    const prioridades = ['Urgente', 'Alta', 'Média', 'Baixa']
    return prioridades.map(prioridade => ({
      name: prioridade,
      value: tarefas.filter(t => t.prioridade === prioridade && !t.concluida).length,
      color: prioridade === 'Urgente' ? '#EF4444' :
             prioridade === 'Alta' ? '#F59E0B' :
             prioridade === 'Média' ? '#FCD34D' : '#60A5FA'
    }))
  }, [tarefas])

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
      <div className="max-w-[1600px] mx-auto space-y-6 p-4 sm:p-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-br from-accent-electric/20 to-accent-cyan/20 rounded-xl border border-accent-electric/30">
                <User className="w-6 h-6 text-accent-electric" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Dashboard Pessoal</h1>
            </div>
            <p className="text-gray-400 text-sm sm:text-base">
              Visão completa da sua gestão pessoal - finanças, projetos e produtividade
            </p>
          </div>
          <button
            onClick={toggleMostrarValores}
            className="flex items-center gap-2 px-4 py-2 bg-card-bg/80 hover:bg-card-bg border border-card-border/50 rounded-xl transition-all hover:border-accent-electric/50"
            title={mostrarValores ? 'Ocultar valores' : 'Mostrar valores'}
          >
            {mostrarValores ? (
              <Eye className="w-5 h-5 text-accent-electric" />
            ) : (
              <EyeOff className="w-5 h-5 text-gray-400" />
            )}
            <span className="text-sm text-gray-300 hidden sm:inline">
              {mostrarValores ? 'Ocultar' : 'Mostrar'} Valores
            </span>
          </button>
        </div>

        {/* Financial Overview - Hero Section */}
        <div className="bg-gradient-to-br from-accent-electric/10 via-accent-cyan/5 to-transparent border border-accent-electric/20 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <Wallet className="w-5 h-5 text-accent-electric" />
            <h2 className="text-xl font-bold text-white">Visão Financeira</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title="Saldo Atual"
              value={mostrarValores ? formatCurrency(saldoAtual) : '••••••'}
              icon={Wallet}
              valueColor={saldoAtual > 0 ? 'text-emerald-400' : 'text-red-400'}
              className="bg-dark-black/50 border-accent-electric/20"
            />
            <StatCard
              title="Entradas do Mês"
              value={mostrarValores ? formatCurrency(entradasMes) : '••••••'}
              icon={TrendingUp}
              valueColor="text-emerald-400"
              className="bg-dark-black/50 border-accent-electric/20"
            />
            <StatCard
              title="Contas a Pagar do Mês"
              value={mostrarValores ? formatCurrency(saidasMes) : '••••••'}
              icon={TrendingDown}
              valueColor="text-red-400"
              className="bg-dark-black/50 border-accent-electric/20"
            />
            <StatCard
              title="Previsão do Mês"
              value={mostrarValores ? formatCurrency(previsaoMes) : '••••••'}
              icon={Activity}
              valueColor={previsaoMes > 0 ? 'text-emerald-400' : 'text-red-400'}
              className="bg-dark-black/50 border-accent-electric/20"
            />
          </div>
        </div>

        {/* Gráficos Financeiros */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fluxo de Caixa */}
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-accent-electric" />
                <h3 className="text-lg font-bold text-white">Fluxo de Caixa (6 Meses)</h3>
              </div>
              <Link
                href="/pessoal/financeiro/controle"
                className="text-sm text-accent-electric hover:text-accent-cyan transition-colors flex items-center gap-1"
              >
                Ver detalhes <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dadosFluxoCaixa}>
                <defs>
                  <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="mes" stroke="#9CA3AF" fontSize={12} />
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
                <Area type="monotone" dataKey="Entradas" stroke="#10B981" fillOpacity={1} fill="url(#colorEntradas)" />
                <Area type="monotone" dataKey="Contas a Pagar" stroke="#EF4444" fillOpacity={1} fill="url(#colorSaidas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Gastos por Categoria */}
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-accent-electric" />
                <h3 className="text-lg font-bold text-white">Gastos por Categoria</h3>
              </div>
              <Link
                href="/pessoal/financeiro/controle"
                className="text-sm text-accent-electric hover:text-accent-cyan transition-colors flex items-center gap-1"
              >
                Ver detalhes <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {dadosCategorias.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={dadosCategorias}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosCategorias.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-gray-400">Nenhum dado disponível</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Tarefas Pendentes"
            value={tarefasPendentes}
            icon={CheckSquare}
            subtitle={`${tarefasConcluidas} concluídas`}
            valueColor="text-yellow-400"
          />
          <StatCard
            title="Projetos Ativos"
            value={projetosEmAndamento}
            icon={FolderKanban}
            subtitle={`${progressoMedio}% progresso`}
            valueColor="text-blue-400"
          />
          <StatCard
            title="Metas Ativas"
            value={metasAtivas}
            icon={Target}
            subtitle={`${Math.round(percentualGeralMetas)}% completo`}
            valueColor="text-emerald-400"
          />
          <StatCard
            title="Tarefas Urgentes"
            value={tarefasUrgentes}
            icon={AlertCircle}
            valueColor="text-red-400"
            subtitle="Requer atenção"
          />
        </div>

        {/* Gráficos de Produtividade */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status dos Projetos */}
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-accent-electric" />
                <h3 className="text-lg font-bold text-white">Status dos Projetos</h3>
              </div>
              <Link
                href="/pessoal/produtividade/projetos"
                className="text-sm text-accent-electric hover:text-accent-cyan transition-colors flex items-center gap-1"
              >
                Ver todos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {dadosStatusProjetos.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dadosStatusProjetos}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {dadosStatusProjetos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center">
                <p className="text-gray-400">Nenhum projeto cadastrado</p>
              </div>
            )}
          </div>

          {/* Prioridade das Tarefas */}
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-accent-electric" />
                <h3 className="text-lg font-bold text-white">Tarefas por Prioridade</h3>
              </div>
              <Link
                href="/pessoal/produtividade/tarefas"
                className="text-sm text-accent-electric hover:text-accent-cyan transition-colors flex items-center gap-1"
              >
                Ver todas <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {dadosPrioridadeTarefas.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={dadosPrioridadeTarefas}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosPrioridadeTarefas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center">
                <p className="text-gray-400">Nenhuma tarefa pendente</p>
              </div>
            )}
          </div>
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
                className="text-sm text-accent-electric hover:text-accent-cyan transition-colors flex items-center gap-1"
              >
                Ver todas <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {tarefasPrioritarias.length > 0 ? (
              <div className="space-y-3">
                {tarefasPrioritarias.map((tarefa) => (
                  <div
                    key={tarefa.id}
                    className="p-4 bg-dark-black/50 border border-card-border/50 rounded-lg hover:border-accent-electric/30 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{tarefa.titulo}</h3>
                        {tarefa.descricao && (
                          <p className="text-sm text-gray-400 mb-2 line-clamp-1">{tarefa.descricao}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs">
                          <span className={`px-2 py-1 rounded ${
                            tarefa.prioridade === 'Urgente' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            tarefa.prioridade === 'Alta' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                            tarefa.prioridade === 'Média' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {tarefa.prioridade}
                          </span>
                          <span className="text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(tarefa.data).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Nenhuma tarefa prioritária</p>
                <Link
                  href="/pessoal/produtividade/tarefas"
                  className="text-sm text-accent-electric hover:text-accent-cyan mt-2 inline-block"
                >
                  Criar nova tarefa
                </Link>
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
                className="text-sm text-accent-electric hover:text-accent-cyan transition-colors flex items-center gap-1"
              >
                Ver todos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {projetosRecentes.length > 0 ? (
              <div className="space-y-3">
                {projetosRecentes.map((projeto) => (
                  <div
                    key={projeto.id}
                    className="p-4 bg-dark-black/50 border border-card-border/50 rounded-lg hover:border-accent-electric/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{projeto.nome}</h3>
                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{projeto.descricao}</p>
                        <div className="flex items-center gap-3 text-xs mb-2">
                          <span className={`px-2 py-1 rounded ${
                            projeto.status === 'Em Andamento' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            projeto.status === 'Concluído' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            projeto.status === 'Pausado' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}>
                            {projeto.status}
                          </span>
                        </div>
                        <div className="w-full bg-dark-black rounded-full h-2 mb-1">
                          <div
                            className="bg-gradient-to-r from-accent-electric to-accent-cyan h-2 rounded-full transition-all"
                            style={{ width: `${projeto.progresso}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">{projeto.progresso}% concluído</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FolderKanban className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Nenhum projeto recente</p>
                <Link
                  href="/pessoal/produtividade/projetos"
                  className="text-sm text-accent-electric hover:text-accent-cyan mt-2 inline-block"
                >
                  Criar novo projeto
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Últimas Transações e Metas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Últimas Transações */}
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent-electric" />
                Últimas Transações
              </h2>
              <Link
                href="/pessoal/financeiro/controle"
                className="text-sm text-accent-electric hover:text-accent-cyan transition-colors flex items-center gap-1"
              >
                Ver todas <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {ultimasTransacoes.length > 0 ? (
              <div className="space-y-3">
                {ultimasTransacoes.map((transacao) => (
                  <div
                    key={transacao.id}
                    className="flex items-center justify-between p-4 bg-dark-black/50 border border-card-border/50 rounded-lg hover:border-accent-electric/30 transition-all"
                  >
                    <div className="flex-1">
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
                      {mostrarValores ? formatCurrency(transacao.valor) : '••••'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Wallet className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Nenhuma transação registrada</p>
                <Link
                  href="/pessoal/financeiro/controle"
                  className="text-sm text-accent-electric hover:text-accent-cyan mt-2 inline-block"
                >
                  Registrar transação
                </Link>
              </div>
            )}
          </div>

          {/* Metas Financeiras */}
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-accent-electric" />
                Metas Financeiras
              </h2>
              <Link
                href="/pessoal/financeiro/objetivos"
                className="text-sm text-accent-electric hover:text-accent-cyan transition-colors flex items-center gap-1"
              >
                Ver todas <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {metas.length > 0 ? (
              <div className="space-y-4">
                {metas.slice(0, 3).map((meta) => {
                  const percentual = meta.valorMeta > 0
                    ? Math.min((meta.valorAtual / meta.valorMeta) * 100, 100)
                    : 0
                  const isCompleta = meta.valorAtual >= meta.valorMeta
                  return (
                    <div
                      key={meta.id}
                      className={`p-4 bg-dark-black/50 border rounded-lg ${
                        isCompleta ? 'border-emerald-500/30' : 'border-card-border/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-white font-semibold">{meta.descricao}</h3>
                        {isCompleta && (
                          <span className="text-emerald-400 text-xs font-bold">✓ Completa</span>
                        )}
                      </div>
                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">
                            {mostrarValores ? formatCurrency(meta.valorAtual) : '••••'} / {mostrarValores ? formatCurrency(meta.valorMeta) : '••••'}
                          </span>
                          <span className={`font-semibold ${
                            isCompleta ? 'text-emerald-400' : 'text-accent-electric'
                          }`}>
                            {Math.round(percentual)}%
                          </span>
                        </div>
                        <div className="w-full bg-dark-black rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isCompleta
                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                                : 'bg-gradient-to-r from-accent-electric to-accent-cyan'
                            }`}
                            style={{ width: `${percentual}%` }}
                          />
                        </div>
                      </div>
                      {meta.dataLimite && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Prazo: {new Date(meta.dataLimite).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Nenhuma meta cadastrada</p>
                <Link
                  href="/pessoal/financeiro/objetivos"
                  className="text-sm text-accent-electric hover:text-accent-cyan mt-2 inline-block"
                >
                  Criar nova meta
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
