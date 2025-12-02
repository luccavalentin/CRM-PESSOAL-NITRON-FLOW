'use client'

import { useState, useEffect, useMemo } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { formatCurrency } from '@/utils/formatCurrency'
import { Plus, DollarSign, Calendar, AlertCircle, CheckCircle2, TrendingDown, FileText, Percent, CreditCard, X, BarChart3 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { useFinancasPessoaisStore } from '@/stores/financasPessoaisStore'

interface Divida {
  id: string
  descricao: string
  credor: string
  valorOriginal: number
  valorAtual: number
  dataVencimento: string
  observacoes?: string
  renegociada: boolean
  dataRenegociacao?: string
}

interface Parcela {
  id: string
  dividaId: string
  numero: number
  valor: number
  dataVencimento: string
  paga: boolean
  dataPagamento?: string
}

interface Renegociacao {
  id: string
  dividaId: string
  valorTotal: number
  numeroParcelas: number
  taxaJuros?: number
  dataInicio: string
  observacoes?: string
  parcelas: Parcela[]
}

export default function NegociacoesPage() {
  const [dividas, setDividas] = useState<Divida[]>([])
  const [renegociacoes, setRenegociacoes] = useState<Renegociacao[]>([])
  const [isDividaModalOpen, setIsDividaModalOpen] = useState(false)
  const [isRenegociacaoModalOpen, setIsRenegociacaoModalOpen] = useState(false)
  const [editingDivida, setEditingDivida] = useState<Divida | null>(null)
  const [dividaParaRenegociar, setDividaParaRenegociar] = useState<Divida | null>(null)
  const [filtro, setFiltro] = useState<'todas' | 'pendentes' | 'renegociadas'>('pendentes')

  const addTransacao = useFinancasPessoaisStore((state) => state.addTransacao)

  useEffect(() => {
    const savedDividas = localStorage.getItem('dividas-pessoais')
    const savedRenegociacoes = localStorage.getItem('renegociacoes-pessoais')
    if (savedDividas) {
      setDividas(JSON.parse(savedDividas))
    }
    if (savedRenegociacoes) {
      setRenegociacoes(JSON.parse(savedRenegociacoes))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('dividas-pessoais', JSON.stringify(dividas))
  }, [dividas])

  useEffect(() => {
    localStorage.setItem('renegociacoes-pessoais', JSON.stringify(renegociacoes))
  }, [renegociacoes])

  const handleSubmitDivida = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novaDivida: Divida = {
      id: editingDivida?.id || uuidv4(),
      descricao: (formData.get('descricao') as string) || 'Sem descrição',
      credor: (formData.get('credor') as string) || 'Não informado',
      valorOriginal: parseFloat(formData.get('valorOriginal') as string) || 0,
      valorAtual: parseFloat(formData.get('valorAtual') as string) || parseFloat(formData.get('valorOriginal') as string) || 0,
      dataVencimento: (formData.get('dataVencimento') as string) || new Date().toISOString().split('T')[0],
      observacoes: formData.get('observacoes') as string || undefined,
      renegociada: editingDivida?.renegociada || false,
      dataRenegociacao: editingDivida?.dataRenegociacao,
    }

    if (editingDivida) {
      setDividas(dividas.map(d => d.id === editingDivida.id ? novaDivida : d))
    } else {
      setDividas([...dividas, novaDivida])
    }

    setIsDividaModalOpen(false)
    setEditingDivida(null)
  }

  const handleSubmitRenegociacao = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!dividaParaRenegociar) return

    const formData = new FormData(e.currentTarget)
    const numeroParcelas = parseInt(formData.get('numeroParcelas') as string) || 1
    const valorTotal = parseFloat(formData.get('valorTotal') as string) || dividaParaRenegociar.valorAtual
    const taxaJuros = formData.get('taxaJuros') ? parseFloat(formData.get('taxaJuros') as string) : undefined
    const dataInicio = (formData.get('dataInicio') as string) || new Date().toISOString().split('T')[0]

    // Criar parcelas
    const valorParcela = valorTotal / numeroParcelas
    const parcelas: Parcela[] = []
    const dataInicioObj = new Date(dataInicio)

    for (let i = 0; i < numeroParcelas; i++) {
      const dataVencimento = new Date(dataInicioObj)
      dataVencimento.setMonth(dataVencimento.getMonth() + i)
      
      parcelas.push({
        id: uuidv4(),
        dividaId: dividaParaRenegociar.id,
        numero: i + 1,
        valor: valorParcela,
        dataVencimento: dataVencimento.toISOString().split('T')[0],
        paga: false,
      })
    }

    const novaRenegociacao: Renegociacao = {
      id: uuidv4(),
      dividaId: dividaParaRenegociar.id,
      valorTotal,
      numeroParcelas,
      taxaJuros,
      dataInicio,
      observacoes: formData.get('observacoes') as string || undefined,
      parcelas,
    }

    // Atualizar dívida como renegociada
    setDividas(dividas.map(d => 
      d.id === dividaParaRenegociar.id 
        ? { ...d, renegociada: true, dataRenegociacao: new Date().toISOString().split('T')[0] }
        : d
    ))

    setRenegociacoes([...renegociacoes, novaRenegociacao])

    // Adicionar parcelas como CONTAS A PAGAR no controle financeiro
    parcelas.forEach(parcela => {
      addTransacao({
        id: uuidv4(),
        descricao: `Parcela ${parcela.numero}/${numeroParcelas} - ${dividaParaRenegociar.descricao}`,
        valor: parcela.valor,
        categoria: 'Contas a Pagar',
        data: parcela.dataVencimento,
        tipo: 'saida',
      })
    })

    setIsRenegociacaoModalOpen(false)
    setDividaParaRenegociar(null)
    alert('Renegociação criada com sucesso! As parcelas foram adicionadas automaticamente como CONTAS A PAGAR no controle financeiro.')
  }

  const handleDeleteDivida = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta dívida?')) {
      setDividas(dividas.filter(d => d.id !== id))
      setRenegociacoes(renegociacoes.filter(r => r.dividaId !== id))
    }
  }

  const handlePagarParcela = (renegociacaoId: string, parcelaId: string) => {
    setRenegociacoes(renegociacoes.map(r => {
      if (r.id === renegociacaoId) {
        return {
          ...r,
          parcelas: r.parcelas.map(p => 
            p.id === parcelaId 
              ? { ...p, paga: true, dataPagamento: new Date().toISOString().split('T')[0] }
              : p
          ),
        }
      }
      return r
    }))
  }

  const dividasFiltradas = useMemo(() => {
    switch (filtro) {
      case 'pendentes':
        return dividas.filter(d => !d.renegociada)
      case 'renegociadas':
        return dividas.filter(d => d.renegociada)
      default:
        return dividas
    }
  }, [dividas, filtro])

  const totalDividas = dividas.filter(d => !d.renegociada).reduce((acc, d) => acc + d.valorAtual, 0)
  const totalRenegociado = renegociacoes.reduce((acc, r) => acc + r.valorTotal, 0)
  const parcelasPendentes = renegociacoes.reduce((acc, r) => 
    acc + r.parcelas.filter(p => !p.paga).length, 0
  )
  const valorParcelasPendentes = renegociacoes.reduce((acc, r) => 
    acc + r.parcelas.filter(p => !p.paga).reduce((sum, p) => sum + p.valor, 0), 0
  )

  // Dados para gráficos
  const dadosEvolucao = useMemo(() => {
    const meses = new Map<string, { mes: string; pago: number; pendente: number }>()
    
    renegociacoes.forEach(r => {
      r.parcelas.forEach(p => {
        const mes = new Date(p.dataVencimento).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
        if (!meses.has(mes)) {
          meses.set(mes, { mes, pago: 0, pendente: 0 })
        }
        const dadosMes = meses.get(mes)!
        if (p.paga) {
          dadosMes.pago += p.valor
        } else {
          dadosMes.pendente += p.valor
        }
      })
    })

    return Array.from(meses.values()).sort((a, b) => 
      new Date(a.mes).getTime() - new Date(b.mes).getTime()
    )
  }, [renegociacoes])

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Negociações</h1>
            <p className="text-gray-400">Gerencie suas dívidas e renegociações de forma profissional</p>
          </div>
          <Button
            onClick={() => {
              setEditingDivida(null)
              setIsDividaModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Nova Dívida
          </Button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Total em Dívidas"
            value={formatCurrency(totalDividas)}
            icon={DollarSign}
            valueColor="text-red-400"
            className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20"
          />
          <StatCard
            title="Total Renegociado"
            value={formatCurrency(totalRenegociado)}
            icon={CheckCircle2}
            valueColor="text-emerald-400"
            className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20"
          />
          <StatCard
            title="Parcelas Pendentes"
            value={parcelasPendentes}
            icon={Calendar}
            valueColor="text-yellow-400"
            className="bg-gradient-to-br from-yellow-500/10 to-orange-600/5 border-yellow-500/20"
          />
          <StatCard
            title="Valor Pendente"
            value={formatCurrency(valorParcelasPendentes)}
            icon={TrendingDown}
            valueColor="text-orange-400"
            className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20"
          />
        </div>

        {/* Filtros */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFiltro('todas')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtro === 'todas'
                  ? 'bg-accent-electric/20 text-accent-electric border border-accent-electric/30'
                  : 'bg-dark-black/50 text-gray-400 border border-card-border/50'
              }`}
            >
              Todas ({dividas.length})
            </button>
            <button
              onClick={() => setFiltro('pendentes')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtro === 'pendentes'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-dark-black/50 text-gray-400 border border-card-border/50'
              }`}
            >
              Pendentes ({dividas.filter(d => !d.renegociada).length})
            </button>
            <button
              onClick={() => setFiltro('renegociadas')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtro === 'renegociadas'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-dark-black/50 text-gray-400 border border-card-border/50'
              }`}
            >
              Renegociadas ({dividas.filter(d => d.renegociada).length})
            </button>
          </div>
        </div>

        {/* Gráfico */}
        {dadosEvolucao.length > 0 && (
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-accent-electric" />
              <h3 className="text-lg font-bold text-white">Evolução de Pagamentos</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosEvolucao}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="mes" stroke="#9CA3AF" fontSize={12} />
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
                <Bar dataKey="pago" fill="#10B981" name="Pago" radius={[8, 8, 0, 0]} />
                <Bar dataKey="pendente" fill="#EF4444" name="Pendente" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Dívidas Pendentes */}
        {filtro !== 'renegociadas' && (
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Dívidas Pendentes ({dividas.filter(d => !d.renegociada).length})
            </h2>
            {dividasFiltradas.filter(d => !d.renegociada).length > 0 ? (
              <div className="space-y-3">
                {dividasFiltradas.filter(d => !d.renegociada).map((divida) => {
                  const diasAteVencimento = Math.ceil(
                    (new Date(divida.dataVencimento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  )
                  return (
                    <div
                      key={divida.id}
                      className="p-5 bg-dark-black/50 border border-red-500/30 rounded-xl hover:border-red-500/50 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-white">{divida.descricao}</h3>
                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/20">
                              Pendente
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Credor</p>
                              <p className="text-sm font-semibold text-white">{divida.credor}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Valor Atual</p>
                              <p className="text-lg font-bold text-red-400">{formatCurrency(divida.valorAtual)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Vencimento</p>
                              <p className={`text-sm font-semibold ${
                                diasAteVencimento < 0 ? 'text-red-400' :
                                diasAteVencimento <= 7 ? 'text-orange-400' :
                                'text-white'
                              }`}>
                                {new Date(divida.dataVencimento).toLocaleDateString('pt-BR')}
                                {diasAteVencimento >= 0 && (
                                  <span className="ml-2 text-xs">
                                    ({diasAteVencimento} dias)
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          {divida.observacoes && (
                            <p className="text-sm text-gray-400 mb-3">{divida.observacoes}</p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => {
                              setDividaParaRenegociar(divida)
                              setIsRenegociacaoModalOpen(true)
                            }}
                            className="px-4 py-2 text-sm bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg transition-colors"
                          >
                            Renegociar
                          </button>
                          <button
                            onClick={() => {
                              setEditingDivida(divida)
                              setIsDividaModalOpen(true)
                            }}
                            className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDivida(divida.id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg font-medium">Nenhuma dívida pendente</p>
              </div>
            )}
          </div>
        )}

        {/* Renegociações */}
        {filtro !== 'pendentes' && renegociacoes.length > 0 && (
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Renegociações ({renegociacoes.length})
            </h2>
            <div className="space-y-4">
              {renegociacoes.map((renegociacao) => {
                const divida = dividas.find(d => d.id === renegociacao.dividaId)
                const parcelasPagas = renegociacao.parcelas.filter(p => p.paga).length
                const progresso = (parcelasPagas / renegociacao.parcelas.length) * 100
                return (
                  <div
                    key={renegociacao.id}
                    className="p-5 bg-dark-black/50 border border-emerald-500/30 rounded-xl"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2">
                          {divida?.descricao || 'Dívida não encontrada'}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Valor Total</p>
                            <p className="text-sm font-semibold text-white">{formatCurrency(renegociacao.valorTotal)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Parcelas</p>
                            <p className="text-sm font-semibold text-white">
                              {parcelasPagas}/{renegociacao.numeroParcelas} pagas
                            </p>
                          </div>
                          {renegociacao.taxaJuros && (
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Taxa de Juros</p>
                              <p className="text-sm font-semibold text-white">{renegociacao.taxaJuros}%</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Progresso</p>
                            <p className="text-sm font-semibold text-emerald-400">{progresso.toFixed(0)}%</p>
                          </div>
                        </div>
                        <div className="w-full bg-dark-black rounded-full h-2 mb-3">
                          <div
                            className="bg-emerald-500 h-2 rounded-full transition-all"
                            style={{ width: `${progresso}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-white mb-2">Parcelas:</h4>
                      {renegociacao.parcelas.map((parcela) => (
                        <div
                          key={parcela.id}
                          className={`p-3 rounded-lg border ${
                            parcela.paga
                              ? 'bg-emerald-500/10 border-emerald-500/30'
                              : 'bg-dark-black/30 border-card-border/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-white">
                                Parcela {parcela.numero}/{renegociacao.numeroParcelas}
                              </span>
                              <span className="text-sm text-gray-400">
                                {formatCurrency(parcela.valor)}
                              </span>
                              <span className="text-xs text-gray-500">
                                Venc: {new Date(parcela.dataVencimento).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            {!parcela.paga && (
                              <button
                                onClick={() => handlePagarParcela(renegociacao.id, parcela.id)}
                                className="px-3 py-1 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded transition-colors"
                              >
                                Marcar como Paga
                              </button>
                            )}
                            {parcela.paga && (
                              <span className="px-3 py-1 text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                                ✓ Paga
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Dívida */}
      <Modal
        isOpen={isDividaModalOpen}
        onClose={() => {
          setIsDividaModalOpen(false)
          setEditingDivida(null)
        }}
        title={editingDivida ? 'Editar Dívida' : 'Nova Dívida'}
        size="lg"
        variant="warning"
        icon={AlertCircle}
        description={editingDivida ? 'Atualize as informações da dívida' : 'Registre uma nova dívida para acompanhar e renegociar'}
      >
        <form onSubmit={handleSubmitDivida} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descrição
            </label>
            <input
              type="text"
              name="descricao"
              defaultValue={editingDivida?.descricao}
              placeholder="Ex: Cartão de crédito, Empréstimo..."
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Credor
            </label>
            <input
              type="text"
              name="credor"
              defaultValue={editingDivida?.credor}
              placeholder="Nome do credor/banco"
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Valor Original (R$)
              </label>
              <input
                type="number"
                name="valorOriginal"
                step="0.01"
                min="0"
                defaultValue={editingDivida?.valorOriginal || 0}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Valor Atual (R$)
              </label>
              <input
                type="number"
                name="valorAtual"
                step="0.01"
                min="0"
                defaultValue={editingDivida?.valorAtual || editingDivida?.valorOriginal || 0}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Data de Vencimento
            </label>
            <input
              type="date"
              name="dataVencimento"
              defaultValue={editingDivida?.dataVencimento || new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Observações
            </label>
            <textarea
              name="observacoes"
              defaultValue={editingDivida?.observacoes}
              rows={3}
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingDivida ? 'Salvar Alterações' : 'Criar Dívida'}
            </Button>
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
          </div>
        </form>
      </Modal>

      {/* Modal de Renegociação */}
      <Modal
        isOpen={isRenegociacaoModalOpen}
        onClose={() => {
          setIsRenegociacaoModalOpen(false)
          setDividaParaRenegociar(null)
        }}
        title={`Renegociar - ${dividaParaRenegociar?.descricao || ''}`}
        size="lg"
        variant="success"
        icon={CheckCircle2}
        description={`Renegocie a dívida de ${dividaParaRenegociar ? formatCurrency(dividaParaRenegociar.valorAtual) : ''} em parcelas personalizadas`}
      >
        {dividaParaRenegociar && (
          <form onSubmit={handleSubmitRenegociacao} className="space-y-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-4">
              <p className="text-sm text-blue-300">
                Valor Atual: <strong>{formatCurrency(dividaParaRenegociar.valorAtual)}</strong>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Valor Total (R$)
                </label>
                <input
                  type="number"
                  name="valorTotal"
                  step="0.01"
                  min="0"
                  defaultValue={dividaParaRenegociar.valorAtual}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Número de Parcelas
                </label>
                <input
                  type="number"
                  name="numeroParcelas"
                  min="1"
                  defaultValue="1"
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Taxa de Juros (%)
                </label>
                <input
                  type="number"
                  name="taxaJuros"
                  step="0.01"
                  min="0"
                  placeholder="Opcional"
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data Início
                </label>
                <input
                  type="date"
                  name="dataInicio"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Observações
              </label>
              <textarea
                name="observacoes"
                rows={3}
                placeholder="Observações sobre a renegociação..."
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <p className="text-xs text-emerald-400">
                As parcelas serão automaticamente adicionadas como saídas no controle financeiro pessoal.
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Criar Renegociação
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsRenegociacaoModalOpen(false)
                  setDividaParaRenegociar(null)
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </MainLayout>
  )
}

