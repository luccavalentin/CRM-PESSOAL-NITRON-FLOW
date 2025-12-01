'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { cleanLeadsPiracicamirimImmediate, cleanMockDataImmediate } from '@/utils/cleanDataImmediate'

export default function Home() {
  const router = useRouter()
  const { checkAuth } = useAuthStore()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const verifyAndRedirect = async () => {
      // Limpar leads de Piracicamirim IMEDIATAMENTE
      cleanLeadsPiracicamirimImmediate()
      
      // Limpar dados mockados IMEDIATAMENTE
      cleanMockDataImmediate()
      
      const isAuth = await checkAuth()
      
      if (isAuth) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
      setChecking(false)
    }

    verifyAndRedirect()
  }, [checkAuth, router])

  if (checking) {
    return null
  }

  return null
}
