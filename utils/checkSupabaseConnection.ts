import { supabase } from '@/lib/supabase'

/**
 * Verifica se o Supabase está conectado e funcionando
 */
export async function checkSupabaseConnection(): Promise<{
  connected: boolean
  error?: string
  details?: any
}> {
  try {
    // Tenta fazer uma query simples para verificar a conexão
    const { data, error } = await supabase
      .from('usuarios')
      .select('count')
      .limit(1)

    if (error) {
      // Se a tabela não existir, ainda pode estar conectado
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        return {
          connected: true,
          error: 'Tabela usuarios não encontrada. Execute o schema.sql no Supabase.',
          details: error,
        }
      }
      return {
        connected: false,
        error: error.message,
        details: error,
      }
    }

    return {
      connected: true,
      details: 'Conexão com Supabase estabelecida com sucesso!',
    }
  } catch (err: any) {
    return {
      connected: false,
      error: err.message || 'Erro desconhecido ao conectar com Supabase',
      details: err,
    }
  }
}

/**
 * Verifica se as variáveis de ambiente do Supabase estão configuradas
 */
export function checkSupabaseEnv(): {
  configured: boolean
  missing: string[]
} {
  const missing: string[] = []
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL')
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  return {
    configured: missing.length === 0,
    missing,
  }
}

