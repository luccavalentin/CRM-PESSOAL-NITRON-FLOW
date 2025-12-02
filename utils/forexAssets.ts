// Lista completa de ativos FOREX (pares de moedas)
export const FOREX_ASSETS = [
  // Majors (Principais)
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'USD/CHF',
  'AUD/USD',
  'USD/CAD',
  'NZD/USD',
  
  // Crosses EUR
  'EUR/GBP',
  'EUR/JPY',
  'EUR/CHF',
  'EUR/AUD',
  'EUR/CAD',
  'EUR/NZD',
  
  // Crosses GBP
  'GBP/JPY',
  'GBP/CHF',
  'GBP/AUD',
  'GBP/CAD',
  'GBP/NZD',
  
  // Crosses JPY
  'AUD/JPY',
  'CAD/JPY',
  'CHF/JPY',
  'NZD/JPY',
  
  // Crosses AUD
  'AUD/CAD',
  'AUD/CHF',
  'AUD/NZD',
  
  // Crosses CAD
  'CAD/CHF',
  'NZD/CAD',
  
  // Crosses CHF
  'NZD/CHF',
  
  // Exóticos
  'USD/BRL',
  'EUR/BRL',
  'GBP/BRL',
  'USD/MXN',
  'USD/ZAR',
  'USD/TRY',
  'USD/RUB',
  'USD/CNH',
  'USD/HKD',
  'USD/SGD',
  'USD/SEK',
  'USD/NOK',
  'USD/DKK',
  'USD/PLN',
  
  // Outros crosses
  'BRL/JPY',
  'BRL/EUR',
  'BRL/GBP',
]

// Função para buscar ativos (com autocomplete)
export const searchForexAssets = (query: string): string[] => {
  if (!query) return FOREX_ASSETS
  const lowerQuery = query.toLowerCase()
  return FOREX_ASSETS.filter(asset => 
    asset.toLowerCase().includes(lowerQuery)
  )
}





