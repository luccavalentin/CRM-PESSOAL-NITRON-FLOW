'use client'

import { useEffect } from 'react'
import { X, AlertCircle, CheckCircle2, Info, AlertTriangle, LucideIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  icon?: LucideIcon
  description?: string
  footer?: React.ReactNode
  showCloseButton?: boolean
  closeOnBackdrop?: boolean
  className?: string
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  variant = 'default',
  icon: Icon,
  description,
  footer,
  showCloseButton = true,
  closeOnBackdrop = true,
  className = '',
}: ModalProps) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
  }

  const variantStyles = {
    default: {
      headerBg: 'bg-gradient-to-r from-card-bg via-accent-electric/10 to-dark-black',
      borderColor: 'border-accent-electric/40',
      iconBg: 'bg-gradient-to-br from-accent-electric/30 to-accent-cyan/20',
      iconColor: 'text-accent-electric',
      accentBorder: 'border-l-4 border-accent-electric shadow-lg shadow-accent-electric/20',
      glow: 'shadow-[0_0_20px_rgba(0,217,255,0.1)]',
    },
    success: {
      headerBg: 'bg-gradient-to-r from-emerald-900/40 via-emerald-800/30 to-emerald-900/20',
      borderColor: 'border-emerald-500/50',
      iconBg: 'bg-gradient-to-br from-emerald-500/30 to-emerald-400/20',
      iconColor: 'text-emerald-300',
      accentBorder: 'border-l-4 border-emerald-500 shadow-lg shadow-emerald-500/20',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    },
    warning: {
      headerBg: 'bg-gradient-to-r from-yellow-900/40 via-yellow-800/30 to-yellow-900/20',
      borderColor: 'border-yellow-500/50',
      iconBg: 'bg-gradient-to-br from-yellow-500/30 to-yellow-400/20',
      iconColor: 'text-yellow-300',
      accentBorder: 'border-l-4 border-yellow-500 shadow-lg shadow-yellow-500/20',
      glow: 'shadow-[0_0_20px_rgba(234,179,8,0.15)]',
    },
    error: {
      headerBg: 'bg-gradient-to-r from-red-900/40 via-red-800/30 to-red-900/20',
      borderColor: 'border-red-500/50',
      iconBg: 'bg-gradient-to-br from-red-500/30 to-red-400/20',
      iconColor: 'text-red-300',
      accentBorder: 'border-l-4 border-red-500 shadow-lg shadow-red-500/20',
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
    },
    info: {
      headerBg: 'bg-gradient-to-r from-blue-900/40 via-blue-800/30 to-blue-900/20',
      borderColor: 'border-blue-500/50',
      iconBg: 'bg-gradient-to-br from-blue-500/30 to-blue-400/20',
      iconColor: 'text-blue-300',
      accentBorder: 'border-l-4 border-blue-500 shadow-lg shadow-blue-500/20',
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]',
    },
  }

  const defaultIcons = {
    success: CheckCircle2,
    warning: AlertTriangle,
    error: AlertCircle,
    info: Info,
    default: undefined,
  }

  const selectedIcon = Icon || defaultIcons[variant]
  const SelectedIcon = selectedIcon
  const styles = variantStyles[variant]

  // Prevenir scroll do body quando modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Fechar com ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop com blur melhorado */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9998]"
            onClick={closeOnBackdrop ? onClose : undefined}
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none overflow-y-auto">
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
              className={`w-full ${sizeClasses[size]} bg-gradient-to-br from-card-bg via-card-bg to-dark-black border-2 ${styles.borderColor} rounded-2xl shadow-2xl shadow-black/50 pointer-events-auto my-auto ${styles.accentBorder} ${styles.glow} ${className}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header com gradiente e ícone */}
              {(title || SelectedIcon) && (
                <div className={`${styles.headerBg} p-6 border-b ${styles.borderColor} rounded-t-xl relative overflow-hidden`}>
                  {/* Efeito de brilho sutil no header */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                  {/* Efeito de partículas sutil */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
                    <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
                  </div>
                  
                  <div className="flex items-start gap-4 relative z-10">
                    {SelectedIcon && (
                      <div className={`${styles.iconBg} p-3 rounded-xl ${styles.iconColor} flex-shrink-0 shadow-lg backdrop-blur-sm border border-white/10`}>
                        <SelectedIcon className="w-6 h-6 drop-shadow-lg" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                        {title}
                      </h2>
                      {description && (
                        <p className="text-sm text-gray-400 mt-1">{description}</p>
                      )}
                    </div>
                    {showCloseButton && (
                      <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 hover:rotate-90 flex-shrink-0 group"
                        aria-label="Fechar"
                      >
                        <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Content com scroll suave */}
              <div className="p-6 max-h-[calc(90vh-180px)] overflow-y-auto custom-scrollbar">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {children}
                </motion.div>
              </div>
              
              {/* Footer customizado */}
              {footer && (
                <div className={`p-6 border-t ${styles.borderColor} bg-dark-black/30 rounded-b-xl`}>
                  {footer}
                </div>
              )}
            </motion.div>
          </div>

          {/* Estilos customizados para scrollbar */}
          <style jsx global>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(0, 0, 0, 0.2);
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(0, 217, 255, 0.3);
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(0, 217, 255, 0.5);
            }
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
