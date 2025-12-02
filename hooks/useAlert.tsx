'use client'

import { useState, useCallback } from 'react'
import AlertModal from '@/components/ui/AlertModal'

interface AlertOptions {
  title?: string
  message: string
  buttonText?: string
  variant?: 'success' | 'error' | 'warning' | 'info'
  icon?: React.ReactNode
}

export function useAlert() {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<AlertOptions>({ message: '' })
  const [resolvePromise, setResolvePromise] = useState<(() => void) | null>(null)

  const alert = useCallback((opts: AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      setOptions(opts)
      setIsOpen(true)
      setResolvePromise(() => resolve)
    })
  }, [])

  const handleClose = useCallback(() => {
    if (resolvePromise) {
      resolvePromise()
      setResolvePromise(null)
    }
    setIsOpen(false)
  }, [resolvePromise])

  const AlertModalComponent = () => (
    <AlertModal
      isOpen={isOpen}
      onClose={handleClose}
      title={options.title}
      message={options.message}
      buttonText={options.buttonText}
      variant={options.variant}
      icon={options.icon}
    />
  )

  return { alert, AlertModal: AlertModalComponent }
}

