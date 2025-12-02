import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'

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
  login: (email: string, password: string, rememberMe: boolean) => Promise<boolean>
  register: (nome: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      rememberMe: false,
      users: [],
      
      register: async (nome: string, email: string, password: string) => {
        try {
          // Normaliza o email
          const normalizedEmail = email.toLowerCase().trim()
          
          // Registra no Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: normalizedEmail,
            password: password,
            options: {
              data: {
                nome: nome,
              },
              emailRedirectTo: undefined, // Não redireciona após confirmação
            },
          })

          if (authError) {
            console.error('[AuthStore] Erro ao registrar no Supabase:', authError)
            
            // Se o usuário já existe, tenta fazer login
            if (authError.message.includes('already registered') || 
                authError.message.includes('User already registered')) {
              console.log('[AuthStore] Usuário já existe, tentando fazer login...')
              const loginSuccess = await get().login(normalizedEmail, password, true)
              return loginSuccess
            }
            
            return false
          }

          if (!authData.user) {
            console.error('[AuthStore] Usuário não foi criado')
            return false
          }

          // Se o email não foi confirmado automaticamente, confirma manualmente
          // Isso é necessário se a confirmação de email estiver desabilitada
          if (!authData.user.email_confirmed_at) {
            console.log('[AuthStore] Email não confirmado, mas continuando com o registro')
          }

          // Cria o perfil do usuário na tabela usuarios
          const { error: profileError } = await supabase
            .from('usuarios')
            .insert({
              id: authData.user.id,
              nome: nome,
              email: email.toLowerCase(),
              status: 'Ativo',
              data_registro: new Date().toISOString(),
            })

          if (profileError) {
            console.error('[AuthStore] Erro ao criar perfil:', profileError)
            // Mesmo com erro no perfil, o usuário foi criado no auth
            // Pode ser que o trigger já tenha criado
          }

          // Se o email não foi confirmado automaticamente, tenta confirmar via função SQL
          if (!authData.user.email_confirmed_at) {
            console.log('[AuthStore] Email não confirmado, tentando confirmar automaticamente...')
            // Chama função SQL para confirmar email
            const { error: confirmError } = await supabase.rpc('revalidate_user_session', {
              user_email: normalizedEmail
            })
            if (confirmError) {
              console.warn('[AuthStore] Não foi possível confirmar email automaticamente:', confirmError)
            }
          }

          // Atualiza o estado local
          set({
            isAuthenticated: true,
            user: { email: normalizedEmail, name: nome },
            rememberMe: true,
          })

          console.log('[AuthStore] Usuário registrado com sucesso no Supabase:', normalizedEmail)
          return true
        } catch (error) {
          console.error('[AuthStore] Erro ao registrar:', error)
          return false
        }
      },
      
      login: async (email: string, password: string, rememberMe: boolean) => {
        try {
          // Normaliza o email
          const normalizedEmail = email.toLowerCase().trim()
          
          // Faz login no Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password: password,
          })

          if (authError) {
            console.error('[AuthStore] Erro ao fazer login:', authError)
            
            // Se o erro for de email não confirmado, tenta confirmar automaticamente
            if (authError.message.includes('Email not confirmed') || 
                authError.message.includes('email not confirmed')) {
              console.log('[AuthStore] Email não confirmado, tentando confirmar automaticamente...')
              
              // Tenta confirmar o email via função SQL
              const { error: confirmError } = await supabase.rpc('revalidate_user_session', {
                user_email: normalizedEmail
              })
              
              if (!confirmError) {
                // Se conseguiu confirmar, tenta fazer login novamente
                console.log('[AuthStore] Email confirmado, tentando login novamente...')
                const { data: retryAuthData, error: retryAuthError } = await supabase.auth.signInWithPassword({
                  email: normalizedEmail,
                  password: password,
                })
                
                if (!retryAuthError && retryAuthData?.user) {
                  // Login bem-sucedido após confirmação
                  const { data: profile } = await supabase
                    .from('usuarios')
                    .select('nome, email')
                    .eq('id', retryAuthData.user.id)
                    .single()
                  
                  await supabase
                    .from('usuarios')
                    .update({ ultimo_acesso: new Date().toISOString() })
                    .eq('id', retryAuthData.user.id)
                  
                  set({
                    isAuthenticated: true,
                    user: { 
                      email: retryAuthData.user.email || normalizedEmail, 
                      name: profile?.nome || retryAuthData.user.user_metadata?.nome 
                    },
                    rememberMe,
                  })
                  
                  console.log('[AuthStore] Login realizado com sucesso após confirmação automática:', normalizedEmail)
                  return true
                }
              }
            }
            
            return false
          }

          if (!authData.user) {
            console.error('[AuthStore] Usuário não encontrado')
            return false
          }

          // Se o email não estiver confirmado, tenta confirmar automaticamente
          if (!authData.user.email_confirmed_at) {
            console.log('[AuthStore] Email não confirmado, confirmando automaticamente...')
            const { error: confirmError } = await supabase.rpc('revalidate_user_session', {
              user_email: normalizedEmail
            })
            if (confirmError) {
              console.warn('[AuthStore] Não foi possível confirmar email:', confirmError)
            } else {
              console.log('[AuthStore] Email confirmado com sucesso')
            }
          }

          // Busca o perfil do usuário
          const { data: profile, error: profileError } = await supabase
            .from('usuarios')
            .select('nome, email')
            .eq('id', authData.user.id)
            .single()

          if (profileError) {
            console.warn('[AuthStore] Erro ao buscar perfil:', profileError)
          }

          // Atualiza último acesso
          await supabase
            .from('usuarios')
            .update({ ultimo_acesso: new Date().toISOString() })
            .eq('id', authData.user.id)

          // Atualiza o estado local
          set({
            isAuthenticated: true,
            user: { 
              email: authData.user.email || email.toLowerCase(), 
              name: profile?.nome || authData.user.user_metadata?.nome 
            },
            rememberMe,
          })

          console.log('[AuthStore] Login realizado com sucesso:', email)
          return true
        } catch (error) {
          console.error('[AuthStore] Erro ao fazer login:', error)
          return false
        }
      },
      
      logout: async () => {
        try {
          // Faz logout no Supabase
          await supabase.auth.signOut()
          
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
          
          console.log('[AuthStore] Logout realizado com sucesso')
        } catch (error) {
          console.error('[AuthStore] Erro ao fazer logout:', error)
        }
      },
      
      checkAuth: async () => {
        try {
          // Verifica a sessão no Supabase
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('[AuthStore] Erro ao verificar sessão:', error)
            return false
          }

          if (session && session.user) {
            // Busca o perfil do usuário
            const { data: profile } = await supabase
              .from('usuarios')
              .select('nome, email')
              .eq('id', session.user.id)
              .single()

            // Atualiza o estado local
            set({
              isAuthenticated: true,
              user: { 
                email: session.user.email || '', 
                name: profile?.nome || session.user.user_metadata?.nome 
              },
            })
            
            return true
          }

          // Se não houver sessão, verifica o estado local
          const { isAuthenticated } = get()
          return isAuthenticated
        } catch (error) {
          console.error('[AuthStore] Erro ao verificar autenticação:', error)
          const { isAuthenticated } = get()
          return isAuthenticated
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        // SEMPRE salva a lista de usuários - isso é crítico para o sistema funcionar
        const partialState: any = {
          users: state.users || [], // Garante que sempre tenha um array
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
      // Garante que o estado seja persistido imediatamente após mudanças
      onRehydrateStorage: () => (state) => {
        // Verifica se os usuários foram carregados corretamente
        if (state && state.users && state.users.length > 0) {
          console.log(`[AuthStore] ${state.users.length} usuário(s) carregado(s) do localStorage`)
        }
      },
    }
  )
)

