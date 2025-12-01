'use client'

import { useState, useRef, useEffect } from 'react'
import { FOREX_ASSETS, searchForexAssets } from '@/utils/forexAssets'
import { Search, X } from 'lucide-react'

interface ForexAutocompleteProps {
  value?: string
  onChange?: (value: string) => void
  onSelect?: (value: string) => void
  placeholder?: string
  required?: boolean
  name?: string
  className?: string
}

export default function ForexAutocomplete({
  value = '',
  onChange,
  onSelect,
  placeholder = 'Digite para buscar ativo FOREX...',
  required = false,
  name = 'ativo',
  className = '',
}: ForexAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    if (inputValue.length > 0) {
      const results = searchForexAssets(inputValue)
      setSuggestions(results.slice(0, 10)) // Limitar a 10 sugestões
      setShowSuggestions(results.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
    setSelectedIndex(-1)
  }, [inputValue])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange?.(newValue)
  }

  const handleSelect = (asset: string) => {
    setInputValue(asset)
    setShowSuggestions(false)
    onChange?.(asset)
    onSelect?.(asset)
    inputRef.current?.blur()
  }

  const handleClear = () => {
    setInputValue('')
    setShowSuggestions(false)
    onChange?.('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        inputRef.current?.blur()
        break
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (inputValue.length > 0 && suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className={`w-full pl-10 ${inputValue ? 'pr-10' : 'pr-4'} py-3 bg-card-bg border border-card-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all ${className}`}
        />
        {/* Input hidden para garantir que o valor seja enviado no formulário */}
        <input type="hidden" name={name} value={inputValue} />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-dark-black border border-card-border rounded-xl shadow-xl max-h-60 overflow-y-auto"
        >
          {suggestions.map((asset, index) => (
            <button
              key={asset}
              type="button"
              onClick={() => handleSelect(asset)}
              className={`w-full text-left px-4 py-3 hover:bg-accent-electric/10 transition-colors ${
                index === selectedIndex
                  ? 'bg-accent-electric/20 border-l-2 border-accent-electric'
                  : ''
              } ${
                index === 0 ? 'rounded-t-xl' : ''
              } ${
                index === suggestions.length - 1 ? 'rounded-b-xl' : ''
              }`}
            >
              <span className="text-white font-medium">{asset}</span>
            </button>
          ))}
        </div>
      )}

    </div>
  )
}

