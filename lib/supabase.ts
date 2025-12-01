import { createClient } from '@supabase/supabase-js'

// Debug: verificar se as variáveis estão sendo carregadas
if (typeof window !== 'undefined') {
  console.log('🔍 Debug - Variáveis de ambiente no cliente:')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Definida' : '❌ Não definida')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Não definida')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  const missing = []
  if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  
  const errorMessage = `
❌ ERRO: Variáveis de ambiente do Supabase não configuradas!

Faltando: ${missing.join(', ')}

📝 SOLUÇÃO IMEDIATA:

1. ✅ O arquivo .env.local foi criado na raiz do projeto
2. ⚠️ VOCÊ PRECISA REINICIAR O SERVIDOR COMPLETAMENTE:
   - Pare o servidor (Ctrl+C no terminal)
   - Limpe o cache: Delete a pasta .next (ou execute: Remove-Item .next -Recurse -Force)
   - Execute: npm run dev
   - O Next.js só carrega variáveis NEXT_PUBLIC_* na inicialização!

3. Se ainda não funcionar, verifique:
   - O arquivo .env.local está na mesma pasta que package.json?
   - Não há espaços extras antes ou depois dos valores?
   - O arquivo tem exatamente este conteúdo (sem aspas):

NEXT_PUBLIC_SUPABASE_URL=https://pjbrzajtmgrnltwbvkkj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYnJ6YWp0bWdybmx0d2J2a2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MjI3NzcsImV4cCI6MjA4MDE5ODc3N30.tiBE_2MSphmqK7ZzkDPhqPZhnTMRcuzh4qz81AVTZgk

4. Verifique o console do navegador para ver os logs de debug acima.
  `
  
  throw new Error(errorMessage)
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


