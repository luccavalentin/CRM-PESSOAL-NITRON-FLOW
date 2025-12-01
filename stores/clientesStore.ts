import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface Cliente {
  id: string
  nome: string
  email?: string
  telefone?: string
  empresa?: string
  endereco?: string
  cidade?: string
  estado?: string
  status: 'Ativo' | 'Inativo' | 'Prospecto'
  valorTotal: number
  ultimaInteracao?: string
  observacoes?: string
  leadId?: string // ID do lead original se foi convertido
  dataCadastro: string
}

interface ClientesStore {
  clientes: Cliente[]
  addCliente: (cliente: Cliente) => void
  updateCliente: (id: string, cliente: Partial<Cliente>) => void
  deleteCliente: (id: string) => void
  getClienteByLeadId: (leadId: string) => Cliente | undefined
}

export const useClientesStore = create<ClientesStore>()(
  persist(
    (set, get) => ({
      clientes: [],
      addCliente: (cliente) =>
        set((state) => ({ clientes: [...state.clientes, cliente] })),
      updateCliente: (id, updates) =>
        set((state) => ({
          clientes: state.clientes.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      deleteCliente: (id) =>
        set((state) => ({
          clientes: state.clientes.filter((c) => c.id !== id),
        })),
      getClienteByLeadId: (leadId) =>
        get().clientes.find((c) => c.leadId === leadId),
    }),
    {
      name: 'clientes-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

