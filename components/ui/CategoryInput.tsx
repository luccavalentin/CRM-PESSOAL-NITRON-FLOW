'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Search, Plus, X } from 'lucide-react'

interface CategoryInputProps {
  value: string
  onChange: (value: string) => void
  categories: string[]
  onAddCategory?: (category: string) => void
  placeholder?: string
  className?: string
}

export default function CategoryInput({
  value,
  defaultValue,
  onChange,
  categories,
  onAddCategory,
  placeholder = 'Buscar ou criar categoria...',
  className = '',
  name,
}: CategoryInputProps) {
  const initialValue = value || defaultValue || ''
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const [isOpen, setIsOpen] = useState(false)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value !== undefined) {
      setSearchTerm(value)
    } else if (defaultValue !== undefined) {
      setSearchTerm(defaultValue)
    }
  }, [value, defaultValue])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setShowNewCategory(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredCategories = useMemo(() => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return categories.slice(0, 10) // Mostrar primeiras 10 quando não há busca
    }
    return categories.filter((cat) =>
      cat && cat.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [categories, searchTerm])

  const exactMatch = useMemo(() => {
    if (!searchTerm) return null
    return categories.find(
      (cat) => cat && cat.toLowerCase() === searchTerm.trim().toLowerCase()
    )
  }, [categories, searchTerm])

  const showCreateOption = useMemo(() => {
    if (!searchTerm || searchTerm.trim().length === 0) return false
    const trimmed = searchTerm.trim()
    return !exactMatch && trimmed.length > 0
  }, [searchTerm, exactMatch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    setIsOpen(true)
    setShowNewCategory(false)
    
    // Sempre atualizar o valor para permitir digitação livre
    onChange(newValue)
  }

  const handleSelectCategory = (category: string) => {
    onChange(category)
    setSearchTerm(category)
    setIsOpen(false)
    setShowNewCategory(false)
  }

  const handleCreateCategory = () => {
    const categoriaTrimmed = searchTerm.trim()
    if (categoriaTrimmed && onAddCategory) {
      // Criar a categoria
      onAddCategory(categoriaTrimmed)
      // Atualizar o valor
      onChange(categoriaTrimmed)
      setSearchTerm(categoriaTrimmed)
      setIsOpen(false)
      setShowNewCategory(false)
    } else if (categoriaTrimmed) {
      // Se não tiver callback, apenas atualizar o valor
      onChange(categoriaTrimmed)
      setSearchTerm(categoriaTrimmed)
      setIsOpen(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (showCreateOption && onAddCategory) {
        handleCreateCategory()
      } else if (filteredCategories.length > 0) {
        handleSelectCategory(filteredCategories[0])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setShowNewCategory(false)
    }
  }

  return (
    <div className={`relative ${className}`}>
      {name && (
        <input
          type="hidden"
          name={name}
          value={searchTerm}
        />
      )}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 bg-card-bg border border-card-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('')
              onChange('')
              setIsOpen(false)
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (filteredCategories.length > 0 || showCreateOption) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-card-bg border border-card-border rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar"
        >
          {filteredCategories.length > 0 && (
            <div className="p-2">
              <div className="text-xs text-gray-400 px-3 py-2 font-semibold">
                Categorias Existentes
              </div>
              {filteredCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleSelectCategory(category)}
                  className="w-full text-left px-4 py-2.5 hover:bg-accent-electric/10 rounded-lg transition-colors text-white flex items-center justify-between group"
                >
                  <span>{category}</span>
                  {value === category && (
                    <span className="text-accent-electric text-sm">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {showCreateOption && (
            <div className="border-t border-card-border p-2">
              <button
                type="button"
                onClick={handleCreateCategory}
                className="w-full text-left px-4 py-2.5 hover:bg-emerald-500/10 rounded-lg transition-colors text-emerald-400 flex items-center gap-2 group font-semibold"
              >
                <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>
                  Criar categoria: &quot;{searchTerm.trim()}&quot;
                </span>
              </button>
            </div>
          )}
          
          {!searchTerm && filteredCategories.length === 0 && (
            <div className="p-4 text-center text-gray-400 text-sm">
              Digite para buscar ou criar uma categoria
            </div>
          )}
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 217, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 217, 255, 0.5);
        }
      `}</style>
    </div>
  )
}

