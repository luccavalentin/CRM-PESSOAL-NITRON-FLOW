'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { Plus, Moon, Calendar, Trash2, Edit2, Clock, TrendingUp } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface RegistroSono {
  id: string
  data: string
  horaDormir: string
  horaAcordar: string
  qualidade: 'Excelente' | 'Boa' | 'Regular' | 'Ruim'
  observacoes?: string
}

export default function SonoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRegistro, setEditingRegistro] = useState<RegistroSono | null>(null)
  const [registros, setRegistros] = useState<RegistroSono[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('sono-pessoal')
    if (saved) {
      setRegistros(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('sono-pessoal', JSON.stringify(registros))
  }, [registros])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novoRegistro: RegistroSono = {
      id: editingRegistro?.id || uuidv4(),
      data: formData.get('data') as string,
      horaDormir: formData.get('horaDormir') as string,
      horaAcordar: formData.get('horaAcordar') as string,
      qualidade: (formData.get('qualidade') as RegistroSono['qualidade']) || 'Boa',
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

  const calcularHorasSono = (horaDormir: string, horaAcordar: string) => {
    const [hDormir, mDormir] = horaDormir.split(':').map(Number)
    const [hAcordar, mAcordar] = horaAcordar.split(':').map(Number)
    const dormir = hDormir * 60 + mDormir
    const acordar = hAcordar * 60 + mAcordar
    let diff = acordar - dormir
    if (diff < 0) diff += 24 * 60
    return Math.floor(diff / 60) + (diff % 60) / 60
  }

  const registrosSemana = registros.filter(r => {
    const dataRegistro = new Date(r.data)
    const hoje = new Date()
    const diffTime = Math.abs(hoje.getTime() - dataRegistro.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  })
  const horasMedias = registrosSemana.length > 0
    ? (registrosSemana.reduce((acc, r) => acc + calcularHorasSono(r.horaDormir, r.horaAcordar), 0) / registrosSemana.length).toFixed(1)
    : '0'

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Sono</h1>
            <p className="text-gray-400">Acompanhe a qualidade do seu sono</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            title="Registros Esta Semana"
            value={registrosSemana.length}
            icon={Moon}
          />
          <StatCard
            title="Média de Horas"
            value={`${horasMedias}h`}
            icon={Clock}
            valueColor="text-emerald-400"
          />
        </div>

        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Moon className="w-5 h-5 text-accent-electric" />
            Histórico de Sono
          </h2>
          {registros.length > 0 ? (
            <div className="space-y-3">
              {registros
                .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                .map((registro) => {
                  const horasSono = calcularHorasSono(registro.horaDormir, registro.horaAcordar)
                  
                  return (
                    <div
                      key={registro.id}
                      className="p-5 bg-dark-black/50 border border-card-border/50 rounded-xl hover:border-accent-electric/30 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-white font-semibold text-lg">
                              {new Date(registro.data).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </h3>
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                              registro.qualidade === 'Excelente'
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                                : registro.qualidade === 'Boa'
                                ? 'bg-blue-500/15 text-blue-400 border-blue-500/20'
                                : registro.qualidade === 'Regular'
                                ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'
                                : 'bg-red-500/15 text-red-400 border-red-500/20'
                            }`}>
                              {registro.qualidade}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                            <div className="flex items-center gap-1">
                              <Moon className="w-4 h-4" />
                              <span>Dormiu: {registro.horaDormir}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>Acordou: {registro.horaAcordar}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              <span>{horasSono.toFixed(1)}h de sono</span>
                            </div>
                          </div>
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
                  )
                })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Moon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
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
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data *
              </label>
              <input
                type="date"
                name="data"
                required
                defaultValue={editingRegistro?.data || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hora de Dormir *
                </label>
                <input
                  type="time"
                  name="horaDormir"
                  required
                  defaultValue={editingRegistro?.horaDormir}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hora de Acordar *
                </label>
                <input
                  type="time"
                  name="horaAcordar"
                  required
                  defaultValue={editingRegistro?.horaAcordar}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Qualidade do Sono
              </label>
              <select
                name="qualidade"
                defaultValue={editingRegistro?.qualidade || 'Boa'}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              >
                <option value="Excelente">Excelente</option>
                <option value="Boa">Boa</option>
                <option value="Regular">Regular</option>
                <option value="Ruim">Ruim</option>
              </select>
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
                {editingRegistro ? 'Salvar Alterações' : 'Adicionar Registro'}
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

