import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Tarefa } from '@/types'
import { saveTarefa, deleteTarefa as deleteTarefaFromSupabase, loadTarefas } from '@/utils/supabaseSync'

interface TarefasStore {
  tarefas: Tarefa[]
  addTarefa: (tarefa: Tarefa) => void
  updateTarefa: (id: string, tarefa: Partial<Tarefa>) => void
  deleteTarefa: (id: string) => void
  toggleConcluida: (id: string) => void
  getTarefasByProjeto: (projetoId: string) => Tarefa[]
  getTarefasByCategoria: (categoria: Tarefa['categoria']) => Tarefa[]
  getTarefasByStatus: (status: Tarefa['status']) => Tarefa[]
  getTarefasDoDia: () => Tarefa[]
  loadFromSupabase: () => Promise<void>
}

export const useTarefasStore = create<TarefasStore>()(
  persist(
    (set, get) => ({
      tarefas: [],
      addTarefa: async (tarefa) => {
        // Salvar no Supabase
        await saveTarefa(tarefa)
        set((state) => ({ tarefas: [...state.tarefas, tarefa] }))
      },
      updateTarefa: async (id, updates) => {
        const estado = get()
        const tarefaAtualizada = estado.tarefas.find(t => t.id === id)
        if (tarefaAtualizada) {
          const tarefa = { ...tarefaAtualizada, ...updates }
          // Salvar no Supabase
          await saveTarefa(tarefa)
        }
        set((state) => ({
          tarefas: state.tarefas.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }))
      },
      deleteTarefa: async (id) => {
        // Deletar no Supabase
        await deleteTarefa(id)
        set((state) => ({
          tarefas: state.tarefas.filter((t) => t.id !== id),
        }))
      },
      toggleConcluida: async (id) => {
        const estado = get()
        const tarefa = estado.tarefas.find(t => t.id === id)
        if (tarefa) {
          const tarefaAtualizada = {
            ...tarefa,
            concluida: !tarefa.concluida,
            status: !tarefa.concluida ? 'Concluída' : 'Pendente'
          }
          // Salvar no Supabase
          await saveTarefa(tarefaAtualizada)
        }
        set((state) => ({
          tarefas: state.tarefas.map((t) =>
            t.id === id
              ? { ...t, concluida: !t.concluida, status: !t.concluida ? 'Concluída' : 'Pendente' }
              : t
          ),
        }))
      },
      getTarefasByProjeto: (projetoId) =>
        get().tarefas.filter((t) => t.projetoId === projetoId),
      getTarefasByCategoria: (categoria) =>
        get().tarefas.filter((t) => t.categoria === categoria),
      getTarefasByStatus: (status) =>
        get().tarefas.filter((t) => t.status === status),
      getTarefasDoDia: () => {
        const hoje = new Date().toISOString().split('T')[0]
        return get().tarefas.filter((t) => t.data === hoje)
      },
    }),
    {
      name: 'tarefas-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

