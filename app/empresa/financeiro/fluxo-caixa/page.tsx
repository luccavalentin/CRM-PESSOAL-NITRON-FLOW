'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import CategoryInput from '@/components/ui/CategoryInput'
import MonthFilter from '@/components/ui/MonthFilter'
import { useFinancasEmpresaStore } from '@/stores/financasEmpresaStore'
import { useCategoriasStore } from '@/stores/categoriasStore'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDateForInput } from '@/utils/formatDate'
import { TransacaoFinanceira } from '@/types'
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar,
  Filter,
  Search,
  Edit2,
  Trash2,
  Download,
  AlertCircle,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Link2,
  ListTodo,
  CheckSquare,
  Square,
  Trash,
  CheckCircle2
} from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useTarefasStore } from '@/stores/tarefasStore'
import { Tarefa, Prioridade, CategoriaTarefa, StatusTarefa } from '@/types'

export default function FluxoCaixaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTarefaModalOpen, setIsTarefaModalOpen] = useState(false)
  const [editingTransacao, setEditingTransacao] = useState<TransacaoFinanceira | null>(null)
  const [transacaoParaTarefa, setTransacaoParaTarefa] = useState<TransacaoFinanceira | null>(null)
  const [tipoTransacao, setTipoTransacao] = useState<'entrada' | 'saida'>('entrada')
  const [busca, setBusca] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas')
  const [saldoInicial, setSaldoInicial] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [categoriaModal, setCategoriaModal] = useState('')
  const [mesSelecionado, setMesSelecionado] = useState<number>(() => new Date().getMonth())
  const [anoSelecionado, setAnoSelecionado] = useState<number>(() => new Date().getFullYear())
  
  const addTarefa = useTarefasStore((state) => state.addTarefa)
  const tarefas = useTarefasStore((state) => state.tarefas)

  const transacoes = useFinancasEmpresaStore((state) => state.transacoes)
  const fluxoCaixa = useFinancasEmpresaStore((state) => state.fluxoCaixa)
  const addTransacao = useFinancasEmpresaStore((state) => state.addTransacao)
  const updateTransacao = useFinancasEmpresaStore((state) => state.updateTransacao)
  const deleteTransacao = useFinancasEmpresaStore((state) => state.deleteTransacao)
  const calcularFluxoCaixa = useFinancasEmpresaStore((state) => state.calcularFluxoCaixa)
  const getEntradasPorCliente = useFinancasEmpresaStore((state) => state.getEntradasPorCliente)
  const getSaidasPorCategoria = useFinancasEmpresaStore((state) => state.getSaidasPorCategoria)
  const getContasPendentesMes = useFinancasEmpresaStore((state) => state.getContasPendentesMes)
  const marcarComoPaga = useFinancasEmpresaStore((state) => state.marcarComoPaga)
  const rolarContasNaoPagas = useFinancasEmpresaStore((state) => state.rolarContasNaoPagas)

  const calcularInfoParcela = useCallback((transacao: TransacaoFinanceira) => {
    if (!transacao.transacaoOriginalId && !transacao.recorrente) return null
    
    const originalId = transacao.transacaoOriginalId || transacao.id
    const transacoesRelacionadas = transacoes.filter(t => 
      t.transacaoOriginalId === originalId || 
      (t.id === originalId && t.recorrente) ||
      (t.transacaoOriginalId && t.transacaoOriginalId === originalId)
    )
    
    if (transacoesRelacionadas.length <= 1) return null
    
    // Ordenar por data
    const ordenadas = [...transacoesRelacionadas].sort((a, b) => 
      new Date(a.data).getTime() - new Date(b.data).getTime()
    )
    
    const indiceParcela = ordenadas.findIndex(t => t.id === transacao.id)
    const numeroParcela = indiceParcela + 1
    const totalParcelas = ordenadas.length
    
    return { numeroParcela, totalParcelas }
  }, [transacoes])

  useEffect(() => {
    calcularFluxoCaixa()
    rolarContasNaoPagas()
  }, [transacoes, calcularFluxoCaixa, rolarContasNaoPagas])

  useEffect(() => {
    // Mostrar/ocultar opções de recorrência baseado no checkbox
    const checkbox = document.querySelector('input[name="recorrente"]') as HTMLInputElement
    const options = document.getElementById('recorrencia-options')
    
    const handleChange = () => {
      if (options) {
        if (checkbox?.checked) {
          options.classList.remove('hidden')
        } else {
          options.classList.add('hidden')
        }
      }
    }
    
    checkbox?.addEventListener('change', handleChange)
    
    // Verificar estado inicial quando modal abre
    if (isModalOpen && editingTransacao?.recorrente) {
      setTimeout(() => {
        if (options) options.classList.remove('hidden')
      }, 100)
    }
    
    return () => {
      checkbox?.removeEventListener('change', handleChange)
    }
  }, [isModalOpen, editingTransacao])

  // Filtros e cálculos - otimizado
  const transacoesFiltradas = useMemo(() => {
    // Primeiro filtrar por mês selecionado
    let filtradas = transacoes.filter(t => {
      const data = new Date(t.data)
      return data.getMonth() === mesSelecionado && 
             data.getFullYear() === anoSelecionado
    })

    // Filtro por busca
    if (busca) {
      const buscaLower = busca.toLowerCase()
      filtradas = filtradas.filter(t => 
        t.descricao.toLowerCase().includes(buscaLower) ||
        t.categoria.toLowerCase().includes(buscaLower)
      )
    }

    // Filtro por categoria
    if (categoriaFiltro !== 'todas') {
      filtradas = filtradas.filter(t => t.categoria === categoriaFiltro)
    }

    return filtradas.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
  }, [transacoes, mesSelecionado, anoSelecionado, busca, categoriaFiltro])

  const entradas = transacoesFiltradas.filter(t => t.tipo === 'entrada')
  const saidas = transacoesFiltradas.filter(t => t.tipo === 'saida')
  const totalEntradas = entradas.reduce((acc, t) => acc + t.valor, 0)
  const totalSaidas = saidas.filter(t => t.paga === true).reduce((acc, t) => acc + t.valor, 0)
  const contasPendentes = getContasPendentesMes()
  const saldoPeriodo = totalEntradas - totalSaidas
  const saldoAtual = saldoInicial + fluxoCaixa

  // Categorias únicas para filtro
  const { addCategoria, getAllCategorias } = useCategoriasStore()
  const categoriasSalvas = useCategoriasStore((state) => state.getAllCategorias())
  
  const categorias = useMemo(() => {
    // Combina categorias salvas com categorias das transações
    const categoriasTransacoes = Array.from(new Set(transacoes.map(t => t.categoria).filter(c => c && c.trim() !== '')))
    const todasCategorias = Array.from(new Set([...categoriasSalvas, ...categoriasTransacoes]))
    return todasCategorias.sort()
  }, [transacoes, categoriasSalvas])

  // Dados para gráficos
  const dadosGraficoLinha = useMemo(() => {
    const dias = new Map<string, { data: string; entradas: number; saidas: number; saldo: number }>()
    let saldoAcumulado = saldoInicial

    transacoesFiltradas.forEach(t => {
      const data = new Date(t.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      if (!dias.has(data)) {
        dias.set(data, { data, entradas: 0, saidas: 0, saldo: saldoAcumulado })
      }
      const dia = dias.get(data)!
      if (t.tipo === 'entrada') {
        dia.entradas += t.valor
        saldoAcumulado += t.valor
      } else {
        dia.saidas += t.valor
        saldoAcumulado -= t.valor
      }
      dia.saldo = saldoAcumulado
    })

    return Array.from(dias.values()).sort((a, b) => 
      new Date(a.data.split('/').reverse().join('-')).getTime() - 
      new Date(b.data.split('/').reverse().join('-')).getTime()
    )
  }, [transacoesFiltradas, saldoInicial])

  const dadosGraficoPizza = useMemo(() => {
    const categoriasMap = new Map<string, number>()
    saidas.forEach(t => {
      categoriasMap.set(t.categoria, (categoriasMap.get(t.categoria) || 0) + t.valor)
    })
    return Array.from(categoriasMap.entries()).map(([name, value]) => ({ name, value }))
  }, [saidas])

  const coresPizza = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4']

  const margemLucro = totalEntradas > 0 ? ((saldoPeriodo / totalEntradas) * 100) : 0

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const isRecorrente = formData.get('recorrente') === 'on'
    const tipoRecorrencia = formData.get('tipoRecorrencia') as TransacaoFinanceira['tipoRecorrencia']
    const dataFim = formData.get('dataFim') as string || undefined
    const quantidadeRecorrencias = formData.get('quantidadeRecorrencias') ? parseInt(formData.get('quantidadeRecorrencias') as string) : undefined
    
    const transacaoOriginalId = editingTransacao?.transacaoOriginalId || (editingTransacao?.id || uuidv4())
    
    // Determinar categoria
    const categoriaModalTrim = categoriaModal?.trim() || ''
    const categoriaForm = (formData.get('categoria') as string)?.trim() || ''
    const categoriaFinal = categoriaModalTrim || categoriaForm || 'Outros'
    
    const novaTransacao: TransacaoFinanceira = {
      id: editingTransacao?.id || uuidv4(),
      descricao: (formData.get('descricao') as string) || 'Sem descrição',
      valor: parseFloat(formData.get('valor') as string) || 0,
      categoria: categoriaFinal,
      data: (formData.get('data') as string) || formatDateForInput(),
      tipo: tipoTransacao,
      recorrente: isRecorrente,
      tipoRecorrencia: isRecorrente ? tipoRecorrencia : undefined,
      dataFim: isRecorrente && dataFim ? dataFim : undefined,
      quantidadeRecorrencias: isRecorrente && quantidadeRecorrencias ? quantidadeRecorrencias : undefined,
      transacaoOriginalId: isRecorrente && !editingTransacao ? transacaoOriginalId : editingTransacao?.transacaoOriginalId,
      paga: editingTransacao?.paga || (tipoTransacao === 'entrada' ? undefined : false), // Entradas não têm status de paga, apenas saídas
      dataPagamento: editingTransacao?.dataPagamento,
    }

    if (editingTransacao) {
      // Se for recorrente, atualizar todas as transações relacionadas
      if (editingTransacao.recorrente && editingTransacao.transacaoOriginalId) {
        const transacoesRelacionadas = transacoes.filter(
          t => t.transacaoOriginalId === editingTransacao.transacaoOriginalId || 
               (t.id === editingTransacao.transacaoOriginalId && t.recorrente)
        )
        
        // Atualizar todas as transações relacionadas
        transacoesRelacionadas.forEach(t => {
          updateTransacao(t.id, {
            descricao: novaTransacao.descricao,
            valor: novaTransacao.valor,
            categoria: novaTransacao.categoria,
            tipoRecorrencia: novaTransacao.tipoRecorrencia,
            dataFim: novaTransacao.dataFim,
            quantidadeRecorrencias: novaTransacao.quantidadeRecorrencias,
          })
        })
      } else {
        updateTransacao(editingTransacao.id, novaTransacao)
      }
    } else {
      addTransacao(novaTransacao)
      
      // Se for recorrente, gerar as próximas transações
      if (isRecorrente && tipoRecorrencia) {
        const dataInicial = new Date(novaTransacao.data)
        const quantidade = quantidadeRecorrencias || (dataFim ? calcularQuantidadeRecorrencias(dataInicial, new Date(dataFim), tipoRecorrencia) : 12)
        
        for (let i = 1; i < quantidade; i++) {
          const proximaData = calcularProximaData(dataInicial, tipoRecorrencia, i)
          if (dataFim && proximaData > new Date(dataFim)) break
          
          const transacaoRecorrente: TransacaoFinanceira = {
            id: uuidv4(),
            descricao: novaTransacao.descricao,
            valor: novaTransacao.valor,
            categoria: novaTransacao.categoria,
            data: proximaData.toISOString().split('T')[0],
            tipo: novaTransacao.tipo,
            recorrente: true,
            tipoRecorrencia: novaTransacao.tipoRecorrencia,
            dataFim: novaTransacao.dataFim,
            quantidadeRecorrencias: novaTransacao.quantidadeRecorrencias,
            transacaoOriginalId: transacaoOriginalId,
            paga: novaTransacao.tipo === 'entrada' ? undefined : false,
          }
          addTransacao(transacaoRecorrente)
        }
      }
    }

    setIsModalOpen(false)
    setEditingTransacao(null)
    setCategoriaModal('')
  }

  const calcularProximaData = useCallback((dataInicial: Date, tipoRecorrencia: TransacaoFinanceira['tipoRecorrencia'], multiplicador: number): Date => {
    const data = new Date(dataInicial)
    switch (tipoRecorrencia) {
      case 'diaria':
        data.setDate(data.getDate() + (1 * multiplicador))
        break
      case 'semanal':
        data.setDate(data.getDate() + (7 * multiplicador))
        break
      case 'quinzenal':
        data.setDate(data.getDate() + (15 * multiplicador))
        break
      case 'mensal':
        data.setMonth(data.getMonth() + (1 * multiplicador))
        break
      case 'bimestral':
        data.setMonth(data.getMonth() + (2 * multiplicador))
        break
      case 'trimestral':
        data.setMonth(data.getMonth() + (3 * multiplicador))
        break
      case 'semestral':
        data.setMonth(data.getMonth() + (6 * multiplicador))
        break
      case 'anual':
        data.setFullYear(data.getFullYear() + (1 * multiplicador))
        break
    }
    return data
  }, [])

  const calcularQuantidadeRecorrencias = useCallback((dataInicial: Date, dataFim: Date, tipoRecorrencia: TransacaoFinanceira['tipoRecorrencia']): number => {
    let count = 0
    let data = new Date(dataInicial)
    while (data <= dataFim) {
      count++
      data = calcularProximaData(dataInicial, tipoRecorrencia, count)
    }
    return count
  }, [calcularProximaData])

  const handleEdit = useCallback((transacao: TransacaoFinanceira) => {
    setEditingTransacao(transacao)
    setTipoTransacao(transacao.tipo)
    setCategoriaModal(transacao.categoria)
    setIsModalOpen(true)
  }, [])

  const handleAddCategory = useCallback((newCategory: string) => {
    const trimmed = newCategory.trim()
    if (trimmed) {
      // Salva a nova categoria no store
      addCategoria(trimmed, 'saida') // Para empresa, categorias são sempre saídas
      // Atualiza o estado local
      setCategoriaModal(trimmed)
    }
  }, [addCategoria])

  const handleDelete = useCallback((id: string) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      deleteTransacao(id)
    }
  }, [deleteTransacao])

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  const handleSelectAll = () => {
    if (selectedIds.size === transacoesFiltradas.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(transacoesFiltradas.map(t => t.id)))
    }
  }

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return
    
    const count = selectedIds.size
    if (confirm(`Tem certeza que deseja excluir ${count} transação(ões) selecionada(s)?`)) {
      selectedIds.forEach(id => deleteTransacao(id))
      setSelectedIds(new Set())
    }
  }

  const handleVincularTarefa = (transacao: TransacaoFinanceira) => {
    setTransacaoParaTarefa(transacao)
    setIsTarefaModalOpen(true)
  }

  const handleSubmitTarefa = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!transacaoParaTarefa) return

    const formData = new FormData(e.currentTarget)
    const novaTarefa: Tarefa = {
      id: uuidv4(),
      titulo: (formData.get('titulo') as string) || `Tarefa - ${transacaoParaTarefa.descricao.substring(0, 30)}`,
      descricao: formData.get('descricao') as string || undefined,
      prioridade: (formData.get('prioridade') as Prioridade) || 'Média',
      categoria: 'Empresarial' as CategoriaTarefa,
      data: (formData.get('data') as string) || formatDateForInput(),
      status: 'Pendente' as StatusTarefa,
      tarefaRapida: formData.get('tarefaRapida') === 'on',
      recorrente: false,
      concluida: false,
      etiquetas: [`${transacaoParaTarefa.tipo === 'entrada' ? 'Receita' : 'Despesa'}: ${transacaoParaTarefa.descricao.substring(0, 30)}`, `Valor: ${formatCurrency(transacaoParaTarefa.valor)}`],
      projetoId: undefined,
    }

    addTarefa(novaTarefa)
    setIsTarefaModalOpen(false)
    setTransacaoParaTarefa(null)
  }

  const entradasPorCliente = getEntradasPorCliente()
  const saidasPorCategoria = getSaidasPorCategoria()

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Fluxo de Caixa</h1>
            <p className="text-gray-400 text-sm">Controle financeiro completo da sua empresa</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              onClick={() => {
                setTipoTransacao('entrada')
                setEditingTransacao(null)
                setIsModalOpen(true)
              }}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Entrada
            </Button>
            <Button
              onClick={() => {
                setTipoTransacao('saida')
                setEditingTransacao(null)
                setCategoriaModal('Contas a Pagar')
                setIsModalOpen(true)
              }}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Conta a Pagar
            </Button>
          </div>
        </div>

        {/* Filtro de Mês */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-4">
          <MonthFilter
            selectedMonth={mesSelecionado}
            selectedYear={anoSelecionado}
            onMonthChange={(month, year) => {
              setMesSelecionado(month)
              setAnoSelecionado(year)
            }}
          />
        </div>

        {/* Filtros */}
        <div className="bg-card-bg border border-card-border rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Buscar
              </label>
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Descrição ou categoria..."
                className="w-full px-4 py-2 bg-dark-black border border-card-border rounded-lg text-white focus:outline-none focus:border-accent-electric"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Categoria
              </label>
              <select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                className="w-full px-4 py-2 bg-dark-black border border-card-border rounded-lg text-white focus:outline-none focus:border-accent-electric"
              >
                <option value="todas">Todas</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Saldo Inicial
              </label>
              <input
                type="number"
                value={saldoInicial}
                onChange={(e) => setSaldoInicial(parseFloat(e.target.value) || 0)}
                step="0.01"
                className="w-full px-4 py-2 bg-dark-black border border-card-border rounded-lg text-white focus:outline-none focus:border-accent-electric"
              />
            </div>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          <StatCard
            title="Saldo Atual"
            value={formatCurrency(saldoAtual)}
            icon={Wallet}
            valueColor={saldoAtual >= 0 ? 'text-emerald-400' : 'text-red-400'}
            trend={{
              value: saldoAtual >= 0 ? 5 : -5,
              isPositive: saldoAtual >= 0,
            }}
          />
          <StatCard
            title="Total Entradas"
            value={formatCurrency(totalEntradas)}
            icon={TrendingUp}
            valueColor="text-emerald-400"
          />
          <StatCard
            title="Contas a Pagar (Pagas)"
            value={formatCurrency(totalSaidas)}
            icon={TrendingDown}
            valueColor="text-red-400"
          />
          <StatCard
            title="Contas Pendentes"
            value={formatCurrency(contasPendentes)}
            icon={AlertCircle}
            valueColor="text-orange-400"
            subtitle={`${transacoes.filter(t => t.tipo === 'saida' && !t.paga && new Date(t.data).getMonth() === new Date().getMonth() && new Date(t.data).getFullYear() === new Date().getFullYear()).length} conta(s)`}
          />
          <StatCard
            title="Saldo do Período"
            value={formatCurrency(saldoPeriodo)}
            icon={DollarSign}
            valueColor={saldoPeriodo >= 0 ? 'text-emerald-400' : 'text-red-400'}
          />
        </div>

        {/* Indicadores Adicionais */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card-bg border border-card-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Margem de Lucro</p>
                <p className={`text-2xl font-bold ${margemLucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {margemLucro.toFixed(1)}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          <div className="bg-card-bg border border-card-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Transações</p>
                <p className="text-2xl font-bold text-white">{transacoesFiltradas.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          <div className="bg-card-bg border border-card-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Média Diária</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(saldoPeriodo / Math.max(1, transacoesFiltradas.length))}
                </p>
              </div>
              <PieChart className="w-8 h-8 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Gráfico de Linha - Evolução do Saldo */}
          <div className="bg-card-bg border border-card-border rounded-xl p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent-electric" />
              Evolução do Saldo
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dadosGraficoLinha}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="data" stroke="#9CA3AF" fontSize={12} />
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
                <Line 
                  type="monotone" 
                  dataKey="entradas" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  name="Entradas"
                />
                <Line 
                  type="monotone" 
                  dataKey="saidas" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Contas a Pagar"
                />
                <Line 
                  type="monotone" 
                  dataKey="saldo" 
                  stroke="#00d4ff" 
                  strokeWidth={2}
                  name="Saldo"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Pizza - Contas a Pagar por Categoria */}
          <div className="bg-card-bg border border-card-border rounded-xl p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-accent-electric" />
              Contas a Pagar por Categoria
            </h3>
            {dadosGraficoPizza.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
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
                  <Pie
                    data={dadosGraficoPizza}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosGraficoPizza.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={coresPizza[index % coresPizza.length]} />
                    ))}
                  </Pie>
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-400">
                Nenhuma conta a pagar no período
              </div>
            )}
          </div>
        </div>

        {/* Análises Detalhadas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Entradas por Cliente */}
          <div className="bg-card-bg border border-card-border rounded-xl p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-emerald-400" />
              Entradas por Cliente
            </h3>
            {Object.keys(entradasPorCliente).length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Object.entries(entradasPorCliente)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cliente, valor]) => (
                    <div
                      key={cliente}
                      className="flex items-center justify-between p-3 bg-dark-black/50 border border-card-border rounded-lg hover:border-emerald-500/50 transition-all"
                    >
                      <span className="text-white text-sm">{cliente}</span>
                      <span className="text-emerald-400 font-semibold">
                        {formatCurrency(valor)}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">Nenhuma entrada registrada</p>
            )}
          </div>

          {/* Contas a Pagar por Categoria */}
          <div className="bg-card-bg border border-card-border rounded-xl p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ArrowDownRight className="w-5 h-5 text-red-400" />
              Contas a Pagar por Categoria
            </h3>
            {Object.keys(saidasPorCategoria).length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Object.entries(saidasPorCategoria)
                  .sort(([, a], [, b]) => b - a)
                  .map(([categoria, valor]) => (
                    <div
                      key={categoria}
                      className="flex items-center justify-between p-3 bg-dark-black/50 border border-card-border rounded-lg hover:border-red-500/50 transition-all"
                    >
                      <span className="text-white text-sm">{categoria}</span>
                      <span className="text-red-400 font-semibold">
                        {formatCurrency(valor)}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">Nenhuma conta a pagar registrada</p>
            )}
          </div>
        </div>

        {/* Lista de Transações */}
        <div className="bg-card-bg border-2 border-card-border rounded-xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Transações ({transacoesFiltradas.length})
              </h2>
              {saldoAtual < 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400 font-semibold">Saldo Negativo</span>
                </div>
              )}
            </div>
            {transacoesFiltradas.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 bg-dark-black/50 border border-card-border rounded-lg text-white hover:border-accent-electric transition-colors flex items-center gap-2 text-sm"
                >
                  {selectedIds.size === transacoesFiltradas.length ? (
                    <>
                      <CheckSquare className="w-4 h-4" />
                      Desselecionar Todos
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4" />
                      Selecionar Todos
                    </>
                  )}
                </button>
                {selectedIds.size > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="px-4 py-2 bg-red-600/20 border border-red-500/50 rounded-lg text-red-400 hover:bg-red-600/30 transition-colors flex items-center gap-2 text-sm font-semibold"
                  >
                    <Trash className="w-4 h-4" />
                    Excluir Selecionados ({selectedIds.size})
                  </button>
                )}
              </div>
            )}
          </div>
          {transacoesFiltradas.length > 0 ? (
            <div className="space-y-2">
              {transacoesFiltradas.map((transacao) => {
                const isPaga = transacao.tipo === 'saida' && transacao.paga === true // Apenas saídas podem ser pagas
                const isVencida = transacao.tipo === 'saida' && !isPaga && new Date(transacao.data) < new Date()
                const infoParcela = calcularInfoParcela(transacao)
                
                return (
                  <div
                    key={transacao.id}
                    className={`p-6 rounded-2xl transition-all duration-300 group relative overflow-hidden shadow-lg ${
                      transacao.tipo === 'saida' && isPaga
                        ? 'bg-gradient-to-br from-emerald-900/30 via-emerald-800/20 to-emerald-900/10 border-2 border-emerald-500/40 opacity-80 shadow-emerald-500/20'
                        : isVencida
                        ? 'bg-gradient-to-br from-red-900/30 via-red-800/20 to-red-900/10 border-2 border-red-500/60 shadow-red-500/30'
                        : transacao.tipo === 'entrada'
                        ? 'bg-gradient-to-br from-emerald-900/20 via-dark-black/60 to-dark-black/40 border-2 border-emerald-500/30 hover:border-emerald-400/50 shadow-emerald-500/10'
                        : 'bg-gradient-to-br from-red-900/20 via-dark-black/60 to-dark-black/40 border-2 border-red-500/30 hover:border-red-400/50 shadow-red-500/10'
                    } hover:shadow-xl hover:scale-[1.02]`}
                  >
                    {/* Efeito de brilho sutil animado */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Barra lateral colorida com gradiente */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      transacao.tipo === 'saida' && isPaga
                        ? 'bg-gradient-to-b from-emerald-400 to-emerald-600'
                        : isVencida
                        ? 'bg-gradient-to-b from-red-400 to-red-600 animate-pulse'
                        : transacao.tipo === 'entrada'
                        ? 'bg-gradient-to-b from-emerald-400 to-emerald-600'
                        : 'bg-gradient-to-b from-red-400 to-red-600'
                    }`} />
                    
                    {/* Canto superior direito decorativo */}
                    <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 ${
                      transacao.tipo === 'entrada' ? 'bg-emerald-400' : 'bg-red-400'
                    } rounded-full blur-3xl`} />
                    
                    {/* Indicador de Parcela Neon */}
                    {infoParcela && (
                      <div className="mb-3 relative z-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-accent-electric/30 via-accent-cyan/30 to-accent-electric/30 border-2 border-accent-electric/50 text-accent-electric shadow-lg shadow-accent-electric/50 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-electric animate-ping"></span>
                          {infoParcela.numeroParcela} Parcela de {infoParcela.totalParcelas}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
                      <div className="flex items-center gap-3 flex-1">
                        {/* Checkbox de seleção */}
                        <input
                          type="checkbox"
                          checked={selectedIds.has(transacao.id)}
                          onChange={() => handleToggleSelect(transacao.id)}
                          className="w-5 h-5 rounded border-card-border bg-dark-black/50 text-accent-electric focus:ring-accent-electric cursor-pointer"
                        />
                        
                        {/* Checkbox de paga (apenas para contas a pagar) */}
                        {transacao.tipo === 'saida' && (
                          <button
                            onClick={() => marcarComoPaga(transacao.id)}
                            className={`flex-shrink-0 w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all shadow-lg ${
                              isPaga
                                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400 text-white shadow-emerald-500/50'
                                : 'bg-dark-black/70 border-card-border hover:border-emerald-500/50 text-transparent hover:text-emerald-400 hover:bg-emerald-500/10'
                            }`}
                            title={isPaga ? 'Marcar como não paga' : 'Marcar como paga'}
                          >
                            {isPaga && <CheckCircle2 className="w-5 h-5" />}
                          </button>
                        )}
                        
                        <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                          transacao.tipo === 'entrada'
                            ? 'bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-gradient-to-br from-red-500/30 to-red-600/20 text-red-400 border border-red-500/30'
                        }`}>
                          {transacao.tipo === 'entrada' ? (
                            <ArrowUpRight className="w-7 h-7" />
                          ) : (
                            <ArrowDownRight className="w-7 h-7" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <p className={`font-semibold text-lg truncate ${
                              transacao.tipo === 'saida' && isPaga ? 'line-through text-gray-500' : 'text-white'
                            }`}>
                              {transacao.descricao}
                            </p>
                            {isPaga && (
                              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Paga
                              </span>
                            )}
                            {isVencida && !isPaga && (
                              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1 animate-pulse">
                                <AlertCircle className="w-3 h-3" />
                                Vencida
                              </span>
                            )}
                            {infoParcela && (
                              <span className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-accent-electric/40 via-accent-cyan/40 to-accent-electric/40 border-2 border-accent-electric/60 text-accent-electric shadow-lg shadow-accent-electric/40 animate-pulse flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-accent-electric animate-ping"></span>
                                {infoParcela.numeroParcela} Parcela de {infoParcela.totalParcelas}
                              </span>
                            )}
                            {transacao.recorrente && !infoParcela && (
                              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                Recorrente
                              </span>
                            )}
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                              transacao.tipo === 'entrada'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }`}>
                              {transacao.tipo === 'entrada' ? 'Entrada' : 'Conta a Pagar'}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2.5 text-sm">
                            <span className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-black/50 border border-card-border/30 ${
                              transacao.tipo === 'saida' && isPaga ? 'text-gray-500' : 'text-gray-300'
                            }`}>
                              <Calendar className="w-4 h-4 flex-shrink-0" />
                              <span className="font-medium">
                                {new Date(transacao.data).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                              {transacao.dataPagamento && (
                                <span className="text-emerald-400 ml-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span className="text-xs font-semibold">Paga em {new Date(transacao.dataPagamento).toLocaleDateString('pt-BR')}</span>
                                </span>
                              )}
                            </span>
                            <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-accent-electric/25 to-accent-cyan/25 text-accent-electric border border-accent-electric/40 shadow-sm">
                              <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent-electric"></span>
                                {transacao.categoria}
                              </span>
                            </span>
                            {transacao.tipoRecorrencia && (
                              <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/25 text-purple-300 border border-purple-500/40 shadow-sm">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                                  {transacao.tipoRecorrencia.charAt(0).toUpperCase() + transacao.tipoRecorrencia.slice(1)}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-baseline gap-2">
                            <span className={`text-2xl font-bold ${
                              transacao.tipo === 'entrada' ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                              {transacao.tipo === 'entrada' ? '+' : '-'}
                            </span>
                            <span
                              className={`text-3xl font-extrabold tracking-tight ${
                                transacao.tipo === 'saida' && isPaga
                                  ? 'text-gray-500 line-through'
                                  : transacao.tipo === 'entrada'
                                  ? 'text-emerald-400'
                                  : isVencida
                                  ? 'text-red-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {formatCurrency(transacao.valor)}
                            </span>
                          </div>
                          {isVencida && !isPaga && (
                            <div className="mt-2 px-2.5 py-1 rounded-lg bg-red-500/20 border border-red-500/30">
                              <p className="text-xs text-red-400 font-semibold flex items-center gap-1.5">
                                <AlertCircle className="w-3 h-3" />
                                Vencida há {Math.floor((new Date().getTime() - new Date(transacao.data).getTime()) / (1000 * 60 * 60 * 24))} dia(s)
                              </p>
                            </div>
                          )}
                          {!isVencida && !isPaga && transacao.tipo === 'saida' && (
                            <p className="text-xs text-gray-500 mt-1.5">Pendente</p>
                          )}
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <button
                            onClick={() => handleVincularTarefa(transacao)}
                            className="p-2.5 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 rounded-xl transition-all border border-transparent hover:border-purple-500/30 shadow-sm hover:shadow-purple-500/20"
                            title="Vincular Tarefa"
                          >
                            <Link2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(transacao)}
                            className="p-2.5 text-accent-electric hover:text-accent-cyan hover:bg-accent-electric/20 rounded-xl transition-all border border-transparent hover:border-accent-electric/30 shadow-sm hover:shadow-accent-electric/20"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(transacao.id)}
                            className="p-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all border border-transparent hover:border-red-500/30 shadow-sm hover:shadow-red-500/20"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhuma transação encontrada</p>
              <p className="text-gray-500 text-sm mt-2">Comece registrando suas primeiras transações</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Transação */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTransacao(null)
          setCategoriaModal('')
        }}
        title={editingTransacao ? 'Editar Transação' : tipoTransacao === 'entrada' ? 'Nova Entrada' : 'Conta a Pagar'}
        description={editingTransacao ? 'Atualize os dados da transação' : tipoTransacao === 'entrada' ? 'Registre uma nova entrada financeira' : 'Registre uma nova conta a pagar'}
        size="md"
        variant={tipoTransacao === 'entrada' ? 'success' : 'error'}
        icon={tipoTransacao === 'entrada' ? TrendingUp : TrendingDown}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descrição
            </label>
            <input
              type="text"
              name="descricao"
              defaultValue={editingTransacao?.descricao}
              placeholder="Ex: Venda de produto, Pagamento de fornecedor..."
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Valor (R$)
              </label>
              <input
                type="number"
                name="valor"
                step="0.01"
                min="0"
                defaultValue={editingTransacao?.valor}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data
              </label>
              <input
                type="date"
                name="data"
                defaultValue={editingTransacao?.data ? formatDateForInput(editingTransacao.data) : formatDateForInput()}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {tipoTransacao === 'entrada' ? 'Cliente' : 'Categoria'}
            </label>
            {tipoTransacao === 'saida' ? (
              <>
                <CategoryInput
                  value={categoriaModal || editingTransacao?.categoria || ''}
                  onChange={(value) => setCategoriaModal(value)}
                  categories={categorias}
                  onAddCategory={handleAddCategory}
                  placeholder="Buscar ou criar categoria..."
                />
                <input
                  type="hidden"
                  name="categoria"
                  value={categoriaModal || editingTransacao?.categoria || ''}
                />
              </>
            ) : (
              <input
                type="text"
                name="categoria"
                defaultValue={editingTransacao?.categoria}
                placeholder="Nome do cliente"
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            )}
          </div>
          
          {/* Recorrência */}
          <div className="border-t border-card-border pt-4">
            <label className="flex items-center gap-2 cursor-pointer mb-4">
              <input
                type="checkbox"
                name="recorrente"
                defaultChecked={editingTransacao?.recorrente}
                className="w-4 h-4 rounded border-card-border bg-card-bg text-accent-electric focus:ring-accent-electric"
              />
              <span className="text-sm font-medium text-gray-300">Transação Recorrente</span>
            </label>
            
            <div id="recorrencia-options" className="space-y-4 hidden">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Recorrência
                </label>
                <select
                  name="tipoRecorrencia"
                  defaultValue={editingTransacao?.tipoRecorrencia || 'mensal'}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="diaria">Diária</option>
                  <option value="semanal">Semanal</option>
                  <option value="quinzenal">Quinzenal</option>
                  <option value="mensal">Mensal</option>
                  <option value="bimestral">Bimestral</option>
                  <option value="trimestral">Trimestral</option>
                  <option value="semestral">Semestral</option>
                  <option value="anual">Anual</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data Final (Opcional)
                  </label>
                  <input
                    type="date"
                    name="dataFim"
                    defaultValue={editingTransacao?.dataFim}
                    className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Quantidade de Repetições (Opcional)
                  </label>
                  <input
                    type="number"
                    name="quantidadeRecorrencias"
                    min="1"
                    defaultValue={editingTransacao?.quantidadeRecorrencias}
                    placeholder="Ex: 12"
                    className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false)
                setEditingTransacao(null)
                setCategoriaModal('')
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingTransacao ? 'Salvar Alterações' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Vincular Tarefa */}
      <Modal
        isOpen={isTarefaModalOpen}
        onClose={() => {
          setIsTarefaModalOpen(false)
          setTransacaoParaTarefa(null)
        }}
        title="Vincular Tarefa"
        description={`Criar tarefa relacionada à transação: ${transacaoParaTarefa?.descricao.substring(0, 30) || ''}...`}
        size="md"
        variant="default"
        icon={Link2}
      >
        <form onSubmit={handleSubmitTarefa} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título da Tarefa
            </label>
            <input
              type="text"
              name="titulo"
              defaultValue={`Tarefa - ${transacaoParaTarefa?.descricao.substring(0, 30) || ''}...`}
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descrição
            </label>
            <textarea
              name="descricao"
              rows={3}
              placeholder="Descreva a tarefa relacionada a esta transação..."
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prioridade
              </label>
              <select
                name="prioridade"
                defaultValue="Média"
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data
              </label>
              <input
                type="date"
                name="data"
                defaultValue={formatDateForInput()}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="tarefaRapida"
                className="w-4 h-4 rounded border-card-border bg-card-bg text-accent-electric focus:ring-accent-electric"
              />
              <span className="text-sm text-gray-300">Tarefa Rápida (2 min)</span>
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              <Link2 className="w-4 h-4 mr-2" />
              Vincular Tarefa
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsTarefaModalOpen(false)
                setTransacaoParaTarefa(null)
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  )
}
