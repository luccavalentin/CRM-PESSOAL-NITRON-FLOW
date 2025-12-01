import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ItemCompra } from '@/types'

interface ListaComprasStore {
  itens: ItemCompra[]
  addItem: (item: ItemCompra) => void
  updateItem: (id: string, item: Partial<ItemCompra>) => void
  deleteItem: (id: string) => void
  toggleStatus: (id: string) => void
  getItensByCategoria: (categoria: ItemCompra['categoria']) => ItemCompra[]
  getItensPendentes: () => ItemCompra[]
  getValorTotal: () => number
}

export const useListaComprasStore = create<ListaComprasStore>()(
  persist(
    (set, get) => ({
      itens: [],
      addItem: (item) =>
        set((state) => ({ itens: [...state.itens, item] })),
      updateItem: (id, updates) =>
        set((state) => ({
          itens: state.itens.map((i) =>
            i.id === id ? { ...i, ...updates } : i
          ),
        })),
      deleteItem: (id) =>
        set((state) => ({
          itens: state.itens.filter((i) => i.id !== id),
        })),
      toggleStatus: (id) =>
        set((state) => ({
          itens: state.itens.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status: i.status === 'Pendente' ? 'Comprado' : 'Pendente',
                }
              : i
          ),
        })),
      getItensByCategoria: (categoria) =>
        get().itens.filter((i) => i.categoria === categoria),
      getItensPendentes: () =>
        get().itens.filter((i) => i.status === 'Pendente'),
      getValorTotal: () =>
        get()
          .itens.filter((i) => i.status === 'Pendente')
          .reduce((acc, i) => acc + i.valorEstimado * i.quantidade, 0),
    }),
    {
      name: 'lista-compras-storage',
    }
  )
)

