import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User {
  id: string
  nome: string
  email: string
  senha: string
}

interface AuthState {
  isAuthenticated: boolean
  user: {
    email: string
    name?: string
  } | null
  rememberMe: boolean
  users: User[]
  login: (email: string, password: string, rememberMe: boolean) => boolean
  register: (nome: string, email: string, password: string) => boolean
  logout: () => void
  checkAuth: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      rememberMe: false,
      users: [],
      
      register: (nome: string, email: string, password: string) => {
        const { users } = get()
        
        // Verifica se o email já existe
        const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase())
        if (emailExists) {
          return false
        }

        // Cria novo usuário
        const newUser: User = {
          id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          nome,
          email: email.toLowerCase(),
          senha: password, // Em produção, isso deve ser um hash
        }

        // Adiciona o usuário à lista
        set({
          users: [...users, newUser],
          isAuthenticated: true,
          user: { email: newUser.email, name: newUser.nome },
          rememberMe: true,
        })

        return true
      },
      
      login: (email: string, password: string, rememberMe: boolean) => {
        const { users } = get()
        
        // Busca o usuário pelo email
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
        
        // SEGURANÇA: Não permite login sem cadastro - usuário deve estar cadastrado
        if (!user) {
          return false
        }

        // Verifica a senha (em produção, comparar hash)
        if (user.senha === password) {
          set({
            isAuthenticated: true,
            user: { email: user.email, name: user.nome },
            rememberMe,
          })
          return true
        }

        return false
      },
      
      logout: () => {
        const { rememberMe } = get()
        // Se não tiver rememberMe ativo, limpa tudo
        if (!rememberMe) {
          set({
            isAuthenticated: false,
            user: null,
            rememberMe: false,
          })
        } else {
          // Se tiver rememberMe, apenas desautentica mas mantém os dados
          set({
            isAuthenticated: false,
            user: null,
            rememberMe: true,
          })
        }
      },
      
      checkAuth: () => {
        const { isAuthenticated, rememberMe } = get()
        // Se não estiver autenticado mas tiver rememberMe, ainda precisa fazer login
        // mas podemos pré-preencher o email
        return isAuthenticated
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        // Sempre salva a lista de usuários
        const partialState: any = {
          users: state.users,
        }
        
        // Se rememberMe estiver ativo, salva tudo
        if (state.rememberMe) {
          partialState.isAuthenticated = state.isAuthenticated
          partialState.user = state.user
          partialState.rememberMe = state.rememberMe
        } else {
          // Caso contrário, só salva a preferência de lembrar
          partialState.isAuthenticated = false
          partialState.user = null
          partialState.rememberMe = false
        }
        
        return partialState
      },
    }
  )
)

