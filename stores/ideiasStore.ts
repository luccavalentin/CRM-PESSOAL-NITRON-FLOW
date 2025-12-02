import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Ideia } from '@/types'
import { saveIdeia, deleteIdeia as deleteIdeiaFromSupabase, loadIdeias } from '@/utils/supabaseSync'

interface IdeiasStore {
  ideias: Ideia[]
  addIdeia: (ideia: Ideia) => void
  updateIdeia: (id: string, ideia: Partial<Ideia>) => void
  deleteIdeia: (id: string) => void
  getIdeiasByStatus: (status: Ideia['status']) => Ideia[]
  getIdeiasByCategoria: (categoria: Ideia['categoria']) => Ideia[]
  getIdeiasRecentes: (limit?: number) => Ideia[]
  loadFromSupabase: () => Promise<void>
}

export const useIdeiasStore = create<IdeiasStore>()(
  persist(
    (set, get) => ({
      ideias: [],
      addIdeia: async (ideia) => {
        // Salvar no Supabase
        await saveIdeia(ideia)
        set((state) => ({ ideias: [...state.ideias, ideia] }))
      },
      updateIdeia: async (id, updates) => {
        const estado = get()
        const ideiaAtualizada = estado.ideias.find(i => i.id === id)
        if (ideiaAtualizada) {
          const ideia = { ...ideiaAtualizada, ...updates }
          // Salvar no Supabase
          await saveIdeia(ideia)
        }
        set((state) => ({
          ideias: state.ideias.map((i) =>
            i.id === id ? { ...i, ...updates } : i
          ),
        }))
      },
      deleteIdeia: async (id) => {
        // Deletar no Supabase
        await deleteIdeiaFromSupabase(id)
        set((state) => ({
          ideias: state.ideias.filter((i) => i.id !== id),
        }))
      },
      loadFromSupabase: async () => {
        const ideias = await loadIdeias()
        set({ ideias })
      },
      getIdeiasByStatus: (status) =>
        get().ideias.filter((i) => i.status === status),
      getIdeiasByCategoria: (categoria) =>
        get().ideias.filter((i) => i.categoria === categoria),
      getIdeiasRecentes: (limit = 5) =>
        get()
          .ideias.sort(
            (a, b) =>
              new Date(b.dataCriacao).getTime() -
              new Date(a.dataCriacao).getTime()
          )
          .slice(0, limit),
    }),
    {
      name: 'ideias-storage',
    }
  )
)






