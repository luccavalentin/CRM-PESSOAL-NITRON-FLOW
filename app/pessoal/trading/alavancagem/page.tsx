'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { useTradingStore } from '@/stores/tradingStore'
import { formatCurrency } from '@/utils/formatCurrency'
import { SessaoAlavancagem } from '@/types'
import ForexAutocomplete from '@/components/ui/ForexAutocomplete'
import { 
  Plus, 
  Zap,
  TrendingUp, 
  TrendingDown, 
  Trash2, 
  Edit2, 
  Calendar, 
  AlertCircle, 
  CheckCircle2,
  Shield,
  Target,
  BarChart3,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Clock,
  DollarSign,
  Activity,
  AlertTriangle,
  Settings,
  ArrowRight,
  Lock
} from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, ComposedChart } from 'recharts'

interface OperacaoAlavancagem {
  id: string
  sessaoId: string
  ativo: string
  tipo: 'CALL' | 'PUT'
  resultado: 'Gain' | 'Loss'
  valorEntrada: number
  lucroPrejuizo: number
  dataHora: string
  nivel: number
}

export default function AlavancagemPage() {
  const [isSessaoModalOpen, setIsSessaoModalOpen] = useState(false)
  const [isOperacaoModalOpen, setIsOperacaoModalOpen] = useState(false)
  const [isConfirmacaoNivelModalOpen, setIsConfirmacaoNivelModalOpen] = useState(false)
  const [editingSessao, setEditingSessao] = useState<SessaoAlavancagem | null>(null)
  const [sessaoAtiva, setSessaoAtiva] = useState<SessaoAlavancagem | null>(null)
  const [operacoesAlavancagem, setOperacoesAlavancagem] = useState<OperacaoAlavancagem[]>([])
  const [mostrarAlerta, setMostrarAlerta] = useState<{ tipo: 'nivel_concluido' | 'meta_final' | 'stop_total' | null, mensagem: string }>({ tipo: null, mensagem: '' })
  const [alertaSonoroAtivo, setAlertaSonoroAtivo] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const sessoes = useTradingStore((state) => state.sessoes)
  const addSessao = useTradingStore((state) => state.addSessao)
  const updateSessao = useTradingStore((state) => state.updateSessao)

  useEffect(() => {
    const saved = localStorage.getItem('operacoes-alavancagem')
    if (saved) {
      setOperacoesAlavancagem(JSON.parse(saved))
    }
    
    // Encontrar sessão ativa
    const ativa = sessoes.find(s => s.status === 'ativa')
    if (ativa) {
      setSessaoAtiva(ativa)
    }
  }, [sessoes])

  useEffect(() => {
    localStorage.setItem('operacoes-alavancagem', JSON.stringify(operacoesAlavancagem))
  }, [operacoesAlavancagem])

  // Calcular progresso da sessão
  const calcularProgressoSessao = (sessao: SessaoAlavancagem) => {
    const operacoesSessao = operacoesAlavancagem.filter(o => o.sessaoId === sessao.id)
    const lucroTotal = operacoesSessao.reduce((acc, o) => acc + o.lucroPrejuizo, 0)
    const capitalAtual = sessao.capitalInicial + lucroTotal
    
    // Calcular progresso por nível
    const progressoPorNivel = []
    let capitalAcumulado = sessao.capitalInicial
    
    for (let i = 0; i < sessao.numeroNiveis; i++) {
      const metaNivel = capitalAcumulado * (sessao.metaPorNivel / 100)
      const operacoesNivel = operacoesSessao.filter(o => o.nivel === i + 1)
      const lucroNivel = operacoesNivel.reduce((acc, o) => acc + o.lucroPrejuizo, 0)
      const progresso = metaNivel > 0 ? (lucroNivel / metaNivel) * 100 : 0
      progressoPorNivel.push(Math.min(progresso, 100))
      capitalAcumulado += metaNivel
    }

    return {
      lucroTotal,
      capitalAtual,
      progressoPorNivel,
    }
  }

  const handleSessaoSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const capitalEnviado = parseFloat(formData.get('capitalEnviado') as string)
    const numeroNiveis = parseInt(formData.get('numeroNiveis') as string)
    const metaPorNivel = parseFloat(formData.get('metaPorNivel') as string)
    const stopTotal = parseFloat(formData.get('stopTotal') as string)
    const stopProtegido = formData.get('stopProtegido') ? parseFloat(formData.get('stopProtegido') as string) : undefined
    const valorEntradas = parseFloat(formData.get('valorEntradas') as string)
    const tipoEntrada = formData.get('tipoEntrada') as 'percentual' | 'fixo'
    
    const novaSessao: SessaoAlavancagem = {
      id: editingSessao?.id || uuidv4(),
      capitalInicial: capitalEnviado,
      numeroNiveis: numeroNiveis,
      metaPorNivel: metaPorNivel,
      stopTotal: stopTotal,
      stopProtegido: stopProtegido,
      valorEntradas: valorEntradas,
      tipoEntrada: tipoEntrada,
      status: 'ativa',
      nivelAtual: 1,
      progressoPorNivel: Array(numeroNiveis).fill(0),
    }

    if (editingSessao) {
      updateSessao(editingSessao.id, novaSessao)
    } else {
      addSessao(novaSessao)
      setSessaoAtiva(novaSessao)
    }

    setIsSessaoModalOpen(false)
    setEditingSessao(null)
  }

  const handleOperacaoSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!sessaoAtiva) return

    const formData = new FormData(e.currentTarget)
    
    const novaOperacao: OperacaoAlavancagem = {
      id: uuidv4(),
      sessaoId: sessaoAtiva.id,
      ativo: formData.get('ativo') as string,
      tipo: formData.get('tipo') as 'CALL' | 'PUT',
      resultado: formData.get('resultado') as 'Gain' | 'Loss',
      valorEntrada: parseFloat(formData.get('valorEntrada') as string),
      lucroPrejuizo: parseFloat(formData.get('lucroPrejuizo') as string),
      dataHora: new Date().toISOString(),
      nivel: sessaoAtiva.nivelAtual,
    }

    setOperacoesAlavancagem([...operacoesAlavancagem, novaOperacao])

    // Verificar se nível foi concluído
    const progresso = calcularProgressoSessao(sessaoAtiva)
    const operacoesNivelAtual = [...operacoesAlavancagem, novaOperacao].filter(o => 
      o.sessaoId === sessaoAtiva.id && o.nivel === sessaoAtiva.nivelAtual
    )
    const lucroNivelAtual = operacoesNivelAtual.reduce((acc, o) => acc + o.lucroPrejuizo, 0)
    const capitalAcumulado = sessaoAtiva.capitalInicial + progresso.lucroTotal
    const metaNivelAtual = capitalAcumulado * (sessaoAtiva.metaPorNivel / 100)

    if (lucroNivelAtual >= metaNivelAtual && sessaoAtiva.nivelAtual < sessaoAtiva.numeroNiveis) {
      setMostrarAlerta({
        tipo: 'nivel_concluido',
        mensagem: `Nível ${sessaoAtiva.nivelAtual} concluído! Deseja avançar para o próximo nível?`
      })
      if (alertaSonoroAtivo && audioRef.current) {
        audioRef.current.play().catch(() => {})
      }
      setIsConfirmacaoNivelModalOpen(true)
    }

    // Verificar se meta final foi atingida
    if (sessaoAtiva.nivelAtual === sessaoAtiva.numeroNiveis && lucroNivelAtual >= metaNivelAtual) {
      setMostrarAlerta({
        tipo: 'meta_final',
        mensagem: 'Meta final atingida! Sessão concluída com sucesso!'
      })
      if (alertaSonoroAtivo && audioRef.current) {
        audioRef.current.play().catch(() => {})
      }
      updateSessao(sessaoAtiva.id, { status: 'concluida' })
    }

    // Verificar stop total
    const lucroTotalAtualizado = progresso.lucroTotal + novaOperacao.lucroPrejuizo
    if (lucroTotalAtualizado <= -sessaoAtiva.stopTotal) {
      setMostrarAlerta({
        tipo: 'stop_total',
        mensagem: 'Stop total atingido! Sessão encerrada.'
      })
      if (alertaSonoroAtivo && audioRef.current) {
        audioRef.current.play().catch(() => {})
      }
      updateSessao(sessaoAtiva.id, { status: 'concluida' })
    }

    setIsOperacaoModalOpen(false)
  }

  const avancarNivel = () => {
    if (sessaoAtiva && sessaoAtiva.nivelAtual < sessaoAtiva.numeroNiveis) {
      updateSessao(sessaoAtiva.id, {
        nivelAtual: sessaoAtiva.nivelAtual + 1,
      })
      setSessaoAtiva({
        ...sessaoAtiva,
        nivelAtual: sessaoAtiva.nivelAtual + 1,
      })
      setIsConfirmacaoNivelModalOpen(false)
      setMostrarAlerta({ tipo: null, mensagem: '' })
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
  }

  // Estatísticas da alavancagem
  const estatisticasAlavancagem = useMemo(() => {
    const sessoesConcluidas = sessoes.filter(s => s.status === 'concluida').length
    const totalSessoes = sessoes.length
    
    const lucrosSessoes = sessoes.map(s => {
      const operacoesSessao = operacoesAlavancagem.filter(o => o.sessaoId === s.id)
      return operacoesSessao.reduce((acc, o) => acc + o.lucroPrejuizo, 0)
    })
    const mediaLucroSessao = lucrosSessoes.length > 0 
      ? lucrosSessoes.reduce((acc, v) => acc + v, 0) / lucrosSessoes.length 
      : 0

    // Assertividade em alavancagem
    const gains = operacoesAlavancagem.filter(o => o.resultado === 'Gain').length
    const losses = operacoesAlavancagem.filter(o => o.resultado === 'Loss').length
    const assertividade = operacoesAlavancagem.length > 0 
      ? (gains / operacoesAlavancagem.length) * 100 
      : 0

    // Melhor ativo para alavancar
    const ativosMap = new Map<string, { lucro: number, operacoes: number }>()
    operacoesAlavancagem.forEach(o => {
      const atual = ativosMap.get(o.ativo) || { lucro: 0, operacoes: 0 }
      ativosMap.set(o.ativo, {
        lucro: atual.lucro + o.lucroPrejuizo,
        operacoes: atual.operacoes + 1,
      })
    })
    const melhorAtivo = Array.from(ativosMap.entries())
      .sort((a, b) => b[1].lucro - a[1].lucro)[0]?.[0] || 'N/A'

    return {
      totalSessoes,
      sessoesConcluidas,
      mediaLucroSessao,
      assertividade,
      melhorAtivo,
    }
  }, [sessoes, operacoesAlavancagem])

  // Gráfico da evolução da sessão
  const dadosEvolucaoSessao = useMemo(() => {
    if (!sessaoAtiva) return []
    
    const operacoesSessao = operacoesAlavancagem
      .filter(o => o.sessaoId === sessaoAtiva.id)
      .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())
    
    let capitalAcumulado = sessaoAtiva.capitalInicial
    return operacoesSessao.map((op, idx) => {
      capitalAcumulado += op.lucroPrejuizo
      return {
        operacao: idx + 1,
        capital: capitalAcumulado,
        lucro: capitalAcumulado - sessaoAtiva.capitalInicial,
      }
    })
  }, [sessaoAtiva, operacoesAlavancagem])

  const progressoSessao = sessaoAtiva ? calcularProgressoSessao(sessaoAtiva) : null

  return (
    <MainLayout>
      {/* Áudio para alertas */}
      <audio ref={audioRef} loop>
        <source src="/alert-sound.mp3" type="audio/mpeg" />
      </audio>

      {/* Overlay de alerta NÍVEL CONCLUÍDO */}
      {mostrarAlerta.tipo === 'nivel_concluido' && (
        <div className="fixed inset-0 bg-blue-500/95 z-50 flex items-center justify-center">
          <div className="text-center p-8">
            <CheckCircle2 className="w-24 h-24 text-white mx-auto mb-4" />
            <h1 className="text-6xl font-bold text-white mb-4">NÍVEL CONCLUÍDO</h1>
            <p className="text-2xl text-white mb-8">{mostrarAlerta.mensagem}</p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={avancarNivel}
                className="bg-white text-blue-600 hover:bg-gray-100 text-xl px-8 py-4"
              >
                Avançar Nível
              </Button>
              <Button
                onClick={() => {
                  setMostrarAlerta({ tipo: null, mensagem: '' })
                  setIsConfirmacaoNivelModalOpen(false)
                  if (audioRef.current) {
                    audioRef.current.pause()
                    audioRef.current.currentTime = 0
                  }
                }}
                variant="secondary"
                className="text-white text-xl px-8 py-4"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay de alerta META FINAL */}
      {mostrarAlerta.tipo === 'meta_final' && (
        <div className="fixed inset-0 bg-emerald-500/95 z-50 flex items-center justify-center">
          <div className="text-center p-8">
            <CheckCircle2 className="w-24 h-24 text-white mx-auto mb-4" />
            <h1 className="text-6xl font-bold text-white mb-4">META FINAL ATINGIDA</h1>
            <p className="text-2xl text-white mb-8">{mostrarAlerta.mensagem}</p>
            <Button
              onClick={() => {
                setMostrarAlerta({ tipo: null, mensagem: '' })
                if (audioRef.current) {
                  audioRef.current.pause()
                  audioRef.current.currentTime = 0
                }
              }}
              className="bg-white text-emerald-600 hover:bg-gray-100 text-xl px-8 py-4"
            >
              Confirmar
            </Button>
          </div>
        </div>
      )}

      {/* Overlay de alerta STOP TOTAL */}
      {mostrarAlerta.tipo === 'stop_total' && (
        <div className="fixed inset-0 bg-red-500/95 z-50 flex items-center justify-center">
          <div className="text-center p-8">
            <AlertCircle className="w-24 h-24 text-white mx-auto mb-4" />
            <h1 className="text-6xl font-bold text-white mb-4">STOP TOTAL ATINGIDO</h1>
            <p className="text-2xl text-white mb-8">{mostrarAlerta.mensagem}</p>
            <Button
              onClick={() => {
                setMostrarAlerta({ tipo: null, mensagem: '' })
                if (audioRef.current) {
                  audioRef.current.pause()
                  audioRef.current.currentTime = 0
                }
              }}
              className="bg-white text-red-600 hover:bg-gray-100 text-xl px-8 py-4"
            >
              Confirmar
            </Button>
          </div>
        </div>
      )}

      <div className={`max-w-[1600px] mx-auto space-y-6 p-4 sm:p-6 ${mostrarAlerta.tipo ? 'blur-sm' : ''}`}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Sessões de Alavancagem</h1>
            <p className="text-gray-400">Módulo avançado de alavancagem separado do gerenciamento principal</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setAlertaSonoroAtivo(!alertaSonoroAtivo)}
              className="p-2 bg-dark-black/50 border border-card-border/50 rounded-lg hover:border-accent-electric/50 transition-colors"
              title={alertaSonoroAtivo ? 'Desativar alerta sonoro' : 'Ativar alerta sonoro'}
            >
              {alertaSonoroAtivo ? (
                <Volume2 className="w-5 h-5 text-accent-electric" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-400" />
              )}
            </button>
            <Button
              onClick={() => {
                setEditingSessao(null)
                setIsSessaoModalOpen(true)
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-accent-electric to-accent-cyan text-white"
              disabled={!!sessaoAtiva}
            >
              <Plus className="w-4 h-4" />
              Nova Sessão
            </Button>
          </div>
        </div>

        {/* Estatísticas da Alavancagem */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          <StatCard
            title="Total de Sessões"
            value={estatisticasAlavancagem.totalSessoes}
            icon={Activity}
            className="bg-gradient-to-br from-accent-electric/10 to-accent-cyan/5 border-accent-electric/20"
          />
          <StatCard
            title="Sessões Concluídas"
            value={estatisticasAlavancagem.sessoesConcluidas}
            icon={CheckCircle2}
            valueColor="text-emerald-400"
            className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20"
          />
          <StatCard
            title="Média de Lucro/Sessão"
            value={formatCurrency(estatisticasAlavancagem.mediaLucroSessao)}
            icon={DollarSign}
            valueColor="text-blue-400"
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20"
          />
          <StatCard
            title="Assertividade"
            value={`${estatisticasAlavancagem.assertividade.toFixed(1)}%`}
            icon={Target}
            valueColor="text-purple-400"
            className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20"
          />
          <StatCard
            title="Melhor Ativo"
            value={estatisticasAlavancagem.melhorAtivo}
            icon={TrendingUp}
            valueColor="text-yellow-400"
            className="bg-gradient-to-br from-yellow-500/10 to-orange-600/5 border-yellow-500/20"
          />
        </div>

        {/* Sessão Ativa */}
        {sessaoAtiva && progressoSessao && (
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent-electric" />
                Sessão Ativa - Nível {sessaoAtiva.nivelAtual}/{sessaoAtiva.numeroNiveis}
              </h2>
              <Button
                onClick={() => {
                  setEditingSessao(sessaoAtiva)
                  setIsSessaoModalOpen(true)
                }}
                className="flex items-center gap-2"
                variant="secondary"
              >
                <Settings className="w-4 h-4" />
                Editar
              </Button>
            </div>

            {/* Informações da Sessão */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-dark-black/50 border border-card-border/50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Capital Inicial</p>
                <p className="text-lg font-bold text-white">{formatCurrency(sessaoAtiva.capitalInicial)}</p>
              </div>
              <div className="bg-dark-black/50 border border-card-border/50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Capital Atual</p>
                <p className={`text-lg font-bold ${progressoSessao.capitalAtual >= sessaoAtiva.capitalInicial ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(progressoSessao.capitalAtual)}
                </p>
              </div>
              <div className="bg-dark-black/50 border border-card-border/50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Lucro Total</p>
                <p className={`text-lg font-bold ${progressoSessao.lucroTotal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {progressoSessao.lucroTotal >= 0 ? '+' : ''}{formatCurrency(progressoSessao.lucroTotal)}
                </p>
              </div>
              <div className="bg-dark-black/50 border border-card-border/50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Stop Total</p>
                <p className="text-lg font-bold text-red-400">{formatCurrency(sessaoAtiva.stopTotal)}</p>
              </div>
            </div>

            {/* Progresso por Nível */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold text-white">Progresso por Nível</h3>
              {Array.from({ length: sessaoAtiva.numeroNiveis }, (_, i) => {
                const nivel = i + 1
                const operacoesNivel = operacoesAlavancagem.filter(o => 
                  o.sessaoId === sessaoAtiva.id && o.nivel === nivel
                )
                const lucroNivel = operacoesNivel.reduce((acc, o) => acc + o.lucroPrejuizo, 0)
                const capitalAcumulado = sessaoAtiva.capitalInicial + 
                  operacoesAlavancagem
                    .filter(o => o.sessaoId === sessaoAtiva.id && o.nivel < nivel)
                    .reduce((acc, o) => acc + o.lucroPrejuizo, 0)
                const metaNivel = capitalAcumulado * (sessaoAtiva.metaPorNivel / 100)
                const progressoNivel = metaNivel > 0 ? (lucroNivel / metaNivel) * 100 : 0
                const isAtual = nivel === sessaoAtiva.nivelAtual
                const isConcluido = nivel < sessaoAtiva.nivelAtual
                const isBloqueado = nivel > sessaoAtiva.nivelAtual

                return (
                  <div
                    key={nivel}
                    className={`p-4 rounded-lg border-2 ${
                      isAtual
                        ? 'bg-accent-electric/10 border-accent-electric/30'
                        : isConcluido
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-gray-500/10 border-gray-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {isConcluido && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                        {isAtual && <Zap className="w-5 h-5 text-accent-electric" />}
                        {isBloqueado && <Lock className="w-5 h-5 text-gray-500" />}
                        <h4 className="text-white font-semibold">Nível {nivel}</h4>
                        {isAtual && (
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-accent-electric/20 text-accent-electric">
                            Atual
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Meta: {formatCurrency(metaNivel)}</p>
                        <p className={`text-sm font-semibold ${lucroNivel >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {lucroNivel >= 0 ? '+' : ''}{formatCurrency(lucroNivel)}
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-dark-black rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          progressoNivel >= 100
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                            : isAtual
                            ? 'bg-gradient-to-r from-accent-electric to-accent-cyan'
                            : 'bg-gradient-to-r from-gray-500 to-gray-400'
                        }`}
                        style={{ width: `${Math.min(progressoNivel, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Progresso: {progressoNivel.toFixed(1)}% | Falta: {formatCurrency(Math.max(0, metaNivel - lucroNivel))}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Gráfico da Evolução */}
            {dadosEvolucaoSessao.length > 0 && (
              <div className="bg-dark-black/50 border border-card-border/50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Evolução da Sessão</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={dadosEvolucaoSessao}>
                    <defs>
                      <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00D9FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="operacao" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="capital" 
                      stroke="#00D9FF" 
                      strokeWidth={2}
                      fill="url(#colorCapital)"
                      name="Capital (R$)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="lucro" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      dot={{ fill: '#10B981', r: 4 }}
                      name="Lucro (R$)"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Botão Registrar Operação */}
            {sessaoAtiva.status === 'ativa' && (
              <div className="flex justify-center">
                <Button
                  onClick={() => setIsOperacaoModalOpen(true)}
                  className="flex items-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-xl px-8 py-4 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
                >
                  <Plus className="w-6 h-6" />
                  Registrar Operação - Nível {sessaoAtiva.nivelAtual}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Lista de Sessões */}
        {sessoes.length > 0 && (
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent-electric" />
              Histórico de Sessões
            </h2>
            <div className="space-y-3">
              {sessoes
                .sort((a, b) => new Date(b.id).localeCompare(a.id))
                .map((sessao) => {
                  const progresso = calcularProgressoSessao(sessao)
                  return (
                    <div
                      key={sessao.id}
                      className={`p-5 rounded-xl border transition-all ${
                        sessao.status === 'ativa'
                          ? 'bg-accent-electric/10 border-accent-electric/30'
                          : sessao.status === 'concluida'
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-dark-black/50 border-card-border/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="text-white font-semibold text-lg">
                              Sessão {sessao.id.substring(0, 8)}
                            </h3>
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                              sessao.status === 'ativa'
                                ? 'bg-accent-electric/15 text-accent-electric border-accent-electric/20'
                                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                            }`}>
                              {sessao.status === 'ativa' ? 'Ativa' : 'Concluída'}
                            </span>
                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/20">
                              Nível {sessao.nivelAtual}/{sessao.numeroNiveis}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400 mb-1">Capital Inicial</p>
                              <p className="text-white font-semibold">{formatCurrency(sessao.capitalInicial)}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 mb-1">Lucro Total</p>
                              <p className={`font-semibold ${progresso.lucroTotal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {progresso.lucroTotal >= 0 ? '+' : ''}{formatCurrency(progresso.lucroTotal)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 mb-1">Meta por Nível</p>
                              <p className="text-white font-semibold">{sessao.metaPorNivel}%</p>
                            </div>
                            <div>
                              <p className="text-gray-400 mb-1">Stop Total</p>
                              <p className="text-red-400 font-semibold">{formatCurrency(sessao.stopTotal)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Modal de Sessão */}
        <Modal
          isOpen={isSessaoModalOpen}
          onClose={() => {
            setIsSessaoModalOpen(false)
            setEditingSessao(null)
          }}
          title={editingSessao ? 'Editar Sessão' : 'Nova Sessão de Alavancagem'}
          size="lg"
          variant="warning"
          icon={Zap}
          description={editingSessao ? 'Atualize as configurações da sessão' : 'Configure uma nova sessão de alavancagem com níveis e metas'}
        >
          <form onSubmit={handleSessaoSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Capital Enviado para Carteira (R$)
              </label>
              <input
                type="number"
                name="capitalEnviado"
                required
                step="0.01"
                min="0"
                defaultValue={editingSessao?.capitalInicial}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nº de Níveis (1 a 5)
                </label>
                <input
                  type="number"
                  name="numeroNiveis"
                  required
                  min="1"
                  max="5"
                  defaultValue={editingSessao?.numeroNiveis || 1}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Meta por Nível (%)
                </label>
                <input
                  type="number"
                  name="metaPorNivel"
                  required
                  step="0.01"
                  min="0"
                  defaultValue={editingSessao?.metaPorNivel}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stop Total (R$)
                </label>
                <input
                  type="number"
                  name="stopTotal"
                  required
                  step="0.01"
                  min="0"
                  defaultValue={editingSessao?.stopTotal}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Perder tudo</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stop Protegido (R$)
                </label>
                <input
                  type="number"
                  name="stopProtegido"
                  step="0.01"
                  min="0"
                  defaultValue={editingSessao?.stopProtegido}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Guardar parte do capital (opcional)</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Valor das Entradas
                </label>
                <input
                  type="number"
                  name="valorEntradas"
                  required
                  step="0.01"
                  min="0"
                  defaultValue={editingSessao?.valorEntradas}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Entrada
                </label>
                <select
                  name="tipoEntrada"
                  required
                  defaultValue={editingSessao?.tipoEntrada || 'percentual'}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="percentual">Percentual (%)</option>
                  <option value="fixo">Valor Fixo (R$)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={!!sessaoAtiva && !editingSessao}>
                {editingSessao ? 'Salvar Alterações' : 'Criar Sessão'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsSessaoModalOpen(false)
                  setEditingSessao(null)
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal de Operação */}
        <Modal
          isOpen={isOperacaoModalOpen}
          onClose={() => setIsOperacaoModalOpen(false)}
          title={`Nova Operação - Nível ${sessaoAtiva?.nivelAtual || 1}`}
          size="lg"
          variant="info"
          icon={Plus}
          description="Registre uma operação na sessão de alavancagem atual"
        >
          <form onSubmit={handleOperacaoSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ativo FOREX
                </label>
                <ForexAutocomplete
                  placeholder="Digite para buscar ativo FOREX..."
                  required
                  name="ativo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo
                </label>
                <select
                  name="tipo"
                  required
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="CALL">Compra (CALL)</option>
                  <option value="PUT">Venda (PUT)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Resultado
                </label>
                <select
                  name="resultado"
                  required
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="Gain">Gain</option>
                  <option value="Loss">Loss</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Valor da Entrada (R$)
                </label>
                <input
                  type="number"
                  name="valorEntrada"
                  required
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Lucro/Prejuízo (R$)
              </label>
              <input
                type="number"
                name="lucroPrejuizo"
                required
                step="0.01"
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Registrar Operação
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsOperacaoModalOpen(false)}
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

