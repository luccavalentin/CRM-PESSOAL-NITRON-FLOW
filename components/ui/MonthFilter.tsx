'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import Button from './Button'

interface MonthFilterProps {
  selectedMonth: number // 0-11 (janeiro = 0)
  selectedYear: number
  onMonthChange: (month: number, year: number) => void
  className?: string
}

export default function MonthFilter({
  selectedMonth,
  selectedYear,
  onMonthChange,
  className = '',
}: MonthFilterProps) {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      onMonthChange(11, selectedYear - 1)
    } else {
      onMonthChange(selectedMonth - 1, selectedYear)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      onMonthChange(0, selectedYear + 1)
    } else {
      onMonthChange(selectedMonth + 1, selectedYear)
    }
  }

  const handleCurrentMonth = () => {
    const hoje = new Date()
    onMonthChange(hoje.getMonth(), hoje.getFullYear())
  }

  const isCurrentMonth = () => {
    const hoje = new Date()
    return selectedMonth === hoje.getMonth() && selectedYear === hoje.getFullYear()
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-accent-electric" />
        <span className="text-sm font-medium text-gray-300">Período:</span>
      </div>
      
      <div className="flex items-center gap-2 bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-lg p-2">
        <button
          onClick={handlePreviousMonth}
          className="p-1.5 hover:bg-accent-electric/20 rounded-lg transition-colors text-gray-400 hover:text-accent-electric"
          title="Mês anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="px-4 py-1.5 min-w-[180px] text-center">
          <div className="text-base font-bold text-white">
            {meses[selectedMonth]} {selectedYear}
          </div>
        </div>
        
        <button
          onClick={handleNextMonth}
          className="p-1.5 hover:bg-accent-electric/20 rounded-lg transition-colors text-gray-400 hover:text-accent-electric"
          title="Próximo mês"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {!isCurrentMonth() && (
        <Button
          onClick={handleCurrentMonth}
          variant="secondary"
          className="px-4 py-2 text-sm"
        >
          Mês Atual
        </Button>
      )}
    </div>
  )
}



