import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Tarefa } from '@/types'

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
}

export const useTarefasStore = create<TarefasStore>()(
  persist(
    (set, get) => ({
      tarefas: [],
      addTarefa: (tarefa) =>
        set((state) => ({ tarefas: [...state.tarefas, tarefa] })),
      updateTarefa: (id, updates) =>
        set((state) => ({
          tarefas: state.tarefas.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),
      deleteTarefa: (id) =>
        set((state) => ({
          tarefas: state.tarefas.filter((t) => t.id !== id),
        })),
      toggleConcluida: (id) =>
        set((state) => ({
          tarefas: state.tarefas.map((t) =>
            t.id === id
              ? { ...t, concluida: !t.concluida, status: !t.concluida ? 'Concluída' : 'Pendente' }
              : t
          ),
        })),
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

