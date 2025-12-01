import { createClient } from '@supabase/supabase-js'

// Variáveis de ambiente - NUNCA commitar credenciais no código
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  )
}

// Cliente Supabase para uso no cliente (browser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Tipos TypeScript para o banco de dados
export type Database = {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string
          nome: string
          email: string
          senha_hash: string
          remember_me: boolean
          is_authenticated: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          nome: string
          email: string
          senha_hash: string
          remember_me?: boolean
          is_authenticated?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string
          senha_hash?: string
          remember_me?: boolean
          is_authenticated?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          nome: string
          email: string | null
          telefone: string | null
          estado: string
          cidade: string
          bairro: string
          nicho: string | null
          observacoes: string | null
          status: 'Novo' | 'Contatado' | 'Qualificado' | 'Convertido' | 'Perdido'
          data_criacao: string
          origem: string | null
          contactado: boolean
          data_contato: string | null
          tem_site: boolean | null
          lead_quente: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          nome: string
          email?: string | null
          telefone?: string | null
          estado: string
          cidade: string
          bairro: string
          nicho?: string | null
          observacoes?: string | null
          status?: 'Novo' | 'Contatado' | 'Qualificado' | 'Convertido' | 'Perdido'
          data_criacao: string
          origem?: string | null
          contactado?: boolean
          data_contato?: string | null
          tem_site?: string | null
          lead_quente?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string | null
          telefone?: string | null
          estado?: string
          cidade?: string
          bairro?: string
          nicho?: string | null
          observacoes?: string | null
          status?: 'Novo' | 'Contatado' | 'Qualificado' | 'Convertido' | 'Perdido'
          data_criacao?: string
          origem?: string | null
          contactado?: boolean
          data_contato?: string | null
          tem_site?: string | null
          lead_quente?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // Adicione mais tipos conforme necessário
    }
  }
}

