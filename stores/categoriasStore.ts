import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { saveCategoria } from '@/utils/supabaseSync'

interface CategoriaFinanceira {
  id: string
  nome: string
  tipo: 'entrada' | 'saida' | 'ambos'
  usuarioId?: string
  cor?: string
  descricao?: string
  created_at?: string
}

interface CategoriasStore {
  categorias: CategoriaFinanceira[]
  addCategoria: (nome: string, tipo: 'entrada' | 'saida' | 'ambos') => void
  getCategoriasByTipo: (tipo: 'entrada' | 'saida') => string[]
  getAllCategorias: () => string[]
  deleteCategoria: (id: string) => void
}

export const useCategoriasStore = create<CategoriasStore>()(
  persist(
    (set, get) => ({
      categorias: [
        // Categorias padrão para entradas
        { id: 'entrada-salario', nome: 'Salário', tipo: 'entrada' },
        { id: 'entrada-freelance', nome: 'Freelance', tipo: 'entrada' },
        { id: 'entrada-vendas', nome: 'Vendas', tipo: 'entrada' },
        { id: 'entrada-investimentos', nome: 'Investimentos', tipo: 'entrada' },
        { id: 'entrada-outros', nome: 'Outros', tipo: 'entrada' },
        // Categorias padrão para saídas
        { id: 'saida-alimentacao', nome: 'Alimentação', tipo: 'saida' },
        { id: 'saida-transporte', nome: 'Transporte', tipo: 'saida' },
        { id: 'saida-moradia', nome: 'Moradia', tipo: 'saida' },
        { id: 'saida-saude', nome: 'Saúde', tipo: 'saida' },
        { id: 'saida-educacao', nome: 'Educação', tipo: 'saida' },
        { id: 'saida-lazer', nome: 'Lazer', tipo: 'saida' },
        { id: 'saida-contas', nome: 'Contas a Pagar', tipo: 'saida' },
        { id: 'saida-outros', nome: 'Outros', tipo: 'saida' },
      ],
      
      addCategoria: async (nome: string, tipo: 'entrada' | 'saida' | 'ambos') => {
        const trimmed = nome.trim()
        if (!trimmed) return

        const categorias = get().categorias
        // Verificar se já existe
        const existe = categorias.some(
          c => c.nome.toLowerCase() === trimmed.toLowerCase() && 
          (c.tipo === tipo || c.tipo === 'ambos' || tipo === 'ambos')
        )

        if (!existe) {
          const novaCategoria: CategoriaFinanceira = {
            id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            nome: trimmed,
            tipo: tipo,
            created_at: new Date().toISOString(),
          }
          
          // Salvar no Supabase
          await saveCategoria(novaCategoria)
          
          set((state) => ({
            categorias: [...state.categorias, novaCategoria]
          }))
        }
      },
      
      getCategoriasByTipo: (tipo: 'entrada' | 'saida') => {
        const categorias = get().categorias
        return categorias
          .filter(c => c.tipo === tipo || c.tipo === 'ambos')
          .map(c => c.nome)
          .sort()
      },
      
      getAllCategorias: () => {
        const categorias = get().categorias
        return Array.from(new Set(categorias.map(c => c.nome))).sort()
      },
      
      deleteCategoria: (id: string) => {
        set((state) => ({
          categorias: state.categorias.filter(c => c.id !== id)
        }))
      },
    }),
    {
      name: 'categorias-financeiras-storage',
    }
  )
)



