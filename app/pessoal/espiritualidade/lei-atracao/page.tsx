'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { Plus, Sparkles, Trash2, Edit2, Calendar } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface Afirmacao {
  id: string
  texto: string
  categoria: string
  dataCriacao: string
  frequencia: number
  status: 'Ativa' | 'Arquivada'
}

export default function LeiAtracaoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAfirmacao, setEditingAfirmacao] = useState<Afirmacao | null>(null)
  const [afirmacoes, setAfirmacoes] = useState<Afirmacao[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('lei-atracao-pessoal')
    if (saved) {
      setAfirmacoes(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('lei-atracao-pessoal', JSON.stringify(afirmacoes))
  }, [afirmacoes])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novaAfirmacao: Afirmacao = {
      id: editingAfirmacao?.id || uuidv4(),
      texto: formData.get('texto') as string,
      categoria: formData.get('categoria') as string,
      dataCriacao: editingAfirmacao?.dataCriacao || new Date().toISOString().split('T')[0],
      frequencia: parseInt(formData.get('frequencia') as string) || 1,
      status: (formData.get('status') as Afirmacao['status']) || 'Ativa',
    }

    if (editingAfirmacao) {
      setAfirmacoes(afirmacoes.map(a => a.id === editingAfirmacao.id ? novaAfirmacao : a))
    } else {
      setAfirmacoes([...afirmacoes, novaAfirmacao])
    }

    setIsModalOpen(false)
    setEditingAfirmacao(null)
  }

  const afirmacoesAtivas = afirmacoes.filter(a => a.status === 'Ativa')

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Lei da Atração</h1>
            <p className="text-gray-400">Afirmações e manifestações</p>
          </div>
          <Button
            onClick={() => {
              setEditingAfirmacao(null)
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Nova Afirmação
          </Button>
        </div>

        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-electric" />
            Afirmações Ativas
          </h2>
          {afirmacoesAtivas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {afirmacoesAtivas.map((afirmacao) => (
                <div
                  key={afirmacao.id}
                  className="p-5 bg-gradient-to-br from-accent-electric/10 to-accent-cyan/5 border border-accent-electric/20 rounded-xl hover:border-accent-electric/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-white font-semibold text-lg mb-2">{afirmacao.texto}</p>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-accent-electric/15 text-accent-electric border border-accent-electric/20">
                        {afirmacao.categoria}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingAfirmacao(afirmacao)
                          setIsModalOpen(true)
                        }}
                        className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Tem certeza que deseja excluir esta afirmação?')) {
                            setAfirmacoes(afirmacoes.filter(a => a.id !== afirmacao.id))
                          }
                        }}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Criada em {new Date(afirmacao.dataCriacao).toLocaleDateString('pt-BR')}</span>
                    <span>•</span>
                    <span>Frequência: {afirmacao.frequencia}x/dia</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhuma afirmação cadastrada</p>
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingAfirmacao(null)
          }}
          title={editingAfirmacao ? 'Editar Afirmação' : 'Nova Afirmação'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Afirmação *
              </label>
              <textarea
                name="texto"
                required
                rows={4}
                defaultValue={editingAfirmacao?.texto}
                placeholder="Ex: Eu sou bem-sucedido e próspero..."
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Categoria *
                </label>
                <input
                  type="text"
                  name="categoria"
                  required
                  defaultValue={editingAfirmacao?.categoria}
                  placeholder="Ex: Prosperidade, Saúde, Amor..."
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Frequência (vezes/dia)
                </label>
                <input
                  type="number"
                  name="frequencia"
                  min="1"
                  defaultValue={editingAfirmacao?.frequencia || 1}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                defaultValue={editingAfirmacao?.status || 'Ativa'}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              >
                <option value="Ativa">Ativa</option>
                <option value="Arquivada">Arquivada</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingAfirmacao ? 'Salvar Alterações' : 'Criar Afirmação'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingAfirmacao(null)
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

