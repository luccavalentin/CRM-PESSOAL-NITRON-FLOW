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
  getContasPendentesMes: () => number
  marcarComoPaga: (id: string) => void
  rolarContasNaoPagas: () => void
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
              t.tipo === 'saida' &&
              (t.paga === true || t.tipo === 'entrada') // Contas pagas ou entradas
            )
          })
          .reduce((acc, t) => acc + t.valor, 0)
      },
      getContasPendentesMes: () => {
        const hoje = new Date()
        const mesAtual = hoje.getMonth()
        const anoAtual = hoje.getFullYear()
        return get()
          .transacoes.filter((t) => {
            const data = new Date(t.data)
            return (
              data.getMonth() === mesAtual &&
              data.getFullYear() === anoAtual &&
              t.tipo === 'saida' &&
              !t.paga
            )
          })
          .reduce((acc, t) => acc + t.valor, 0)
      },
      marcarComoPaga: (id) => {
        set((state) => ({
          transacoes: state.transacoes.map((t) => {
            if (t.id === id) {
              const novaPaga = !t.paga
              return {
                ...t,
                paga: novaPaga,
                dataPagamento: novaPaga ? new Date().toISOString().split('T')[0] : undefined,
              }
            }
            return t
          }),
        }))
        get().calcularSaldo()
      },
      rolarContasNaoPagas: () => {
        const hoje = new Date()
        const mesAtual = hoje.getMonth()
        const anoAtual = hoje.getFullYear()
        
        // Se for o primeiro dia do mês, rolar contas não pagas do mês anterior
        if (hoje.getDate() === 1) {
          const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1
          const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual
          
          const contasNaoPagas = get().transacoes.filter((t) => {
            const data = new Date(t.data)
            return (
              data.getMonth() === mesAnterior &&
              data.getFullYear() === anoAnterior &&
              t.tipo === 'saida' &&
              !t.paga
            )
          })
          
          if (contasNaoPagas.length > 0) {
            set((state) => ({
              transacoes: state.transacoes.map((t) => {
                if (contasNaoPagas.some(c => c.id === t.id)) {
                  const dataOriginal = new Date(t.data)
                  const novaData = new Date(anoAtual, mesAtual, dataOriginal.getDate())
                  return {
                    ...t,
                    data: novaData.toISOString().split('T')[0],
                    rolouMes: true,
                  }
                }
                return t
              }),
            }))
          }
        } else {
          // Verificar contas não pagas do mês atual que já venceram e rolar para o próximo mês
          const contasVencidas = get().transacoes.filter((t) => {
            const dataVencimento = new Date(t.data)
            const hojeSemHora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
            const vencimentoSemHora = new Date(dataVencimento.getFullYear(), dataVencimento.getMonth(), dataVencimento.getDate())
            
            return (
              t.tipo === 'saida' &&
              !t.paga &&
              vencimentoSemHora < hojeSemHora &&
              dataVencimento.getMonth() === mesAtual &&
              dataVencimento.getFullYear() === anoAtual &&
              !t.rolouMes
            )
          })
          
          // Se houver contas vencidas, rolar para o próximo mês
          if (contasVencidas.length > 0) {
            const proximoMes = mesAtual === 11 ? 0 : mesAtual + 1
            const proximoAno = mesAtual === 11 ? anoAtual + 1 : anoAtual
            
            set((state) => ({
              transacoes: state.transacoes.map((t) => {
                if (contasVencidas.some(c => c.id === t.id)) {
                  const dataOriginal = new Date(t.data)
                  const novaData = new Date(proximoAno, proximoMes, dataOriginal.getDate())
                  return {
                    ...t,
                    data: novaData.toISOString().split('T')[0],
                    rolouMes: true,
                  }
                }
                return t
              }),
            }))
          }
        }
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



