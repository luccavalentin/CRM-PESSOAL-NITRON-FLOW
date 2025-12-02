import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ItemCompra } from '@/types'
import { saveItemCompra, deleteItemCompra } from '@/utils/supabaseSync'

interface ListaComprasStore {
  itens: ItemCompra[]
  addItem: (item: ItemCompra) => void
  updateItem: (id: string, item: Partial<ItemCompra>) => void
  deleteItem: (id: string) => void
  toggleStatus: (id: string) => void
  getItensByCategoria: (categoria: ItemCompra['categoria']) => ItemCompra[]
  getItensPendentes: () => ItemCompra[]
  getValorTotal: () => number
  loadFromSupabase: () => Promise<void>
}

export const useListaComprasStore = create<ListaComprasStore>()(
  persist(
    (set, get) => ({
      itens: [],
      addItem: async (item) => {
        // Salvar no Supabase
        await saveItemCompra(item)
        set((state) => ({ itens: [...state.itens, item] }))
      },
      updateItem: async (id, updates) => {
        const estado = get()
        const itemAtualizado = estado.itens.find(i => i.id === id)
        if (itemAtualizado) {
          const item = { ...itemAtualizado, ...updates }
          // Salvar no Supabase
          await saveItemCompra(item)
        }
        set((state) => ({
          itens: state.itens.map((i) =>
            i.id === id ? { ...i, ...updates } : i
          ),
        }))
      },
      deleteItem: async (id) => {
        // Deletar no Supabase
        await deleteItemCompra(id)
        set((state) => ({
          itens: state.itens.filter((i) => i.id !== id),
        }))
      },
      toggleStatus: async (id) => {
        const estado = get()
        const item = estado.itens.find(i => i.id === id)
        if (item) {
          const itemAtualizado = {
            ...item,
            status: item.status === 'Pendente' ? 'Comprado' : 'Pendente',
          }
          // Salvar no Supabase
          await saveItemCompra(itemAtualizado)
        }
        set((state) => ({
          itens: state.itens.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status: i.status === 'Pendente' ? 'Comprado' : 'Pendente',
                }
              : i
          ),
        }))
      },
      getItensByCategoria: (categoria) =>
        get().itens.filter((i) => i.categoria === categoria),
      getItensPendentes: () =>
        get().itens.filter((i) => i.status === 'Pendente'),
      getValorTotal: () =>
        get()
          .itens.filter((i) => i.status === 'Pendente')
          .reduce((acc, i) => acc + i.valorEstimado * i.quantidade, 0),
      loadFromSupabase: async () => {
        const itens = await loadItensCompra()
        set({ itens })
      },
    }),
    {
      name: 'lista-compras-storage',
    }
  )
)






