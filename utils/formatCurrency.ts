import { usePreferencesStore } from '@/stores/preferencesStore'

export const formatCurrency = (valor: number): string => {
  const mostrarValores = usePreferencesStore.getState().mostrarValores
  if (mostrarValores) {
    return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  }
  return '••••••'
}

export const useFormatCurrency = () => {
  const mostrarValores = usePreferencesStore((state) => state.mostrarValores)
  
  return (valor: number): string => {
    if (mostrarValores) {
      return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    }
    return '••••••'
  }
}


