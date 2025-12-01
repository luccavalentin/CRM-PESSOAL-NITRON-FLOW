'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { useTradingStore } from '@/stores/tradingStore'
import { formatCurrency } from '@/utils/formatCurrency'
import { OperacaoTrading } from '@/types'
import ForexAutocomplete from '@/components/ui/ForexAutocomplete'
import { 
  Plus, 
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
  PieChart as PieChartIcon,
  Upload,
  X,
  Play,
  Volume2,
  VolumeX,
  Clock,
  DollarSign,
  Activity,
  Zap,
  AlertTriangle,
  Settings,
  Search,
  Filter
} from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, AreaChart, Area } from 'recharts'

const COLORS = ['#00D9FF', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899']

export default function GerenciamentoRiscoPage() {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [isOperacaoModalOpen, setIsOperacaoModalOpen] = useState(false)
  const [editingOperacao, setEditingOperacao] = useState<OperacaoTrading | null>(null)
  const [printPreview, setPrintPreview] = useState<string | null>(null)
  const [alertaSonoroAtivo, setAlertaSonoroAtivo] = useState(true)
  const [mostrarAlerta, setMostrarAlerta] = useState<{ tipo: 'stop_gain' | 'stop_loss' | null, mensagem: string }>({ tipo: null, mensagem: '' })
  const [valoresCalculados, setValoresCalculados] = useState<{
    stopGainReais: number
    stopGainPercentual: number
    stopLossReais: number
    stopLossPercentual: number
    valorMaximoEntrada: number
  } | null>(null)
  const [abaEstatisticas, setAbaEstatisticas] = useState<'diarias' | 'mensais' | 'anuais' | 'globais'>('diarias')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const operacoes = useTradingStore((state) => state.operacoes)
  const configuracao = useTradingStore((state) => state.configuracao)
  const addOperacao = useTradingStore((state) => state.addOperacao)
  const updateOperacao = useTradingStore((state) => state.updateOperacao)
  const deleteOperacao = useTradingStore((state) => state.deleteOperacao)
  const setConfiguracao = useTradingStore((state) => state.setConfiguracao)
  const verificarBloqueio = useTradingStore((state) => state.verificarBloqueio)
  const getOperacoesDoDia = useTradingStore((state) => state.getOperacoesDoDia)
  const getLucroPrejuizoDia = useTradingStore((state) => state.getLucroPrejuizoDia)

  const operacoesHoje = getOperacoesDoDia()
  const lucroPrejuizoHoje = getLucroPrejuizoDia()
  const proximaOperacao = operacoesHoje.length + 1

  // Verificar se precisa de configuração inicial
  useEffect(() => {
    if (!configuracao) {
      setIsConfigModalOpen(true)
    }
  }, [configuracao])

  // Verificar bloqueios e alertas
  useEffect(() => {
    if (configuracao) {
      verificarBloqueio()
      
      // Verificar stop gain
      if (lucroPrejuizoHoje >= configuracao.stopGainReais && !configuracao.bloqueado) {
        setMostrarAlerta({ 
          tipo: 'stop_gain', 
          mensagem: 'STOP GAIN atingido — pare imediatamente.' 
        })
        if (alertaSonoroAtivo && audioRef.current) {
          audioRef.current.play().catch(() => {})
        }
        // Bloquear sistema
        setConfiguracao({
          ...configuracao,
          bloqueado: true,
          motivoBloqueio: 'stop_gain',
        })
      }
      
      // Verificar stop loss
      if (lucroPrejuizoHoje <= -configuracao.stopLossReais && !configuracao.bloqueado) {
        setMostrarAlerta({ 
          tipo: 'stop_loss', 
          mensagem: 'STOP LOSS atingido — pare imediatamente.' 
        })
        if (alertaSonoroAtivo && audioRef.current) {
          audioRef.current.play().catch(() => {})
        }
        // Bloquear sistema
        setConfiguracao({
          ...configuracao,
          bloqueado: true,
          motivoBloqueio: 'stop_loss',
        })
      }

      // Verificar limite de operações
      if (operacoesHoje.length >= 5 && !configuracao.bloqueado) {
        setConfiguracao({
          ...configuracao,
          bloqueado: true,
          motivoBloqueio: 'limite_operacoes',
        })
      }
    }
  }, [lucroPrejuizoHoje, configuracao, verificarBloqueio, alertaSonoroAtivo, operacoesHoje.length, setConfiguracao])

  // Repetir alerta sonoro
  useEffect(() => {
    if (mostrarAlerta.tipo && alertaSonoroAtivo && audioRef.current) {
      const interval = setInterval(() => {
        audioRef.current?.play().catch(() => {})
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [mostrarAlerta, alertaSonoroAtivo])

  // Calcular valores quando o usuário digita na configuração
  const calcularValores = (capitalTotal: number, metaDiariaPercentual: number) => {
    const stopGainPercentual = metaDiariaPercentual
    const stopLossPercentual = metaDiariaPercentual * 0.5 // 50% do Stop Gain
    const stopGainReais = (capitalTotal * stopGainPercentual) / 100
    const stopLossReais = (capitalTotal * stopLossPercentual) / 100
    const valorMaximoEntrada = capitalTotal * 0.025 // 2,5% do capital

    setValoresCalculados({
      stopGainReais,
      stopGainPercentual,
      stopLossReais,
      stopLossPercentual,
      valorMaximoEntrada,
    })
  }

  const handleConfigSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const capitalTotal = parseFloat(formData.get('capitalTotal') as string)
    const metaDiariaPercentual = parseFloat(formData.get('metaDiariaPercentual') as string)
    
    // Cálculos automáticos conforme especificação
    const stopGainPercentual = metaDiariaPercentual
    const stopLossPercentual = metaDiariaPercentual * 0.5 // 50% do Stop Gain
    const stopGainReais = (capitalTotal * stopGainPercentual) / 100
    const stopLossReais = (capitalTotal * stopLossPercentual) / 100
    const valorMaximoEntrada = capitalTotal * 0.025 // 2,5% do capital
    const limiteOperacoesDia = 5 // Fixo conforme especificação
    
    const novaConfig = {
      capitalTotal,
      metaDiariaPercentual,
      stopGainReais,
      stopGainPercentual,
      stopLossReais,
      stopLossPercentual,
      valorMaximoEntrada,
      limiteOperacoesDia,
      dataInicio: configuracao?.dataInicio || new Date().toISOString().split('T')[0],
      diaAtual: new Date().toISOString().split('T')[0],
      bloqueado: false,
      motivoBloqueio: undefined,
    }

    setConfiguracao(novaConfig)
    setIsConfigModalOpen(false)
    setValoresCalculados(null)
  }

  const handleOperacaoSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const valorEntrada = parseFloat(formData.get('valorEntrada') as string)
    
    // Validar valor máximo de entrada
    if (configuracao && valorEntrada > configuracao.valorMaximoEntrada) {
      alert(`O valor da entrada não pode exceder ${formatCurrency(configuracao.valorMaximoEntrada)} (2,5% do capital)`)
      return
    }

    // Validar limite de operações
    if (operacoesHoje.length >= 5) {
      alert('Limite diário de 5 operações atingido.')
      return
    }

    // Validar se sistema está bloqueado
    if (configuracao?.bloqueado) {
      alert('Sistema bloqueado. Não é possível registrar novas operações.')
      return
    }

    const novaOperacao: OperacaoTrading = {
      id: editingOperacao?.id || uuidv4(),
      numeroOperacao: proximaOperacao,
      ativo: formData.get('ativo') as string,
      tipo: formData.get('tipo') as 'CALL' | 'PUT',
      resultado: formData.get('resultado') as 'Gain' | 'Loss',
      valorEntrada,
      lucroPrejuizo: parseFloat(formData.get('lucroPrejuizo') as string),
      urlPrint: printPreview || formData.get('urlPrint') as string || undefined,
      observacoes: formData.get('observacoes') as string || undefined,
      dataHora: editingOperacao?.dataHora || new Date().toISOString(),
    }

    if (editingOperacao) {
      updateOperacao(editingOperacao.id, novaOperacao)
    } else {
      addOperacao(novaOperacao)
    }

    setIsOperacaoModalOpen(false)
    setEditingOperacao(null)
    setPrintPreview(null)
  }

  const handlePrintUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPrintPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const iniciarNovoDia = () => {
    if (configuracao) {
      setConfiguracao({
        ...configuracao,
        diaAtual: new Date().toISOString().split('T')[0],
        bloqueado: false,
        motivoBloqueio: undefined,
      })
      setMostrarAlerta({ tipo: null, mensagem: '' })
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
  }

  // Cálculos do dia
  const saldoAtual = configuracao ? configuracao.capitalTotal + lucroPrejuizoHoje : 0
  const percentualAcumulado = configuracao ? (lucroPrejuizoHoje / configuracao.capitalTotal) * 100 : 0
  const progressoStopGain = configuracao && configuracao.stopGainReais > 0 ? (lucroPrejuizoHoje / configuracao.stopGainReais) * 100 : 0
  const progressoStopLoss = configuracao && configuracao.stopLossReais > 0 ? Math.abs(lucroPrejuizoHoje / configuracao.stopLossReais) * 100 : 0

  // Semáforo de risco
  const getSemaforoRisco = () => {
    if (!configuracao) return { cor: 'gray', texto: 'Indefinido' }
    if (configuracao.bloqueado) return { cor: 'red', texto: 'Perigo' }
    if (progressoStopGain >= 80 || progressoStopLoss >= 80) return { cor: 'yellow', texto: 'Atenção' }
    return { cor: 'green', texto: 'Seguro' }
  }

  const semaforoRisco = getSemaforoRisco()

  // Estatísticas diárias
  const estatisticasDiarias = useMemo(() => {
    const gains = operacoesHoje.filter(o => o.resultado === 'Gain').length
    const losses = operacoesHoje.filter(o => o.resultado === 'Loss').length
    const taxaAcerto = operacoesHoje.length > 0 ? (gains / operacoesHoje.length) * 100 : 0
    
    // Assertividade por ativo
    const ativosMap = new Map<string, { gains: number, losses: number }>()
    operacoesHoje.forEach(o => {
      const atual = ativosMap.get(o.ativo) || { gains: 0, losses: 0 }
      if (o.resultado === 'Gain') atual.gains++
      else atual.losses++
      ativosMap.set(o.ativo, atual)
    })
    
    const assertividadeAtivos = Array.from(ativosMap.entries()).map(([ativo, dados]) => ({
      ativo,
      assertividade: dados.gains + dados.losses > 0 
        ? (dados.gains / (dados.gains + dados.losses)) * 100 
        : 0,
      total: dados.gains + dados.losses,
    }))

    // Assertividade por tipo
    const assertividadeCompra = operacoesHoje.filter(o => o.tipo === 'CALL')
    const assertividadeVenda = operacoesHoje.filter(o => o.tipo === 'PUT')
    const taxaCompra = assertividadeCompra.length > 0 
      ? (assertividadeCompra.filter(o => o.resultado === 'Gain').length / assertividadeCompra.length) * 100 
      : 0
    const taxaVenda = assertividadeVenda.length > 0 
      ? (assertividadeVenda.filter(o => o.resultado === 'Gain').length / assertividadeVenda.length) * 100 
      : 0

    return {
      taxaAcerto,
      totalOperacoes: operacoesHoje.length,
      gains,
      losses,
      lucroFinal: lucroPrejuizoHoje,
      assertividadeAtivos,
      assertividadeCompra: taxaCompra,
      assertividadeVenda: taxaVenda,
    }
  }, [operacoesHoje, lucroPrejuizoHoje])

  // Estatísticas mensais
  const estatisticasMensais = useMemo(() => {
    const hoje = new Date()
    const mesAtual = hoje.getMonth()
    const anoAtual = hoje.getFullYear()
    
    const operacoesMes = operacoes.filter(o => {
      const data = new Date(o.dataHora)
      return data.getMonth() === mesAtual && data.getFullYear() === anoAtual
    })

    const gains = operacoesMes.filter(o => o.resultado === 'Gain').length
    const losses = operacoesMes.filter(o => o.resultado === 'Loss').length
    const taxaAcerto = operacoesMes.length > 0 ? (gains / operacoesMes.length) * 100 : 0
    const lucroTotal = operacoesMes.reduce((acc, o) => acc + o.lucroPrejuizo, 0)

    // Ativo mais lucrativo
    const ativosLucro = new Map<string, number>()
    operacoesMes.forEach(o => {
      const atual = ativosLucro.get(o.ativo) || 0
      ativosLucro.set(o.ativo, atual + o.lucroPrejuizo)
    })
    const ativoMaisLucrativo = Array.from(ativosLucro.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

    // Ativo mais perigoso
    const ativoMaisPerigoso = Array.from(ativosLucro.entries())
      .sort((a, b) => a[1] - b[1])[0]?.[0] || 'N/A'

    // Desempenho por compra/venda
    const compras = operacoesMes.filter(o => o.tipo === 'CALL')
    const vendas = operacoesMes.filter(o => o.tipo === 'PUT')
    const lucroCompras = compras.reduce((acc, o) => acc + o.lucroPrejuizo, 0)
    const lucroVendas = vendas.reduce((acc, o) => acc + o.lucroPrejuizo, 0)

    return {
      taxaAcerto,
      totalOperacoes: operacoesMes.length,
      lucroTotal,
      ativoMaisLucrativo,
      ativoMaisPerigoso,
      lucroCompras,
      lucroVendas,
    }
  }, [operacoes])

  // Estatísticas anuais
  const estatisticasAnuais = useMemo(() => {
    const hoje = new Date()
    const anoAtual = hoje.getFullYear()
    
    const operacoesAno = operacoes.filter(o => {
      const data = new Date(o.dataHora)
      return data.getFullYear() === anoAtual
    })

    const gains = operacoesAno.filter(o => o.resultado === 'Gain').length
    const taxaAcerto = operacoesAno.length > 0 ? (gains / operacoesAno.length) * 100 : 0
    const lucroAnual = operacoesAno.reduce((acc, o) => acc + o.lucroPrejuizo, 0)

    // Gráfico mensal
    const mesesMap = new Map<number, { lucro: number, operacoes: number }>()
    operacoesAno.forEach(o => {
      const mes = new Date(o.dataHora).getMonth()
      const atual = mesesMap.get(mes) || { lucro: 0, operacoes: 0 }
      mesesMap.set(mes, {
        lucro: atual.lucro + o.lucroPrejuizo,
        operacoes: atual.operacoes + 1,
      })
    })

    const graficoMensal = Array.from({ length: 12 }, (_, i) => {
      const dados = mesesMap.get(i) || { lucro: 0, operacoes: 0 }
      return {
        mes: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i],
        lucro: dados.lucro,
        operacoes: dados.operacoes,
      }
    })

    // Ranking de ativos
    const ativosMap = new Map<string, { gains: number, losses: number }>()
    operacoesAno.forEach(o => {
      const atual = ativosMap.get(o.ativo) || { gains: 0, losses: 0 }
      if (o.resultado === 'Gain') atual.gains++
      else atual.losses++
      ativosMap.set(o.ativo, atual)
    })

    const rankingAtivos = Array.from(ativosMap.entries())
      .map(([ativo, dados]) => ({
        ativo,
        assertividade: dados.gains + dados.losses > 0 
          ? (dados.gains / (dados.gains + dados.losses)) * 100 
          : 0,
        total: dados.gains + dados.losses,
      }))
      .sort((a, b) => b.assertividade - a.assertividade)

    return {
      taxaAcerto,
      lucroAnual,
      graficoMensal,
      rankingAtivos,
    }
  }, [operacoes])

  // Estatísticas globais (lifetime)
  const estatisticasGlobais = useMemo(() => {
    const gains = operacoes.filter(o => o.resultado === 'Gain').length
    const losses = operacoes.filter(o => o.resultado === 'Loss').length
    const taxaAcerto = operacoes.length > 0 ? (gains / operacoes.length) * 100 : 0
    const lucroTotal = operacoes.reduce((acc, o) => acc + o.lucroPrejuizo, 0)

    // Média de lucro por dia
    const diasMap = new Map<string, number>()
    operacoes.forEach(o => {
      const dia = o.dataHora.split('T')[0]
      const atual = diasMap.get(dia) || 0
      diasMap.set(dia, atual + o.lucroPrejuizo)
    })
    const diasComOperacoes = diasMap.size
    const mediaLucroDia = diasComOperacoes > 0 ? lucroTotal / diasComOperacoes : 0

    // Média mensal
    const mesesMap = new Map<string, number>()
    operacoes.forEach(o => {
      const data = new Date(o.dataHora)
      const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`
      const atual = mesesMap.get(mesAno) || 0
      mesesMap.set(mesAno, atual + o.lucroPrejuizo)
    })
    const mesesComOperacoes = mesesMap.size
    const mediaLucroMes = mesesComOperacoes > 0 
      ? Array.from(mesesMap.values()).reduce((acc, v) => acc + v, 0) / mesesComOperacoes 
      : 0

    // Assertividade por ativo
    const ativosMap = new Map<string, { gains: number, losses: number }>()
    operacoes.forEach(o => {
      const atual = ativosMap.get(o.ativo) || { gains: 0, losses: 0 }
      if (o.resultado === 'Gain') atual.gains++
      else atual.losses++
      ativosMap.set(o.ativo, atual)
    })

    const assertividadeAtivos = Array.from(ativosMap.entries())
      .map(([ativo, dados]) => ({
        ativo,
        assertividade: dados.gains + dados.losses > 0 
          ? (dados.gains / (dados.gains + dados.losses)) * 100 
          : 0,
        total: dados.gains + dados.losses,
      }))
      .sort((a, b) => b.assertividade - a.assertividade)

    // Assertividade por tipo
    const compras = operacoes.filter(o => o.tipo === 'CALL')
    const vendas = operacoes.filter(o => o.tipo === 'PUT')
    const taxaCompra = compras.length > 0 
      ? (compras.filter(o => o.resultado === 'Gain').length / compras.length) * 100 
      : 0
    const taxaVenda = vendas.length > 0 
      ? (vendas.filter(o => o.resultado === 'Gain').length / vendas.length) * 100 
      : 0

    // Melhor e pior horário
    const horariosMap = new Map<number, { gains: number, losses: number }>()
    operacoes.forEach(o => {
      const hora = new Date(o.dataHora).getHours()
      const atual = horariosMap.get(hora) || { gains: 0, losses: 0 }
      if (o.resultado === 'Gain') atual.gains++
      else atual.losses++
      horariosMap.set(hora, atual)
    })

    const horarios = Array.from(horariosMap.entries())
      .map(([hora, dados]) => ({
        hora,
        assertividade: dados.gains + dados.losses > 0 
          ? (dados.gains / (dados.gains + dados.losses)) * 100 
          : 0,
        total: dados.gains + dados.losses,
      }))
      .sort((a, b) => b.assertividade - a.assertividade)

    const melhorHorario = horarios[0]?.hora || null
    const piorHorario = horarios[horarios.length - 1]?.hora || null

    // Melhores dias da semana
    const diasSemanaMap = new Map<number, { gains: number, losses: number }>()
    operacoes.forEach(o => {
      const diaSemana = new Date(o.dataHora).getDay()
      const atual = diasSemanaMap.get(diaSemana) || { gains: 0, losses: 0 }
      if (o.resultado === 'Gain') atual.gains++
      else atual.losses++
      diasSemanaMap.set(diaSemana, atual)
    })

    const diasSemana = Array.from(diasSemanaMap.entries())
      .map(([dia, dados]) => ({
        dia,
        nome: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][dia],
        assertividade: dados.gains + dados.losses > 0 
          ? (dados.gains / (dados.gains + dados.losses)) * 100 
          : 0,
        total: dados.gains + dados.losses,
      }))
      .sort((a, b) => b.assertividade - a.assertividade)

    return {
      taxaAcerto,
      totalOperacoes: operacoes.length,
      mediaLucroDia,
      mediaLucroMes,
      assertividadeAtivos,
      assertividadeCompra: taxaCompra,
      assertividadeVenda: taxaVenda,
      melhorHorario,
      piorHorario,
      melhoresDias: diasSemana.slice(0, 3),
    }
  }, [operacoes])

  // Dados para gráficos
  const dadosUltimasOperacoes = useMemo(() => {
    return operacoes
      .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime())
      .slice(0, 10)
      .map(o => ({
        ativo: o.ativo,
        resultado: o.resultado === 'Gain' ? 1 : -1,
        lucro: o.lucroPrejuizo,
      }))
  }, [operacoes])

  const sistemaBloqueado = configuracao?.bloqueado || false
  const podeOperar = !sistemaBloqueado && operacoesHoje.length < 5

  return (
    <MainLayout>
      {/* Áudio para alertas */}
      <audio ref={audioRef} loop>
        <source src="/alert-sound.mp3" type="audio/mpeg" />
      </audio>

      {/* Overlay de alerta STOP GAIN */}
      {mostrarAlerta.tipo === 'stop_gain' && (
        <div className="fixed inset-0 bg-emerald-500/95 z-50 flex items-center justify-center">
          <div className="text-center p-8">
            <CheckCircle2 className="w-24 h-24 text-white mx-auto mb-4" />
            <h1 className="text-6xl font-bold text-white mb-4">STOP GAIN ATINGIDO</h1>
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

      {/* Overlay de alerta STOP LOSS */}
      {mostrarAlerta.tipo === 'stop_loss' && (
        <div className="fixed inset-0 bg-red-500/95 z-50 flex items-center justify-center">
          <div className="text-center p-8">
            <AlertCircle className="w-24 h-24 text-white mx-auto mb-4" />
            <h1 className="text-6xl font-bold text-white mb-4">STOP LOSS ATINGIDO</h1>
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
            <h1 className="text-3xl font-bold text-white mb-2">Gerenciamento de Risco</h1>
            <p className="text-gray-400">Sistema completo de controle de risco para trading</p>
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
            {configuracao?.bloqueado && (
              <Button
                onClick={iniciarNovoDia}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white"
              >
                <Play className="w-4 h-4" />
                Iniciar Novo Dia
              </Button>
            )}
            <Button
              onClick={() => setIsConfigModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-accent-electric to-accent-cyan text-white"
            >
              <Target className="w-4 h-4" />
              {configuracao ? 'Editar Config' : 'Configurar'}
            </Button>
          </div>
        </div>

        {/* Alerta de bloqueio */}
        {sistemaBloqueado && (
          <div className={`p-6 rounded-xl border-2 ${
            configuracao?.motivoBloqueio === 'stop_gain'
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : configuracao?.motivoBloqueio === 'stop_loss'
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-yellow-500/10 border-yellow-500/30'
          }`}>
            <div className="flex items-center gap-3">
              <AlertTriangle className={`w-6 h-6 ${
                configuracao?.motivoBloqueio === 'stop_gain'
                  ? 'text-emerald-400'
                  : configuracao?.motivoBloqueio === 'stop_loss'
                  ? 'text-red-400'
                  : 'text-yellow-400'
              }`} />
              <div>
                <p className={`font-semibold text-lg ${
                  configuracao?.motivoBloqueio === 'stop_gain'
                    ? 'text-emerald-400'
                    : configuracao?.motivoBloqueio === 'stop_loss'
                    ? 'text-red-400'
                    : 'text-yellow-400'
                }`}>
                  Sistema Bloqueado
                </p>
                <p className="text-gray-400 text-sm">
                  {configuracao?.motivoBloqueio === 'stop_gain' 
                    ? 'Stop Gain atingido — pare imediatamente.'
                    : configuracao?.motivoBloqueio === 'stop_loss'
                    ? 'Stop Loss atingido — pare imediatamente.'
                    : 'Limite diário de 5 operações atingido.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Principal */}
        {configuracao && (
          <>
            {/* Cards Principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <StatCard
                title="Capital Total"
                value={formatCurrency(configuracao.capitalTotal)}
                icon={DollarSign}
                className="bg-gradient-to-br from-accent-electric/10 to-accent-cyan/5 border-accent-electric/20"
              />
              <StatCard
                title="Meta do Dia"
                value={`${formatCurrency(configuracao.stopGainReais)} (${configuracao.stopGainPercentual.toFixed(2)}%)`}
                icon={Target}
                valueColor="text-emerald-400"
                className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20"
              />
              <StatCard
                title="Stop Loss"
                value={`${formatCurrency(configuracao.stopLossReais)} (${configuracao.stopLossPercentual.toFixed(2)}%)`}
                icon={Shield}
                valueColor="text-red-400"
                className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20"
              />
              <StatCard
                title="Entrada Máxima"
                value={formatCurrency(configuracao.valorMaximoEntrada)}
                icon={Zap}
                valueColor="text-yellow-400"
                className="bg-gradient-to-br from-yellow-500/10 to-orange-600/5 border-yellow-500/20"
              />
            </div>

            {/* Status do Dia */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <StatCard
                title="Lucro do Dia"
                value={formatCurrency(lucroPrejuizoHoje)}
                icon={TrendingUp}
                valueColor={lucroPrejuizoHoje >= 0 ? 'text-emerald-400' : 'text-red-400'}
                className={lucroPrejuizoHoje >= 0 
                  ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20'
                  : 'bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20'
                }
              />
              <StatCard
                title="Operações Hoje"
                value={`${operacoesHoje.length}/5`}
                icon={Activity}
                valueColor={operacoesHoje.length >= 5 ? 'text-red-400' : 'text-blue-400'}
                className={operacoesHoje.length >= 5
                  ? 'bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20'
                  : 'bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20'
                }
              />
              <StatCard
                title="Próxima Operação"
                value={podeOperar ? `${proximaOperacao}/5` : 'Bloqueado'}
                icon={Clock}
                valueColor={podeOperar ? 'text-emerald-400' : 'text-red-400'}
                className={podeOperar
                  ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20'
                  : 'bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20'
                }
              />
              <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-4 h-4 rounded-full ${
                    semaforoRisco.cor === 'green' ? 'bg-emerald-400' :
                    semaforoRisco.cor === 'yellow' ? 'bg-yellow-400' :
                    semaforoRisco.cor === 'red' ? 'bg-red-400' :
                    'bg-gray-400'
                  } animate-pulse`} />
                  <h3 className="text-sm font-medium text-gray-400">Semáforo de Risco</h3>
                </div>
                <p className={`text-2xl font-bold ${
                  semaforoRisco.cor === 'green' ? 'text-emerald-400' :
                  semaforoRisco.cor === 'yellow' ? 'text-yellow-400' :
                  semaforoRisco.cor === 'red' ? 'text-red-400' :
                  'text-gray-400'
                }`}>
                  {semaforoRisco.texto}
                </p>
              </div>
            </div>

            {/* Progresso */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Progresso até Stop Gain
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progresso</span>
                    <span className="text-emerald-400 font-semibold">{Math.min(progressoStopGain, 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-dark-black rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-4 rounded-full transition-all"
                      style={{ width: `${Math.min(progressoStopGain, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(lucroPrejuizoHoje)} / {formatCurrency(configuracao.stopGainReais)}
                  </p>
                </div>
              </div>

              <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                  Progresso até Stop Loss
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progresso</span>
                    <span className="text-red-400 font-semibold">{Math.min(progressoStopLoss, 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-dark-black rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-red-500 to-red-400 h-4 rounded-full transition-all"
                      style={{ width: `${Math.min(progressoStopLoss, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(Math.abs(lucroPrejuizoHoje))} / {formatCurrency(configuracao.stopLossReais)}
                  </p>
                </div>
              </div>
            </div>

            {/* Indicadores Rápidos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Taxa de Acerto</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Diária</p>
                    <p className="text-2xl font-bold text-accent-electric">{estatisticasDiarias.taxaAcerto.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Mensal</p>
                    <p className="text-xl font-semibold text-blue-400">{estatisticasMensais.taxaAcerto.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Global</p>
                    <p className="text-xl font-semibold text-purple-400">{estatisticasGlobais.taxaAcerto.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Melhores Ativos</h3>
                <div className="space-y-2">
                  {estatisticasGlobais.assertividadeAtivos.slice(0, 5).map((ativo, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm">{ativo.ativo}</span>
                      <span className="text-emerald-400 font-semibold">{ativo.assertividade.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Últimas 10 Operações</h3>
                <div className="space-y-2">
                  {dadosUltimasOperacoes.slice(0, 10).map((op, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">{op.ativo}</span>
                      <span className={op.lucro >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {op.lucro >= 0 ? '+' : ''}{formatCurrency(op.lucro)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Botão Registrar Operação */}
        {configuracao && podeOperar && (
          <div className="flex justify-center">
            <Button
              onClick={() => {
                setEditingOperacao(null)
                setIsOperacaoModalOpen(true)
              }}
              className="flex items-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-xl px-8 py-4 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
            >
              <Plus className="w-6 h-6" />
              Registrar Operação {proximaOperacao}/5
            </Button>
          </div>
        )}

        {/* Lista de Operações do Dia */}
        {operacoesHoje.length > 0 && (
          <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent-electric" />
              Operações do Dia ({operacoesHoje.length}/5)
            </h2>
            <div className="space-y-3">
              {operacoesHoje
                .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime())
                .map((operacao) => (
                  <div
                    key={operacao.id}
                    className="p-5 bg-dark-black/50 border border-card-border/50 rounded-xl hover:border-accent-electric/30 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold text-lg">{operacao.ativo}</h3>
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/20">
                            Op. #{operacao.numeroOperacao || operacoesHoje.indexOf(operacao) + 1}
                          </span>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                            operacao.resultado === 'Gain'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                              : 'bg-red-500/15 text-red-400 border-red-500/20'
                          }`}>
                            {operacao.resultado}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-accent-electric/15 text-accent-electric border border-accent-electric/20">
                            {operacao.tipo}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400 mb-1">Valor Entrada</p>
                            <p className="text-white font-semibold">
                              {formatCurrency(operacao.valorEntrada)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 mb-1">Lucro/Prejuízo</p>
                            <p className={`font-semibold ${operacao.lucroPrejuizo >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {operacao.lucroPrejuizo >= 0 ? '+' : ''}{formatCurrency(operacao.lucroPrejuizo)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 mb-1">Data/Hora</p>
                            <p className="text-white font-semibold">
                              {new Date(operacao.dataHora).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        {operacao.observacoes && (
                          <p className="text-sm text-gray-400 mt-2">{operacao.observacoes}</p>
                        )}
                        {operacao.urlPrint && (
                          <a
                            href={operacao.urlPrint}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-accent-electric hover:text-accent-cyan mt-2 inline-block"
                          >
                            Ver print
                          </a>
                        )}
                      </div>
                      {!sistemaBloqueado && (
                        <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingOperacao(operacao)
                              setPrintPreview(operacao.urlPrint || null)
                              setIsOperacaoModalOpen(true)
                            }}
                            className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Tem certeza que deseja excluir esta operação?')) {
                                deleteOperacao(operacao.id)
                              }
                            }}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Estatísticas Detalhadas - Abas */}
        {configuracao && (
          <EstatisticasDetalhadas
            diarias={estatisticasDiarias}
            mensais={estatisticasMensais}
            anuais={estatisticasAnuais}
            globais={estatisticasGlobais}
            abaAtiva={abaEstatisticas}
            setAbaAtiva={setAbaEstatisticas}
          />
        )}

        {/* Modal de Configuração */}
        <Modal
          isOpen={isConfigModalOpen}
          onClose={() => {
            setIsConfigModalOpen(false)
            setValoresCalculados(null)
          }}
          title={configuracao ? 'Editar Configuração' : 'Configuração Inicial do Sistema'}
          size="lg"
          variant="warning"
          icon={Settings}
          description={configuracao ? 'Atualize os parâmetros do sistema' : 'Configure o capital e meta diária. O sistema calculará automaticamente Stop Loss (50% do Stop Gain), valor máximo por entrada (2,5%) e limite de 5 operações por dia.'}
        >
          <form onSubmit={handleConfigSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Capital Total (R$)
              </label>
              <input
                type="number"
                name="capitalTotal"
                required
                step="0.01"
                min="0"
                defaultValue={configuracao?.capitalTotal}
                onChange={(e) => {
                  const capital = parseFloat(e.target.value) || 0
                  const meta = parseFloat((document.querySelector('input[name="metaDiariaPercentual"]') as HTMLInputElement)?.value || '0')
                  if (capital > 0 && meta > 0) {
                    calcularValores(capital, meta)
                  }
                }}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Meta Diária (Stop Gain) (%)
              </label>
              <input
                type="number"
                name="metaDiariaPercentual"
                required
                step="0.01"
                min="0"
                defaultValue={configuracao?.metaDiariaPercentual}
                onChange={(e) => {
                  const meta = parseFloat(e.target.value) || 0
                  const capital = parseFloat((document.querySelector('input[name="capitalTotal"]') as HTMLInputElement)?.value || '0')
                  if (capital > 0 && meta > 0) {
                    calcularValores(capital, meta)
                  }
                }}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                O Stop Loss será automaticamente 50% deste valor
              </p>
            </div>
            
            {/* Apresentação dos Valores Calculados */}
            {(valoresCalculados || configuracao) && (
              <div className="bg-gradient-to-br from-accent-electric/10 to-accent-cyan/5 border-2 border-accent-electric/30 rounded-xl p-6 space-y-4">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent-electric" />
                  Valores Calculados Automaticamente
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-dark-black/50 border border-emerald-500/20 rounded-lg p-4">
                    <p className="text-xs text-gray-400 mb-1">Stop Gain (R$)</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {formatCurrency((valoresCalculados || configuracao)!.stopGainReais)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ({((valoresCalculados || configuracao)!.stopGainPercentual).toFixed(2)}%)
                    </p>
                  </div>
                  <div className="bg-dark-black/50 border border-red-500/20 rounded-lg p-4">
                    <p className="text-xs text-gray-400 mb-1">Stop Loss (R$)</p>
                    <p className="text-2xl font-bold text-red-400">
                      {formatCurrency((valoresCalculados || configuracao)!.stopLossReais)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ({((valoresCalculados || configuracao)!.stopLossPercentual).toFixed(2)}%)
                    </p>
                  </div>
                  <div className="bg-dark-black/50 border border-yellow-500/20 rounded-lg p-4 md:col-span-2">
                    <p className="text-xs text-gray-400 mb-1">Entrada Máxima por Operação (2,5%)</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {formatCurrency((valoresCalculados || configuracao)!.valorMaximoEntrada)}
                    </p>
                  </div>
                  <div className="bg-dark-black/50 border border-blue-500/20 rounded-lg p-4 md:col-span-2">
                    <p className="text-xs text-gray-400 mb-1">Limite de Operações por Dia</p>
                    <p className="text-2xl font-bold text-blue-400">
                      5 operações (fixo)
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {configuracao ? 'Salvar Alterações' : 'Criar Configuração'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsConfigModalOpen(false)
                  setValoresCalculados(null)
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
          onClose={() => {
            setIsOperacaoModalOpen(false)
            setEditingOperacao(null)
            setPrintPreview(null)
          }}
          title={editingOperacao ? 'Editar Operação' : `Nova Operação ${proximaOperacao}/5`}
          size="lg"
          variant="info"
          icon={Plus}
          description={editingOperacao ? 'Atualize os dados da operação' : 'Registre uma nova operação. O valor da entrada não pode exceder 2,5% do capital.'}
        >
          <form onSubmit={handleOperacaoSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ativo FOREX
                </label>
                <ForexAutocomplete
                  value={editingOperacao?.ativo || ''}
                  onChange={(value) => {
                    if (editingOperacao) {
                      setEditingOperacao({ ...editingOperacao, ativo: value })
                    }
                  }}
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
                  defaultValue={editingOperacao?.tipo}
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
                  defaultValue={editingOperacao?.resultado}
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
                  max={configuracao?.valorMaximoEntrada}
                  defaultValue={editingOperacao?.valorEntrada}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
                {configuracao && (
                  <p className="text-xs text-gray-500 mt-1">
                    Máximo: {formatCurrency(configuracao.valorMaximoEntrada)} (2,5% do capital)
                  </p>
                )}
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
                defaultValue={editingOperacao?.lucroPrejuizo}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload do Print
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePrintUpload}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
              {printPreview && (
                <div className="mt-2 relative">
                  <img src={printPreview} alt="Preview" className="max-w-full h-auto rounded-lg border border-card-border/50" />
                  <button
                    type="button"
                    onClick={() => setPrintPreview(null)}
                    className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <input
                type="hidden"
                name="urlPrint"
                value={printPreview || editingOperacao?.urlPrint || ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Observações
              </label>
              <textarea
                name="observacoes"
                defaultValue={editingOperacao?.observacoes}
                rows={3}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={sistemaBloqueado}>
                {editingOperacao ? 'Salvar Alterações' : 'Registrar Operação'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsOperacaoModalOpen(false)
                  setEditingOperacao(null)
                  setPrintPreview(null)
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

// Componente de Estatísticas Detalhadas
function EstatisticasDetalhadas({ 
  diarias, 
  mensais, 
  anuais, 
  globais,
  abaAtiva,
  setAbaAtiva
}: any) {
  return (
    <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
      <div className="flex flex-wrap gap-2 mb-6 border-b border-card-border/50 pb-4">
        <button
          onClick={() => setAbaAtiva('diarias')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            abaAtiva === 'diarias'
              ? 'bg-accent-electric/20 text-accent-electric border border-accent-electric/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Diárias
        </button>
        <button
          onClick={() => setAbaAtiva('mensais')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            abaAtiva === 'mensais'
              ? 'bg-accent-electric/20 text-accent-electric border border-accent-electric/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Mensais
        </button>
        <button
          onClick={() => setAbaAtiva('anuais')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            abaAtiva === 'anuais'
              ? 'bg-accent-electric/20 text-accent-electric border border-accent-electric/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Anuais
        </button>
        <button
          onClick={() => setAbaAtiva('globais')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            abaAtiva === 'globais'
              ? 'bg-accent-electric/20 text-accent-electric border border-accent-electric/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Globais
        </button>
      </div>

      {abaAtiva === 'diarias' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Taxa de Acerto"
              value={`${diarias.taxaAcerto.toFixed(1)}%`}
              icon={Target}
              valueColor="text-emerald-400"
            />
            <StatCard
              title="Total Operações"
              value={diarias.totalOperacoes}
              icon={Activity}
            />
            <StatCard
              title="Gains"
              value={diarias.gains}
              icon={TrendingUp}
              valueColor="text-emerald-400"
            />
            <StatCard
              title="Losses"
              value={diarias.losses}
              icon={TrendingDown}
              valueColor="text-red-400"
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-dark-black/50 border border-card-border/50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-white mb-3">Assertividade por Ativo</h4>
              <div className="space-y-2">
                {diarias.assertividadeAtivos.length > 0 ? (
                  diarias.assertividadeAtivos.map((a: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm">{a.ativo}</span>
                      <span className="text-emerald-400 font-semibold">{a.assertividade.toFixed(1)}%</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Nenhum dado disponível</p>
                )}
              </div>
            </div>
            <div className="bg-dark-black/50 border border-card-border/50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-white mb-3">Assertividade por Tipo</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Compra (CALL)</span>
                  <span className="text-blue-400 font-semibold">{diarias.assertividadeCompra.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Venda (PUT)</span>
                  <span className="text-purple-400 font-semibold">{diarias.assertividadeVenda.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {abaAtiva === 'mensais' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Taxa de Acerto"
              value={`${mensais.taxaAcerto.toFixed(1)}%`}
              icon={Target}
              valueColor="text-emerald-400"
            />
            <StatCard
              title="Total Operações"
              value={mensais.totalOperacoes}
              icon={Activity}
            />
            <StatCard
              title="Lucro Total"
              value={formatCurrency(mensais.lucroTotal)}
              icon={DollarSign}
              valueColor={mensais.lucroTotal >= 0 ? 'text-emerald-400' : 'text-red-400'}
            />
            <StatCard
              title="Ativo Mais Lucrativo"
              value={mensais.ativoMaisLucrativo}
              icon={TrendingUp}
              valueColor="text-emerald-400"
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-dark-black/50 border border-card-border/50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-white mb-3">Desempenho por Tipo</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Compra (CALL)</span>
                  <span className={mensais.lucroCompras >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {formatCurrency(mensais.lucroCompras)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Venda (PUT)</span>
                  <span className={mensais.lucroVendas >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {formatCurrency(mensais.lucroVendas)}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-dark-black/50 border border-card-border/50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-white mb-3">Análise de Ativos</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Mais Lucrativo</span>
                  <span className="text-emerald-400 font-semibold">{mensais.ativoMaisLucrativo}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Mais Perigoso</span>
                  <span className="text-red-400 font-semibold">{mensais.ativoMaisPerigoso}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {abaAtiva === 'anuais' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              title="Taxa de Acerto"
              value={`${anuais.taxaAcerto.toFixed(1)}%`}
              icon={Target}
              valueColor="text-emerald-400"
            />
            <StatCard
              title="Lucro Anual"
              value={formatCurrency(anuais.lucroAnual)}
              icon={DollarSign}
              valueColor={anuais.lucroAnual >= 0 ? 'text-emerald-400' : 'text-red-400'}
            />
          </div>
          {anuais.graficoMensal && anuais.graficoMensal.length > 0 && (
            <div className="bg-dark-black/50 border border-card-border/50 rounded-xl p-6">
              <h4 className="text-sm font-semibold text-white mb-4">Gráfico Mensal</h4>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={anuais.graficoMensal}>
                  <defs>
                    <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00D9FF" stopOpacity={0}/>
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
                  <Area 
                    type="monotone" 
                    dataKey="lucro" 
                    stroke="#00D9FF" 
                    strokeWidth={2}
                    fill="url(#colorLucro)"
                    name="Lucro (R$)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          {anuais.rankingAtivos && anuais.rankingAtivos.length > 0 && (
            <div className="bg-dark-black/50 border border-card-border/50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-white mb-3">Ranking de Ativos por Assertividade</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {anuais.rankingAtivos.slice(0, 10).map((a: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">
                      {idx + 1}. {a.ativo} ({a.total} ops)
                    </span>
                    <span className="text-emerald-400 font-semibold">{a.assertividade.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {abaAtiva === 'globais' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Taxa de Acerto"
              value={`${globais.taxaAcerto.toFixed(1)}%`}
              icon={Target}
              valueColor="text-emerald-400"
            />
            <StatCard
              title="Total Operações"
              value={globais.totalOperacoes}
              icon={Activity}
            />
            <StatCard
              title="Média Lucro/Dia"
              value={formatCurrency(globais.mediaLucroDia)}
              icon={DollarSign}
              valueColor="text-blue-400"
            />
            <StatCard
              title="Média Lucro/Mês"
              value={formatCurrency(globais.mediaLucroMes)}
              icon={TrendingUp}
              valueColor="text-purple-400"
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-dark-black/50 border border-card-border/50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-white mb-3">Assertividade por Ativo</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {globais.assertividadeAtivos.length > 0 ? (
                  globais.assertividadeAtivos.map((a: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm">{a.ativo} ({a.total})</span>
                      <span className="text-emerald-400 font-semibold">{a.assertividade.toFixed(1)}%</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Nenhum dado disponível</p>
                )}
              </div>
            </div>
            <div className="bg-dark-black/50 border border-card-border/50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-white mb-3">Assertividade por Tipo</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Compra (CALL)</span>
                  <span className="text-blue-400 font-semibold">{globais.assertividadeCompra.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Venda (PUT)</span>
                  <span className="text-purple-400 font-semibold">{globais.assertividadeVenda.toFixed(1)}%</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-card-border/50">
                <h5 className="text-xs font-semibold text-gray-400 mb-2">Melhor Horário</h5>
                <p className="text-emerald-400 font-semibold">
                  {globais.melhorHorario !== null ? `${globais.melhorHorario}h` : 'N/A'}
                </p>
              </div>
              <div className="mt-2">
                <h5 className="text-xs font-semibold text-gray-400 mb-2">Pior Horário</h5>
                <p className="text-red-400 font-semibold">
                  {globais.piorHorario !== null ? `${globais.piorHorario}h` : 'N/A'}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-card-border/50">
                <h5 className="text-xs font-semibold text-gray-400 mb-2">Melhores Dias da Semana</h5>
                <div className="space-y-1">
                  {globais.melhoresDias.length > 0 ? (
                    globais.melhoresDias.map((d: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-gray-300 text-xs">{d.nome}</span>
                        <span className="text-emerald-400 font-semibold text-xs">{d.assertividade.toFixed(1)}%</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-xs">Nenhum dado disponível</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
