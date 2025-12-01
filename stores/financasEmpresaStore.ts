import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TransacaoFinanceira, MetaFinanceira } from '@/types'

interface FinancasEmpresaStore {
  transacoes: TransacaoFinanceira[]
  metas: MetaFinanceira[]
  fluxoCaixa: number
  addTransacao: (transacao: TransacaoFinanceira) => void
  updateTransacao: (id: string, transacao: Partial<TransacaoFinanceira>) => void
  deleteTransacao: (id: string) => void
  addMeta: (meta: MetaFinanceira) => void
  updateMeta: (id: string, meta: Partial<MetaFinanceira>) => void
  deleteMeta: (id: string) => void
  getEntradasPorCliente: () => Record<string, number>
  getSaidasPorCategoria: () => Record<string, number>
  getPrevisaoFaturamento: () => number
  calcularFluxoCaixa: () => void
  getSaudeFinanceira: () => 'saudavel' | 'atencao' | 'critico'
}

export const useFinancasEmpresaStore = create<FinancasEmpresaStore>()(
  persist(
    (set, get) => ({
      transacoes: [],
      metas: [],
      fluxoCaixa: 0,
      addTransacao: (transacao) => {
        set((state) => ({ transacoes: [...state.transacoes, transacao] }))
        get().calcularFluxoCaixa()
      },
      updateTransacao: (id, updates) => {
        set((state) => ({
          transacoes: state.transacoes.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }))
        get().calcularFluxoCaixa()
      },
      deleteTransacao: (id) => {
        set((state) => ({
          transacoes: state.transacoes.filter((t) => t.id !== id),
        }))
        get().calcularFluxoCaixa()
      },
      addMeta: (meta) =>
        set((state) => ({ metas: [...state.metas, meta] })),
      updateMeta: (id, updates) =>
        set((state) => ({
          metas: state.metas.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),
      deleteMeta: (id) =>
        set((state) => ({
          metas: state.metas.filter((m) => m.id !== id),
        })),
      getEntradasPorCliente: () => {
        const entradas = get()
          .transacoes.filter((t) => t.tipo === 'entrada')
          .reduce((acc, t) => {
            const cliente = t.categoria || 'Outros'
            acc[cliente] = (acc[cliente] || 0) + t.valor
            return acc
          }, {} as Record<string, number>)
        return entradas
      },
      getSaidasPorCategoria: () => {
        return get()
          .transacoes.filter((t) => t.tipo === 'saida')
          .reduce((acc, t) => {
            acc[t.categoria] = (acc[t.categoria] || 0) + t.valor
            return acc
          }, {} as Record<string, number>)
      },
      getPrevisaoFaturamento: () => {
        const hoje = new Date()
        const mesAtual = hoje.getMonth()
        const anoAtual = hoje.getFullYear()
        return get()
          .transacoes.filter((t) => {
            const data = new Date(t.data)
            return (
              data.getMonth() === mesAtual &&
              data.getFullYear() === anoAtual &&
              t.tipo === 'entrada'
            )
          })
          .reduce((acc, t) => acc + t.valor, 0)
      },
      calcularFluxoCaixa: () => {
        const entradas = get()
          .transacoes.filter((t) => t.tipo === 'entrada')
          .reduce((acc, t) => acc + t.valor, 0)
        const saidas = get()
          .transacoes.filter((t) => t.tipo === 'saida')
          .reduce((acc, t) => acc + t.valor, 0)
        set({ fluxoCaixa: entradas - saidas })
      },
      getSaudeFinanceira: () => {
        const fluxo = get().fluxoCaixa
        if (fluxo > 0) return 'saudavel'
        if (fluxo > -10000) return 'atencao'
        return 'critico'
      },
    }),
    {
      name: 'financas-empresa-storage',
    }
  )
)


