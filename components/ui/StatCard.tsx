import { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  subtitle?: string
  valueColor?: string
  className?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  valueColor = 'text-white',
  className,
  trend,
}: StatCardProps) {
  return (
    <div className={`bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6 ${className || ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-accent-electric/20 rounded-lg">
          <Icon className="w-5 h-5 text-accent-electric" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${
            trend.isPositive ? 'bg-emerald-500/20' : 'bg-red-500/20'
          }`}>
            {trend.isPositive ? (
              <TrendingUp className={`w-4 h-4 ${trend.isPositive ? 'text-emerald-400' : 'text-red-400'}`} />
            ) : (
              <TrendingDown className={`w-4 h-4 ${trend.isPositive ? 'text-emerald-400' : 'text-red-400'}`} />
            )}
            <span className={`text-xs font-semibold ${trend.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
        <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
