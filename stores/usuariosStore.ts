import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UsuarioApp } from '@/types'

interface UsuariosStore {
  usuarios: UsuarioApp[]
  addUsuario: (usuario: UsuarioApp) => void
  updateUsuario: (id: string, usuario: Partial<UsuarioApp>) => void
  deleteUsuario: (id: string) => void
  getUsuariosAtivos: () => UsuarioApp[]
  getUsuariosInativos: () => UsuarioApp[]
  getUsuariosByPlano: (plano: string) => UsuarioApp[]
  getIndicadoresRetencao: () => {
    total: number
    ativos: number
    inativos: number
    taxaRetencao: number
  }
}

export const useUsuariosStore = create<UsuariosStore>()(
  persist(
    (set, get) => ({
      usuarios: [],
      addUsuario: (usuario) =>
        set((state) => ({ usuarios: [...state.usuarios, usuario] })),
      updateUsuario: (id, updates) =>
        set((state) => ({
          usuarios: state.usuarios.map((u) =>
            u.id === id ? { ...u, ...updates } : u
          ),
        })),
      deleteUsuario: (id) =>
        set((state) => ({
          usuarios: state.usuarios.filter((u) => u.id !== id),
        })),
      getUsuariosAtivos: () =>
        get().usuarios.filter((u) => u.status === 'Ativo'),
      getUsuariosInativos: () =>
        get().usuarios.filter((u) => u.status === 'Inativo'),
      getUsuariosByPlano: (plano) =>
        get().usuarios.filter((u) => u.plano === plano),
      getIndicadoresRetencao: () => {
        const usuarios = get().usuarios
        const ativos = usuarios.filter((u) => u.status === 'Ativo').length
        const inativos = usuarios.filter((u) => u.status === 'Inativo').length
        const taxaRetencao =
          usuarios.length > 0 ? (ativos / usuarios.length) * 100 : 0

        return {
          total: usuarios.length,
          ativos,
          inativos,
          taxaRetencao,
        }
      },
    }),
    {
      name: 'usuarios-storage',
    }
  )
)


