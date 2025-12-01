'use client'

import { useState, useEffect, useMemo } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { useFinancasEmpresaStore } from '@/stores/financasEmpresaStore'
import { formatCurrency } from '@/utils/formatCurrency'
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
  Trash
} from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useTarefasStore } from '@/stores/tarefasStore'
import { Tarefa, Prioridade, CategoriaTarefa, StatusTarefa } from '@/types'

type PeriodoFiltro = 'hoje' | 'semana' | 'mes' | 'trimestre' | 'ano' | 'todos'

export default function FluxoCaixaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTarefaModalOpen, setIsTarefaModalOpen] = useState(false)
  const [editingTransacao, setEditingTransacao] = useState<TransacaoFinanceira | null>(null)
  const [transacaoParaTarefa, setTransacaoParaTarefa] = useState<TransacaoFinanceira | null>(null)
  const [tipoTransacao, setTipoTransacao] = useState<'entrada' | 'saida'>('entrada')
  const [periodoFiltro, setPeriodoFiltro] = useState<PeriodoFiltro>('mes')
  const [busca, setBusca] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas')
  const [saldoInicial, setSaldoInicial] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  
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

  useEffect(() => {
    calcularFluxoCaixa()
  }, [transacoes, calcularFluxoCaixa])

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

  // Filtros e cálculos
  const transacoesFiltradas = useMemo(() => {
    let filtradas = [...transacoes]
    const hoje = new Date()

    // Filtro por período
    switch (periodoFiltro) {
      case 'hoje':
        filtradas = filtradas.filter(t => {
          const data = new Date(t.data)
          return data.toDateString() === hoje.toDateString()
        })
        break
      case 'semana':
        const inicioSemana = new Date(hoje)
        inicioSemana.setDate(hoje.getDate() - hoje.getDay())
        filtradas = filtradas.filter(t => new Date(t.data) >= inicioSemana)
        break
      case 'mes':
        filtradas = filtradas.filter(t => {
          const data = new Date(t.data)
          return data.getMonth() === hoje.getMonth() && data.getFullYear() === hoje.getFullYear()
        })
        break
      case 'trimestre':
        const trimestreAtual = Math.floor(hoje.getMonth() / 3)
        filtradas = filtradas.filter(t => {
          const data = new Date(t.data)
          return Math.floor(data.getMonth() / 3) === trimestreAtual && data.getFullYear() === hoje.getFullYear()
        })
        break
      case 'ano':
        filtradas = filtradas.filter(t => {
          const data = new Date(t.data)
          return data.getFullYear() === hoje.getFullYear()
        })
        break
    }

    // Filtro por busca
    if (busca) {
      filtradas = filtradas.filter(t => 
        t.descricao.toLowerCase().includes(busca.toLowerCase()) ||
        t.categoria.toLowerCase().includes(busca.toLowerCase())
      )
    }

    // Filtro por categoria
    if (categoriaFiltro !== 'todas') {
      filtradas = filtradas.filter(t => t.categoria === categoriaFiltro)
    }

    return filtradas.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
  }, [transacoes, periodoFiltro, busca, categoriaFiltro])

  const entradas = transacoesFiltradas.filter(t => t.tipo === 'entrada')
  const saidas = transacoesFiltradas.filter(t => t.tipo === 'saida')
  const totalEntradas = entradas.reduce((acc, t) => acc + t.valor, 0)
  const totalSaidas = saidas.reduce((acc, t) => acc + t.valor, 0)
  const saldoPeriodo = totalEntradas - totalSaidas
  const saldoAtual = saldoInicial + fluxoCaixa

  // Categorias únicas para filtro
  const categorias = useMemo(() => {
    const cats = new Set(transacoes.map(t => t.categoria))
    return Array.from(cats).sort()
  }, [transacoes])

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
    
    const novaTransacao: TransacaoFinanceira = {
      id: editingTransacao?.id || uuidv4(),
      descricao: (formData.get('descricao') as string) || 'Sem descrição',
      valor: parseFloat(formData.get('valor') as string) || 0,
      categoria: (formData.get('categoria') as string) || 'Outros',
      data: (formData.get('data') as string) || new Date().toISOString().split('T')[0],
      tipo: tipoTransacao,
      recorrente: isRecorrente,
      tipoRecorrencia: isRecorrente ? tipoRecorrencia : undefined,
      dataFim: isRecorrente && dataFim ? dataFim : undefined,
      quantidadeRecorrencias: isRecorrente && quantidadeRecorrencias ? quantidadeRecorrencias : undefined,
      transacaoOriginalId: isRecorrente && !editingTransacao ? transacaoOriginalId : editingTransacao?.transacaoOriginalId,
    }

    if (editingTransacao) {
      updateTransacao(editingTransacao.id, novaTransacao)
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
          }
          addTransacao(transacaoRecorrente)
        }
      }
    }

    setIsModalOpen(false)
    setEditingTransacao(null)
  }

  const calcularProximaData = (dataInicial: Date, tipoRecorrencia: TransacaoFinanceira['tipoRecorrencia'], multiplicador: number): Date => {
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
  }

  const calcularQuantidadeRecorrencias = (dataInicial: Date, dataFim: Date, tipoRecorrencia: TransacaoFinanceira['tipoRecorrencia']): number => {
    let count = 0
    let data = new Date(dataInicial)
    while (data <= dataFim) {
      count++
      data = calcularProximaData(dataInicial, tipoRecorrencia, count)
    }
    return count
  }

  const handleEdit = (transacao: TransacaoFinanceira) => {
    setEditingTransacao(transacao)
    setTipoTransacao(transacao.tipo)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      deleteTransacao(id)
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

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
      data: (formData.get('data') as string) || new Date().toISOString().split('T')[0],
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
                setIsModalOpen(true)
              }}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Saída
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-card-bg border border-card-border rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Período
              </label>
              <select
                value={periodoFiltro}
                onChange={(e) => setPeriodoFiltro(e.target.value as PeriodoFiltro)}
                className="w-full px-4 py-2 bg-dark-black border border-card-border rounded-lg text-white focus:outline-none focus:border-accent-electric"
              >
                <option value="hoje">Hoje</option>
                <option value="semana">Esta Semana</option>
                <option value="mes">Este Mês</option>
                <option value="trimestre">Este Trimestre</option>
                <option value="ano">Este Ano</option>
                <option value="todos">Todos</option>
              </select>
            </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
            title="Total Saídas"
            value={formatCurrency(totalSaidas)}
            icon={TrendingDown}
            valueColor="text-red-400"
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
                  name="Saídas"
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

          {/* Gráfico de Pizza - Saídas por Categoria */}
          <div className="bg-card-bg border border-card-border rounded-xl p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-accent-electric" />
              Saídas por Categoria
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
                Nenhuma saída no período
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

          {/* Saídas por Categoria */}
          <div className="bg-card-bg border border-card-border rounded-xl p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ArrowDownRight className="w-5 h-5 text-red-400" />
              Saídas por Categoria
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
              <p className="text-gray-400 text-center py-8">Nenhuma saída registrada</p>
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
              {transacoesFiltradas.map((transacao) => (
                <div
                  key={transacao.id}
                  className="flex items-center justify-between p-4 bg-dark-black/50 border border-card-border rounded-lg hover:border-accent-electric/30 transition-all group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(transacao.id)}
                      onChange={() => handleToggleSelect(transacao.id)}
                      className="w-5 h-5 rounded border-card-border bg-dark-black/50 text-accent-electric focus:ring-accent-electric cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          transacao.tipo === 'entrada' 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {transacao.tipo === 'entrada' ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium truncate">{transacao.descricao}</p>
                          {transacao.recorrente && (
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                              Recorrente
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">
                          {transacao.categoria} • {new Date(transacao.data).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                          {transacao.tipoRecorrencia && (
                            <span className="ml-2 text-purple-400">
                              • {transacao.tipoRecorrencia.charAt(0).toUpperCase() + transacao.tipoRecorrencia.slice(1)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    </div>
                  </div>
                  {tarefas.filter(t => 
                    t.etiquetas?.some(e => e.includes(transacao.descricao.substring(0, 30)))
                  ).length > 0 && (
                    <div className="mb-2 p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <div className="flex items-center gap-2 text-xs text-purple-400">
                        <ListTodo className="w-3 h-3" />
                        <span>
                          {tarefas.filter(t => 
                            t.etiquetas?.some(e => e.includes(transacao.descricao.substring(0, 30)))
                          ).length} tarefa(s) vinculada(s)
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-lg font-bold ${
                        transacao.tipo === 'entrada'
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      {transacao.tipo === 'entrada' ? '+' : '-'}
                      {formatCurrency(transacao.valor)}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleVincularTarefa(transacao)}
                        className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded transition-colors"
                        title="Vincular Tarefa"
                      >
                        <Link2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(transacao)}
                        className="p-2 text-gray-400 hover:text-accent-electric hover:bg-accent-electric/10 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(transacao.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleVincularTarefa(transacao)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 rounded-lg transition-colors"
                    >
                      <Link2 className="w-3 h-3" />
                      Vincular Tarefa
                    </button>
                  </div>
                </div>
              ))}
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
        }}
        title={editingTransacao ? 'Editar Transação' : tipoTransacao === 'entrada' ? 'Nova Entrada' : 'Nova Saída'}
        description={editingTransacao ? 'Atualize os dados da transação' : tipoTransacao === 'entrada' ? 'Registre uma nova entrada financeira' : 'Registre uma nova saída financeira'}
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
                defaultValue={editingTransacao?.data || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {tipoTransacao === 'entrada' ? 'Cliente' : 'Categoria'}
            </label>
            <input
              type="text"
              name="categoria"
              defaultValue={editingTransacao?.categoria}
              placeholder={tipoTransacao === 'entrada' ? 'Nome do cliente' : 'Categoria da despesa'}
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
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
                defaultValue={new Date().toISOString().split('T')[0]}
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
