'use client'

import { AlertTriangle, Trash2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './Button'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  icon?: React.ReactNode
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar Ação',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  icon,
}: ConfirmationModalProps) {
  const variantStyles = {
    danger: {
      headerBg: 'bg-gradient-to-r from-red-900/40 via-red-800/30 to-red-900/20',
      borderColor: 'border-red-500/50',
      iconBg: 'bg-gradient-to-br from-red-500/30 to-red-400/20',
      iconColor: 'text-red-300',
      accentBorder: 'border-l-4 border-red-500 shadow-lg shadow-red-500/20',
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
      buttonBg: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      headerBg: 'bg-gradient-to-r from-yellow-900/40 via-yellow-800/30 to-yellow-900/20',
      borderColor: 'border-yellow-500/50',
      iconBg: 'bg-gradient-to-br from-yellow-500/30 to-yellow-400/20',
      iconColor: 'text-yellow-300',
      accentBorder: 'border-l-4 border-yellow-500 shadow-lg shadow-yellow-500/20',
      glow: 'shadow-[0_0_20px_rgba(234,179,8,0.15)]',
      buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
    },
    info: {
      headerBg: 'bg-gradient-to-r from-blue-900/40 via-blue-800/30 to-blue-900/20',
      borderColor: 'border-blue-500/50',
      iconBg: 'bg-gradient-to-br from-blue-500/30 to-blue-400/20',
      iconColor: 'text-blue-300',
      accentBorder: 'border-l-4 border-blue-500 shadow-lg shadow-blue-500/20',
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
    },
  }

  const styles = variantStyles[variant]
  const DefaultIcon = variant === 'danger' ? Trash2 : AlertTriangle

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9998]"
            onClick={onClose}
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ 
                type: 'spring',
                stiffness: 300,
                damping: 30,
                duration: 0.3
              }}
              className={`w-full max-w-md bg-gradient-to-br from-card-bg via-card-bg to-dark-black border-2 ${styles.borderColor} rounded-2xl shadow-2xl shadow-black/50 pointer-events-auto ${styles.accentBorder} ${styles.glow}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`${styles.headerBg} p-6 border-b ${styles.borderColor} rounded-t-xl relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                
                <div className="flex items-start gap-4 relative z-10">
                  <div className={`${styles.iconBg} p-3 rounded-xl ${styles.iconColor} flex-shrink-0 shadow-lg backdrop-blur-sm border border-white/10`}>
                    {icon || <DefaultIcon className="w-6 h-6 drop-shadow-lg" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {title}
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 hover:rotate-90 flex-shrink-0 group"
                    aria-label="Fechar"
                  >
                    <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <p className="text-gray-300 text-lg leading-relaxed">
                  {message}
                </p>
              </div>
              
              {/* Footer */}
              <div className={`p-6 border-t ${styles.borderColor} bg-dark-black/30 rounded-b-xl flex gap-3 justify-end`}>
                <Button
                  variant="secondary"
                  onClick={onClose}
                  className="min-w-[100px]"
                >
                  {cancelText}
                </Button>
                <Button
                  onClick={handleConfirm}
                  className={`min-w-[100px] ${styles.buttonBg} text-white`}
                >
                  {confirmText}
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Estilos */}
          <style jsx global>{`
            @keyframes shimmer {
              0% {
                transform: translateX(-100%);
              }
              100% {
                transform: translateX(100%);
              }
            }
            .animate-shimmer {
              animation: shimmer 3s infinite;
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  )
}

