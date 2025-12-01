import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface Lead {
  id: string
  nome: string
  email?: string
  telefone?: string
  estado: string
  cidade: string
  bairro: string
  observacoes?: string
  status: 'Novo' | 'Contatado' | 'Qualificado' | 'Convertido' | 'Perdido'
  dataCriacao: string
  origem?: string
  contactado?: boolean
  dataContato?: string
  temSite?: boolean
  leadQuente?: boolean
}

interface LeadsStore {
  leads: Lead[]
  addLead: (lead: Lead) => void
  updateLead: (id: string, lead: Partial<Lead>) => void
  deleteLead: (id: string) => void
  getLeadsByEstado: (estado: string) => Lead[]
  getLeadsByCidade: (cidade: string) => Lead[]
  getLeadsByStatus: (status: Lead['status']) => Lead[]
}

export const useLeadsStore = create<LeadsStore>()(
  persist(
    (set, get) => ({
      leads: [],
      addLead: (lead) =>
        set((state) => ({ leads: [...state.leads, lead] })),
      updateLead: (id, updates) =>
        set((state) => ({
          leads: state.leads.map((l) =>
            l.id === id ? { ...l, ...updates } : l
          ),
        })),
      deleteLead: (id) =>
        set((state) => ({
          leads: state.leads.filter((l) => l.id !== id),
        })),
      getLeadsByEstado: (estado) =>
        get().leads.filter((l) => l.estado === estado),
      getLeadsByCidade: (cidade) =>
        get().leads.filter((l) => l.cidade === cidade),
      getLeadsByStatus: (status) =>
        get().leads.filter((l) => l.status === status),
    }),
    {
      name: 'leads-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

