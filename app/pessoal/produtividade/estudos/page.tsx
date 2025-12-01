'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { Plus, BookOpen, CheckCircle2, Clock, Trash2, Edit2, Play } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface Aula {
  id: string
  titulo: string
  materia: string
  urlVideo?: string
  duracao: number
  status: 'Não iniciada' | 'Em andamento' | 'Concluída'
  dataInicio?: string
  dataConclusao?: string
  notas?: string
}

export default function EstudosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAula, setEditingAula] = useState<Aula | null>(null)
  const [aulas, setAulas] = useState<Aula[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('aulas-estudos-pessoal')
    if (saved) {
      setAulas(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('aulas-estudos-pessoal', JSON.stringify(aulas))
  }, [aulas])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novaAula: Aula = {
      id: editingAula?.id || uuidv4(),
      titulo: formData.get('titulo') as string,
      materia: formData.get('materia') as string,
      urlVideo: formData.get('urlVideo') as string || undefined,
      duracao: parseInt(formData.get('duracao') as string),
      status: editingAula?.status || 'Não iniciada',
      dataInicio: editingAula?.dataInicio,
      dataConclusao: editingAula?.dataConclusao,
      notas: formData.get('notas') as string || undefined,
    }

    if (editingAula) {
      setAulas(aulas.map(a => a.id === editingAula.id ? novaAula : a))
    } else {
      setAulas([...aulas, novaAula])
    }

    setIsModalOpen(false)
    setEditingAula(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta aula?')) {
      setAulas(aulas.filter(a => a.id !== id))
    }
  }

  const handleStatusChange = (id: string, novoStatus: Aula['status']) => {
    setAulas(aulas.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: novoStatus,
          dataInicio: novoStatus === 'Em andamento' && !a.dataInicio ? new Date().toISOString().split('T')[0] : a.dataInicio,
          dataConclusao: novoStatus === 'Concluída' ? new Date().toISOString().split('T')[0] : a.dataConclusao,
        }
      }
      return a
    }))
  }

  const aulasConcluidas = aulas.filter(a => a.status === 'Concluída').length
  const totalHoras = aulas.reduce((acc, a) => acc + a.duracao, 0)
  const horasEstudadas = aulas.filter(a => a.status === 'Concluída').reduce((acc, a) => acc + a.duracao, 0)

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Estudos</h1>
            <p className="text-gray-400">Gerencie seus estudos e aulas</p>
          </div>
          <Button
            onClick={() => {
              setEditingAula(null)
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Nova Aula
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total de Aulas"
            value={aulas.length}
            icon={BookOpen}
          />
          <StatCard
            title="Aulas Concluídas"
            value={aulasConcluidas}
            icon={CheckCircle2}
            valueColor="text-emerald-400"
          />
          <StatCard
            title="Horas Estudadas"
            value={`${horasEstudadas}h`}
            icon={Clock}
            valueColor="text-accent-electric"
          />
        </div>

        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent-electric" />
            Todas as Aulas
          </h2>
          {aulas.length > 0 ? (
            <div className="space-y-3">
              {aulas.map((aula) => (
                <div
                  key={aula.id}
                  className="p-5 bg-dark-black/50 border border-card-border/50 rounded-xl hover:border-accent-electric/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold text-lg">{aula.titulo}</h3>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                          aula.status === 'Concluída' 
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' 
                            : aula.status === 'Em andamento'
                            ? 'bg-blue-500/15 text-blue-400 border-blue-500/20'
                            : 'bg-gray-500/15 text-gray-400 border-gray-500/20'
                        }`}>
                          {aula.status}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-accent-electric/15 text-accent-electric border border-accent-electric/20">
                          {aula.materia}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{aula.duracao} minutos</span>
                        </div>
                        {aula.dataInicio && (
                          <span>Iniciada em {new Date(aula.dataInicio).toLocaleDateString('pt-BR')}</span>
                        )}
                        {aula.dataConclusao && (
                          <span>Concluída em {new Date(aula.dataConclusao).toLocaleDateString('pt-BR')}</span>
                        )}
                      </div>
                      {aula.notas && (
                        <p className="text-sm text-gray-400 mb-3">{aula.notas}</p>
                      )}
                      {aula.urlVideo && (
                        <a
                          href={aula.urlVideo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-accent-electric hover:text-accent-cyan transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          Assistir vídeo
                        </a>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <select
                        value={aula.status}
                        onChange={(e) => handleStatusChange(aula.id, e.target.value as Aula['status'])}
                        className="px-3 py-1.5 bg-card-bg border border-card-border rounded-lg text-white text-xs focus:outline-none focus:border-accent-electric"
                      >
                        <option value="Não iniciada">Não iniciada</option>
                        <option value="Em andamento">Em andamento</option>
                        <option value="Concluída">Concluída</option>
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingAula(aula)
                            setIsModalOpen(true)
                          }}
                          className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(aula.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhuma aula cadastrada</p>
              <p className="text-gray-500 text-sm mt-1">Comece adicionando suas aulas</p>
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingAula(null)
          }}
          title={editingAula ? 'Editar Aula' : 'Nova Aula'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Título da Aula *
              </label>
              <input
                type="text"
                name="titulo"
                required
                defaultValue={editingAula?.titulo}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Matéria *
                </label>
                <input
                  type="text"
                  name="materia"
                  required
                  defaultValue={editingAula?.materia}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duração (minutos) *
                </label>
                <input
                  type="number"
                  name="duracao"
                  required
                  min="1"
                  defaultValue={editingAula?.duracao}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                URL do Vídeo
              </label>
              <input
                type="url"
                name="urlVideo"
                defaultValue={editingAula?.urlVideo}
                placeholder="https://..."
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notas
              </label>
              <textarea
                name="notas"
                defaultValue={editingAula?.notas}
                rows={3}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingAula ? 'Salvar Alterações' : 'Criar Aula'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingAula(null)
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

