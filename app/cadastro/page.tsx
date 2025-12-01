'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import Logo from '@/components/ui/Logo'
import { Building2, Mail, Lock, User, Eye, EyeOff, UserPlus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CadastroPage() {
  const router = useRouter()
  const { isAuthenticated, register, rememberMe } = useAuthStore()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Se já estiver autenticado, redireciona para o dashboard
    if (isAuthenticated) {
      router.push('/dashboard')
      return
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validação básica
    if (!nome || !email || !password || !confirmPassword) {
      setError('Por favor, preencha todos os campos')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    // Validação de email básica
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Por favor, insira um email válido')
      setLoading(false)
      return
    }

    // Simula um pequeno delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const success = register(nome, email, password)
    
    if (success) {
      router.push('/dashboard')
    } else {
      setError('Erro ao criar conta. Este email já pode estar em uso.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-deep flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <Logo size="lg" showSlogan={true} variant="full" className="mb-4" />
        </div>

        {/* Card de Cadastro */}
        <div className="bg-card-bg/90 backdrop-blur-xl border border-card-border/50 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome */}
            <div>
              <label htmlFor="nome" className="block text-sm font-semibold text-gray-300 mb-2">
                Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full pl-12 pr-4 py-3 bg-dark-black/50 border border-card-border/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent-electric/50 focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-12 pr-4 py-3 bg-dark-black/50 border border-card-border/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent-electric/50 focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 bg-dark-black/50 border border-card-border/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent-electric/50 focus:ring-2 focus:ring-accent-electric/20 transition-all"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirmar Senha */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-300 mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 bg-dark-black/50 border border-card-border/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent-electric/50 focus:ring-2 focus:ring-accent-electric/20 transition-all"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}

            {/* Botão de Cadastro */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/40 hover:shadow-xl hover:shadow-blue-600/60 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Criando conta...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Criar Conta</span>
                </>
              )}
            </button>
          </form>

          {/* Link para Login */}
          <div className="mt-6 pt-6 border-t border-card-border/30">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-accent-electric transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Já tem uma conta? Faça login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


