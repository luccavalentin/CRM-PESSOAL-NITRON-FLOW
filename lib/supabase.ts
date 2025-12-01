import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Tipos para TypeScript (gerados automaticamente pelo Supabase CLI)
export type Database = {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string
          nome: string
          email: string
          status: string
          plano: string | null
          aplicativo_vinculado: string | null
          data_registro: string
          ultimo_acesso: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          email: string
          status?: string
          plano?: string | null
          aplicativo_vinculado?: string | null
          data_registro?: string
          ultimo_acesso?: string | null
        }
        Update: {
          id?: string
          nome?: string
          email?: string
          status?: string
          plano?: string | null
          aplicativo_vinculado?: string | null
          data_registro?: string
          ultimo_acesso?: string | null
        }
      }
    }
  }
}


