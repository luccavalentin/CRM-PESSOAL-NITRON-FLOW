'use client'

import { useState, useEffect, useMemo } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { useFinancasPessoaisStore } from '@/stores/financasPessoaisStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { formatCurrency } from '@/utils/formatCurrency'
import { TransacaoFinanceira } from '@/types'
import { Plus, TrendingUp, TrendingDown, Wallet, Link2, ListTodo, Edit2, Trash2, Filter, Search, Calendar, BarChart3, PieChart as PieChartIcon, ArrowUpDown } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useTarefasStore } from '@/stores/tarefasStore'
import { Tarefa, Prioridade, CategoriaTarefa, StatusTarefa } from '@/types'
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts'

const COLORS = ['#00D9FF', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

export default function ControleFinancasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTarefaModalOpen, setIsTarefaModalOpen] = useState(false)
  const [editingTransacao, setEditingTransacao] = useState<TransacaoFinanceira | null>(null)
  const [transacaoParaTarefa, setTransacaoParaTarefa] = useState<TransacaoFinanceira | null>(null)
  const [tipoTransacao, setTipoTransacao] = useState<'entrada' | 'saida'>('entrada')
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'entrada' | 'saida'>('todos')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas')
  const [busca, setBusca] = useState('')
  const [ordenacao, setOrdenacao] = useState<'data' | 'valor' | 'categoria'>('data')
  const [ordem, setOrdem] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
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
    
    if (isModalOpen && editingTransacao?.recorrente) {
      setTimeout(() => {
        if (options) options.classList.remove('hidden')
      }, 100)
    }
    
    return () => {
      checkbox?.removeEventListener('change', handleChange)
    }
  }, [isModalOpen, editingTransacao])

  const transacoes = useFinancasPessoaisStore((state) => state.transacoes)
  const saldoAtual = useFinancasPessoaisStore((state) => state.saldoAtual)
  const addTransacao = useFinancasPessoaisStore((state) => state.addTransacao)
  const updateTransacao = useFinancasPessoaisStore((state) => state.updateTransacao)
  const deleteTransacao = useFinancasPessoaisStore((state) => state.deleteTransacao)
  const calcularSaldo = useFinancasPessoaisStore((state) => state.calcularSaldo)
  const getEntradasMes = useFinancasPessoaisStore((state) => state.getEntradasMes)
  const getSaidasMes = useFinancasPessoaisStore((state) => state.getSaidasMes)
  const getPrevisaoMes = useFinancasPessoaisStore((state) => state.getPrevisaoMes)
  
  const addTarefa = useTarefasStore((state) => state.addTarefa)
  const tarefas = useTarefasStore((state) => state.tarefas)

  useEffect(() => {
    calcularSaldo()
  }, [transacoes, calcularSaldo])

  const entradasMes = getEntradasMes()
  const saidasMes = getSaidasMes()
  const previsaoMes = getPrevisaoMes()
  const mostrarValores = usePreferencesStore((state) => state.mostrarValores)

  // Dados para gráficos
  const dadosFluxoMensal = useMemo(() => {
    const ultimos6Meses = []
    const hoje = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      const mes = data.toLocaleDateString('pt-BR', { month: 'short' })
      
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
        mes,
        Entradas: entradas,
        Saídas: saidas,
        Saldo: entradas - saidas,
      })
    }
    
    return ultimos6Meses
  }, [transacoes])

  const dadosCategorias = useMemo(() => {
    const categoriasMap = new Map<string, { entradas: number, saidas: number }>()
    
    transacoes.forEach(t => {
      const atual = categoriasMap.get(t.categoria) || { entradas: 0, saidas: 0 }
      if (t.tipo === 'entrada') {
        atual.entradas += t.valor
      } else {
        atual.saidas += t.valor
      }
      categoriasMap.set(t.categoria, atual)
    })
    
    return Array.from(categoriasMap.entries())
      .map(([name, values]) => ({ 
        name, 
        entradas: values.entradas,
        saidas: values.saidas,
        total: values.entradas + values.saidas
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8)
  }, [transacoes])

  const dadosCategoriasPizza = useMemo(() => {
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

  const categoriasUnicas = useMemo(() => {
    return Array.from(new Set(transacoes.map(t => t.categoria))).sort()
  }, [transacoes])

  // Transações filtradas e ordenadas
  const transacoesFiltradas = useMemo(() => {
    let filtradas = [...transacoes]
    
    // Filtro por tipo
    if (filtroTipo !== 'todos') {
      filtradas = filtradas.filter(t => t.tipo === filtroTipo)
    }
    
    // Filtro por categoria
    if (filtroCategoria !== 'todas') {
      filtradas = filtradas.filter(t => t.categoria === filtroCategoria)
    }
    
    // Busca
    if (busca) {
      filtradas = filtradas.filter(t => 
        t.descricao.toLowerCase().includes(busca.toLowerCase()) ||
        t.categoria.toLowerCase().includes(busca.toLowerCase())
      )
    }
    
    // Ordenação
    filtradas.sort((a, b) => {
      let comparacao = 0
      switch (ordenacao) {
        case 'data':
          comparacao = new Date(a.data).getTime() - new Date(b.data).getTime()
          break
        case 'valor':
          comparacao = a.valor - b.valor
          break
        case 'categoria':
          comparacao = a.categoria.localeCompare(b.categoria)
          break
      }
      return ordem === 'asc' ? comparacao : -comparacao
    })
    
    return filtradas
  }, [transacoes, filtroTipo, filtroCategoria, busca, ordenacao, ordem])

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
      categoria: 'Pessoal' as CategoriaTarefa,
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

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Controle Financeiro</h1>
            <p className="text-gray-400">Gerencie suas finanças pessoais com controle total</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => {
                setTipoTransacao('entrada')
                setEditingTransacao(null)
                setIsModalOpen(true)
              }}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-600/50 hover:shadow-xl hover:shadow-emerald-600/70 hover:scale-105 transition-all duration-200 border-2 border-emerald-500/50"
            >
              <Plus className="w-5 h-5" />
              Nova Entrada
            </Button>
            <Button
              onClick={() => {
                setTipoTransacao('saida')
                setEditingTransacao(null)
                setIsModalOpen(true)
              }}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-red-600/50 hover:shadow-xl hover:shadow-red-600/70 hover:scale-105 transition-all duration-200 border-2 border-red-500/50"
            >
              <Plus className="w-5 h-5" />
              Nova Saída
            </Button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Saldo Atual"
            value={mostrarValores ? formatCurrency(saldoAtual) : '••••••'}
            icon={Wallet}
            valueColor={saldoAtual > 0 ? 'text-emerald-400' : 'text-red-400'}
            className="bg-gradient-to-br from-accent-electric/10 to-accent-cyan/5 border-accent-electric/20"
          />
          <StatCard
            title="Entradas do Mês"
            value={mostrarValores ? formatCurrency(entradasMes) : '••••••'}
            icon={TrendingUp}
            valueColor="text-emerald-400"
            className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20"
          />
          <StatCard
            title="Saídas do Mês"
            value={mostrarValores ? formatCurrency(saidasMes) : '••••••'}
            icon={TrendingDown}
            valueColor="text-red-400"
            className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20"
          />
          <StatCard
            title="Previsão do Mês"
            value={mostrarValores ? formatCurrency(previsaoMes) : '••••••'}
            icon={Wallet}
            valueColor={previsaoMes > 0 ? 'text-emerald-400' : 'text-red-400'}
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20"
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fluxo de Caixa Mensal */}
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-accent-electric" />
              <h3 className="text-lg font-bold text-white">Fluxo de Caixa (6 Meses)</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dadosFluxoMensal}>
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
                <Area type="monotone" dataKey="Saídas" stroke="#EF4444" fillOpacity={1} fill="url(#colorSaidas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Gastos por Categoria */}
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="w-5 h-5 text-accent-electric" />
              <h3 className="text-lg font-bold text-white">Gastos por Categoria</h3>
            </div>
            {dadosCategoriasPizza.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosCategoriasPizza}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosCategoriasPizza.map((entry, index) => (
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
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-gray-400">Nenhum dado disponível</p>
              </div>
            )}
          </div>
        </div>

        {/* Análise por Categoria */}
        {dadosCategorias.length > 0 && (
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-accent-electric" />
              <h3 className="text-lg font-bold text-white">Análise por Categoria</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosCategorias}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} angle={-45} textAnchor="end" height={100} />
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
                <Bar dataKey="entradas" fill="#10B981" name="Entradas" radius={[8, 8, 0, 0]} />
                <Bar dataKey="saidas" fill="#EF4444" name="Saídas" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Filtros e Busca */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por descrição ou categoria..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
              />
            </div>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as 'todos' | 'entrada' | 'saida')}
              className="px-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
            >
              <option value="todos">Todos os Tipos</option>
              <option value="entrada">Entradas</option>
              <option value="saida">Saídas</option>
            </select>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="px-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
            >
              <option value="todas">Todas as Categorias</option>
              {categoriasUnicas.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value as 'data' | 'valor' | 'categoria')}
                className="px-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
              >
                <option value="data">Data</option>
                <option value="valor">Valor</option>
                <option value="categoria">Categoria</option>
              </select>
              <button
                onClick={() => setOrdem(ordem === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2.5 bg-dark-black/50 border border-card-border/50 rounded-lg text-white hover:border-accent-electric/50 transition-colors"
                title={ordem === 'asc' ? 'Crescente' : 'Decrescente'}
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Transações */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-accent-electric" />
              Transações ({transacoesFiltradas.length})
            </h2>
          </div>
          {transacoesFiltradas.length > 0 ? (
            <div className="space-y-3">
              {transacoesFiltradas.map((transacao) => {
                const tarefasVinculadas = tarefas.filter(t => 
                  t.etiquetas?.some(e => e.includes(transacao.descricao.substring(0, 30)))
                )
                
                return (
                  <div
                    key={transacao.id}
                    className="p-5 bg-dark-black/50 border border-card-border/50 rounded-xl hover:border-accent-electric/30 transition-all group"
                  >
                    {tarefasVinculadas.length > 0 && (
                      <div className="mb-3 p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        <div className="flex items-center gap-2 text-xs text-purple-400">
                          <ListTodo className="w-3 h-3" />
                          <span>{tarefasVinculadas.length} tarefa(s) vinculada(s)</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <p className="text-white font-semibold text-lg">{transacao.descricao}</p>
                          {transacao.recorrente && (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                              Recorrente
                            </span>
                          )}
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                            transacao.tipo === 'entrada'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}>
                            {transacao.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(transacao.data).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-accent-electric/15 text-accent-electric border border-accent-electric/20">
                            {transacao.categoria}
                          </span>
                          {transacao.tipoRecorrencia && (
                            <span className="text-purple-400">
                              • {transacao.tipoRecorrencia.charAt(0).toUpperCase() + transacao.tipoRecorrencia.slice(1)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`text-2xl font-bold ${
                            transacao.tipo === 'entrada'
                              ? 'text-emerald-400'
                              : 'text-red-400'
                          }`}
                        >
                          {transacao.tipo === 'entrada' ? '+' : '-'}
                          {mostrarValores ? formatCurrency(transacao.valor) : '••••'}
                        </span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleVincularTarefa(transacao)}
                            className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors"
                            title="Vincular Tarefa"
                          >
                            <Link2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(transacao)}
                            className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(transacao.id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
            <div className="text-center py-16">
              <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhuma transação encontrada</p>
              <p className="text-gray-500 text-sm mt-1">Ajuste os filtros ou adicione uma nova transação</p>
            </div>
          )}
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
          size="lg"
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
                className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
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
                  className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Categoria
                </label>
                <input
                  type="text"
                  name="categoria"
                  defaultValue={editingTransacao?.categoria}
                  placeholder="Ex: Salário, Alimentação..."
                  className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data
              </label>
              <input
                type="date"
                name="data"
                defaultValue={editingTransacao?.data || new Date().toISOString().split('T')[0]}
                className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
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
                    className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
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
                      className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
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
                      className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
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
      </div>
    </MainLayout>
  )
}
