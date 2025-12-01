import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Ideia } from '@/types'

interface IdeiasStore {
  ideias: Ideia[]
  addIdeia: (ideia: Ideia) => void
  updateIdeia: (id: string, ideia: Partial<Ideia>) => void
  deleteIdeia: (id: string) => void
  getIdeiasByStatus: (status: Ideia['status']) => Ideia[]
  getIdeiasByCategoria: (categoria: Ideia['categoria']) => Ideia[]
  getIdeiasRecentes: (limit?: number) => Ideia[]
}

export const useIdeiasStore = create<IdeiasStore>()(
  persist(
    (set, get) => ({
      ideias: [],
      addIdeia: (ideia) =>
        set((state) => ({ ideias: [...state.ideias, ideia] })),
      updateIdeia: (id, updates) =>
        set((state) => ({
          ideias: state.ideias.map((i) =>
            i.id === id ? { ...i, ...updates } : i
          ),
        })),
      deleteIdeia: (id) =>
        set((state) => ({
          ideias: state.ideias.filter((i) => i.id !== id),
        })),
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


