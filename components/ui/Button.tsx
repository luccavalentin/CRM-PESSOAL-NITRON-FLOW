'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-black'
  
  const variantClasses = {
    primary: 'bg-accent-electric text-white hover:bg-accent-cyan focus:ring-accent-electric',
    secondary: 'bg-card-bg text-gray-300 hover:bg-card-hover border border-card-border focus:ring-card-border',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
    ghost: 'bg-transparent text-gray-300 hover:bg-card-hover focus:ring-card-border',
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  }

  // Verificar se o botão tem classes de azul ciano (accent-electric ou accent-cyan)
  const hasCyanClasses = className.includes('accent-electric') || 
                        className.includes('accent-cyan') || 
                        className.includes('from-accent-electric') ||
                        className.includes('to-accent-cyan')
  
  const isCyanButton = hasCyanClasses || variant === 'primary'
  
  // Se for botão azul ciano, substituir qualquer classe de texto por azul marinho
  let processedClassName = className
  let variantClass = variantClasses[variant]
  
  if (isCyanButton) {
    // Remover text-white do variantClasses quando for botão ciano
    variantClass = variantClass.replace('text-white', '')
    // Remover todas as classes de texto da className e adicionar text-blue-900 (azul marinho)
    processedClassName = className.replace(/text-[\w-]+/g, '') + ' text-blue-900'
    processedClassName = processedClassName.trim()
  }

  return (
    <button
      className={`${baseClasses} ${variantClass} ${sizeClasses[size]} ${processedClassName}`}
      {...props}
    >
      {children}
    </button>
  )
}
