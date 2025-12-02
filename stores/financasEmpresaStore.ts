import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TransacaoFinanceira, MetaFinanceira } from '@/types'
import { saveTransacaoEmpresa, deleteTransacaoEmpresa, loadTransacoesEmpresa } from '@/utils/supabaseSync'

interface FinancasEmpresaStore {
  transacoes: TransacaoFinanceira[]
  metas: MetaFinanceira[]
  fluxoCaixa: number
  saldoAcumulado: number // Saldo acumulado que passa para o próximo mês
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
  getContasPendentesMes: () => number
  marcarComoPaga: (id: string) => void
  rolarContasNaoPagas: () => void
  loadFromSupabase: () => Promise<void>
}

export const useFinancasEmpresaStore = create<FinancasEmpresaStore>()(
  persist(
    (set, get) => ({
      transacoes: [],
      metas: [],
      fluxoCaixa: 0,
      saldoAcumulado: 0,
      addTransacao: async (transacao) => {
        // Salvar no Supabase
        await saveTransacaoEmpresa(transacao)
        
        set((state) => ({ transacoes: [...state.transacoes, transacao] }))
        get().calcularFluxoCaixa()
      },
      updateTransacao: async (id, updates) => {
        const estado = get()
        const transacaoAtualizada = estado.transacoes.find(t => t.id === id)
        if (transacaoAtualizada) {
          const transacao = { ...transacaoAtualizada, ...updates }
          // Salvar no Supabase
          await saveTransacaoEmpresa(transacao)
        }
        
        set((state) => ({
          transacoes: state.transacoes.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }))
        get().calcularFluxoCaixa()
      },
      deleteTransacao: async (id) => {
        // Deletar no Supabase
        await deleteTransacaoEmpresa(id)
        
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
              t.tipo === 'saida' &&
              t.paga === true // Apenas contas pagas
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
        
        // Fluxo de caixa = Saldo acumulado + Receitas do mês - Despesas do mês
        const fluxoCaixa = saldoAcumulado + receitasMes - despesasMes
        
        set({ 
          fluxoCaixa,
          saldoAcumulado 
        })
      },
      getSaudeFinanceira: () => {
        const fluxo = get().fluxoCaixa
        if (fluxo > 0) return 'saudavel'
        if (fluxo > -10000) return 'atencao'
        return 'critico'
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
      marcarComoPaga: async (id) => {
        const estado = get()
        const transacao = estado.transacoes.find(t => t.id === id)
        if (transacao) {
          const novaPaga = !transacao.paga
          const transacaoAtualizada = {
            ...transacao,
            paga: novaPaga,
            dataPagamento: novaPaga ? new Date().toISOString().split('T')[0] : undefined,
          }
          // Salvar no Supabase
          await saveTransacaoEmpresa(transacaoAtualizada)
        }
        
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
        get().calcularFluxoCaixa()
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
      loadFromSupabase: async () => {
        const transacoes = await loadTransacoesEmpresa()
        set({ transacoes })
        get().calcularFluxoCaixa()
      },
    }),
    {
      name: 'financas-empresa-storage',
    }
  )
)



