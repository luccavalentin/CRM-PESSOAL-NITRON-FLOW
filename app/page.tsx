'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { initializeMockData } from '@/utils/mockData'

export default function Home() {
  const router = useRouter()
  const { checkAuth } = useAuthStore()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Inicializar dados mockados
    initializeMockData()
    
    if (checkAuth()) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
    setChecking(false)
  }, [checkAuth, router])

  if (checking) {
    return null
  }

  return null
}
