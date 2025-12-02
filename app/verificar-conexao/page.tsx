'use client'

import { useEffect, useState } from 'react'
import { checkSupabaseConnection, checkSupabaseEnv } from '@/utils/checkSupabaseConnection'
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function VerificarConexaoPage() {
  const [envStatus, setEnvStatus] = useState<{
    configured: boolean
    missing: string[]
  } | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean
    error?: string
    details?: any
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkConnection() {
      // Verifica variáveis de ambiente primeiro
      const envCheck = checkSupabaseEnv()
      setEnvStatus(envCheck)

      // Se as variáveis estiverem configuradas, verifica a conexão
      if (envCheck.configured) {
        const connCheck = await checkSupabaseConnection()
        setConnectionStatus(connCheck)
      } else {
        setConnectionStatus({
          connected: false,
          error: 'Variáveis de ambiente não configuradas',
        })
      }

      setLoading(false)
    }

    checkConnection()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-deep flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-accent-electric animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Verificando conexão...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-deep p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Verificação de Conexão com Supabase</h1>

        {/* Status das Variáveis de Ambiente */}
        <div className="bg-card-bg/90 backdrop-blur-xl border border-card-border/50 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            Variáveis de Ambiente
          </h2>
          {envStatus?.configured ? (
            <div className="flex items-center gap-3 text-green-400">
              <CheckCircle2 className="w-6 h-6" />
              <span>Todas as variáveis de ambiente estão configuradas</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-red-400">
                <XCircle className="w-6 h-6" />
                <span>Variáveis de ambiente faltando:</span>
              </div>
              <ul className="list-disc list-inside ml-8 text-gray-300">
                {envStatus?.missing.map((varName) => (
                  <li key={varName} className="font-mono text-sm">
                    {varName}
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-400">
                  <strong>Como configurar:</strong>
                </p>
                <p className="text-sm text-gray-300 mt-2">
                  1. Crie um arquivo <code className="bg-dark-black/50 px-2 py-1 rounded">.env.local</code> na raiz do projeto
                </p>
                <p className="text-sm text-gray-300">
                  2. Adicione as variáveis conforme mostrado em <code className="bg-dark-black/50 px-2 py-1 rounded">CHAVES_CONFIGURADAS.md</code>
                </p>
                <p className="text-sm text-gray-300">
                  3. Na Vercel, configure as variáveis em <strong>Settings &gt; Environment Variables</strong>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Status da Conexão */}
        <div className="bg-card-bg/90 backdrop-blur-xl border border-card-border/50 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            Conexão com Banco de Dados
          </h2>
          {connectionStatus?.connected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-green-400">
                <CheckCircle2 className="w-6 h-6" />
                <span>Conexão estabelecida com sucesso!</span>
              </div>
              {connectionStatus.details && (
                <p className="text-sm text-gray-300 ml-8">{connectionStatus.details}</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-red-400">
                <XCircle className="w-6 h-6" />
                <span>Não foi possível conectar ao banco de dados</span>
              </div>
              {connectionStatus?.error && (
                <div className="ml-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400 font-semibold mb-2">Erro:</p>
                  <p className="text-sm text-gray-300">{connectionStatus.error}</p>
                </div>
              )}
              {connectionStatus?.error?.includes('Tabela usuarios não encontrada') && (
                <div className="ml-8 mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-yellow-400 font-semibold mb-2">Solução:</p>
                  <p className="text-sm text-gray-300">
                    1. Acesse o painel do Supabase: https://supabase.com/dashboard
                  </p>
                  <p className="text-sm text-gray-300">
                    2. Vá em <strong>SQL Editor</strong>
                  </p>
                  <p className="text-sm text-gray-300">
                    3. Execute o arquivo <code className="bg-dark-black/50 px-2 py-1 rounded">supabase/schema.sql</code>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Informações Adicionais */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-400">
            <strong>URL do Supabase:</strong>{' '}
            <code className="bg-dark-black/50 px-2 py-1 rounded">
              {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Não configurado'}
            </code>
          </p>
        </div>
      </div>
    </div>
  )
}





