'use client'

import { useState, useCallback } from 'react'
import ConfirmationModal from '@/components/ui/ConfirmationModal'

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  icon?: React.ReactNode
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({ message: '' })
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts)
      setIsOpen(true)
      setResolvePromise(() => resolve)
    })
  }, [])

  const handleConfirm = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(true)
      setResolvePromise(null)
    }
    setIsOpen(false)
  }, [resolvePromise])

  const handleCancel = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(false)
      setResolvePromise(null)
    }
    setIsOpen(false)
  }, [resolvePromise])

  const ConfirmModal = () => (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      title={options.title}
      message={options.message}
      confirmText={options.confirmText}
      cancelText={options.cancelText}
      variant={options.variant}
      icon={options.icon}
    />
  )

  return { confirm, ConfirmModal }
}

