import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TransacaoFinanceira, MetaFinanceira, GastoRecorrente } from '@/types'

interface FinancasPessoaisStore {
  transacoes: TransacaoFinanceira[]
  metas: MetaFinanceira[]
  gastosRecorrentes: GastoRecorrente[]
  saldoAtual: number
  saldoAcumulado: number // Saldo acumulado que passa para o próximo mês
  addTransacao: (transacao: TransacaoFinanceira) => void
  updateTransacao: (id: string, transacao: Partial<TransacaoFinanceira>) => void
  deleteTransacao: (id: string) => void
  addMeta: (meta: MetaFinanceira) => void
  updateMeta: (id: string, meta: Partial<MetaFinanceira>) => void
  deleteMeta: (id: string) => void
  addGastoRecorrente: (gasto: GastoRecorrente) => void
  updateGastoRecorrente: (id: string, gasto: Partial<GastoRecorrente>) => void
  deleteGastoRecorrente: (id: string) => void
  getEntradasMes: () => number
  getSaidasMes: () => number
  getPrevisaoMes: () => number
  calcularSaldo: () => void
}

export const useFinancasPessoaisStore = create<FinancasPessoaisStore>()(
  persist(
    (set, get) => ({
      transacoes: [],
      metas: [],
      gastosRecorrentes: [],
      saldoAtual: 0,
      saldoAcumulado: 0,
      addTransacao: (transacao) => {
        set((state) => ({ transacoes: [...state.transacoes, transacao] }))
        get().calcularSaldo()
      },
      updateTransacao: (id, updates) => {
        set((state) => ({
          transacoes: state.transacoes.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }))
        get().calcularSaldo()
      },
      deleteTransacao: (id) => {
        set((state) => ({
          transacoes: state.transacoes.filter((t) => t.id !== id),
        }))
        get().calcularSaldo()
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
      addGastoRecorrente: (gasto) =>
        set((state) => ({ gastosRecorrentes: [...state.gastosRecorrentes, gasto] })),
      updateGastoRecorrente: (id, updates) =>
        set((state) => ({
          gastosRecorrentes: state.gastosRecorrentes.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        })),
      deleteGastoRecorrente: (id) =>
        set((state) => ({
          gastosRecorrentes: state.gastosRecorrentes.filter((g) => g.id !== id),
        })),
      getEntradasMes: () => {
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
      getSaidasMes: () => {
        const hoje = new Date()
        const mesAtual = hoje.getMonth()
        const anoAtual = hoje.getFullYear()
        return get()
          .transacoes.filter((t) => {
            const data = new Date(t.data)
            return (
              data.getMonth() === mesAtual &&
              data.getFullYear() === anoAtual &&
              t.tipo === 'saida'
            )
          })
          .reduce((acc, t) => acc + t.valor, 0)
      },
      getPrevisaoMes: () => {
        const entradas = get().getEntradasMes()
        const saidas = get().getSaidasMes()
        const gastosRecorrentes = get().gastosRecorrentes.reduce(
          (acc, g) => acc + g.valor,
          0
        )
        return entradas - saidas - gastosRecorrentes
      },
      calcularSaldo: () => {
        const hoje = new Date()
        const mesAtual = hoje.getMonth()
        const anoAtual = hoje.getFullYear()
        
        // Calcula receitas e despesas do mês atual
        const receitasMes = get()
          .transacoes.filter((t) => {
            const data = new Date(t.data)
            return (
              data.getMonth() === mesAtual &&
              data.getFullYear() === anoAtual &&
              t.tipo === 'entrada'
            )
          })
          .reduce((acc, t) => acc + t.valor, 0)
        
        const despesasMes = get()
          .transacoes.filter((t) => {
            const data = new Date(t.data)
            return (
              data.getMonth() === mesAtual &&
              data.getFullYear() === anoAtual &&
              t.tipo === 'saida'
            )
          })
          .reduce((acc, t) => acc + t.valor, 0)
        
        // Calcula saldo acumulado de meses anteriores
        const receitasAnteriores = get()
          .transacoes.filter((t) => {
            const data = new Date(t.data)
            return (
              (data.getMonth() < mesAtual && data.getFullYear() === anoAtual) ||
              data.getFullYear() < anoAtual
            ) && t.tipo === 'entrada'
          })
          .reduce((acc, t) => acc + t.valor, 0)
        
        const despesasAnteriores = get()
          .transacoes.filter((t) => {
            const data = new Date(t.data)
            return (
              (data.getMonth() < mesAtual && data.getFullYear() === anoAtual) ||
              data.getFullYear() < anoAtual
            ) && t.tipo === 'saida'
          })
          .reduce((acc, t) => acc + t.valor, 0)
        
        // Saldo acumulado = Receitas anteriores - Despesas anteriores
        const saldoAcumulado = receitasAnteriores - despesasAnteriores
        
        // Saldo atual = Saldo acumulado + Receitas do mês - Despesas do mês
        const saldoAtual = saldoAcumulado + receitasMes - despesasMes
        
        set({ 
          saldoAtual,
          saldoAcumulado 
        })
      },
    }),
    {
      name: 'financas-pessoais-storage',
    }
  )
)



