'use client'

import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showSlogan?: boolean
  className?: string
  variant?: 'full' | 'compact' | 'icon'
}

export default function Logo({ size = 'md', showSlogan = false, className = '', variant = 'full' }: LogoProps) {
  // Versão compacta para sidebar
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Ícone N com gradiente */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D9FF] via-[#00D4FF] to-[#00A8CC] flex items-center justify-center shadow-lg shadow-[#00D9FF]/50 border border-[#00D9FF]/30">
            <span className="text-white font-black text-lg">N</span>
          </div>
        </div>
        {/* Texto */}
        <div className="flex flex-col leading-tight">
          <span className="text-base font-black text-white tracking-wide">NITRON</span>
          <span className="text-base font-black bg-gradient-to-r from-[#00D9FF] via-[#00D4FF] to-[#00D9FF] bg-clip-text text-transparent tracking-wide">FLOW</span>
        </div>
      </div>
    )
  }

  // Versão ícone apenas
  if (variant === 'icon') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D9FF] via-[#00D4FF] to-[#00A8CC] flex items-center justify-center shadow-lg shadow-[#00D9FF]/50 border-2 border-[#00D9FF]/40">
            <span className="text-white font-black text-2xl">N</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#00D4FF] border-2 border-dark-black flex items-center justify-center shadow-md">
            <span className="text-[10px] font-black text-dark-black">F</span>
          </div>
        </div>
      </div>
    )
  }

  // Versão completa
  const sizeClasses = {
    sm: { width: 200, height: 70, textSize: 'text-lg', sloganSize: 'text-xs', fontSize: 28 },
    md: { width: 280, height: 90, textSize: 'text-2xl', sloganSize: 'text-sm', fontSize: 36 },
    lg: { width: 360, height: 120, textSize: 'text-3xl', sloganSize: 'text-base', fontSize: 48 },
    xl: { width: 440, height: 150, textSize: 'text-4xl', sloganSize: 'text-lg', fontSize: 60 },
  }

  const sizes = sizeClasses[size]

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative mb-3">
        <svg
          width={sizes.width}
          height={sizes.height}
          viewBox="0 0 320 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-2xl"
        >
          <defs>
            <linearGradient id="nitronGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E0E0E0" />
            </linearGradient>
            <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00D9FF" />
              <stop offset="50%" stopColor="#00D4FF" />
              <stop offset="100%" stopColor="#00D9FF" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="strongGlow">
              <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* NITRON Text - White, bold, with shadow */}
          <text
            x="10"
            y="40"
            fontSize={sizes.fontSize}
            fontWeight="900"
            fill="url(#nitronGradient)"
            fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
            letterSpacing="4"
            stroke="#000000"
            strokeWidth="0.8"
            strokeOpacity="0.2"
          >
            NITRON
          </text>

          {/* FLOW Text - Cyan gradient with strong glow */}
          <g filter="url(#strongGlow)">
            <text
              x="10"
              y="78"
              fontSize={sizes.fontSize}
              fontWeight="900"
              fill="url(#flowGradient)"
              fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
              letterSpacing="4"
            >
              FLOW
            </text>
          </g>

          {/* Data flow dots after L - More visible */}
          <g opacity="1">
            <circle cx="108" cy="65" r="3" fill="#00D9FF" filter="url(#glow)" />
            <circle cx="120" cy="65" r="3" fill="#00D9FF" filter="url(#glow)" />
            <circle cx="132" cy="65" r="3" fill="#00D9FF" filter="url(#glow)" />
            <line x1="108" y1="65" x2="132" y2="65" stroke="#00D9FF" strokeWidth="2" opacity="0.7" />
          </g>

          {/* Lightning bolt in O - Enhanced and more visible */}
          <g filter="url(#glow)">
            <circle cx="145" cy="65" r="14" fill="none" stroke="url(#flowGradient)" strokeWidth="3" />
            <path
              d="M 137 58 L 145 65 L 140 65 L 150 75 L 145 68 L 149 68 Z"
              fill="url(#flowGradient)"
            />
          </g>
        </svg>
      </div>

      {showSlogan && (
        <div className="flex flex-col items-center mt-4">
          <p className={`${sizes.sloganSize} text-gray-200 font-semibold mb-2 tracking-wide`}>
            Cresça. Automatize. Prospere.
          </p>
          <div className="flex items-center gap-2 w-36">
            <div className="h-0.5 bg-gradient-to-r from-transparent via-[#00D9FF] to-[#00D9FF] flex-1" />
            <div className="w-2 h-2 rounded-full bg-[#00D9FF] shadow-sm shadow-[#00D9FF]/60" />
            <div className="h-0.5 bg-gradient-to-l from-transparent via-[#00D9FF] to-[#00D9FF] flex-1" />
          </div>
        </div>
      )}
    </div>
  )
}
