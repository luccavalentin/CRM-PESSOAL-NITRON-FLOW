'use client'

import { useState, useEffect, useMemo } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { Plus, BookOpen, CheckCircle2, Clock, Trash2, Edit2, Play, FolderOpen, FileText, ChevronDown, ChevronRight, Layers, BarChart3, PieChart as PieChartIcon } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts'

const COLORS = ['#00D9FF', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

interface Aula {
  id: string
  titulo: string
  urlVideo?: string
  duracao: number
  status: 'Não iniciada' | 'Em andamento' | 'Concluída'
  dataInicio?: string
  dataConclusao?: string
  notas?: string
}

interface Materia {
  id: string
  nome: string
  descricao?: string
  aulas: Aula[]
}

interface Tema {
  id: string
  nome: string
  descricao?: string
  materias: Materia[]
}

export default function EstudosPage() {
  const [isTemaModalOpen, setIsTemaModalOpen] = useState(false)
  const [isMateriaModalOpen, setIsMateriaModalOpen] = useState(false)
  const [isAulaModalOpen, setIsAulaModalOpen] = useState(false)
  const [editingTema, setEditingTema] = useState<Tema | null>(null)
  const [editingMateria, setEditingMateria] = useState<{ temaId: string; materia: Materia } | null>(null)
  const [editingAula, setEditingAula] = useState<{ temaId: string; materiaId: string; aula: Aula } | null>(null)
  const [temas, setTemas] = useState<Tema[]>([])
  const [expandedTemas, setExpandedTemas] = useState<Set<string>>(new Set())
  const [expandedMaterias, setExpandedMaterias] = useState<Set<string>>(new Set())

  useEffect(() => {
    const saved = localStorage.getItem('estudos-hierarquia')
    if (saved) {
      setTemas(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('estudos-hierarquia', JSON.stringify(temas))
  }, [temas])

  const toggleTema = (temaId: string) => {
    const newExpanded = new Set(expandedTemas)
    if (newExpanded.has(temaId)) {
      newExpanded.delete(temaId)
    } else {
      newExpanded.add(temaId)
    }
    setExpandedTemas(newExpanded)
  }

  const toggleMateria = (materiaId: string) => {
    const newExpanded = new Set(expandedMaterias)
    if (newExpanded.has(materiaId)) {
      newExpanded.delete(materiaId)
    } else {
      newExpanded.add(materiaId)
    }
    setExpandedMaterias(newExpanded)
  }

  // Handlers para Tema
  const handleSubmitTema = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novoTema: Tema = {
      id: editingTema?.id || uuidv4(),
      nome: (formData.get('nome') as string) || 'Sem nome',
      descricao: formData.get('descricao') as string || undefined,
      materias: editingTema?.materias || [],
    }

    if (editingTema) {
      setTemas(temas.map(t => t.id === editingTema.id ? novoTema : t))
    } else {
      setTemas([...temas, novoTema])
    }

    setIsTemaModalOpen(false)
    setEditingTema(null)
  }

  const handleDeleteTema = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este tema? Todas as matérias e aulas serão excluídas.')) {
      setTemas(temas.filter(t => t.id !== id))
    }
  }

  // Handlers para Matéria
  const handleSubmitMateria = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingMateria) return
    
    const formData = new FormData(e.currentTarget)
    
    const novaMateria: Materia = {
      id: editingMateria.materia.id || uuidv4(),
      nome: (formData.get('nome') as string) || 'Sem nome',
      descricao: formData.get('descricao') as string || undefined,
      aulas: editingMateria.materia.aulas || [],
    }

    setTemas(temas.map(tema => {
      if (tema.id === editingMateria.temaId) {
        if (editingMateria.materia.id) {
          // Editar matéria existente
          return {
            ...tema,
            materias: tema.materias.map(m => m.id === editingMateria.materia.id ? novaMateria : m)
          }
        } else {
          // Adicionar nova matéria
          return {
            ...tema,
            materias: [...tema.materias, novaMateria]
          }
        }
      }
      return tema
    }))

    setIsMateriaModalOpen(false)
    setEditingMateria(null)
  }

  const handleDeleteMateria = (temaId: string, materiaId: string) => {
    if (confirm('Tem certeza que deseja excluir esta matéria? Todas as aulas serão excluídas.')) {
      setTemas(temas.map(tema => {
        if (tema.id === temaId) {
          return {
            ...tema,
            materias: tema.materias.filter(m => m.id !== materiaId)
          }
        }
        return tema
      }))
    }
  }

  // Handlers para Aula
  const handleSubmitAula = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingAula) return
    
    const formData = new FormData(e.currentTarget)
    
    const novaAula: Aula = {
      id: editingAula.aula.id || uuidv4(),
      titulo: (formData.get('titulo') as string) || 'Sem título',
      urlVideo: formData.get('urlVideo') as string || undefined,
      duracao: parseInt(formData.get('duracao') as string) || 0,
      status: editingAula.aula.status || 'Não iniciada',
      dataInicio: editingAula.aula.dataInicio,
      dataConclusao: editingAula.aula.dataConclusao,
      notas: formData.get('notas') as string || undefined,
    }

    setTemas(temas.map(tema => {
      if (tema.id === editingAula.temaId) {
        return {
          ...tema,
          materias: tema.materias.map(materia => {
            if (materia.id === editingAula.materiaId) {
              if (editingAula.aula.id) {
                // Editar aula existente
                return {
                  ...materia,
                  aulas: materia.aulas.map(a => a.id === editingAula.aula.id ? novaAula : a)
                }
              } else {
                // Adicionar nova aula
                return {
                  ...materia,
                  aulas: [...materia.aulas, novaAula]
                }
              }
            }
            return materia
          })
        }
      }
      return tema
    }))

    setIsAulaModalOpen(false)
    setEditingAula(null)
  }

  const handleDeleteAula = (temaId: string, materiaId: string, aulaId: string) => {
    if (confirm('Tem certeza que deseja excluir esta aula?')) {
      setTemas(temas.map(tema => {
        if (tema.id === temaId) {
          return {
            ...tema,
            materias: tema.materias.map(materia => {
              if (materia.id === materiaId) {
                return {
                  ...materia,
                  aulas: materia.aulas.filter(a => a.id !== aulaId)
                }
              }
              return materia
            })
          }
        }
        return tema
      }))
    }
  }

  const handleStatusChange = (temaId: string, materiaId: string, aulaId: string, novoStatus: Aula['status']) => {
    setTemas(temas.map(tema => {
      if (tema.id === temaId) {
        return {
          ...tema,
          materias: tema.materias.map(materia => {
            if (materia.id === materiaId) {
              return {
                ...materia,
                aulas: materia.aulas.map(aula => {
                  if (aula.id === aulaId) {
                    return {
                      ...aula,
                      status: novoStatus,
                      dataInicio: novoStatus === 'Em andamento' && !aula.dataInicio ? new Date().toISOString().split('T')[0] : aula.dataInicio,
                      dataConclusao: novoStatus === 'Concluída' ? new Date().toISOString().split('T')[0] : aula.dataConclusao,
                    }
                  }
                  return aula
                })
              }
            }
            return materia
          })
        }
      }
      return tema
    }))
  }

  // Estatísticas
  const totalAulas = temas.reduce((acc, tema) => 
    acc + tema.materias.reduce((acc2, materia) => acc2 + materia.aulas.length, 0), 0
  )
  const aulasConcluidas = temas.reduce((acc, tema) => 
    acc + tema.materias.reduce((acc2, materia) => 
      acc2 + materia.aulas.filter(a => a.status === 'Concluída').length, 0), 0
  )
  const totalHoras = temas.reduce((acc, tema) => 
    acc + tema.materias.reduce((acc2, materia) => 
      acc2 + materia.aulas.reduce((acc3, aula) => acc3 + aula.duracao, 0), 0), 0
  )
  const horasEstudadas = temas.reduce((acc, tema) => 
    acc + tema.materias.reduce((acc2, materia) => 
      acc2 + materia.aulas.filter(a => a.status === 'Concluída').reduce((acc3, aula) => acc3 + aula.duracao, 0), 0), 0
  )

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Estudos</h1>
            <p className="text-gray-400">Gerencie seus estudos por Tema, Matéria e Aula</p>
          </div>
          <Button
            onClick={() => {
              setEditingTema(null)
              setIsTemaModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Novo Tema
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Temas"
            value={temas.length}
            icon={Layers}
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20"
          />
          <StatCard
            title="Total de Aulas"
            value={totalAulas}
            icon={BookOpen}
            className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20"
          />
          <StatCard
            title="Aulas Concluídas"
            value={aulasConcluidas}
            icon={CheckCircle2}
            valueColor="text-emerald-400"
            className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20"
          />
          <StatCard
            title="Horas Estudadas"
            value={`${Math.round(horasEstudadas / 60)}h`}
            icon={Clock}
            valueColor="text-accent-electric"
            className="bg-gradient-to-br from-accent-electric/10 to-accent-cyan/5 border-accent-electric/20"
          />
        </div>

        {/* Gráficos */}
        {temas.length > 0 && totalAulas > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <PieChartIcon className="w-5 h-5 text-accent-electric" />
                <h3 className="text-lg font-bold text-white">Status das Aulas</h3>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Concluídas', value: aulasConcluidas, color: '#10B981' },
                      { name: 'Em Andamento', value: temas.reduce((acc, tema) => 
                        acc + tema.materias.reduce((acc2, materia) => 
                          acc2 + materia.aulas.filter(a => a.status === 'Em andamento').length, 0), 0), color: '#00D9FF' },
                      { name: 'Não Iniciadas', value: totalAulas - aulasConcluidas - temas.reduce((acc, tema) => 
                        acc + tema.materias.reduce((acc2, materia) => 
                          acc2 + materia.aulas.filter(a => a.status === 'Em andamento').length, 0), 0), color: '#6B7280' },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Concluídas', value: aulasConcluidas, color: '#10B981' },
                      { name: 'Em Andamento', value: temas.reduce((acc, tema) => 
                        acc + tema.materias.reduce((acc2, materia) => 
                          acc2 + materia.aulas.filter(a => a.status === 'Em andamento').length, 0), 0), color: '#00D9FF' },
                      { name: 'Não Iniciadas', value: totalAulas - aulasConcluidas - temas.reduce((acc, tema) => 
                        acc + tema.materias.reduce((acc2, materia) => 
                          acc2 + materia.aulas.filter(a => a.status === 'Em andamento').length, 0), 0), color: '#6B7280' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-accent-electric" />
                <h3 className="text-lg font-bold text-white">Aulas por Tema</h3>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={temas.map(tema => ({
                  nome: tema.nome.length > 12 ? tema.nome.substring(0, 12) + '...' : tema.nome,
                  aulas: tema.materias.reduce((acc, m) => acc + m.aulas.length, 0),
                  concluidas: tema.materias.reduce((acc, m) => 
                    acc + m.aulas.filter(a => a.status === 'Concluída').length, 0),
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="nome" 
                    stroke="#9CA3AF" 
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="aulas" fill="#7C3AED" name="Total" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="concluidas" fill="#10B981" name="Concluídas" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-accent-electric" />
            Estrutura de Estudos
          </h2>
          {temas.length > 0 ? (
            <div className="space-y-3">
              {temas.map((tema) => {
                const totalMaterias = tema.materias.length
                const totalAulasTema = tema.materias.reduce((acc, m) => acc + m.aulas.length, 0)
                const isExpanded = expandedTemas.has(tema.id)
                
                return (
                  <div
                    key={tema.id}
                    className="border border-card-border/50 rounded-xl overflow-hidden"
                  >
                    {/* Header do Tema */}
                    <div
                      className="p-4 bg-dark-black/50 hover:bg-dark-black/70 transition-colors cursor-pointer"
                      onClick={() => toggleTema(tema.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                          <FolderOpen className="w-5 h-5 text-accent-electric" />
                          <div>
                            <h3 className="text-white font-semibold text-lg">{tema.nome}</h3>
                            {tema.descricao && (
                              <p className="text-sm text-gray-400 mt-1">{tema.descricao}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>{totalMaterias} {totalMaterias === 1 ? 'matéria' : 'matérias'}</span>
                              <span>{totalAulasTema} {totalAulasTema === 1 ? 'aula' : 'aulas'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setEditingMateria({ temaId: tema.id, materia: { id: '', nome: '', aulas: [] } })
                              setIsMateriaModalOpen(true)
                            }}
                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Adicionar Matéria"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingTema(tema)
                              setIsTemaModalOpen(true)
                            }}
                            className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTema(tema.id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Matérias do Tema */}
                    {isExpanded && (
                      <div className="p-4 space-y-3 bg-card-bg/30">
                        {tema.materias.length > 0 ? (
                          tema.materias.map((materia) => {
                            const isMateriaExpanded = expandedMaterias.has(materia.id)
                            
                            return (
                              <div
                                key={materia.id}
                                className="border border-card-border/30 rounded-lg overflow-hidden bg-dark-black/30"
                              >
                                {/* Header da Matéria */}
                                <div
                                  className="p-3 bg-dark-black/50 hover:bg-dark-black/70 transition-colors cursor-pointer"
                                  onClick={() => toggleMateria(materia.id)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 flex-1">
                                      {isMateriaExpanded ? (
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                      )}
                                      <FileText className="w-4 h-4 text-blue-400" />
                                      <div>
                                        <h4 className="text-white font-medium">{materia.nome}</h4>
                                        {materia.descricao && (
                                          <p className="text-xs text-gray-400 mt-1">{materia.descricao}</p>
                                        )}
                                        <span className="text-xs text-gray-500 mt-1 block">
                                          {materia.aulas.length} {materia.aulas.length === 1 ? 'aula' : 'aulas'}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        onClick={() => {
                                          setEditingAula({ temaId: tema.id, materiaId: materia.id, aula: { id: '', titulo: '', duracao: 0, status: 'Não iniciada' } })
                                          setIsAulaModalOpen(true)
                                        }}
                                        className="p-1.5 text-purple-400 hover:bg-purple-500/10 rounded transition-colors"
                                        title="Adicionar Aula"
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingMateria({ temaId: tema.id, materia })
                                          setIsMateriaModalOpen(true)
                                        }}
                                        className="p-1.5 text-accent-electric hover:bg-accent-electric/10 rounded transition-colors"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteMateria(tema.id, materia.id)}
                                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Aulas da Matéria */}
                                {isMateriaExpanded && (
                                  <div className="p-3 space-y-2 bg-card-bg/20">
                                    {materia.aulas.length > 0 ? (
                                      materia.aulas.map((aula) => (
                                        <div
                                          key={aula.id}
                                          className="p-3 bg-dark-black/50 border border-card-border/20 rounded-lg hover:border-accent-electric/30 transition-all"
                                        >
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-2">
                                                <h5 className="text-white font-medium">{aula.titulo}</h5>
                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                                                  aula.status === 'Concluída' 
                                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' 
                                                    : aula.status === 'Em andamento'
                                                    ? 'bg-blue-500/15 text-blue-400 border-blue-500/20'
                                                    : 'bg-gray-500/15 text-gray-400 border-gray-500/20'
                                                }`}>
                                                  {aula.status}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-4 text-xs text-gray-400 mb-2">
                                                <div className="flex items-center gap-1">
                                                  <Clock className="w-3 h-3" />
                                                  <span>{aula.duracao} min</span>
                                                </div>
                                                {aula.dataInicio && (
                                                  <span>Iniciada: {new Date(aula.dataInicio).toLocaleDateString('pt-BR')}</span>
                                                )}
                                                {aula.dataConclusao && (
                                                  <span>Concluída: {new Date(aula.dataConclusao).toLocaleDateString('pt-BR')}</span>
                                                )}
                                              </div>
                                              {aula.notas && (
                                                <p className="text-xs text-gray-400 mb-2">{aula.notas}</p>
                                              )}
                                              {aula.urlVideo && (
                                                <a
                                                  href={aula.urlVideo}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="inline-flex items-center gap-1 text-xs text-accent-electric hover:text-accent-cyan transition-colors"
                                                >
                                                  <Play className="w-3 h-3" />
                                                  Assistir vídeo
                                                </a>
                                              )}
                                            </div>
                                            <div className="flex flex-col gap-2 ml-4">
                                              <select
                                                value={aula.status}
                                                onChange={(e) => handleStatusChange(tema.id, materia.id, aula.id, e.target.value as Aula['status'])}
                                                className="px-2 py-1 bg-card-bg border border-card-border rounded text-white text-xs focus:outline-none focus:border-accent-electric"
                                              >
                                                <option value="Não iniciada">Não iniciada</option>
                                                <option value="Em andamento">Em andamento</option>
                                                <option value="Concluída">Concluída</option>
                                              </select>
                                              <div className="flex gap-1">
                                                <button
                                                  onClick={() => {
                                                    setEditingAula({ temaId: tema.id, materiaId: materia.id, aula })
                                                    setIsAulaModalOpen(true)
                                                  }}
                                                  className="p-1.5 text-accent-electric hover:bg-accent-electric/10 rounded transition-colors"
                                                >
                                                  <Edit2 className="w-3 h-3" />
                                                </button>
                                                <button
                                                  onClick={() => handleDeleteAula(tema.id, materia.id, aula.id)}
                                                  className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-xs text-gray-500 text-center py-4">Nenhuma aula cadastrada</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })
                        ) : (
                          <p className="text-sm text-gray-400 text-center py-4">Nenhuma matéria cadastrada neste tema</p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Layers className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhum tema cadastrado</p>
              <p className="text-gray-500 text-sm mt-1">Comece criando um tema para organizar seus estudos</p>
            </div>
          )}
        </div>

        {/* Modal de Tema */}
        <Modal
          isOpen={isTemaModalOpen}
          onClose={() => {
            setIsTemaModalOpen(false)
            setEditingTema(null)
          }}
          title={editingTema ? 'Editar Tema' : 'Novo Tema'}
          size="md"
          variant="info"
          icon={Layers}
          description={editingTema ? 'Atualize as informações do tema' : 'Crie um novo tema para organizar seus estudos'}
        >
          <form onSubmit={handleSubmitTema} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome do Tema
              </label>
              <input
                type="text"
                name="nome"
                defaultValue={editingTema?.nome}
                placeholder="Ex: Desenvolvimento Web, Matemática..."
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                name="descricao"
                defaultValue={editingTema?.descricao}
                rows={3}
                placeholder="Descreva o tema..."
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingTema ? 'Salvar Alterações' : 'Criar Tema'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsTemaModalOpen(false)
                  setEditingTema(null)
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal de Matéria */}
        <Modal
          isOpen={isMateriaModalOpen}
          onClose={() => {
            setIsMateriaModalOpen(false)
            setEditingMateria(null)
          }}
          title={editingMateria?.materia.id ? 'Editar Matéria' : 'Nova Matéria'}
          size="md"
          variant="info"
          icon={FileText}
          description={editingMateria?.materia.id ? 'Atualize as informações da matéria' : 'Adicione uma nova matéria ao tema'}
        >
          <form onSubmit={handleSubmitMateria} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome da Matéria
              </label>
              <input
                type="text"
                name="nome"
                defaultValue={editingMateria?.materia.nome}
                placeholder="Ex: React, JavaScript, Álgebra..."
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                name="descricao"
                defaultValue={editingMateria?.materia.descricao}
                rows={3}
                placeholder="Descreva a matéria..."
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingMateria?.materia.id ? 'Salvar Alterações' : 'Criar Matéria'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsMateriaModalOpen(false)
                  setEditingMateria(null)
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal de Aula */}
        <Modal
          isOpen={isAulaModalOpen}
          onClose={() => {
            setIsAulaModalOpen(false)
            setEditingAula(null)
          }}
          title={editingAula?.aula.id ? 'Editar Aula' : 'Nova Aula'}
          size="lg"
          variant="info"
          icon={BookOpen}
          description={editingAula?.aula.id ? 'Atualize as informações da aula' : 'Adicione uma nova aula à matéria'}
        >
          <form onSubmit={handleSubmitAula} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Título da Aula
              </label>
              <input
                type="text"
                name="titulo"
                defaultValue={editingAula?.aula.titulo}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duração (minutos)
                </label>
                <input
                  type="number"
                  name="duracao"
                  min="1"
                  defaultValue={editingAula?.aula.duracao}
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
                defaultValue={editingAula?.aula.urlVideo}
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
                defaultValue={editingAula?.aula.notas}
                rows={3}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingAula?.aula.id ? 'Salvar Alterações' : 'Criar Aula'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsAulaModalOpen(false)
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
