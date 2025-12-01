'use client'

import { useState, useEffect, useMemo } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { formatCurrency } from '@/utils/formatCurrency'
import { Plus, TrendingUp, DollarSign, PieChart, Trash2, Edit2, Building2, Calendar, Percent } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'

interface Aplicacao {
  id: string
  nome: string
  tipo: string
  bancoCorretora: string
  valorInvestido: number
  valorAtual: number
  taxaAnual?: number
  taxaAdministracao?: number
  prazo?: string
  dataAplicacao: string
  rentabilidade: number
  observacoes?: string
}

const COLORS = ['#00D9FF', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

export default function AplicacoesPessoaisPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAplicacao, setEditingAplicacao] = useState<Aplicacao | null>(null)
  const [aplicacoes, setAplicacoes] = useState<Aplicacao[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('aplicacoes-pessoal')
    if (saved) {
      setAplicacoes(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('aplicacoes-pessoal', JSON.stringify(aplicacoes))
  }, [aplicacoes])

  const calcularRentabilidade = (aplicacao: Partial<Aplicacao>): number => {
    if (!aplicacao.valorInvestido || aplicacao.valorInvestido <= 0) return 0
    
    if (aplicacao.valorAtual && aplicacao.valorAtual > 0) {
      return ((aplicacao.valorAtual - aplicacao.valorInvestido) / aplicacao.valorInvestido) * 100
    }
    
    if (aplicacao.taxaAnual && aplicacao.prazo && aplicacao.dataAplicacao) {
      const dataInicio = new Date(aplicacao.dataAplicacao)
      const dataFim = new Date(aplicacao.prazo)
      const dias = Math.max(1, Math.ceil((dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24)))
      const anos = dias / 365
      const taxaEfetiva = aplicacao.taxaAnual - (aplicacao.taxaAdministracao || 0)
      const valorProjetado = aplicacao.valorInvestido * (1 + (taxaEfetiva / 100) * anos)
      return ((valorProjetado - aplicacao.valorInvestido) / aplicacao.valorInvestido) * 100
    }
    
    return 0
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const valorInvestido = parseFloat(formData.get('valorInvestido') as string) || 0
    const valorAtual = parseFloat(formData.get('valorAtual') as string) || 0
    const taxaAnual = formData.get('taxaAnual') ? parseFloat(formData.get('taxaAnual') as string) : undefined
    const taxaAdministracao = formData.get('taxaAdministracao') ? parseFloat(formData.get('taxaAdministracao') as string) : undefined
    const prazo = formData.get('prazo') as string || undefined

    const dadosAplicacao: Partial<Aplicacao> = {
      valorInvestido,
      valorAtual: valorAtual || undefined,
      taxaAnual,
      taxaAdministracao,
      prazo,
    }

    const rentabilidade = calcularRentabilidade({
      ...dadosAplicacao,
      dataAplicacao: formData.get('dataAplicacao') as string || new Date().toISOString().split('T')[0],
    })

    const novaAplicacao: Aplicacao = {
      id: editingAplicacao?.id || uuidv4(),
      nome: (formData.get('nome') as string) || 'Sem nome',
      tipo: (formData.get('tipo') as string) || 'Outros',
      bancoCorretora: (formData.get('bancoCorretora') as string) || 'Não informado',
      valorInvestido,
      valorAtual: valorAtual || valorInvestido,
      taxaAnual,
      taxaAdministracao,
      prazo,
      dataAplicacao: (formData.get('dataAplicacao') as string) || new Date().toISOString().split('T')[0],
      rentabilidade,
      observacoes: formData.get('observacoes') as string || undefined,
    }

    if (editingAplicacao) {
      setAplicacoes(aplicacoes.map(a => a.id === editingAplicacao.id ? novaAplicacao : a))
    } else {
      setAplicacoes([...aplicacoes, novaAplicacao])
    }

    setIsModalOpen(false)
    setEditingAplicacao(null)
  }

  const handleEdit = (aplicacao: Aplicacao) => {
    setEditingAplicacao(aplicacao)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta aplicação?')) {
      setAplicacoes(aplicacoes.filter(a => a.id !== id))
    }
  }

  const totalInvestido = aplicacoes.reduce((acc, a) => acc + a.valorInvestido, 0)
  const totalAtual = aplicacoes.reduce((acc, a) => acc + (a.valorAtual || a.valorInvestido), 0)
  const lucroPrejuizo = totalAtual - totalInvestido
  const rentabilidadeGeral = totalInvestido > 0 ? ((totalAtual - totalInvestido) / totalInvestido) * 100 : 0

  const dadosGraficoLinha = useMemo(() => {
    return aplicacoes.map(a => ({
      nome: a.nome.length > 15 ? a.nome.substring(0, 15) + '...' : a.nome,
      rentabilidade: parseFloat(a.rentabilidade.toFixed(2)),
      valorAtual: a.valorAtual || a.valorInvestido,
    }))
  }, [aplicacoes])

  const dadosGraficoPizza = useMemo(() => {
    return aplicacoes.map(a => ({
      name: a.nome.length > 20 ? a.nome.substring(0, 20) + '...' : a.nome,
      value: a.valorInvestido,
    }))
  }, [aplicacoes])

  const dadosGraficoBarras = useMemo(() => {
    return aplicacoes.map(a => ({
      nome: a.nome.length > 12 ? a.nome.substring(0, 12) + '...' : a.nome,
      investido: a.valorInvestido,
      atual: a.valorAtual || a.valorInvestido,
    }))
  }, [aplicacoes])

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 px-2 sm:px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Investimentos</h1>
            <p className="text-sm sm:text-base text-gray-400">Gerencie seus investimentos pessoais</p>
          </div>
          <Button
            onClick={() => {
              setEditingAplicacao(null)
              setIsModalOpen(true)
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-sm sm:text-lg px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl shadow-lg shadow-blue-600/50 hover:shadow-xl hover:shadow-blue-600/70 hover:scale-105 transition-all duration-200 border-2 border-blue-500/50 hover:from-blue-500 hover:to-blue-600"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Novo Investimento</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <StatCard
            title="Total Investido"
            value={formatCurrency(totalInvestido)}
            icon={DollarSign}
          />
          <StatCard
            title="Valor Atual"
            value={formatCurrency(totalAtual)}
            icon={TrendingUp}
            valueColor="text-emerald-400"
          />
          <StatCard
            title="Lucro/Prejuízo"
            value={formatCurrency(lucroPrejuizo)}
            icon={PieChart}
            valueColor={lucroPrejuizo >= 0 ? 'text-emerald-400' : 'text-red-400'}
          />
          <StatCard
            title="Rentabilidade"
            value={`${rentabilidadeGeral.toFixed(2)}%`}
            icon={TrendingUp}
            valueColor={rentabilidadeGeral >= 0 ? 'text-emerald-400' : 'text-red-400'}
          />
        </div>

        {aplicacoes.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-4 sm:p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent-electric" />
                Rentabilidade por Investimento
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dadosGraficoLinha}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="nome" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: number) => `${value.toFixed(2)}%`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="rentabilidade" 
                    stroke="#00D9FF" 
                    strokeWidth={2}
                    name="Rentabilidade (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-4 sm:p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-accent-electric" />
                Distribuição de Investimentos
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={dadosGraficoPizza}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosGraficoPizza.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-4 sm:p-6 lg:col-span-2">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-accent-electric" />
                Comparação: Investido vs Valor Atual
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosGraficoBarras}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="nome" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
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
                  <Bar dataKey="investido" fill="#7C3AED" name="Investido" />
                  <Bar dataKey="atual" fill="#00D9FF" name="Valor Atual" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-accent-electric" />
            Todas as Aplicações
          </h2>
          {aplicacoes.length > 0 ? (
            <div className="space-y-3">
              {aplicacoes.map((aplicacao) => (
                <div
                  key={aplicacao.id}
                  className="p-4 sm:p-5 bg-dark-black/50 border border-card-border/50 rounded-xl hover:border-accent-electric/30 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
                    <div className="flex-1 w-full sm:w-auto">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-white">{aplicacao.nome}</h3>
                        <span className="px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold bg-accent-electric/15 text-accent-electric border border-accent-electric/20">
                          {aplicacao.tipo}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <p className="text-gray-400 mb-1">Investido</p>
                          <p className="text-white font-semibold text-xs sm:text-sm">
                            {formatCurrency(aplicacao.valorInvestido)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">Valor Atual</p>
                          <p className="text-white font-semibold text-xs sm:text-sm">
                            {formatCurrency(aplicacao.valorAtual || aplicacao.valorInvestido)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">Rentabilidade</p>
                          <p className={`font-semibold text-xs sm:text-sm ${aplicacao.rentabilidade >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {aplicacao.rentabilidade >= 0 ? '+' : ''}{aplicacao.rentabilidade.toFixed(2)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">Data</p>
                          <p className="text-white font-semibold text-xs sm:text-sm">
                            {new Date(aplicacao.dataAplicacao).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      {aplicacao.bancoCorretora && (
                        <div className="mt-2 sm:mt-3 flex items-center gap-2 text-xs sm:text-sm">
                          <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                          <span className="text-gray-400">{aplicacao.bancoCorretora}</span>
                        </div>
                      )}
                      {(aplicacao.taxaAnual || aplicacao.prazo) && (
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                          {aplicacao.taxaAnual && (
                            <div className="flex items-center gap-1">
                              <Percent className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                              <span className="text-gray-400">Taxa: {aplicacao.taxaAnual}% a.a.</span>
                            </div>
                          )}
                          {aplicacao.prazo && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                              <span className="text-gray-400">Vencimento: {new Date(aplicacao.prazo).toLocaleDateString('pt-BR')}</span>
                            </div>
                          )}
                        </div>
                      )}
                      {aplicacao.observacoes && (
                        <p className="text-xs sm:text-sm text-gray-400 mt-2 sm:mt-3">{aplicacao.observacoes}</p>
                      )}
                    </div>
                    <div className="flex gap-2 sm:ml-4 self-start sm:self-auto">
                      <button
                        onClick={() => handleEdit(aplicacao)}
                        className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                        aria-label="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(aplicacao.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        aria-label="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16">
              <PieChart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-base sm:text-lg font-medium">Nenhum investimento cadastrado</p>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">Comece registrando seus investimentos</p>
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingAplicacao(null)
          }}
          title={editingAplicacao ? 'Editar Investimento' : 'Novo Investimento'}
          size="lg"
          variant="info"
          icon={TrendingUp}
          description={editingAplicacao ? 'Atualize as informações do investimento' : 'Registre um novo investimento para acompanhar sua rentabilidade'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome do Investimento
              </label>
              <input
                type="text"
                name="nome"
                defaultValue={editingAplicacao?.nome}
                placeholder="Ex: Ações PETR4, CDB Banco X..."
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all text-sm sm:text-base"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo
                </label>
                <select
                  name="tipo"
                  defaultValue={editingAplicacao?.tipo || ''}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all text-sm sm:text-base"
                >
                  <option value="">Selecione</option>
                  <option value="Ações">Ações</option>
                  <option value="CDB">CDB</option>
                  <option value="LCI/LCA">LCI/LCA</option>
                  <option value="Tesouro Direto">Tesouro Direto</option>
                  <option value="Fundos">Fundos</option>
                  <option value="Criptomoedas">Criptomoedas</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Banco/Corretora
                </label>
                <input
                  type="text"
                  name="bancoCorretora"
                  defaultValue={editingAplicacao?.bancoCorretora}
                  placeholder="Ex: XP Investimentos, Banco Inter..."
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data da Aplicação
                </label>
                <input
                  type="date"
                  name="dataAplicacao"
                  defaultValue={editingAplicacao?.dataAplicacao || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Prazo/Vencimento
                </label>
                <input
                  type="date"
                  name="prazo"
                  defaultValue={editingAplicacao?.prazo}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Valor Investido (R$)
                </label>
                <input
                  type="number"
                  name="valorInvestido"
                  step="0.01"
                  min="0"
                  defaultValue={editingAplicacao?.valorInvestido}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all text-sm sm:text-base"
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
                  defaultValue={editingAplicacao?.valorAtual}
                  placeholder="Deixe vazio para calcular pela taxa"
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Taxa Anual (% a.a.)
                </label>
                <input
                  type="number"
                  name="taxaAnual"
                  step="0.01"
                  min="0"
                  defaultValue={editingAplicacao?.taxaAnual}
                  placeholder="Ex: 12.5"
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Taxa de Administração (% a.a.)
                </label>
                <input
                  type="number"
                  name="taxaAdministracao"
                  step="0.01"
                  min="0"
                  defaultValue={editingAplicacao?.taxaAdministracao}
                  placeholder="Ex: 0.5"
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all text-sm sm:text-base"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Observações
              </label>
              <textarea
                name="observacoes"
                defaultValue={editingAplicacao?.observacoes}
                rows={3}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all text-sm sm:text-base"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" className="flex-1 w-full sm:w-auto">
                {editingAplicacao ? 'Salvar Alterações' : 'Criar Investimento'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingAplicacao(null)
                }}
                className="w-full sm:w-auto"
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
