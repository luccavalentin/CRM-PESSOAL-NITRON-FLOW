import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AuthState {
  isAuthenticated: boolean
  user: {
    email: string
    name?: string
  } | null
  rememberMe: boolean
  login: (email: string, password: string, rememberMe: boolean) => boolean
  logout: () => void
  checkAuth: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      rememberMe: false,
      
      login: (email: string, password: string, rememberMe: boolean) => {
        // Validação simples - em produção, isso seria uma chamada à API
        if (email && password.length >= 6) {
          set({
            isAuthenticated: true,
            user: { email, name: email.split('@')[0] },
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
        // Se rememberMe estiver ativo, salva tudo
        if (state.rememberMe) {
          return {
            isAuthenticated: state.isAuthenticated,
            user: state.user,
            rememberMe: state.rememberMe,
          }
        }
        // Caso contrário, só salva a preferência de lembrar
        return {
          isAuthenticated: false,
          user: null,
          rememberMe: false,
        }
      },
    }
  )
)

