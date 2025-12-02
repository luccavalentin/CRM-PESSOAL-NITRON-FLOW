'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import DateInput from '@/components/ui/DateInput'
import { useAcordosStore, Divida, Acordo, ParcelaAcordo, loadAcordosFromSupabase } from '@/stores/acordosStore'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDateForInput } from '@/utils/formatDate'
import { 
  Plus, 
  DollarSign, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  TrendingDown, 
  FileText, 
  Percent, 
  CreditCard, 
  X, 
  BarChart3,
  Edit2,
  Trash2,
  Users,
  Target,
  TrendingUp,
  Clock,
  ArrowRight,
  PieChart,
  LineChart
} from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart } from 'recharts'

const COLORS = ['#00D9FF', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

export default function AcordoPage() {
  const {
    dividas,
    acordos,
    addDivida,
    updateDivida,
    deleteDivida,
    addAcordo,
    updateAcordo,
    deleteAcordo,
    marcarParcelaComoPaga,
    getTotalDividas,
    getTotalAcordos,
    getValorTotalEconomizado,
    getProximoVencimento,
  } = useAcordosStore()

  const [isDividaModalOpen, setIsDividaModalOpen] = useState(false)
  const [isAcordoModalOpen, setIsAcordoModalOpen] = useState(false)
  const [editingDivida, setEditingDivida] = useState<Divida | null>(null)
  const [dividaParaAcordo, setDividaParaAcordo] = useState<Divida | null>(null)
  const [filtroStatus, setFiltroStatus] = useState<'todas' | 'ativas' | 'renegociadas' | 'quitadas'>('todas')
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [valorAcordoPreview, setValorAcordoPreview] = useState<number>(0)
  const [isSimulacaoModalOpen, setIsSimulacaoModalOpen] = useState(false)
  const [dividaParaSimulacao, setDividaParaSimulacao] = useState<Divida | null>(null)
  const [simulacaoResultado, setSimulacaoResultado] = useState<{
    valorTotal: number
    valorParcela: number
    economia: number
    percentualEconomia: number
    totalJuros: number
    prazoMeses: number
  } | null>(null)

  // Carregar dados do Supabase ao montar o componente
  useEffect(() => {
    loadAcordosFromSupabase()
  }, [])

  const dividasFiltradas = useMemo(() => {
    let filtradas = [...dividas]

    if (filtroStatus === 'ativas') {
      filtradas = filtradas.filter(d => d.status === 'ativa')
    } else if (filtroStatus === 'renegociadas') {
      filtradas = filtradas.filter(d => d.status === 'renegociada')
    } else if (filtroStatus === 'quitadas') {
      filtradas = filtradas.filter(d => d.status === 'quitada')
    }

    if (filtroTipo !== 'todos') {
      filtradas = filtradas.filter(d => d.tipoDivida === filtroTipo)
    }

    return filtradas.sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime())
  }, [dividas, filtroStatus, filtroTipo])

  const acordosAtivos = useMemo(() => {
    return acordos.filter(a => a.status === 'ativo')
  }, [acordos])

  const totalDividas = getTotalDividas()
  const totalAcordos = getTotalAcordos()
  const valorEconomizado = getValorTotalEconomizado()
  const proximoVencimento = getProximoVencimento()

  // Dívidas vencidas
  const dividasVencidas = useMemo(() => {
    const hoje = new Date()
    return dividasFiltradas.filter(d => 
      d.status === 'ativa' && new Date(d.dataVencimento) < hoje
    )
  }, [dividasFiltradas])

  const valorTotalVencido = useMemo(() => {
    return dividasVencidas.reduce((acc, d) => acc + d.valorAtual, 0)
  }, [dividasVencidas])

  // Projeção de quitação
  const projecaoQuitacao = useMemo(() => {
    const acordosAtivosComParcelas = acordos
      .filter(a => a.status === 'ativo')
      .flatMap(a => a.parcelas.filter(p => !p.paga).map(p => ({
        dataVencimento: p.dataVencimento,
        valor: p.valor,
        acordoId: a.id
      })))
      .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime())

    if (acordosAtivosComParcelas.length === 0) return null

    const ultimaParcela = acordosAtivosComParcelas[acordosAtivosComParcelas.length - 1]
    const valorRestante = acordosAtivosComParcelas.reduce((acc, p) => acc + p.valor, 0)

    return {
      data: ultimaParcela.dataVencimento,
      valorRestante
    }
  }, [acordos])

  const handleSubmitDivida = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novaDivida: Omit<Divida, 'id' | 'dataCriacao'> = {
      descricao: (formData.get('descricao') as string) || 'Sem descrição',
      credor: (formData.get('credor') as string) || 'Não informado',
      valorOriginal: parseFloat(formData.get('valorOriginal') as string) || 0,
      valorAtual: parseFloat(formData.get('valorAtual') as string) || parseFloat(formData.get('valorOriginal') as string) || 0,
      dataVencimento: (formData.get('dataVencimento') as string) || formatDateForInput(),
      taxaJurosOriginal: formData.get('taxaJurosOriginal') ? parseFloat(formData.get('taxaJurosOriginal') as string) : undefined,
      tipoDivida: (formData.get('tipoDivida') as Divida['tipoDivida']) || 'outros',
      observacoes: formData.get('observacoes') as string || undefined,
      status: editingDivida?.status || 'ativa',
    }

    if (editingDivida) {
      updateDivida(editingDivida.id, novaDivida)
    } else {
      addDivida(novaDivida)
    }

    setIsDividaModalOpen(false)
    setEditingDivida(null)
  }, [editingDivida, addDivida, updateDivida])

  const handleSubmitAcordo = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!dividaParaAcordo) return

    const formData = new FormData(e.currentTarget)
    const valorTotal = parseFloat(formData.get('valorTotal') as string) || dividaParaAcordo.valorAtual
    const numeroParcelas = parseInt(formData.get('numeroParcelas') as string) || 1
    const taxaJuros = formData.get('taxaJuros') ? parseFloat(formData.get('taxaJuros') as string) : undefined
    const taxaDesconto = formData.get('taxaDesconto') ? parseFloat(formData.get('taxaDesconto') as string) : undefined
    const dataInicio = (formData.get('dataInicio') as string) || formatDateForInput()

    const novoAcordo: Omit<Acordo, 'id' | 'dataCriacao' | 'parcelas'> = {
      dividaId: dividaParaAcordo.id,
      descricao: `Acordo: ${dividaParaAcordo.descricao}`,
      valorTotal,
      valorOriginal: dividaParaAcordo.valorAtual,
      numeroParcelas,
      taxaJuros,
      taxaDesconto,
      dataInicio,
      observacoes: formData.get('observacoes') as string || undefined,
      status: 'ativo',
    }

    addAcordo(novoAcordo)
    setIsAcordoModalOpen(false)
    setDividaParaAcordo(null)
    setValorAcordoPreview(0)
  }, [dividaParaAcordo, addAcordo])

  const handleDeleteDivida = useCallback((id: string) => {
    if (confirm('Tem certeza que deseja excluir esta dívida? Todos os acordos relacionados também serão excluídos.')) {
      deleteDivida(id)
    }
  }, [deleteDivida])

  const handleDeleteAcordo = useCallback((id: string) => {
    if (confirm('Tem certeza que deseja excluir este acordo? A dívida voltará ao status original.')) {
      deleteAcordo(id)
    }
  }, [deleteAcordo])

  // Dados para gráficos
  const dadosDividasPorTipo = useMemo(() => {
    const tipos = new Map<string, number>()
    dividasFiltradas.forEach(d => {
      const atual = tipos.get(d.tipoDivida) || 0
      tipos.set(d.tipoDivida, atual + d.valorAtual)
    })
    return Array.from(tipos.entries()).map(([name, value]) => ({ name, value }))
  }, [dividasFiltradas])

  const dadosEvolucaoAcordos = useMemo(() => {
    const meses = new Map<string, { mes: string; valor: number; economizado: number }>()
    
    acordos.forEach(a => {
      const data = new Date(a.dataCriacao)
      const mes = `${data.getMonth() + 1}/${data.getFullYear()}`
      const atual = meses.get(mes) || { mes, valor: 0, economizado: 0 }
      atual.valor += a.valorTotal
      atual.economizado += (a.valorOriginal - a.valorTotal)
      meses.set(mes, atual)
    })

    return Array.from(meses.values()).sort((a, b) => {
      const [mesA, anoA] = a.mes.split('/').map(Number)
      const [mesB, anoB] = b.mes.split('/').map(Number)
      return anoA - anoB || mesA - mesB
    })
  }, [acordos])

  const tiposDivida = [
    { value: 'todos', label: 'Todos os Tipos' },
    { value: 'cartao', label: 'Cartão de Crédito' },
    { value: 'emprestimo', label: 'Empréstimo' },
    { value: 'financiamento', label: 'Financiamento' },
    { value: 'outros', label: 'Outros' },
  ]

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Users className="w-8 h-8 text-accent-electric" />
              Acordos e Renegociações
            </h1>
            <p className="text-gray-400">Mapeie suas dívidas e renegocie com condições melhores</p>
          </div>
          <Button
            onClick={() => {
              setEditingDivida(null)
              setIsDividaModalOpen(true)
            }}
            className="flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nova Dívida
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Total de Dívidas"
            value={formatCurrency(totalDividas)}
            icon={TrendingDown}
            valueColor="text-red-400"
            className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20"
            subtitle={dividasVencidas.length > 0 ? `${dividasVencidas.length} vencida(s)` : undefined}
          />
          <StatCard
            title="Total em Acordos"
            value={formatCurrency(totalAcordos)}
            icon={Users}
            valueColor="text-orange-400"
            className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20"
            subtitle={acordosAtivos.length > 0 ? `${acordosAtivos.length} ativo(s)` : undefined}
          />
          <StatCard
            title="Valor Economizado"
            value={formatCurrency(valorEconomizado)}
            icon={TrendingUp}
            valueColor="text-emerald-400"
            className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20"
            subtitle={valorEconomizado > 0 ? `${((valorEconomizado / totalDividas) * 100).toFixed(1)}% do total` : undefined}
          />
          <StatCard
            title="Próximo Vencimento"
            value={proximoVencimento 
              ? `${formatCurrency(proximoVencimento.valor)} - ${new Date(proximoVencimento.dataVencimento).toLocaleDateString('pt-BR')}`
              : 'Nenhum'
            }
            icon={Clock}
            valueColor={proximoVencimento ? 'text-yellow-400' : 'text-gray-400'}
            className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20"
          />
        </div>

        {/* Cards Adicionais de Mapeamento */}
        {dividasVencidas.length > 0 && (
          <div className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <div>
                <p className="text-red-400 font-semibold">Atenção: {dividasVencidas.length} dívida(s) vencida(s)</p>
                <p className="text-gray-300 text-sm">Valor total vencido: {formatCurrency(valorTotalVencido)}</p>
              </div>
            </div>
          </div>
        )}

        {projecaoQuitacao && (
          <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-blue-400 font-semibold">Projeção de Quitação</p>
                <p className="text-gray-300 text-sm">
                  Previsão: {new Date(projecaoQuitacao.data).toLocaleDateString('pt-BR')} - 
                  Restante: {formatCurrency(projecaoQuitacao.valorRestante)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20"
              >
                <option value="todas">Todas</option>
                <option value="ativas">Ativas</option>
                <option value="renegociadas">Renegociadas</option>
                <option value="quitadas">Quitadas</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Dívida</label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20"
              >
                {tiposDivida.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Pizza - Dívidas por Tipo */}
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-accent-electric" />
              Dívidas por Tipo
            </h3>
            {dadosDividasPorTipo.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={dadosDividasPorTipo}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosDividasPorTipo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-gray-400">Nenhum dado disponível</p>
              </div>
            )}
          </div>

          {/* Gráfico de Linha - Evolução de Acordos */}
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <LineChart className="w-5 h-5 text-accent-electric" />
              Evolução de Acordos
            </h3>
            {dadosEvolucaoAcordos.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={dadosEvolucaoAcordos}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="mes" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="valor" stroke="#00D9FF" strokeWidth={2} name="Valor Total" />
                  <Line type="monotone" dataKey="economizado" stroke="#10B981" strokeWidth={2} name="Economizado" />
                </RechartsLineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-gray-400">Nenhum dado disponível</p>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Dívidas */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent-electric" />
              Dívidas ({dividasFiltradas.length})
            </h2>
          </div>

          {dividasFiltradas.length > 0 ? (
            <div className="space-y-4">
              {dividasFiltradas.map((divida) => {
                const acordoRelacionado = acordos.find(a => a.dividaId === divida.id && a.status === 'ativo')
                const isVencida = new Date(divida.dataVencimento) < new Date() && divida.status === 'ativa'

                return (
                  <div
                    key={divida.id}
                    className={`p-6 rounded-2xl transition-all duration-300 border-2 ${
                      divida.status === 'quitada'
                        ? 'bg-gradient-to-br from-emerald-900/30 via-emerald-800/20 to-emerald-900/10 border-emerald-500/40 opacity-80'
                        : isVencida
                        ? 'bg-gradient-to-br from-red-900/30 via-red-800/20 to-red-900/10 border-red-500/60'
                        : divida.status === 'renegociada'
                        ? 'bg-gradient-to-br from-orange-900/20 via-dark-black/60 to-dark-black/40 border-orange-500/30'
                        : 'bg-gradient-to-br from-red-900/20 via-dark-black/60 to-dark-black/40 border-red-500/30'
                    } hover:shadow-xl hover:scale-[1.02]`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <h3 className="text-xl font-bold text-white">{divida.descricao}</h3>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                            divida.status === 'quitada'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : divida.status === 'renegociada'
                              ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                              : 'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}>
                            {divida.status === 'quitada' ? 'Quitada' : divida.status === 'renegociada' ? 'Renegociada' : 'Ativa'}
                          </span>
                          {isVencida && (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1 animate-pulse">
                              <AlertCircle className="w-3 h-3" />
                              Vencida
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Credor</p>
                            <p className="text-white font-semibold">{divida.credor}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Valor Original</p>
                            <p className="text-white font-semibold">{formatCurrency(divida.valorOriginal)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Valor Atual</p>
                            <p className={`font-semibold ${divida.valorAtual < divida.valorOriginal ? 'text-emerald-400' : 'text-red-400'}`}>
                              {formatCurrency(divida.valorAtual)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Vencimento</p>
                            <p className="text-white font-semibold">
                              {new Date(divida.dataVencimento).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        {divida.observacoes && (
                          <p className="text-gray-400 text-sm mt-3">{divida.observacoes}</p>
                        )}
                        {acordoRelacionado && (
                          <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="w-4 h-4 text-orange-400" />
                              <span className="text-sm font-semibold text-orange-400">Acordo Ativo</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                              <div>
                                <p className="text-gray-400">Valor Total</p>
                                <p className="text-white">{formatCurrency(acordoRelacionado.valorTotal)}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Parcelas</p>
                                <p className="text-white">{acordoRelacionado.numeroParcelas}x</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Pagas</p>
                                <p className="text-white">
                                  {acordoRelacionado.parcelas.filter(p => p.paga).length}/{acordoRelacionado.numeroParcelas}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400">Economia</p>
                                <p className="text-emerald-400">
                                  {formatCurrency((acordoRelacionado.valorOriginal || 0) - acordoRelacionado.valorTotal)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {divida.status === 'ativa' && !acordoRelacionado && (
                          <Button
                            onClick={() => {
                              setDividaParaAcordo(divida)
                              setIsAcordoModalOpen(true)
                            }}
                            variant="primary"
                            className="flex items-center gap-2"
                          >
                            <Users className="w-4 h-4" />
                            Criar Acordo
                          </Button>
                        )}
                        <Button
                          onClick={() => {
                            setEditingDivida(divida)
                            setIsDividaModalOpen(true)
                          }}
                          variant="secondary"
                          className="flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Editar
                        </Button>
                        <Button
                          onClick={() => handleDeleteDivida(divida.id)}
                          variant="danger"
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhuma dívida cadastrada</p>
              <p className="text-gray-500 text-sm mt-1">Adicione suas dívidas para começar a mapear e renegociar</p>
            </div>
          )}
        </div>

        {/* Lista de Acordos Ativos */}
        {acordosAtivos.length > 0 && (
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-accent-electric" />
              Acordos Ativos ({acordosAtivos.length})
            </h2>
            <div className="space-y-4">
              {acordosAtivos.map((acordo) => {
                const divida = dividas.find(d => d.id === acordo.dividaId)
                const parcelasPagas = acordo.parcelas.filter(p => p.paga).length
                const progresso = (parcelasPagas / acordo.numeroParcelas) * 100

                return (
                  <div
                    key={acordo.id}
                    className="p-6 rounded-2xl bg-gradient-to-br from-orange-900/20 via-dark-black/60 to-dark-black/40 border-2 border-orange-500/30 hover:border-orange-400/50"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{acordo.descricao}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Valor Original</p>
                            <p className="text-white font-semibold">{formatCurrency(acordo.valorOriginal)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Valor do Acordo</p>
                            <p className="text-emerald-400 font-semibold">{formatCurrency(acordo.valorTotal)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Economia</p>
                            <p className="text-emerald-400 font-semibold">
                              {formatCurrency(acordo.valorOriginal - acordo.valorTotal)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Parcelas</p>
                            <p className="text-white font-semibold">
                              {parcelasPagas}/{acordo.numeroParcelas}
                            </p>
                          </div>
                        </div>
                        {acordo.taxaJuros && (
                          <p className="text-sm text-gray-400 mt-2">
                            Taxa de Juros: {acordo.taxaJuros}% ao mês
                          </p>
                        )}
                        {acordo.taxaDesconto && (
                          <p className="text-sm text-emerald-400 mt-2">
                            Desconto: {acordo.taxaDesconto}%
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDeleteAcordo(acordo.id)}
                          variant="danger"
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Cancelar
                        </Button>
                      </div>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Progresso</span>
                        <span className="text-sm font-semibold text-white">{progresso.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-dark-black rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${progresso}%` }}
                        />
                      </div>
                    </div>

                    {/* Parcelas */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-white mb-2">Parcelas:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {acordo.parcelas.map((parcela) => {
                          const isVencida = new Date(parcela.dataVencimento) < new Date() && !parcela.paga
                          return (
                            <div
                              key={parcela.id}
                              className={`p-3 rounded-lg border ${
                                parcela.paga
                                  ? 'bg-emerald-500/10 border-emerald-500/30'
                                  : isVencida
                                  ? 'bg-red-500/10 border-red-500/30'
                                  : 'bg-dark-black/30 border-card-border/50'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-white">Parcela {parcela.numero}</span>
                                <button
                                  onClick={() => marcarParcelaComoPaga(acordo.id, parcela.id)}
                                  className={`p-1 rounded ${
                                    parcela.paga
                                      ? 'bg-emerald-500/20 text-emerald-400'
                                      : 'bg-gray-700/50 text-gray-400 hover:bg-emerald-500/20 hover:text-emerald-400'
                                  } transition-colors`}
                                  title={parcela.paga ? 'Marcar como não paga' : 'Marcar como paga'}
                                >
                                  {parcela.paga ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                  ) : (
                                    <div className="w-4 h-4 border-2 border-current rounded-full" />
                                  )}
                                </button>
                              </div>
                              <p className="text-lg font-bold text-white mb-1">{formatCurrency(parcela.valor)}</p>
                              <p className={`text-xs ${isVencida && !parcela.paga ? 'text-red-400' : 'text-gray-400'}`}>
                                {new Date(parcela.dataVencimento).toLocaleDateString('pt-BR')}
                              </p>
                              {parcela.paga && parcela.dataPagamento && (
                                <p className="text-xs text-emerald-400 mt-1">
                                  Paga em {new Date(parcela.dataPagamento).toLocaleDateString('pt-BR')}
                                </p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Modal de Dívida */}
        <Modal
          isOpen={isDividaModalOpen}
          onClose={() => {
            setIsDividaModalOpen(false)
            setEditingDivida(null)
          }}
          title={editingDivida ? 'Editar Dívida' : 'Nova Dívida'}
          description={editingDivida ? 'Atualize os dados da dívida' : 'Cadastre uma nova dívida para mapear e renegociar'}
        >
          <form onSubmit={handleSubmitDivida} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
              <input
                type="text"
                name="descricao"
                defaultValue={editingDivida?.descricao}
                required
                className="w-full px-4 py-2.5 bg-dark-black border border-card-border rounded-lg text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20"
                placeholder="Ex: Cartão de Crédito Nubank"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Credor</label>
              <input
                type="text"
                name="credor"
                defaultValue={editingDivida?.credor}
                required
                className="w-full px-4 py-2.5 bg-dark-black border border-card-border rounded-lg text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20"
                placeholder="Ex: Banco Nubank"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Valor Original</label>
                <input
                  type="number"
                  name="valorOriginal"
                  step="0.01"
                  defaultValue={editingDivida?.valorOriginal}
                  required
                  className="w-full px-4 py-2.5 bg-dark-black border border-card-border rounded-lg text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Valor Atual</label>
                <input
                  type="number"
                  name="valorAtual"
                  step="0.01"
                  defaultValue={editingDivida?.valorAtual}
                  required
                  className="w-full px-4 py-2.5 bg-dark-black border border-card-border rounded-lg text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Dívida</label>
                <select
                  name="tipoDivida"
                  defaultValue={editingDivida?.tipoDivida || 'outros'}
                  required
                  className="w-full px-4 py-2.5 bg-dark-black border border-card-border rounded-lg text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20"
                >
                  <option value="cartao">Cartão de Crédito</option>
                  <option value="emprestimo">Empréstimo</option>
                  <option value="financiamento">Financiamento</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Data de Vencimento</label>
                <DateInput
                  name="dataVencimento"
                  defaultValue={editingDivida?.dataVencimento}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Taxa de Juros Original (% ao mês)</label>
                <input
                  type="number"
                  name="taxaJurosOriginal"
                  step="0.01"
                  defaultValue={editingDivida?.taxaJurosOriginal}
                  className="w-full px-4 py-2.5 bg-dark-black border border-card-border rounded-lg text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20"
                  placeholder="Ex: 2.5"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Observações</label>
              <textarea
                name="observacoes"
                defaultValue={editingDivida?.observacoes}
                rows={3}
                className="w-full px-4 py-2.5 bg-dark-black border border-card-border rounded-lg text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20"
                placeholder="Informações adicionais sobre a dívida..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsDividaModalOpen(false)
                  setEditingDivida(null)
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                {editingDivida ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal de Acordo */}
        <Modal
          isOpen={isAcordoModalOpen}
          onClose={() => {
            setIsAcordoModalOpen(false)
            setDividaParaAcordo(null)
            setValorAcordoPreview(0)
          }}
          title="Criar Acordo de Renegociação"
          description={dividaParaAcordo ? `Renegocie a dívida: ${dividaParaAcordo.descricao}` : 'Configure as condições do acordo'}
        >
          {dividaParaAcordo && (
            <form onSubmit={handleSubmitAcordo} className="space-y-4">
              <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg mb-4">
                <p className="text-sm text-gray-400 mb-1">Dívida Original</p>
                <p className="text-lg font-bold text-white">{formatCurrency(dividaParaAcordo.valorAtual)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Valor Total do Acordo</label>
                <input
                  type="number"
                  name="valorTotal"
                  step="0.01"
                  defaultValue={dividaParaAcordo.valorAtual}
                  onChange={(e) => {
                    const valor = parseFloat(e.target.value) || dividaParaAcordo.valorAtual
                    setValorAcordoPreview(valor)
                  }}
                  required
                  className="w-full px-4 py-2.5 bg-dark-black border border-card-border rounded-lg text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20"
                />
                <p className="text-xs mt-1">
                  <span className="text-gray-400">Economia: </span>
                  <span className={`font-semibold ${
                    (dividaParaAcordo.valorAtual - (valorAcordoPreview || dividaParaAcordo.valorAtual)) > 0
                      ? 'text-emerald-400'
                      : 'text-gray-400'
                  }`}>
                    {formatCurrency(dividaParaAcordo.valorAtual - (valorAcordoPreview || dividaParaAcordo.valorAtual))}
                  </span>
                  {(dividaParaAcordo.valorAtual - (valorAcordoPreview || dividaParaAcordo.valorAtual)) > 0 && (
                    <span className="text-emerald-400 ml-2">
                      ({(((dividaParaAcordo.valorAtual - (valorAcordoPreview || dividaParaAcordo.valorAtual)) / dividaParaAcordo.valorAtual) * 100).toFixed(1)}% de desconto)
                    </span>
                  )}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Número de Parcelas</label>
                  <input
                    type="number"
                    name="numeroParcelas"
                    min="1"
                    defaultValue="1"
                    required
                    className="w-full px-4 py-2.5 bg-dark-black border border-card-border rounded-lg text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Data de Início</label>
                  <DateInput
                    name="dataInicio"
                    defaultValue={formatDateForInput()}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Taxa de Juros (% ao mês)</label>
                  <input
                    type="number"
                    name="taxaJuros"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2.5 bg-dark-black border border-card-border rounded-lg text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20"
                    placeholder="Ex: 1.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Taxa de Desconto (%)</label>
                  <input
                    type="number"
                    name="taxaDesconto"
                    step="0.01"
                    min="0"
                    max="100"
                    className="w-full px-4 py-2.5 bg-dark-black border border-card-border rounded-lg text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20"
                    placeholder="Ex: 10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Observações</label>
                <textarea
                  name="observacoes"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-dark-black border border-card-border rounded-lg text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20"
                  placeholder="Condições especiais do acordo..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsAcordoModalOpen(false)
                    setDividaParaAcordo(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Criar Acordo
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </MainLayout>
  )
}

