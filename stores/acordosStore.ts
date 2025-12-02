import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'

export interface Divida {
  id: string
  descricao: string
  credor: string
  valorOriginal: number
  valorAtual: number
  dataVencimento: string
  taxaJurosOriginal?: number
  tipoDivida: 'cartao' | 'emprestimo' | 'financiamento' | 'outros'
  observacoes?: string
  status: 'ativa' | 'renegociada' | 'quitada'
  dataCriacao: string
  dataQuitacao?: string
}

export interface ParcelaAcordo {
  id: string
  acordoId: string
  numero: number
  valor: number
  dataVencimento: string
  paga: boolean
  dataPagamento?: string
  juros?: number
  multa?: number
}

export interface Acordo {
  id: string
  dividaId: string
  descricao: string
  valorTotal: number
  valorOriginal: number
  numeroParcelas: number
  taxaJuros?: number
  taxaDesconto?: number
  dataInicio: string
  dataFim?: string
  observacoes?: string
  status: 'ativo' | 'concluido' | 'cancelado'
  parcelas: ParcelaAcordo[]
  valorEconomizado?: number
  dataCriacao: string
}

interface AcordosStore {
  dividas: Divida[]
  acordos: Acordo[]
  addDivida: (divida: Omit<Divida, 'id' | 'dataCriacao'>) => void
  updateDivida: (id: string, divida: Partial<Divida>) => void
  deleteDivida: (id: string) => void
  addAcordo: (acordo: Omit<Acordo, 'id' | 'dataCriacao' | 'parcelas'>) => void
  updateAcordo: (id: string, acordo: Partial<Acordo>) => void
  deleteAcordo: (id: string) => void
  marcarParcelaComoPaga: (acordoId: string, parcelaId: string) => void
  getTotalDividas: () => number
  getTotalAcordos: () => number
  getValorTotalEconomizado: () => number
  getProximoVencimento: () => ParcelaAcordo | null
}

export const useAcordosStore = create<AcordosStore>()(
  persist(
    (set, get) => ({
      dividas: [],
      acordos: [],

      addDivida: async (divida) => {
        const novaDivida: Divida = {
          ...divida,
          id: `div-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          dataCriacao: new Date().toISOString(),
        }
        
        // Salvar no Supabase
        try {
          const { data: session } = await supabase.auth.getSession()
          const userId = session?.session?.user?.id
          
          if (userId) {
            const { error } = await supabase
              .from('dividas')
              .insert({
                id: novaDivida.id,
                usuario_id: userId,
                descricao: novaDivida.descricao,
                credor: novaDivida.credor,
                valor_original: novaDivida.valorOriginal,
                valor_atual: novaDivida.valorAtual,
                data_vencimento: novaDivida.dataVencimento,
                taxa_juros_original: novaDivida.taxaJurosOriginal,
                tipo_divida: novaDivida.tipoDivida,
                observacoes: novaDivida.observacoes,
                status: novaDivida.status,
                data_quitacao: novaDivida.dataQuitacao,
              })
            
            if (error) {
              console.error('Erro ao salvar dívida no Supabase:', error)
            }
          }
        } catch (error) {
          console.error('Erro ao salvar dívida no Supabase:', error)
        }
        
        set((state) => ({
          dividas: [...state.dividas, novaDivida]
        }))
      },

      updateDivida: async (id, divida) => {
        // Atualizar no Supabase
        try {
          const { data: session } = await supabase.auth.getSession()
          const userId = session?.session?.user?.id
          
          if (userId) {
            const updateData: any = {}
            if (divida.descricao !== undefined) updateData.descricao = divida.descricao
            if (divida.credor !== undefined) updateData.credor = divida.credor
            if (divida.valorOriginal !== undefined) updateData.valor_original = divida.valorOriginal
            if (divida.valorAtual !== undefined) updateData.valor_atual = divida.valorAtual
            if (divida.dataVencimento !== undefined) updateData.data_vencimento = divida.dataVencimento
            if (divida.taxaJurosOriginal !== undefined) updateData.taxa_juros_original = divida.taxaJurosOriginal
            if (divida.tipoDivida !== undefined) updateData.tipo_divida = divida.tipoDivida
            if (divida.observacoes !== undefined) updateData.observacoes = divida.observacoes
            if (divida.status !== undefined) updateData.status = divida.status
            if (divida.dataQuitacao !== undefined) updateData.data_quitacao = divida.dataQuitacao
            
            const { error } = await supabase
              .from('dividas')
              .update(updateData)
              .eq('id', id)
              .eq('usuario_id', userId)
            
            if (error) {
              console.error('Erro ao atualizar dívida no Supabase:', error)
            }
          }
        } catch (error) {
          console.error('Erro ao atualizar dívida no Supabase:', error)
        }
        
        set((state) => ({
          dividas: state.dividas.map(d => d.id === id ? { ...d, ...divida } : d)
        }))
      },

      deleteDivida: async (id) => {
        // Deletar no Supabase
        try {
          const { data: session } = await supabase.auth.getSession()
          const userId = session?.session?.user?.id
          
          if (userId) {
            const { error } = await supabase
              .from('dividas')
              .delete()
              .eq('id', id)
              .eq('usuario_id', userId)
            
            if (error) {
              console.error('Erro ao deletar dívida no Supabase:', error)
            }
          }
        } catch (error) {
          console.error('Erro ao deletar dívida no Supabase:', error)
        }
        
        set((state) => ({
          dividas: state.dividas.filter(d => d.id !== id),
          acordos: state.acordos.filter(a => a.dividaId !== id)
        }))
      },

      addAcordo: async (acordo) => {
        // Gerar parcelas automaticamente
        const parcelas: ParcelaAcordo[] = []
        const valorParcela = acordo.valorTotal / acordo.numeroParcelas
        const dataInicio = new Date(acordo.dataInicio)
        
        for (let i = 0; i < acordo.numeroParcelas; i++) {
          const dataVencimento = new Date(dataInicio)
          dataVencimento.setMonth(dataVencimento.getMonth() + i)
          
          parcelas.push({
            id: `parc-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
            acordoId: '',
            numero: i + 1,
            valor: valorParcela,
            dataVencimento: dataVencimento.toISOString().split('T')[0],
            paga: false,
          })
        }

        const novoAcordo: Acordo = {
          ...acordo,
          id: `acordo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          dataCriacao: new Date().toISOString(),
          parcelas: parcelas.map(p => ({ ...p, acordoId: '' })),
        }

        // Atualizar IDs das parcelas
        novoAcordo.parcelas = novoAcordo.parcelas.map(p => ({
          ...p,
          acordoId: novoAcordo.id
        }))

        // Salvar no Supabase
        try {
          const { data: session } = await supabase.auth.getSession()
          const userId = session?.session?.user?.id
          
          if (userId) {
            // Salvar acordo
            const { error: acordoError } = await supabase
              .from('acordos')
              .insert({
                id: novoAcordo.id,
                usuario_id: userId,
                divida_id: novoAcordo.dividaId,
                descricao: novoAcordo.descricao,
                valor_total: novoAcordo.valorTotal,
                valor_original: novoAcordo.valorOriginal,
                numero_parcelas: novoAcordo.numeroParcelas,
                taxa_juros: novoAcordo.taxaJuros,
                taxa_desconto: novoAcordo.taxaDesconto,
                data_inicio: novoAcordo.dataInicio,
                data_fim: novoAcordo.dataFim,
                observacoes: novoAcordo.observacoes,
                status: novoAcordo.status,
                valor_economizado: novoAcordo.valorEconomizado,
              })
            
            if (acordoError) {
              console.error('Erro ao salvar acordo no Supabase:', acordoError)
            } else {
              // Salvar parcelas
              const parcelasData = novoAcordo.parcelas.map(p => ({
                id: p.id,
                acordo_id: novoAcordo.id,
                numero: p.numero,
                valor: p.valor,
                data_vencimento: p.dataVencimento,
                paga: p.paga,
                data_pagamento: p.dataPagamento,
                juros: p.juros || 0,
                multa: p.multa || 0,
              }))
              
              const { error: parcelasError } = await supabase
                .from('parcelas_acordo')
                .insert(parcelasData)
              
              if (parcelasError) {
                console.error('Erro ao salvar parcelas no Supabase:', parcelasError)
              }
            }
          }
        } catch (error) {
          console.error('Erro ao salvar acordo no Supabase:', error)
        }

        set((state) => ({
          acordos: [...state.acordos, novoAcordo],
          dividas: state.dividas.map(d => 
            d.id === acordo.dividaId 
              ? { ...d, status: 'renegociada', valorAtual: acordo.valorTotal }
              : d
          )
        }))
      },

      updateAcordo: async (id, acordo) => {
        // Atualizar no Supabase
        try {
          const { data: session } = await supabase.auth.getSession()
          const userId = session?.session?.user?.id
          
          if (userId) {
            const updateData: any = {}
            if (acordo.descricao !== undefined) updateData.descricao = acordo.descricao
            if (acordo.valorTotal !== undefined) updateData.valor_total = acordo.valorTotal
            if (acordo.valorOriginal !== undefined) updateData.valor_original = acordo.valorOriginal
            if (acordo.numeroParcelas !== undefined) updateData.numero_parcelas = acordo.numeroParcelas
            if (acordo.taxaJuros !== undefined) updateData.taxa_juros = acordo.taxaJuros
            if (acordo.taxaDesconto !== undefined) updateData.taxa_desconto = acordo.taxaDesconto
            if (acordo.dataInicio !== undefined) updateData.data_inicio = acordo.dataInicio
            if (acordo.dataFim !== undefined) updateData.data_fim = acordo.dataFim
            if (acordo.observacoes !== undefined) updateData.observacoes = acordo.observacoes
            if (acordo.status !== undefined) updateData.status = acordo.status
            if (acordo.valorEconomizado !== undefined) updateData.valor_economizado = acordo.valorEconomizado
            
            const { error } = await supabase
              .from('acordos')
              .update(updateData)
              .eq('id', id)
              .eq('usuario_id', userId)
            
            if (error) {
              console.error('Erro ao atualizar acordo no Supabase:', error)
            }
          }
        } catch (error) {
          console.error('Erro ao atualizar acordo no Supabase:', error)
        }
        
        set((state) => ({
          acordos: state.acordos.map(a => a.id === id ? { ...a, ...acordo } : a)
        }))
      },

      deleteAcordo: async (id) => {
        const estado = get()
        const acordo = estado.acordos.find(a => a.id === id)
        
        // Deletar no Supabase
        try {
          const { data: session } = await supabase.auth.getSession()
          const userId = session?.session?.user?.id
          
          if (userId) {
            // Deletar parcelas primeiro (devido à foreign key)
            const { error: parcelasError } = await supabase
              .from('parcelas_acordo')
              .delete()
              .eq('acordo_id', id)
            
            if (parcelasError) {
              console.error('Erro ao deletar parcelas no Supabase:', parcelasError)
            }
            
            // Deletar acordo
            const { error: acordoError } = await supabase
              .from('acordos')
              .delete()
              .eq('id', id)
              .eq('usuario_id', userId)
            
            if (acordoError) {
              console.error('Erro ao deletar acordo no Supabase:', acordoError)
            }
          }
        } catch (error) {
          console.error('Erro ao deletar acordo no Supabase:', error)
        }
        
        set((state) => {
          return {
            acordos: state.acordos.filter(a => a.id !== id),
            dividas: acordo 
              ? state.dividas.map(d => 
                  d.id === acordo.dividaId 
                    ? { ...d, status: 'ativa', valorAtual: acordo.valorOriginal }
                    : d
                )
              : state.dividas
          }
        })
      },

      marcarParcelaComoPaga: async (acordoId, parcelaId) => {
        const estado = get()
        const acordo = estado.acordos.find(a => a.id === acordoId)
        if (!acordo) return
        
        const parcela = acordo.parcelas.find(p => p.id === parcelaId)
        if (!parcela) return
        
        const novaParcela = {
          ...parcela,
          paga: !parcela.paga,
          dataPagamento: !parcela.paga ? new Date().toISOString().split('T')[0] : undefined
        }
        
        // Atualizar no Supabase
        try {
          const { data: session } = await supabase.auth.getSession()
          const userId = session?.session?.user?.id
          
          if (userId) {
            const { error } = await supabase
              .from('parcelas_acordo')
              .update({
                paga: novaParcela.paga,
                data_pagamento: novaParcela.dataPagamento,
              })
              .eq('id', parcelaId)
              .eq('acordo_id', acordoId)
            
            if (error) {
              console.error('Erro ao atualizar parcela no Supabase:', error)
            }
          }
        } catch (error) {
          console.error('Erro ao atualizar parcela no Supabase:', error)
        }
        
        set((state) => {
          const novasDividas = [...state.dividas]
          const novosAcordos = state.acordos.map(a => {
            if (a.id === acordoId) {
              const parcelas = a.parcelas.map(p => {
                if (p.id === parcelaId) {
                  return novaParcela
                }
                return p
              })

              // Verificar se todas as parcelas foram pagas
              const todasPagas = parcelas.every(p => p.paga)
              const status = todasPagas ? 'concluido' : a.status

              // Atualizar status da dívida se acordo concluído
              if (todasPagas) {
                const dividaIndex = novasDividas.findIndex(d => d.id === a.dividaId)
                if (dividaIndex !== -1) {
                  novasDividas[dividaIndex] = {
                    ...novasDividas[dividaIndex],
                    status: 'quitada',
                    dataQuitacao: new Date().toISOString()
                  }
                  
                  // Atualizar no Supabase
                  supabase.auth.getSession().then(({ data: session }) => {
                    const userId = session?.session?.user?.id
                    if (userId) {
                      supabase
                        .from('dividas')
                        .update({
                          status: 'quitada',
                          data_quitacao: new Date().toISOString().split('T')[0],
                        })
                        .eq('id', a.dividaId)
                        .eq('usuario_id', userId)
                      
                      supabase
                        .from('acordos')
                        .update({
                          status: 'concluido',
                          data_fim: new Date().toISOString().split('T')[0],
                        })
                        .eq('id', acordoId)
                        .eq('usuario_id', userId)
                    }
                  })
                }
              }

              return {
                ...a,
                parcelas,
                status
              }
            }
            return a
          })
          
          return {
            dividas: novasDividas,
            acordos: novosAcordos
          }
        })
      },

      getTotalDividas: () => {
        return get().dividas
          .filter(d => d.status === 'ativa')
          .reduce((acc, d) => acc + d.valorAtual, 0)
      },

      getTotalAcordos: () => {
        return get().acordos
          .filter(a => a.status === 'ativo')
          .reduce((acc, a) => {
            const parcelasPendentes = a.parcelas.filter(p => !p.paga)
            return acc + parcelasPendentes.reduce((sum, p) => sum + p.valor, 0)
          }, 0)
      },

      getValorTotalEconomizado: () => {
        return get().acordos.reduce((acc, a) => {
          const economia = (a.valorOriginal || 0) - a.valorTotal
          return acc + (economia > 0 ? economia : 0)
        }, 0)
      },

      getProximoVencimento: () => {
        const hoje = new Date()
        const todasParcelas: (ParcelaAcordo & { acordoId: string })[] = []
        
        get().acordos
          .filter(a => a.status === 'ativo')
          .forEach(a => {
            a.parcelas
              .filter(p => !p.paga)
              .forEach(p => {
                todasParcelas.push({ ...p, acordoId: a.id })
              })
          })

        if (todasParcelas.length === 0) return null

        const proxima = todasParcelas
          .filter(p => new Date(p.dataVencimento) >= hoje)
          .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime())[0]

        return proxima || null
      },
    }),
    {
      name: 'acordos-financeiros-storage',
    }
  )
)

// Função para carregar dados do Supabase ao inicializar
export const loadAcordosFromSupabase = async () => {
  try {
    const { data: session } = await supabase.auth.getSession()
    const userId = session?.session?.user?.id
    
    if (!userId) return
    
    // Carregar dívidas
    const { data: dividasData, error: dividasError } = await supabase
      .from('dividas')
      .select('*')
      .eq('usuario_id', userId)
      .order('data_criacao', { ascending: false })
    
    if (dividasError) {
      console.error('Erro ao carregar dívidas do Supabase:', dividasError)
    }
    
    // Carregar acordos
    const { data: acordosData, error: acordosError } = await supabase
      .from('acordos')
      .select('*')
      .eq('usuario_id', userId)
      .order('data_criacao', { ascending: false })
    
    if (acordosError) {
      console.error('Erro ao carregar acordos do Supabase:', acordosError)
    }
    
    // Carregar parcelas
    let parcelasData: any[] = []
    if (acordosData && acordosData.length > 0) {
      const acordoIds = acordosData.map(a => a.id)
      const { data: parcelas, error: parcelasError } = await supabase
        .from('parcelas_acordo')
        .select('*')
        .in('acordo_id', acordoIds)
        .order('numero', { ascending: true })
      
      if (parcelasError) {
        console.error('Erro ao carregar parcelas do Supabase:', parcelasError)
      } else {
        parcelasData = parcelas || []
      }
    }
    
    // Converter dados do Supabase para o formato do store
    const dividas: Divida[] = (dividasData || []).map(d => ({
      id: d.id,
      descricao: d.descricao,
      credor: d.credor,
      valorOriginal: parseFloat(d.valor_original),
      valorAtual: parseFloat(d.valor_atual),
      dataVencimento: d.data_vencimento,
      taxaJurosOriginal: d.taxa_juros_original ? parseFloat(d.taxa_juros_original) : undefined,
      tipoDivida: d.tipo_divida,
      observacoes: d.observacoes,
      status: d.status,
      dataCriacao: d.data_criacao || d.created_at,
      dataQuitacao: d.data_quitacao,
    }))
    
    const acordos: Acordo[] = (acordosData || []).map(a => {
      const parcelasDoAcordo = parcelasData
        .filter(p => p.acordo_id === a.id)
        .map(p => ({
          id: p.id,
          acordoId: p.acordo_id,
          numero: p.numero,
          valor: parseFloat(p.valor),
          dataVencimento: p.data_vencimento,
          paga: p.paga,
          dataPagamento: p.data_pagamento,
          juros: p.juros ? parseFloat(p.juros) : undefined,
          multa: p.multa ? parseFloat(p.multa) : undefined,
        }))
      
      return {
        id: a.id,
        dividaId: a.divida_id,
        descricao: a.descricao,
        valorTotal: parseFloat(a.valor_total),
        valorOriginal: parseFloat(a.valor_original),
        numeroParcelas: a.numero_parcelas,
        taxaJuros: a.taxa_juros ? parseFloat(a.taxa_juros) : undefined,
        taxaDesconto: a.taxa_desconto ? parseFloat(a.taxa_desconto) : undefined,
        dataInicio: a.data_inicio,
        dataFim: a.data_fim,
        observacoes: a.observacoes,
        status: a.status,
        parcelas: parcelasDoAcordo,
        valorEconomizado: a.valor_economizado ? parseFloat(a.valor_economizado) : undefined,
        dataCriacao: a.data_criacao || a.created_at,
      }
    })
    
    // Atualizar o store
    useAcordosStore.setState({
      dividas,
      acordos,
    })
    
    return { dividas, acordos }
  } catch (error) {
    console.error('Erro ao carregar dados do Supabase:', error)
    return { dividas: [], acordos: [] }
  }
}

