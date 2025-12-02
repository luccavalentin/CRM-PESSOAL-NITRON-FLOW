/**
 * Formata uma data para o formato YYYY-MM-DD sem problemas de timezone
 * @param date - Data a ser formatada (Date, string ou undefined)
 * @returns String no formato YYYY-MM-DD ou data atual se não fornecida
 */
export function formatDateForInput(date?: Date | string): string {
  if (!date) {
    // Retorna data atual no timezone local
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  if (typeof date === 'string') {
    // Se já está no formato YYYY-MM-DD, retorna direto
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date
    }
    // Se for uma string de data, converte para Date primeiro
    const dateObj = new Date(date)
    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const day = String(dateObj.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Se for um objeto Date, formata no timezone local
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Converte uma string de data (YYYY-MM-DD) para Date sem problemas de timezone
 * @param dateString - String no formato YYYY-MM-DD
 * @returns Objeto Date no timezone local
 */
export function parseDateFromInput(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  // Cria a data no timezone local (não UTC)
  return new Date(year, month - 1, day)
}

