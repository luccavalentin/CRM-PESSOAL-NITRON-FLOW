'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { Plus, Star, Trash2, Edit2, Calendar } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface RegistroAstrologia {
  id: string
  data: string
  tipo: 'Lua Nova' | 'Lua Cheia' | 'Eclipse' | 'Retrogradação' | 'Outro'
  signo: string
  descricao: string
  observacoes?: string
}

export default function AstrologiaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRegistro, setEditingRegistro] = useState<RegistroAstrologia | null>(null)
  const [registros, setRegistros] = useState<RegistroAstrologia[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('astrologia-pessoal')
    if (saved) {
      setRegistros(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('astrologia-pessoal', JSON.stringify(registros))
  }, [registros])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novoRegistro: RegistroAstrologia = {
      id: editingRegistro?.id || uuidv4(),
      data: formData.get('data') as string,
      tipo: (formData.get('tipo') as RegistroAstrologia['tipo']) || 'Outro',
      signo: formData.get('signo') as string,
      descricao: formData.get('descricao') as string,
      observacoes: formData.get('observacoes') as string || undefined,
    }

    if (editingRegistro) {
      setRegistros(registros.map(r => r.id === editingRegistro.id ? novoRegistro : r))
    } else {
      setRegistros([...registros, novoRegistro])
    }

    setIsModalOpen(false)
    setEditingRegistro(null)
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Astrologia</h1>
            <p className="text-gray-400">Registre eventos astrológicos e observações</p>
          </div>
          <Button
            onClick={() => {
              setEditingRegistro(null)
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Novo Registro
          </Button>
        </div>

        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-accent-electric" />
            Registros Astrológicos
          </h2>
          {registros.length > 0 ? (
            <div className="space-y-3">
              {registros
                .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                .map((registro) => (
                  <div
                    key={registro.id}
                    className="p-5 bg-dark-black/50 border border-card-border/50 rounded-xl hover:border-accent-electric/30 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold text-lg">{registro.tipo}</h3>
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-accent-electric/15 text-accent-electric border border-accent-electric/20">
                            {registro.signo}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/20">
                            {new Date(registro.data).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{registro.descricao}</p>
                        {registro.observacoes && (
                          <p className="text-sm text-gray-400">{registro.observacoes}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => {
                            setEditingRegistro(registro)
                            setIsModalOpen(true)
                          }}
                          className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir este registro?')) {
                              setRegistros(registros.filter(r => r.id !== registro.id))
                            }
                          }}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhum registro cadastrado</p>
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingRegistro(null)
          }}
          title={editingRegistro ? 'Editar Registro' : 'Novo Registro'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data *
                </label>
                <input
                  type="date"
                  name="data"
                  required
                  defaultValue={editingRegistro?.data}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo *
                </label>
                <select
                  name="tipo"
                  required
                  defaultValue={editingRegistro?.tipo}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="Lua Nova">Lua Nova</option>
                  <option value="Lua Cheia">Lua Cheia</option>
                  <option value="Eclipse">Eclipse</option>
                  <option value="Retrogradação">Retrogradação</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Signo *
              </label>
              <select
                name="signo"
                required
                defaultValue={editingRegistro?.signo}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              >
                <option value="">Selecione</option>
                <option value="Áries">Áries</option>
                <option value="Touro">Touro</option>
                <option value="Gêmeos">Gêmeos</option>
                <option value="Câncer">Câncer</option>
                <option value="Leão">Leão</option>
                <option value="Virgem">Virgem</option>
                <option value="Libra">Libra</option>
                <option value="Escorpião">Escorpião</option>
                <option value="Sagitário">Sagitário</option>
                <option value="Capricórnio">Capricórnio</option>
                <option value="Aquário">Aquário</option>
                <option value="Peixes">Peixes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição *
              </label>
              <textarea
                name="descricao"
                required
                rows={4}
                defaultValue={editingRegistro?.descricao}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Observações
              </label>
              <textarea
                name="observacoes"
                defaultValue={editingRegistro?.observacoes}
                rows={2}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingRegistro ? 'Salvar Alterações' : 'Criar Registro'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingRegistro(null)
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

