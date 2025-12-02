import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  OperacaoTrading,
  ConfiguracaoTrading,
  SessaoAlavancagem,
  MotivoBloqueio,
} from '@/types'

interface TradingStore {
  operacoes: OperacaoTrading[]
  configuracao: ConfiguracaoTrading | null
  sessoes: SessaoAlavancagem[]
  addOperacao: (operacao: OperacaoTrading) => void
  updateOperacao: (id: string, operacao: Partial<OperacaoTrading>) => void
  deleteOperacao: (id: string) => void
  setConfiguracao: (config: ConfiguracaoTrading) => void
  verificarBloqueio: () => void
  getOperacoesDoDia: () => OperacaoTrading[]
  getLucroPrejuizoDia: () => number
  getEstatisticas: () => {
    totalOperacoes: number
    ganhos: number
    perdas: number
    winRate: number
    lucroTotal: number
  }
  addSessao: (sessao: SessaoAlavancagem) => void
  updateSessao: (id: string, sessao: Partial<SessaoAlavancagem>) => void
}

export const useTradingStore = create<TradingStore>()(
  persist(
    (set, get) => ({
      operacoes: [],
      configuracao: null,
      sessoes: [],
      addOperacao: (operacao) => {
        set((state) => ({ operacoes: [...state.operacoes, operacao] }))
        get().verificarBloqueio()
      },
      updateOperacao: (id, updates) =>
        set((state) => ({
          operacoes: state.operacoes.map((o) =>
            o.id === id ? { ...o, ...updates } : o
          ),
        })),
      deleteOperacao: (id) =>
        set((state) => ({
          operacoes: state.operacoes.filter((o) => o.id !== id),
        })),
      setConfiguracao: (config) => {
        set({ configuracao: config })
        get().verificarBloqueio()
      },
      verificarBloqueio: () => {
        const config = get().configuracao
        if (!config) return

        const hoje = new Date().toISOString().split('T')[0]
        const operacoesHoje = get().getOperacoesDoDia()
        const lucroPrejuizo = get().getLucroPrejuizoDia()

        let bloqueado = false
        let motivo: MotivoBloqueio | undefined

        // Verificar stop gain
        if (lucroPrejuizo >= config.stopGainReais) {
          bloqueado = true
          motivo = 'stop_gain'
        }

        // Verificar stop loss
        if (lucroPrejuizo <= -config.stopLossReais) {
          bloqueado = true
          motivo = 'stop_loss'
        }

        // Verificar limite de operações
        if (operacoesHoje.length >= config.limiteOperacoesDia) {
          bloqueado = true
          motivo = 'limite_operacoes'
        }

        if (bloqueado && motivo) {
          set({
            configuracao: {
              ...config,
              bloqueado: true,
              motivoBloqueio: motivo,
            },
          })
        }
      },
      getOperacoesDoDia: () => {
        const hoje = new Date().toISOString().split('T')[0]
        return get().operacoes.filter((o) => o.dataHora.startsWith(hoje))
      },
      getLucroPrejuizoDia: () => {
        return get()
          .getOperacoesDoDia()
          .reduce((acc, o) => acc + o.lucroPrejuizo, 0)
      },
      getEstatisticas: () => {
        const operacoes = get().operacoes
        const ganhos = operacoes.filter((o) => o.resultado === 'Gain').length
        const perdas = operacoes.filter((o) => o.resultado === 'Loss').length
        const lucroTotal = operacoes.reduce(
          (acc, o) => acc + o.lucroPrejuizo,
          0
        )
        const winRate =
          operacoes.length > 0 ? (ganhos / operacoes.length) * 100 : 0

        return {
          totalOperacoes: operacoes.length,
          ganhos,
          perdas,
          winRate,
          lucroTotal,
        }
      },
      addSessao: (sessao) =>
        set((state) => ({ sessoes: [...state.sessoes, sessao] })),
      updateSessao: (id, updates) =>
        set((state) => ({
          sessoes: state.sessoes.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),
    }),
    {
      name: 'trading-storage',
    }
  )
)




