'use client'

import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { useLeadsStore, Lead } from '@/stores/leadsStore'
import { estadosBrasil, getCidadesByEstado, getEstadoNome } from '@/utils/estadosCidades'
import { bairrosPiracicaba, isPiracicaba } from '@/utils/bairrosPiracicaba'
import { v4 as uuidv4 } from 'uuid'
import { Plus, Search, MapPin, User, Mail, Phone, Trash2, Edit2, Filter, CheckCircle, Flame } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useClientesStore } from '@/stores/clientesStore'

export default function LeadsPage() {
  const { leads, addLead, updateLead, deleteLead } = useLeadsStore()
  const { addCliente, getClienteByLeadId } = useClientesStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<string>('')
  const [filtroCidade, setFiltroCidade] = useState<string>('')
  const [filtroStatus, setFiltroStatus] = useState<Lead['status'] | ''>('')
  const [estadoSelecionado, setEstadoSelecionado] = useState<string>('')
  const [cidadeSelecionada, setCidadeSelecionada] = useState<string>('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const contactado = formData.get('contactado') === 'on'
    let dataContato: string | undefined = undefined
    
    if (contactado) {
      // Se está marcando como contactado pela primeira vez, salva a data atual
      // Se já estava contactado, mantém a data original
      if (editingLead?.contactado) {
        // Já estava contactado, mantém a data original
        dataContato = editingLead.dataContato
      } else {
        // Primeira vez marcando como contactado, salva a data atual
        dataContato = new Date().toISOString().split('T')[0]
      }
    }
    // Se desmarcar, dataContato fica undefined
    
    // Lógica: Se não tem site, é lead quente
    const temSiteValue = formData.get('temSite') as string
    const temSite = temSiteValue === 'sim'
    const leadQuente = temSiteValue === 'nao' // Se não tem site, é lead quente
    
    const novoLead: Lead = {
      id: editingLead?.id || uuidv4(),
      nome: formData.get('nome') as string,
      email: formData.get('email') as string || undefined,
      telefone: formData.get('telefone') as string || undefined,
      estado: formData.get('estado') as string,
      cidade: formData.get('cidade') as string,
      bairro: formData.get('bairro') as string,
      observacoes: formData.get('observacoes') as string || undefined,
      status: (formData.get('status') as Lead['status']) || 'Novo',
      dataCriacao: editingLead?.dataCriacao || new Date().toISOString().split('T')[0],
      origem: formData.get('origem') as string || undefined,
      contactado: contactado,
      dataContato: dataContato,
      temSite: temSite,
      leadQuente: leadQuente,
    }

    if (editingLead) {
      updateLead(editingLead.id, novoLead)
    } else {
      addLead(novoLead)
    }

    setIsModalOpen(false)
    setEditingLead(null)
    setEstadoSelecionado('')
    setCidadeSelecionada('')
  }

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead)
    setEstadoSelecionado(lead.estado)
    setCidadeSelecionada(lead.cidade)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lead?')) {
      deleteLead(id)
    }
  }

  const handleConverterCliente = (lead: Lead) => {
    if (confirm(`Deseja converter o lead "${lead.nome}" em cliente?`)) {
      // Verificar se já existe cliente para este lead
      const clienteExistente = getClienteByLeadId(lead.id)
      
      if (clienteExistente) {
        alert('Este lead já foi convertido em cliente!')
        return
      }

      // Criar cliente a partir do lead
      addCliente({
        id: uuidv4(),
        nome: lead.nome,
        email: lead.email,
        telefone: lead.telefone,
        cidade: lead.cidade,
        estado: lead.estado,
        endereco: lead.bairro,
        status: 'Prospecto',
        valorTotal: 0,
        observacoes: lead.observacoes,
        leadId: lead.id,
        dataCadastro: new Date().toISOString().split('T')[0],
      })

      // Atualizar status do lead para "Convertido"
      updateLead(lead.id, { status: 'Convertido' })
      
      alert('Lead convertido em cliente com sucesso!')
    }
  }

  const handleEstadoChange = (estado: string) => {
    setEstadoSelecionado(estado)
    setCidadeSelecionada('')
  }

  const cidadesDisponiveis = estadoSelecionado ? getCidadesByEstado(estadoSelecionado) : []

  // Filtros
  const leadsFiltrados = leads.filter(lead => {
    const matchSearch = searchTerm === '' || 
      lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.telefone?.includes(searchTerm) ||
      lead.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.bairro.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchEstado = filtroEstado === '' || lead.estado === filtroEstado
    const matchCidade = filtroCidade === '' || lead.cidade === filtroCidade
    const matchStatus = filtroStatus === '' || lead.status === filtroStatus

    return matchSearch && matchEstado && matchCidade && matchStatus
  })

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'Novo':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/20'
      case 'Contatado':
        return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'
      case 'Qualificado':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/20'
      case 'Convertido':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
      case 'Perdido':
        return 'bg-red-500/15 text-red-400 border-red-500/20'
      default:
        return 'bg-gray-500/15 text-gray-400 border-gray-500/20'
    }
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Leads</h1>
            <p className="text-gray-400">Gerencie seus leads e oportunidades</p>
          </div>
          <Button
            onClick={() => {
              setEditingLead(null)
              setEstadoSelecionado('')
              setCidadeSelecionada('')
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Novo Lead
          </Button>
        </div>

        {/* Filtros */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-black/50 border border-card-border/50 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
              />
            </div>
            <select
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value)
                setFiltroCidade('')
              }}
              className="px-4 py-2 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
            >
              <option value="">Todos os Estados</option>
              {estadosBrasil.map((estado) => (
                <option key={estado.sigla} value={estado.sigla}>
                  {estado.nome}
                </option>
              ))}
            </select>
            <select
              value={filtroCidade}
              onChange={(e) => setFiltroCidade(e.target.value)}
              className="px-4 py-2 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
              disabled={!filtroEstado}
            >
              <option value="">Todas as Cidades</option>
              {filtroEstado && getCidadesByEstado(filtroEstado).map((cidade) => (
                <option key={cidade} value={cidade}>
                  {cidade}
                </option>
              ))}
            </select>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as Lead['status'] | '')}
              className="px-4 py-2 bg-dark-black/50 border border-card-border/50 rounded-lg text-white text-sm focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/30"
            >
              <option value="">Todos os Status</option>
              <option value="Novo">Novo</option>
              <option value="Contatado">Contatado</option>
              <option value="Qualificado">Qualificado</option>
              <option value="Convertido">Convertido</option>
              <option value="Perdido">Perdido</option>
            </select>
          </div>
        </div>

        {/* Lista de Leads */}
        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl overflow-hidden">
          {leadsFiltrados.length > 0 ? (
            <div className="divide-y divide-card-border/50">
              {leadsFiltrados.map((lead) => (
                <div
                  key={lead.id}
                  className="p-4 hover:bg-dark-black/40 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="w-5 h-5 text-accent-electric" />
                        <h3 className="text-lg font-bold text-white">{lead.nome}</h3>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                        {lead.contactado && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Contactado
                            {lead.dataContato && (
                              <span className="text-emerald-300">
                                ({new Date(lead.dataContato).toLocaleDateString('pt-BR')})
                              </span>
                            )}
                          </span>
                        )}
                        {lead.leadQuente && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/20 flex items-center gap-1 animate-pulse">
                            <Flame className="w-3 h-3" />
                            LEAD QUENTE
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        {lead.email && (
                          <div className="flex items-center gap-2 text-gray-400">
                            <Mail className="w-4 h-4" />
                            <span>{lead.email}</span>
                          </div>
                        )}
                        {lead.telefone && (
                          <div className="flex items-center gap-2 text-gray-400">
                            <Phone className="w-4 h-4" />
                            <span>{lead.telefone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-400">
                          <MapPin className="w-4 h-4" />
                          <span>{getEstadoNome(lead.estado)} - {lead.cidade} - {lead.bairro}</span>
                        </div>
                        <div className="text-gray-500 text-xs">
                          Criado em: {new Date(lead.dataCriacao).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      {lead.observacoes && (
                        <p className="text-sm text-gray-400 mt-2">{lead.observacoes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {lead.status !== 'Convertido' && (
                        <button
                          onClick={() => handleConverterCliente(lead)}
                          className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                          title="Converter em Cliente"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(lead)}
                        className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(lead.id)}
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
              <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhum lead encontrado</p>
              <p className="text-gray-500 text-sm mt-1">Comece adicionando um novo lead</p>
            </div>
          )}
        </div>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingLead(null)
            setEstadoSelecionado('')
            setCidadeSelecionada('')
          }}
          title={editingLead ? 'Editar Lead' : 'Novo Lead'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome *
              </label>
              <input
                type="text"
                name="nome"
                required
                defaultValue={editingLead?.nome}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editingLead?.email}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  name="telefone"
                  defaultValue={editingLead?.telefone}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estado *
              </label>
              <select
                name="estado"
                required
                value={estadoSelecionado}
                onChange={(e) => handleEstadoChange(e.target.value)}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              >
                <option value="">Selecione o Estado</option>
                {estadosBrasil.map((estado) => (
                  <option key={estado.sigla} value={estado.sigla}>
                    {estado.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cidade *
              </label>
              <select
                name="cidade"
                required
                value={cidadeSelecionada}
                onChange={(e) => setCidadeSelecionada(e.target.value)}
                disabled={!estadoSelecionado}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Selecione a Cidade</option>
                {cidadesDisponiveis.map((cidade) => (
                  <option key={cidade} value={cidade}>
                    {cidade}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bairro *
              </label>
              {cidadeSelecionada && isPiracicaba(cidadeSelecionada) ? (
                <select
                  name="bairro"
                  required
                  defaultValue={editingLead?.bairro || ''}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="">Selecione o Bairro</option>
                  {bairrosPiracicaba.map((bairro) => (
                    <option key={bairro} value={bairro}>
                      {bairro}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="bairro"
                  required
                  defaultValue={editingLead?.bairro}
                  placeholder="Digite o bairro"
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={editingLead?.status || 'Novo'}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="Novo">Novo</option>
                  <option value="Contatado">Contatado</option>
                  <option value="Qualificado">Qualificado</option>
                  <option value="Convertido">Convertido</option>
                  <option value="Perdido">Perdido</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Origem
                </label>
                <input
                  type="text"
                  name="origem"
                  defaultValue={editingLead?.origem}
                  placeholder="Ex: Site, Facebook, Indicação..."
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                A empresa tem site? *
              </label>
              <select
                name="temSite"
                required
                defaultValue={editingLead?.temSite === true ? 'sim' : editingLead?.temSite === false ? 'nao' : ''}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              >
                <option value="">Selecione</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
              {editingLead?.leadQuente && (
                <p className="mt-2 text-sm text-orange-400 font-semibold flex items-center gap-2">
                  <span className="px-2 py-1 bg-orange-500/15 border border-orange-500/20 rounded text-xs">🔥 LEAD QUENTE</span>
                  <span className="text-gray-400">Empresa sem site identificada</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Observações
              </label>
              <textarea
                name="observacoes"
                defaultValue={editingLead?.observacoes}
                rows={3}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-card-bg/50 border border-card-border rounded-xl">
              <input
                type="checkbox"
                id="contactado"
                name="contactado"
                defaultChecked={editingLead?.contactado || false}
                className="w-5 h-5 rounded border-gray-600 bg-card-bg text-accent-electric focus:ring-accent-electric focus:ring-2 cursor-pointer"
              />
              <label htmlFor="contactado" className="text-sm font-medium text-gray-300 cursor-pointer flex-1">
                Contactado
              </label>
              {editingLead?.dataContato && (
                <span className="text-xs text-gray-400">
                  Data: {new Date(editingLead.dataContato).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingLead ? 'Salvar Alterações' : 'Criar Lead'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingLead(null)
                  setEstadoSelecionado('')
                  setCidadeSelecionada('')
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

