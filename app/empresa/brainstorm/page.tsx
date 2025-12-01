'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { Plus, Lightbulb, Trash2, Edit2, Users, Clock } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface IdeiaBrainstorm {
  id: string
  titulo: string
  descricao: string
  autor: string
  categoria: string
  prioridade: 'Baixa' | 'Média' | 'Alta'
  status: 'Nova' | 'Em Análise' | 'Aprovada' | 'Rejeitada' | 'Implementada'
  dataCriacao: string
  votos: number
  participantes: string[]
}

export default function BrainstormPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingIdeia, setEditingIdeia] = useState<IdeiaBrainstorm | null>(null)
  const [ideias, setIdeias] = useState<IdeiaBrainstorm[]>([])
  const [filtroStatus, setFiltroStatus] = useState<string>('')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('')

  useEffect(() => {
    const saved = localStorage.getItem('brainstorm-empresa')
    if (saved) {
      setIdeias(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('brainstorm-empresa', JSON.stringify(ideias))
  }, [ideias])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novaIdeia: IdeiaBrainstorm = {
      id: editingIdeia?.id || uuidv4(),
      titulo: formData.get('titulo') as string,
      descricao: formData.get('descricao') as string,
      autor: formData.get('autor') as string,
      categoria: formData.get('categoria') as string,
      prioridade: (formData.get('prioridade') as IdeiaBrainstorm['prioridade']) || 'Média',
      status: editingIdeia?.status || 'Nova',
      dataCriacao: editingIdeia?.dataCriacao || new Date().toISOString().split('T')[0],
      votos: editingIdeia?.votos || 0,
      participantes: editingIdeia?.participantes || [],
    }

    if (editingIdeia) {
      setIdeias(ideias.map(i => i.id === editingIdeia.id ? novaIdeia : i))
    } else {
      setIdeias([...ideias, novaIdeia])
    }

    setIsModalOpen(false)
    setEditingIdeia(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta ideia?')) {
      setIdeias(ideias.filter(i => i.id !== id))
    }
  }

  const handleVotar = (id: string) => {
    setIdeias(ideias.map(i => 
      i.id === id ? { ...i, votos: i.votos + 1 } : i
    ))
  }

  const ideiasFiltradas = ideias.filter(ideia => {
    const matchStatus = filtroStatus === '' || ideia.status === filtroStatus
    const matchCategoria = filtroCategoria === '' || ideia.categoria === filtroCategoria
    return matchStatus && matchCategoria
  })

  const getStatusColor = (status: IdeiaBrainstorm['status']) => {
    switch (status) {
      case 'Nova':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/20'
      case 'Em Análise':
        return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'
      case 'Aprovada':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
      case 'Rejeitada':
        return 'bg-red-500/15 text-red-400 border-red-500/20'
      case 'Implementada':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/20'
      default:
        return 'bg-gray-500/15 text-gray-400 border-gray-500/20'
    }
  }

  const getPrioridadeColor = (prioridade: IdeiaBrainstorm['prioridade']) => {
    switch (prioridade) {
      case 'Alta':
        return 'text-red-400'
      case 'Média':
        return 'text-yellow-400'
      case 'Baixa':
        return 'text-blue-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Brainstorm</h1>
            <p className="text-gray-400">Compartilhe e desenvolva ideias em equipe</p>
          </div>
          <Button
            onClick={() => {
              setEditingIdeia(null)
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Nova Ideia
          </Button>
        </div>

        {/* Filtros */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-4 py-2 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
            >
              <option value="">Todos os Status</option>
              <option value="Nova">Nova</option>
              <option value="Em Análise">Em Análise</option>
              <option value="Aprovada">Aprovada</option>
              <option value="Rejeitada">Rejeitada</option>
              <option value="Implementada">Implementada</option>
            </select>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="px-4 py-2 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
            >
              <option value="">Todas as Categorias</option>
              <option value="Produto">Produto</option>
              <option value="Processo">Processo</option>
              <option value="Marketing">Marketing</option>
              <option value="Tecnologia">Tecnologia</option>
              <option value="Vendas">Vendas</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
        </div>

        {/* Lista de Ideias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideiasFiltradas.length > 0 ? (
            ideiasFiltradas.map((ideia) => (
              <div
                key={ideia.id}
                className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6 hover:border-accent-electric/30 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-2">{ideia.titulo}</h3>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-3">{ideia.descricao}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingIdeia(ideia)
                        setIsModalOpen(true)
                      }}
                      className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ideia.id)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`px-2.5 py-1 rounded-lg font-semibold border ${getStatusColor(ideia.status)}`}>
                      {ideia.status}
                    </span>
                    <span className={`font-semibold ${getPrioridadeColor(ideia.prioridade)}`}>
                      {ideia.prioridade}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{ideia.autor}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(ideia.dataCriacao).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-card-border/50">
                    <span className="text-xs text-gray-400">{ideia.categoria}</span>
                    <button
                      onClick={() => handleVotar(ideia.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-accent-electric/10 hover:bg-accent-electric/20 rounded-lg transition-colors text-accent-electric text-sm font-semibold"
                    >
                      <Lightbulb className="w-3 h-3" />
                      {ideia.votos}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16 bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl">
              <Lightbulb className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhuma ideia encontrada</p>
              <p className="text-gray-500 text-sm mt-1">Comece compartilhando sua primeira ideia</p>
            </div>
          )}
        </div>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingIdeia(null)
          }}
          title={editingIdeia ? 'Editar Ideia' : 'Nova Ideia'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Título *
              </label>
              <input
                type="text"
                name="titulo"
                required
                defaultValue={editingIdeia?.titulo}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição *
              </label>
              <textarea
                name="descricao"
                required
                defaultValue={editingIdeia?.descricao}
                rows={4}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Autor *
                </label>
                <input
                  type="text"
                  name="autor"
                  required
                  defaultValue={editingIdeia?.autor}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Categoria *
                </label>
                <select
                  name="categoria"
                  required
                  defaultValue={editingIdeia?.categoria}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="">Selecione</option>
                  <option value="Produto">Produto</option>
                  <option value="Processo">Processo</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Tecnologia">Tecnologia</option>
                  <option value="Vendas">Vendas</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prioridade
              </label>
              <select
                name="prioridade"
                defaultValue={editingIdeia?.prioridade || 'Média'}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingIdeia ? 'Salvar Alterações' : 'Criar Ideia'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingIdeia(null)
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  )
}

