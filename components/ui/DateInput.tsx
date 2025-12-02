'use client'

import { InputHTMLAttributes } from 'react'
import { formatDateForInput } from '@/utils/formatDate'

interface DateInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue'> {
  value?: Date | string
  defaultValue?: Date | string
}

export default function DateInput({ value, defaultValue, ...props }: DateInputProps) {
  // Formatar valores para evitar problemas de timezone
  const formattedValue = value ? formatDateForInput(value) : undefined
  const formattedDefaultValue = defaultValue ? formatDateForInput(defaultValue) : undefined

  return (
    <input
      type="date"
      value={formattedValue}
      defaultValue={formattedDefaultValue}
      {...props}
    />
  )
}

