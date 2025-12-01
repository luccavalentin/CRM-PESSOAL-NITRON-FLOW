'use client'

import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  subtitle?: string
  valueColor?: string
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  valueColor = 'text-white',
}: StatCardProps) {
  return (
    <div className="group relative bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6 transition-all duration-300 hover:border-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/10 hover:-translate-y-1 bg-gradient-to-br from-card-bg to-dark-black/50">
      <div className="flex flex-col items-center justify-center mb-4">
        {Icon && (
          <div className="p-3 bg-gradient-to-br from-accent-electric/20 to-accent-cyan/10 rounded-xl border border-accent-electric/20 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-accent-electric/5 mb-3">
            <Icon className="w-6 h-6 text-accent-electric" />
          </div>
        )}
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider text-center">{title}</h3>
      </div>
      <div className="text-center">
        <p className={`text-4xl font-extrabold ${valueColor} mb-2 tracking-tight`}>{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-300 font-semibold">{subtitle}</p>
        )}
        {trend && (
          <div
            className={`inline-flex items-center gap-1 mt-2 text-xs font-semibold px-2.5 py-1 rounded-lg ${
              trend.isPositive 
                ? 'text-emerald-400 bg-emerald-400/15 border border-emerald-400/20' 
                : 'text-rose-400 bg-rose-400/15 border border-rose-400/20'
            }`}
          >
            {trend.isPositive ? '+' : ''}
            {trend.value}%
          </div>
        )}
      </div>
    </div>
  )
}
