import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ProjetoPessoal } from '@/types'
import { saveProjetoPessoal, deleteProjetoPessoal as deleteProjetoPessoalFromSupabase, loadProjetosPessoais } from '@/utils/supabaseSync'

interface ProjetosPessoaisStore {
  projetos: ProjetoPessoal[]
  addProjeto: (projeto: ProjetoPessoal) => void
  updateProjeto: (id: string, projeto: Partial<ProjetoPessoal>) => void
  deleteProjeto: (id: string) => void
  getProjetosByStatus: (status: ProjetoPessoal['status']) => ProjetoPessoal[]
  loadFromSupabase: () => Promise<void>
}

export const useProjetosPessoaisStore = create<ProjetosPessoaisStore>()(
  persist(
    (set, get) => ({
      projetos: [],
      addProjeto: async (projeto) => {
        // Salvar no Supabase
        await saveProjetoPessoal(projeto)
        set((state) => ({ projetos: [...state.projetos, projeto] }))
      },
      updateProjeto: async (id, updates) => {
        const estado = get()
        const projetoAtualizado = estado.projetos.find(p => p.id === id)
        if (projetoAtualizado) {
          const projeto = { ...projetoAtualizado, ...updates }
          // Salvar no Supabase
          await saveProjetoPessoal(projeto)
        }
        set((state) => ({
          projetos: state.projetos.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }))
      },
      deleteProjeto: async (id) => {
        // Deletar no Supabase
        await deleteProjetoPessoalFromSupabase(id)
        set((state) => ({
          projetos: state.projetos.filter((p) => p.id !== id),
        }))
      },
      loadFromSupabase: async () => {
        const projetos = await loadProjetosPessoais()
        set({ projetos })
      },
      getProjetosByStatus: (status) =>
        get().projetos.filter((p) => p.status === status),
    }),
    {
      name: 'projetos-pessoais-storage',
    }
  )
)






