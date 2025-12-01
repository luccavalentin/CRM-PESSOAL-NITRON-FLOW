import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Projeto } from '@/types'

interface ProjetosStore {
  projetos: Projeto[]
  addProjeto: (projeto: Projeto) => void
  updateProjeto: (id: string, projeto: Partial<Projeto>) => void
  deleteProjeto: (id: string) => void
  getProjetosByStatus: (status: Projeto['status']) => Projeto[]
  getProjetoById: (id: string) => Projeto | undefined
}

export const useProjetosStore = create<ProjetosStore>()(
  persist(
    (set, get) => ({
      projetos: [],
      addProjeto: (projeto) =>
        set((state) => ({ projetos: [...state.projetos, projeto] })),
      updateProjeto: (id, updates) =>
        set((state) => ({
          projetos: state.projetos.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      deleteProjeto: (id) =>
        set((state) => ({
          projetos: state.projetos.filter((p) => p.id !== id),
        })),
      getProjetosByStatus: (status) =>
        get().projetos.filter((p) => p.status === status),
      getProjetoById: (id) => get().projetos.find((p) => p.id === id),
    }),
    {
      name: 'projetos-storage',
    }
  )
)

