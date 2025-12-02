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
  loadFromSupabase: () => Promise<void>
}

export const useClientesStore = create<ClientesStore>()(
  persist(
    (set, get) => ({
      clientes: [],
      addCliente: async (cliente) => {
        // Salvar no Supabase
        await saveCliente(cliente)
        set((state) => ({ clientes: [...state.clientes, cliente] }))
      },
      updateCliente: async (id, updates) => {
        const estado = get()
        const clienteAtualizado = estado.clientes.find(c => c.id === id)
        if (clienteAtualizado) {
          const cliente = { ...clienteAtualizado, ...updates }
          // Salvar no Supabase
          await saveCliente(cliente)
        }
        set((state) => ({
          clientes: state.clientes.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }))
      },
      deleteCliente: async (id) => {
        // Deletar no Supabase
        await deleteCliente(id)
        set((state) => ({
          clientes: state.clientes.filter((c) => c.id !== id),
        }))
      },
      getClienteByLeadId: (leadId) =>
        get().clientes.find((c) => c.leadId === leadId),
      loadFromSupabase: async () => {
        const clientes = await loadClientes()
        set({ clientes })
      },
    }),
    {
      name: 'clientes-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)






