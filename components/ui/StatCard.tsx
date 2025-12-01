import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  subtitle?: string
  valueColor?: string
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  valueColor = 'text-white',
}: StatCardProps) {
  return (
    <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-accent-electric/20 rounded-lg">
          <Icon className="w-5 h-5 text-accent-electric" />
        </div>
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
