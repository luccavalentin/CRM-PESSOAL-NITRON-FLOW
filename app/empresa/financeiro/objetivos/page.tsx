'use client'

import { useState, useMemo } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { useFinancasEmpresaStore } from '@/stores/financasEmpresaStore'
import { MetaFinanceira } from '@/types'
import { formatCurrency } from '@/utils/formatCurrency'
import { Plus, Target, TrendingUp, Calendar, Trash2, Edit2, AlertCircle, CheckCircle2, BarChart3, Filter, DollarSign, Link2, ListTodo } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts'
import { useTarefasStore } from '@/stores/tarefasStore'
import { Tarefa, Prioridade, CategoriaTarefa, StatusTarefa } from '@/types'

export default function ObjetivosFinanceirosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTarefaModalOpen, setIsTarefaModalOpen] = useState(false)
  const [editingMeta, setEditingMeta] = useState<MetaFinanceira | null>(null)
  const [metaParaTarefa, setMetaParaTarefa] = useState<MetaFinanceira | null>(null)
  const [filtroStatus, setFiltroStatus] = useState<'todas' | 'ativas' | 'completas' | 'vencidas'>('todas')

  const metas = useFinancasEmpresaStore((state) => state.metas)
  const addMeta = useFinancasEmpresaStore((state) => state.addMeta)
  const updateMeta = useFinancasEmpresaStore((state) => state.updateMeta)
  const deleteMeta = useFinancasEmpresaStore((state) => state.deleteMeta)
  
  const addTarefa = useTarefasStore((state) => state.addTarefa)
  const tarefas = useTarefasStore((state) => state.tarefas)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novaMeta: MetaFinanceira = {
      id: editingMeta?.id || uuidv4(),
      descricao: (formData.get('descricao') as string) || 'Sem descrição',
      valorMeta: parseFloat(formData.get('valorMeta') as string) || 0,
      valorAtual: editingMeta?.valorAtual || parseFloat(formData.get('valorAtual') as string) || 0,
      dataLimite: formData.get('dataLimite') as string || undefined,
    }

    if (editingMeta) {
      updateMeta(editingMeta.id, novaMeta)
    } else {
      addMeta(novaMeta)
    }

    setIsModalOpen(false)
    setEditingMeta(null)
  }

  const handleEdit = (meta: MetaFinanceira) => {
    setEditingMeta(meta)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
      deleteMeta(id)
    }
  }

  const handleAtualizarValor = (id: string, novoValor: number) => {
    const meta = metas.find(m => m.id === id)
    if (meta) {
      updateMeta(id, { valorAtual: Math.max(0, novoValor) })
    }
  }

  const handleVincularTarefa = (meta: MetaFinanceira) => {
    setMetaParaTarefa(meta)
    setIsTarefaModalOpen(true)
  }

  const handleSubmitTarefa = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!metaParaTarefa) return

    const formData = new FormData(e.currentTarget)
    const novaTarefa: Tarefa = {
      id: uuidv4(),
      titulo: (formData.get('titulo') as string) || `Tarefa - ${metaParaTarefa.descricao.substring(0, 30)}`,
      descricao: formData.get('descricao') as string || undefined,
      prioridade: (formData.get('prioridade') as Prioridade) || 'Média',
      categoria: 'Empresarial' as CategoriaTarefa,
      data: (formData.get('data') as string) || new Date().toISOString().split('T')[0],
      status: 'Pendente' as StatusTarefa,
      tarefaRapida: formData.get('tarefaRapida') === 'on',
      recorrente: false,
      concluida: false,
      etiquetas: [`Objetivo: ${metaParaTarefa.descricao.substring(0, 30)}`, `Meta: ${formatCurrency(metaParaTarefa.valorMeta)}`],
      projetoId: undefined,
    }

    addTarefa(novaTarefa)
    setIsTarefaModalOpen(false)
    setMetaParaTarefa(null)
  }

  // Filtros
  const metasFiltradas = useMemo(() => {
    switch (filtroStatus) {
      case 'ativas':
        return metas.filter(m => {
          if (m.dataLimite) {
            return new Date(m.dataLimite) >= new Date() && m.valorAtual < m.valorMeta
          }
          return m.valorAtual < m.valorMeta
        })
      case 'completas':
        return metas.filter(m => m.valorAtual >= m.valorMeta)
      case 'vencidas':
        return metas.filter(m => {
          if (m.dataLimite) {
            return new Date(m.dataLimite) < new Date() && m.valorAtual < m.valorMeta
          }
          return false
        })
      default:
        return metas
    }
  }, [metas, filtroStatus])

  const metasAtivas = metas.filter(m => {
    if (m.dataLimite) {
      return new Date(m.dataLimite) >= new Date() && m.valorAtual < m.valorMeta
    }
    return m.valorAtual < m.valorMeta
  })
  const metasCompletas = metas.filter(m => m.valorAtual >= m.valorMeta)
  const metasVencidas = metas.filter(m => {
    if (m.dataLimite) {
      return new Date(m.dataLimite) < new Date() && m.valorAtual < m.valorMeta
    }
    return false
  })
  const totalMetas = metas.reduce((acc, m) => acc + m.valorMeta, 0)
  const totalAtual = metas.reduce((acc, m) => acc + m.valorAtual, 0)
  const percentualGeral = totalMetas > 0 ? (totalAtual / totalMetas) * 100 : 0
  const faltanteGeral = totalMetas - totalAtual

  // Dados para gráficos
  const dadosGraficoBarras = useMemo(() => {
    return metasFiltradas.map(m => ({
      nome: m.descricao.length > 15 ? m.descricao.substring(0, 15) + '...' : m.descricao,
      meta: m.valorMeta,
      atual: m.valorAtual,
      percentual: m.valorMeta > 0 ? (m.valorAtual / m.valorMeta) * 100 : 0,
    }))
  }, [metasFiltradas])

  const coresPizza = ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899']

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Objetivos Financeiros</h1>
            <p className="text-gray-400 text-sm">Gerencie suas metas financeiras empresariais</p>
          </div>
          <Button
            onClick={() => {
              setEditingMeta(null)
              setIsModalOpen(true)
            }}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Novo Objetivo
          </Button>
        </div>

        {/* Filtros */}
        <div className="bg-card-bg border border-card-border rounded-xl p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-400" />
            <button
              onClick={() => setFiltroStatus('todas')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroStatus === 'todas'
                  ? 'bg-accent-electric/20 text-accent-electric border border-accent-electric/30'
                  : 'bg-dark-black/50 text-gray-400 border border-card-border/50 hover:border-accent-electric/30'
              }`}
            >
              Todas ({metas.length})
            </button>
            <button
              onClick={() => setFiltroStatus('ativas')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroStatus === 'ativas'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-dark-black/50 text-gray-400 border border-card-border/50 hover:border-blue-500/30'
              }`}
            >
              Ativas ({metasAtivas.length})
            </button>
            <button
              onClick={() => setFiltroStatus('completas')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroStatus === 'completas'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-dark-black/50 text-gray-400 border border-card-border/50 hover:border-emerald-500/30'
              }`}
            >
              Completas ({metasCompletas.length})
            </button>
            <button
              onClick={() => setFiltroStatus('vencidas')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroStatus === 'vencidas'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-dark-black/50 text-gray-400 border border-card-border/50 hover:border-red-500/30'
              }`}
            >
              Vencidas ({metasVencidas.length})
            </button>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Metas Ativas"
            value={metasAtivas.length}
            icon={Target}
            valueColor="text-blue-400"
          />
          <StatCard
            title="Metas Completas"
            value={metasCompletas.length}
            icon={CheckCircle2}
            valueColor="text-emerald-400"
          />
          <StatCard
            title="Total em Metas"
            value={formatCurrency(totalMetas)}
            icon={Target}
          />
          <StatCard
            title="Progresso Geral"
            value={`${Math.round(percentualGeral)}%`}
            icon={TrendingUp}
            valueColor="text-accent-electric"
          />
        </div>

        {/* Indicadores Adicionais */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card-bg border border-card-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Valor Atual</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totalAtual)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          <div className="bg-card-bg border border-card-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Faltante</p>
                <p className={`text-2xl font-bold ${faltanteGeral > 0 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                  {formatCurrency(faltanteGeral)}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          <div className="bg-card-bg border border-card-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Média de Conclusão</p>
                <p className="text-2xl font-bold text-white">
                  {metas.length > 0 
                    ? `${Math.round(metas.reduce((acc, m) => acc + (m.valorMeta > 0 ? (m.valorAtual / m.valorMeta) * 100 : 0), 0) / metas.length)}%`
                    : '0%'
                  }
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Gráficos */}
        {metasFiltradas.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Gráfico de Barras */}
            <div className="bg-card-bg border border-card-border rounded-xl p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-accent-electric" />
                Progresso das Metas
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosGraficoBarras}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="nome" stroke="#9CA3AF" fontSize={12} angle={-45} textAnchor="end" height={80} />
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
                  <Bar dataKey="meta" fill="#3b82f6" name="Meta" />
                  <Bar dataKey="atual" fill="#22c55e" name="Atual" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de Pizza */}
            <div className="bg-card-bg border border-card-border rounded-xl p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-accent-electric" />
                Distribuição por Meta
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
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
                    data={metasFiltradas.map(m => ({ name: m.descricao, value: m.valorMeta }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name.substring(0, 15)} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {metasFiltradas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={coresPizza[index % coresPizza.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Lista de Metas */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-4 sm:p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-accent-electric" />
            Metas ({metasFiltradas.length})
          </h2>
          {metasFiltradas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metasFiltradas.map((meta) => {
                const percentual = meta.valorMeta > 0
                  ? Math.min((meta.valorAtual / meta.valorMeta) * 100, 100)
                  : 0
                const isCompleta = meta.valorAtual >= meta.valorMeta
                const isVencida = meta.dataLimite ? new Date(meta.dataLimite) < new Date() : false
                const diasRestantes = meta.dataLimite 
                  ? Math.ceil((new Date(meta.dataLimite).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  : null
                
                return (
                  <div
                    key={meta.id}
                    className={`p-5 bg-dark-black/50 border rounded-xl transition-all hover:border-accent-electric/30 ${
                      isCompleta ? 'border-emerald-500/30 bg-emerald-500/5' :
                      isVencida ? 'border-red-500/30 bg-red-500/5' :
                      'border-card-border/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg mb-1 truncate">{meta.descricao}</h3>
                        <div className="flex items-center gap-4 text-sm mb-3">
                          <span className="text-gray-400">
                            {formatCurrency(meta.valorAtual)} / {formatCurrency(meta.valorMeta)}
                          </span>
                        </div>
                        {tarefas.filter(t => 
                          t.etiquetas?.some(e => e.includes(meta.descricao.substring(0, 30)))
                        ).length > 0 && (
                          <div className="mb-2 p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                            <div className="flex items-center gap-2 text-xs text-purple-400">
                              <ListTodo className="w-3 h-3" />
                              <span>
                                {tarefas.filter(t => 
                                  t.etiquetas?.some(e => e.includes(meta.descricao.substring(0, 30)))
                                ).length} tarefa(s) vinculada(s)
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVincularTarefa(meta)}
                          className="p-2 text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                          title="Vincular Tarefa"
                        >
                          <Link2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(meta)}
                          className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(meta.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => handleVincularTarefa(meta)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 rounded-lg transition-colors"
                      >
                        <Link2 className="w-3 h-3" />
                        Vincular Tarefa
                      </button>
                    </div>
                    
                    {/* Barra de Progresso */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className={`font-semibold ${
                          isCompleta ? 'text-emerald-400' :
                          isVencida ? 'text-red-400' :
                          'text-accent-electric'
                        }`}>
                          {Math.round(percentual)}% concluído
                        </span>
                        {isCompleta && (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            Completa
                          </span>
                        )}
                        {isVencida && !isCompleta && (
                          <span className="text-red-400 font-bold">Vencida</span>
                        )}
                      </div>
                      <div className="w-full bg-dark-black rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            isCompleta ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                            isVencida ? 'bg-gradient-to-r from-red-500 to-red-400' :
                            'bg-gradient-to-r from-blue-600 to-blue-700'
                          }`}
                          style={{ width: `${percentual}%` }}
                        />
                      </div>
                    </div>

                    {/* Informações Adicionais */}
                    <div className="space-y-2">
                      {meta.dataLimite && (
                        <div className="flex items-center gap-2 text-xs">
                          <Calendar className={`w-3 h-3 ${isVencida ? 'text-red-400' : 'text-gray-500'}`} />
                          <span className={isVencida ? 'text-red-400' : 'text-gray-400'}>
                            {diasRestantes !== null && (
                              diasRestantes > 0 
                                ? `${diasRestantes} dias restantes`
                                : diasRestantes === 0
                                ? 'Vence hoje'
                                : `Vencida há ${Math.abs(diasRestantes)} dias`
                            )}
                          </span>
                        </div>
                      )}
                      
                      {/* Input rápido para atualizar valor */}
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max={meta.valorMeta}
                          value={meta.valorAtual}
                          onChange={(e) => handleAtualizarValor(meta.id, parseFloat(e.target.value) || 0)}
                          className="flex-1 px-2 py-1.5 bg-dark-black border border-card-border rounded text-white text-sm focus:outline-none focus:border-accent-electric"
                          placeholder="Atualizar valor"
                        />
                        <span className="text-xs text-gray-500">/ {formatCurrency(meta.valorMeta)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhuma meta encontrada</p>
              <p className="text-gray-500 text-sm mt-1">
                {filtroStatus === 'todas' 
                  ? 'Comece criando seu primeiro objetivo financeiro'
                  : `Nenhuma meta ${filtroStatus === 'ativas' ? 'ativa' : filtroStatus === 'completas' ? 'completa' : 'vencida'}`
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingMeta(null)
        }}
        title={editingMeta ? 'Editar Objetivo' : 'Novo Objetivo'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descrição
            </label>
            <input
              type="text"
              name="descricao"
              defaultValue={editingMeta?.descricao}
              placeholder="Ex: Meta de faturamento mensal, Reserva para expansão..."
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Valor Meta (R$)
              </label>
              <input
                type="number"
                name="valorMeta"
                step="0.01"
                min="0"
                defaultValue={editingMeta?.valorMeta}
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
                defaultValue={editingMeta?.valorAtual || 0}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Data Limite
            </label>
            <input
              type="date"
              name="dataLimite"
              defaultValue={editingMeta?.dataLimite}
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingMeta ? 'Salvar Alterações' : 'Criar Objetivo'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false)
                setEditingMeta(null)
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Vincular Tarefa */}
      <Modal
        isOpen={isTarefaModalOpen}
        onClose={() => {
          setIsTarefaModalOpen(false)
          setMetaParaTarefa(null)
        }}
        title={`Vincular Tarefa - ${metaParaTarefa?.descricao.substring(0, 30) || ''}...`}
        size="md"
      >
        <form onSubmit={handleSubmitTarefa} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título da Tarefa
            </label>
            <input
              type="text"
              name="titulo"
              defaultValue={`Tarefa - ${metaParaTarefa?.descricao.substring(0, 30) || ''}...`}
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
              placeholder="Descreva a tarefa relacionada a este objetivo..."
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
                setMetaParaTarefa(null)
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
