'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { Plus, BookOpen, CheckCircle2, Clock, Trash2, Edit2, Star } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface Livro {
  id: string
  titulo: string
  autor: string
  genero: string
  status: 'Quero Ler' | 'Lendo' | 'Lido' | 'Abandonado'
  dataInicio?: string
  dataFim?: string
  nota?: number
  resenha?: string
}

export default function LivrosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLivro, setEditingLivro] = useState<Livro | null>(null)
  const [livros, setLivros] = useState<Livro[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('livros-pessoal')
    if (saved) {
      setLivros(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('livros-pessoal', JSON.stringify(livros))
  }, [livros])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novoLivro: Livro = {
      id: editingLivro?.id || uuidv4(),
      titulo: formData.get('titulo') as string,
      autor: formData.get('autor') as string,
      genero: formData.get('genero') as string,
      status: (formData.get('status') as Livro['status']) || 'Quero Ler',
      dataInicio: formData.get('dataInicio') as string || undefined,
      dataFim: formData.get('dataFim') as string || undefined,
      nota: formData.get('nota') ? parseInt(formData.get('nota') as string) : undefined,
      resenha: formData.get('resenha') as string || undefined,
    }

    if (editingLivro) {
      setLivros(livros.map(l => l.id === editingLivro.id ? novoLivro : l))
    } else {
      setLivros([...livros, novoLivro])
    }

    setIsModalOpen(false)
    setEditingLivro(null)
  }

  const livrosLidos = livros.filter(l => l.status === 'Lido').length
  const livrosLendo = livros.filter(l => l.status === 'Lendo').length
  const notaMedia = livros.filter(l => l.nota).length > 0
    ? (livros.filter(l => l.nota).reduce((acc, l) => acc + (l.nota || 0), 0) / livros.filter(l => l.nota).length).toFixed(1)
    : '0'

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Livros</h1>
            <p className="text-gray-400">Gerencie sua biblioteca pessoal</p>
          </div>
          <Button
            onClick={() => {
              setEditingLivro(null)
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Novo Livro
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Livros Lidos"
            value={livrosLidos}
            icon={CheckCircle2}
            valueColor="text-emerald-400"
          />
          <StatCard
            title="Lendo Agora"
            value={livrosLendo}
            icon={BookOpen}
            valueColor="text-blue-400"
          />
          <StatCard
            title="Nota Média"
            value={`${notaMedia}/5`}
            icon={Star}
            valueColor="text-yellow-400"
          />
        </div>

        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent-electric" />
            Todos os Livros
          </h2>
          {livros.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {livros.map((livro) => (
                <div
                  key={livro.id}
                  className="p-5 bg-dark-black/50 border border-card-border/50 rounded-xl hover:border-accent-electric/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-1">{livro.titulo}</h3>
                      <p className="text-gray-400 text-sm mb-2">por {livro.autor}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                          livro.status === 'Lido' 
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' 
                            : livro.status === 'Lendo'
                            ? 'bg-blue-500/15 text-blue-400 border-blue-500/20'
                            : livro.status === 'Quero Ler'
                            ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'
                            : 'bg-gray-500/15 text-gray-400 border-gray-500/20'
                        }`}>
                          {livro.status}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-accent-electric/15 text-accent-electric border border-accent-electric/20">
                          {livro.genero}
                        </span>
                        {livro.nota && (
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="text-xs font-semibold">{livro.nota}/5</span>
                          </div>
                        )}
                      </div>
                      {livro.dataInicio && (
                        <p className="text-xs text-gray-500 mb-1">
                          Início: {new Date(livro.dataInicio).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                      {livro.dataFim && (
                        <p className="text-xs text-gray-500">
                          Fim: {new Date(livro.dataFim).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingLivro(livro)
                          setIsModalOpen(true)
                        }}
                        className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Tem certeza que deseja excluir este livro?')) {
                            setLivros(livros.filter(l => l.id !== livro.id))
                          }
                        }}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {livro.resenha && (
                    <p className="text-sm text-gray-400 mt-3 line-clamp-2">{livro.resenha}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhum livro cadastrado</p>
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingLivro(null)
          }}
          title={editingLivro ? 'Editar Livro' : 'Novo Livro'}
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
                defaultValue={editingLivro?.titulo}
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
                  defaultValue={editingLivro?.autor}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gênero *
                </label>
                <input
                  type="text"
                  name="genero"
                  required
                  defaultValue={editingLivro?.genero}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={editingLivro?.status || 'Quero Ler'}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="Quero Ler">Quero Ler</option>
                  <option value="Lendo">Lendo</option>
                  <option value="Lido">Lido</option>
                  <option value="Abandonado">Abandonado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nota (1-5)
                </label>
                <input
                  type="number"
                  name="nota"
                  min="1"
                  max="5"
                  defaultValue={editingLivro?.nota}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data Início
                </label>
                <input
                  type="date"
                  name="dataInicio"
                  defaultValue={editingLivro?.dataInicio}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data Fim
                </label>
                <input
                  type="date"
                  name="dataFim"
                  defaultValue={editingLivro?.dataFim}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Resenha
              </label>
              <textarea
                name="resenha"
                defaultValue={editingLivro?.resenha}
                rows={3}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingLivro ? 'Salvar Alterações' : 'Adicionar Livro'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingLivro(null)
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

