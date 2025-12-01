'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { Plus, Headphones, AlertCircle, CheckCircle2, Clock, Trash2, Edit2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface Ticket {
  id: string
  titulo: string
  descricao: string
  categoria: string
  prioridade: 'Baixa' | 'Média' | 'Alta' | 'Urgente'
  status: 'Aberto' | 'Em Andamento' | 'Resolvido' | 'Fechado'
  solicitante: string
  responsavel?: string
  dataAbertura: string
  dataResolucao?: string
}

export default function SuportePage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('tickets-suporte-empresa')
    if (saved) {
      setTickets(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('tickets-suporte-empresa', JSON.stringify(tickets))
  }, [tickets])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novoTicket: Ticket = {
      id: editingTicket?.id || uuidv4(),
      titulo: formData.get('titulo') as string,
      descricao: formData.get('descricao') as string,
      categoria: formData.get('categoria') as string,
      prioridade: (formData.get('prioridade') as Ticket['prioridade']) || 'Média',
      status: editingTicket?.status || 'Aberto',
      solicitante: formData.get('solicitante') as string,
      responsavel: formData.get('responsavel') as string || undefined,
      dataAbertura: editingTicket?.dataAbertura || new Date().toISOString().split('T')[0],
      dataResolucao: editingTicket?.dataResolucao,
    }

    if (editingTicket) {
      setTickets(tickets.map(t => t.id === editingTicket.id ? novoTicket : t))
    } else {
      setTickets([...tickets, novoTicket])
    }

    setIsModalOpen(false)
    setEditingTicket(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este ticket?')) {
      setTickets(tickets.filter(t => t.id !== id))
    }
  }

  const ticketsAbertos = tickets.filter(t => t.status === 'Aberto').length
  const ticketsResolvidos = tickets.filter(t => t.status === 'Resolvido').length
  const ticketsUrgentes = tickets.filter(t => t.prioridade === 'Urgente' && t.status !== 'Fechado').length

  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'Aberto':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/20'
      case 'Em Andamento':
        return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'
      case 'Resolvido':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
      case 'Fechado':
        return 'bg-gray-500/15 text-gray-400 border-gray-500/20'
      default:
        return 'bg-gray-500/15 text-gray-400 border-gray-500/20'
    }
  }

  const getPrioridadeColor = (prioridade: Ticket['prioridade']) => {
    switch (prioridade) {
      case 'Urgente':
        return 'text-red-400'
      case 'Alta':
        return 'text-orange-400'
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Suporte</h1>
            <p className="text-gray-400">Gerencie tickets de suporte</p>
          </div>
          <Button
            onClick={() => {
              setEditingTicket(null)
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Novo Ticket
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Tickets Abertos"
            value={ticketsAbertos}
            icon={AlertCircle}
            valueColor="text-blue-400"
          />
          <StatCard
            title="Tickets Resolvidos"
            value={ticketsResolvidos}
            icon={CheckCircle2}
            valueColor="text-emerald-400"
          />
          <StatCard
            title="Tickets Urgentes"
            value={ticketsUrgentes}
            icon={Clock}
            valueColor="text-red-400"
          />
        </div>

        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Headphones className="w-5 h-5 text-accent-electric" />
            Todos os Tickets
          </h2>
          {tickets.length > 0 ? (
            <div className="space-y-3">
              {tickets
                .sort((a, b) => new Date(b.dataAbertura).getTime() - new Date(a.dataAbertura).getTime())
                .map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-5 bg-dark-black/50 border border-card-border/50 rounded-xl hover:border-accent-electric/30 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold text-lg">{ticket.titulo}</h3>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                          <span className={`text-xs font-semibold ${getPrioridadeColor(ticket.prioridade)}`}>
                            {ticket.prioridade}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{ticket.descricao}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500">
                          <span>Categoria: {ticket.categoria}</span>
                          <span>Solicitante: {ticket.solicitante}</span>
                          <span>Data: {new Date(ticket.dataAbertura).toLocaleDateString('pt-BR')}</span>
                        </div>
                        {ticket.responsavel && (
                          <p className="text-xs text-gray-400 mt-2">Responsável: {ticket.responsavel}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => {
                            setEditingTicket(ticket)
                            setIsModalOpen(true)
                          }}
                          className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ticket.id)}
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
              <Headphones className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhum ticket registrado</p>
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingTicket(null)
          }}
          title={editingTicket ? 'Editar Ticket' : 'Novo Ticket'}
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
                defaultValue={editingTicket?.titulo}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição *
              </label>
              <textarea
                name="descricao"
                defaultValue={editingTicket?.descricao}
                rows={4}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Categoria *
                </label>
                <select
                  name="categoria"
                  defaultValue={editingTicket?.categoria}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="">Selecione</option>
                  <option value="Técnico">Técnico</option>
                  <option value="Financeiro">Financeiro</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Prioridade
                </label>
                <select
                  name="prioridade"
                  defaultValue={editingTicket?.prioridade || 'Média'}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                  <option value="Urgente">Urgente</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Solicitante *
                </label>
                <input
                  type="text"
                  name="solicitante"
                  defaultValue={editingTicket?.solicitante}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Responsável
                </label>
                <input
                  type="text"
                  name="responsavel"
                  defaultValue={editingTicket?.responsavel}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            {editingTicket && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={editingTicket.status}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="Aberto">Aberto</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Resolvido">Resolvido</option>
                  <option value="Fechado">Fechado</option>
                </select>
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingTicket ? 'Salvar Alterações' : 'Criar Ticket'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingTicket(null)
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


