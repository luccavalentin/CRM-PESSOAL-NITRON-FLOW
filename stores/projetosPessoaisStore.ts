import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ProjetoPessoal } from '@/types'

interface ProjetosPessoaisStore {
  projetos: ProjetoPessoal[]
  addProjeto: (projeto: ProjetoPessoal) => void
  updateProjeto: (id: string, projeto: Partial<ProjetoPessoal>) => void
  deleteProjeto: (id: string) => void
  getProjetosByStatus: (status: ProjetoPessoal['status']) => ProjetoPessoal[]
}

export const useProjetosPessoaisStore = create<ProjetosPessoaisStore>()(
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
    }),
    {
      name: 'projetos-pessoais-storage',
    }
  )
)



