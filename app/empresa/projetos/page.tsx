'use client'

import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { useProjetosStore } from '@/stores/projetosStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { formatCurrency } from '@/utils/formatCurrency'
import { Projeto, StatusProjeto } from '@/types'
import { Plus, Edit, Trash2, TrendingUp, CheckCircle2, Circle, ChevronDown, ChevronUp, FileText, ListTodo, Rocket, X } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useTarefasStore } from '@/stores/tarefasStore'
import { Tarefa, Prioridade, CategoriaTarefa, StatusTarefa, DocumentoEtapa } from '@/types'

export default function ProjetosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProjeto, setEditingProjeto] = useState<Projeto | null>(null)
  const [filtroStatus, setFiltroStatus] = useState<StatusProjeto | 'Todos'>('Todos')
  const [projetoEtapasAberto, setProjetoEtapasAberto] = useState<string | null>(null)
  const [etapaSelecionada, setEtapaSelecionada] = useState<{ projetoId: string; etapaId: string } | null>(null)
  const [isDocumentoModalOpen, setIsDocumentoModalOpen] = useState(false)
  const [isTarefaModalOpen, setIsTarefaModalOpen] = useState(false)
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false)
  const [projetoParaDeploy, setProjetoParaDeploy] = useState<Projeto | null>(null)

  const projetos = useProjetosStore((state) => state.projetos)
  const addProjeto = useProjetosStore((state) => state.addProjeto)
  const updateProjeto = useProjetosStore((state) => state.updateProjeto)
  const deleteProjeto = useProjetosStore((state) => state.deleteProjeto)
  const atualizarEtapa = useProjetosStore((state) => state.atualizarEtapa)
  const adicionarDocumentoEtapa = useProjetosStore((state) => state.adicionarDocumentoEtapa)
  const adicionarTarefaEtapa = useProjetosStore((state) => state.adicionarTarefaEtapa)
  
  const addTarefa = useTarefasStore((state) => state.addTarefa)
  const tarefas = useTarefasStore((state) => state.tarefas)

  const projetosFiltrados = filtroStatus === 'Todos'
    ? projetos
    : projetos.filter((p) => p.status === filtroStatus)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novoProjeto: Projeto = {
      id: editingProjeto?.id || uuidv4(),
      nome: (formData.get('nome') as string) || 'Sem nome',
      descricao: (formData.get('descricao') as string) || '',
      status: (formData.get('status') as StatusProjeto) || 'Pendente',
      cliente: formData.get('cliente') as string || undefined,
      valor: formData.get('valor') ? parseFloat(formData.get('valor') as string) : undefined,
      precoVenda: formData.get('precoVenda') ? parseFloat(formData.get('precoVenda') as string) : undefined,
      quantidadeClientes: formData.get('quantidadeClientes') ? parseInt(formData.get('quantidadeClientes') as string) : undefined,
      etapasConcluidas: editingProjeto?.etapasConcluidas || 0,
      totalEtapas: 7, // Sempre 7 etapas padrão
      etapas: editingProjeto?.etapas || [], // Será preenchido automaticamente pelo store
      dataInicio: formData.get('dataInicio') as string || new Date().toISOString().split('T')[0],
      prazo: formData.get('prazo') as string || undefined,
      quantidadeAnexos: editingProjeto?.quantidadeAnexos || 0,
    }

    if (editingProjeto) {
      updateProjeto(editingProjeto.id, novoProjeto)
    } else {
      addProjeto(novoProjeto)
    }

    setIsModalOpen(false)
    setEditingProjeto(null)
  }

  const handleEdit = (projeto: Projeto) => {
    setEditingProjeto(projeto)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      deleteProjeto(id)
    }
  }

  const getProgresso = (projeto: Projeto) => {
    if (projeto.totalEtapas === 0) return 0
    return Math.round((projeto.etapasConcluidas / projeto.totalEtapas) * 100)
  }

  const getStatusColor = (status: StatusProjeto) => {
    switch (status) {
      case 'Andamento':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'Revisão':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'Entregue':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'Arquivado':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
      default:
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50'
    }
  }

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Projetos Empresariais</h1>
            <p className="text-gray-400 text-sm">Gerencie seus projetos e acompanhamentos</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="text-sm sm:text-base">Novo Projeto</span>
          </Button>
        </div>

        <div className="flex gap-4">
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as StatusProjeto | 'Todos')}
            className="px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
          >
            <option value="Todos">Todos os Status</option>
            <option value="Pendente">Pendente</option>
            <option value="Andamento">Em Andamento</option>
            <option value="Revisão">Em Revisão</option>
            <option value="Entregue">Entregue</option>
            <option value="Arquivado">Arquivado</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {projetosFiltrados.length > 0 ? (
            projetosFiltrados.map((projeto) => {
              const progresso = getProgresso(projeto)
              return (
                <div
                  key={projeto.id}
                  className="bg-card-bg border-2 border-card-border rounded-xl p-6 hover:border-accent-electric/50 hover:shadow-lg hover:shadow-accent-electric/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {projeto.nome}
                      </h3>
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                        {projeto.descricao}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(projeto)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-dark-lighter rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(projeto.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Progresso</span>
                        <span className="text-sm font-medium text-white">{progresso}%</span>
                      </div>
                      <div className="w-full bg-dark-gray rounded-full h-2">
                        <div
                          className="bg-accent-electric h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progresso}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {projeto.etapasConcluidas || 0} de {projeto.totalEtapas || 7} etapas
                      </p>
                    </div>

                    {/* Etapas do Projeto */}
                    <div className="border-t border-dark-lighter pt-3">
                      <button
                        onClick={() => setProjetoEtapasAberto(projetoEtapasAberto === projeto.id ? null : projeto.id)}
                        className="w-full flex items-center justify-between text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        <span className="font-medium">Etapas do Projeto</span>
                        {projetoEtapasAberto === projeto.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      
                      {projetoEtapasAberto === projeto.id && (
                        <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
                          {(projeto.etapas || []).map((etapa) => {
                            const tarefasEtapa = tarefas.filter(t => etapa.tarefasIds?.includes(t.id))
                            return (
                              <div
                                key={etapa.id}
                                className={`p-3 rounded-lg border transition-all ${
                                  etapa.concluida
                                    ? 'bg-emerald-500/10 border-emerald-500/30'
                                    : 'bg-dark-black/50 border-card-border/50'
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  <button
                                    onClick={() => atualizarEtapa(projeto.id, etapa.id, !etapa.concluida)}
                                    className="mt-0.5 flex-shrink-0"
                                  >
                                    {etapa.concluida ? (
                                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    ) : (
                                      <Circle className="w-5 h-5 text-gray-500 hover:text-emerald-400 transition-colors" />
                                    )}
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <div className={`text-xs font-semibold mb-1 ${
                                      etapa.concluida ? 'text-emerald-300 line-through' : 'text-white'
                                    }`}>
                                      {etapa.nome}
                                    </div>
                                    {etapa.descricao && (
                                      <div className="text-xs text-gray-400 mb-2 whitespace-pre-line">
                                        {etapa.descricao}
                                      </div>
                                    )}
                                    
                                    {/* Documentos */}
                                    {etapa.documentos && etapa.documentos.length > 0 && (
                                      <div className="mb-2">
                                        <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                          <FileText className="w-3 h-3" />
                                          Documentos ({etapa.documentos.length})
                                        </div>
                                        <div className="space-y-1">
                                          {etapa.documentos.map((doc) => (
                                            <div key={doc.id} className="text-xs text-gray-400 bg-dark-black/30 p-1.5 rounded">
                                              {doc.tipo === 'link' ? (
                                                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-accent-electric hover:underline">
                                                  {doc.titulo}
                                                </a>
                                              ) : (
                                                <span>{doc.titulo}</span>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Tarefas */}
                                    {tarefasEtapa.length > 0 && (
                                      <div className="mb-2">
                                        <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                          <ListTodo className="w-3 h-3" />
                                          Tarefas ({tarefasEtapa.length})
                                        </div>
                                        <div className="space-y-1">
                                          {tarefasEtapa.map((tarefa) => (
                                            <div key={tarefa.id} className="text-xs text-gray-400 bg-dark-black/30 p-1.5 rounded flex items-center justify-between">
                                              <span className={tarefa.concluida ? 'line-through' : ''}>{tarefa.titulo}</span>
                                              <span className={`px-1.5 py-0.5 rounded text-xs ${
                                                tarefa.concluida ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                                              }`}>
                                                {tarefa.status}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Botões de Ação */}
                                    <div className="flex gap-2 mt-2">
                                      <button
                                        onClick={() => {
                                          setEtapaSelecionada({ projetoId: projeto.id, etapaId: etapa.id })
                                          setIsDocumentoModalOpen(true)
                                        }}
                                        className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded transition-colors"
                                      >
                                        <FileText className="w-3 h-3" />
                                        Documentar
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEtapaSelecionada({ projetoId: projeto.id, etapaId: etapa.id })
                                          setIsTarefaModalOpen(true)
                                        }}
                                        className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 rounded transition-colors"
                                      >
                                        <ListTodo className="w-3 h-3" />
                                        Criar Tarefa
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {projeto.cliente && (
                      <div className="text-sm">
                        <span className="text-gray-400">Cliente: </span>
                        <span className="text-white">{projeto.cliente}</span>
                      </div>
                    )}

                    {projeto.valor && (
                      <div className="text-sm">
                        <span className="text-gray-400">Valor: </span>
                        <span className="text-accent-electric font-semibold">
                          {formatCurrency(projeto.valor)}
                        </span>
                      </div>
                    )}
                    {projeto.precoVenda && (
                      <div className="text-sm">
                        <span className="text-gray-400">Preço de Venda: </span>
                        <span className="text-emerald-400 font-semibold">
                          {formatCurrency(projeto.precoVenda)}
                        </span>
                      </div>
                    )}
                    {projeto.quantidadeClientes !== undefined && (
                      <div className="text-sm">
                        <span className="text-gray-400">Quantidade de Clientes: </span>
                        <span className="text-blue-400 font-semibold">
                          {projeto.quantidadeClientes}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-dark-lighter">
                      <span
                        className={`px-3 py-1 rounded border text-xs ${getStatusColor(
                          projeto.status
                        )}`}
                      >
                        {projeto.status}
                      </span>
                      <div className="flex items-center gap-2">
                        {progresso === 100 && (
                          <Button
                            onClick={() => {
                              setProjetoParaDeploy(projeto)
                              setIsDeployModalOpen(true)
                            }}
                            className="flex items-center gap-1 px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <Rocket className="w-3 h-3" />
                            Criar Deploy
                          </Button>
                        )}
                        {projeto.prazo && (
                          <span className="text-xs text-gray-400">
                            Prazo: {new Date(projeto.prazo).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400">Nenhum projeto encontrado</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingProjeto(null)
        }}
        title={editingProjeto ? 'Editar Projeto' : 'Novo Projeto'}
        description={editingProjeto ? 'Atualize as informações do projeto' : 'Crie um novo projeto com etapas pré-definidas'}
        size="lg"
        variant="default"
        icon={editingProjeto ? Edit : Plus}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nome do Projeto
            </label>
            <input
              type="text"
              name="nome"
              defaultValue={editingProjeto?.nome}
              className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descrição
            </label>
            <textarea
              name="descricao"
              defaultValue={editingProjeto?.descricao}
              rows={4}
              className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                defaultValue={editingProjeto?.status || 'Pendente'}
                className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              >
                <option value="Pendente">Pendente</option>
                <option value="Andamento">Em Andamento</option>
                <option value="Revisão">Em Revisão</option>
                <option value="Entregue">Entregue</option>
                <option value="Arquivado">Arquivado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Etapas Padrão
              </label>
              <div className="px-5 py-3 bg-card-bg/50 border border-card-border rounded-xl text-gray-400 text-sm">
                Todos os projetos têm automaticamente 7 etapas padrão vinculadas
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cliente
              </label>
              <input
                type="text"
                name="cliente"
                defaultValue={editingProjeto?.cliente}
                className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Valor (R$)
              </label>
              <input
                type="number"
                name="valor"
                step="0.01"
                defaultValue={editingProjeto?.valor}
                className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Preço de Venda (R$)
              </label>
              <input
                type="number"
                name="precoVenda"
                step="0.01"
                min="0"
                defaultValue={editingProjeto?.precoVenda}
                placeholder="0.00"
                className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quantidade de Clientes
              </label>
              <input
                type="number"
                name="quantidadeClientes"
                min="0"
                step="1"
                defaultValue={editingProjeto?.quantidadeClientes}
                placeholder="0"
                className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data de Início
              </label>
              <input
                type="date"
                name="dataInicio"
                defaultValue={editingProjeto?.dataInicio || new Date().toISOString().split('T')[0]}
                className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prazo
              </label>
              <input
                type="date"
                name="prazo"
                defaultValue={editingProjeto?.prazo}
                className="w-full px-5 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsModalOpen(false)
                setEditingProjeto(null)
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Documento */}
      <Modal
        isOpen={isDocumentoModalOpen}
        onClose={() => {
          setIsDocumentoModalOpen(false)
          setEtapaSelecionada(null)
        }}
        title="Adicionar Documento à Etapa"
        size="md"
      >
        <form onSubmit={(e) => {
          e.preventDefault()
          if (!etapaSelecionada) return
          
          const formData = new FormData(e.currentTarget)
          const tipo = formData.get('tipo') as 'nota' | 'link' | 'arquivo'
          const documento: DocumentoEtapa = {
            id: uuidv4(),
            titulo: (formData.get('titulo') as string) || 'Sem título',
            conteudo: (formData.get('conteudo') as string) || '',
            tipo,
            url: tipo === 'link' ? (formData.get('url') as string) : undefined,
            dataCriacao: new Date().toISOString(),
          }
          
          adicionarDocumentoEtapa(etapaSelecionada.projetoId, etapaSelecionada.etapaId, documento)
          setIsDocumentoModalOpen(false)
          setEtapaSelecionada(null)
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo
            </label>
            <select
              name="tipo"
              id="tipo-documento"
              defaultValue="nota"
              onChange={(e) => {
                const urlField = document.getElementById('url-field') as HTMLElement
                if (urlField) {
                  urlField.style.display = e.target.value === 'link' ? 'block' : 'none'
                }
              }}
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            >
              <option value="nota">Nota/Texto</option>
              <option value="link">Link/URL</option>
              <option value="arquivo">Arquivo (referência)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título
            </label>
            <input
              type="text"
              name="titulo"
              placeholder="Título do documento"
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Conteúdo/Descrição
            </label>
            <textarea
              name="conteudo"
              rows={4}
              placeholder="Descrição, notas ou referências..."
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div id="url-field" style={{ display: 'none' }}>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL
            </label>
            <input
              type="url"
              name="url"
              placeholder="https://..."
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Adicionar Documento
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsDocumentoModalOpen(false)
                setEtapaSelecionada(null)
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Tarefa */}
      <Modal
        isOpen={isTarefaModalOpen}
        onClose={() => {
          setIsTarefaModalOpen(false)
          setEtapaSelecionada(null)
        }}
        title="Criar Tarefa para Etapa"
        size="md"
      >
        <form onSubmit={(e) => {
          e.preventDefault()
          if (!etapaSelecionada) return
          
          const formData = new FormData(e.currentTarget)
          const projeto = projetos.find(p => p.id === etapaSelecionada.projetoId)
          if (!projeto) return
          
          const novaTarefa: Tarefa = {
            id: uuidv4(),
            titulo: (formData.get('titulo') as string) || 'Sem título',
            descricao: formData.get('descricao') as string || undefined,
            prioridade: (formData.get('prioridade') as Prioridade) || 'Média',
            categoria: 'Projeto' as CategoriaTarefa,
            data: (formData.get('data') as string) || new Date().toISOString().split('T')[0],
            status: 'Pendente' as StatusTarefa,
            tarefaRapida: formData.get('tarefaRapida') === 'on',
            recorrente: false,
            projetoId: projeto.id,
            concluida: false,
            etiquetas: [],
          }
          
          addTarefa(novaTarefa)
          adicionarTarefaEtapa(etapaSelecionada.projetoId, etapaSelecionada.etapaId, novaTarefa.id)
          setIsTarefaModalOpen(false)
          setEtapaSelecionada(null)
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título da Tarefa
            </label>
            <input
              type="text"
              name="titulo"
              placeholder="Ex: Implementar funcionalidade X"
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descrição
            </label>
            <textarea
              name="descricao"
              rows={3}
              placeholder="Detalhes da tarefa..."
              className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prioridade
              </label>
              <select
                name="prioridade"
                defaultValue="Média"
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data
              </label>
              <input
                type="date"
                name="data"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="tarefaRapida"
                className="w-4 h-4 rounded border-card-border bg-card-bg text-accent-electric focus:ring-accent-electric"
              />
              <span className="text-sm text-gray-300">Tarefa Rápida (2 min)</span>
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Criar Tarefa
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsTarefaModalOpen(false)
                setEtapaSelecionada(null)
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Deploy */}
      <Modal
        isOpen={isDeployModalOpen}
        onClose={() => {
          setIsDeployModalOpen(false)
          setProjetoParaDeploy(null)
        }}
        title="Criar Deploy do Projeto"
        size="md"
      >
        {projetoParaDeploy && (
          <form onSubmit={(e) => {
            e.preventDefault()
            if (!projetoParaDeploy) return
            
            const formData = new FormData(e.currentTarget)
            const deploys = JSON.parse(localStorage.getItem('deploys-empresa') || '[]')
            
            const novoDeploy = {
              id: uuidv4(),
              nomeProjeto: formData.get('nomeProjeto') as string || undefined,
              linkGitHub: formData.get('linkGitHub') as string || undefined,
              versao: formData.get('versao') as string || undefined,
              ambiente: formData.get('ambiente') as string || undefined,
              descricao: formData.get('descricao') as string || `Deploy do projeto: ${projetoParaDeploy.nome}`,
              responsavel: formData.get('responsavel') as string || undefined,
              data: formData.get('data') as string || new Date().toISOString().split('T')[0],
              status: 'Em Andamento' as const,
              observacoes: formData.get('observacoes') as string || undefined,
              projetoId: projetoParaDeploy.id,
            }
            
            deploys.push(novoDeploy)
            localStorage.setItem('deploys-empresa', JSON.stringify(deploys))
            
            // Atualizar status do projeto para Entregue
            updateProjeto(projetoParaDeploy.id, { status: 'Entregue' })
            
            setIsDeployModalOpen(false)
            setProjetoParaDeploy(null)
            alert('Deploy criado com sucesso!')
          }} className="space-y-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-4">
              <p className="text-sm text-blue-300">
                Projeto: <strong>{projetoParaDeploy.nome}</strong>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Todas as etapas foram concluídas (100%)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome do Projeto
              </label>
              <input
                type="text"
                name="nomeProjeto"
                placeholder="Ex: Sistema de Vendas"
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Link do GitHub
              </label>
              <input
                type="url"
                name="linkGitHub"
                placeholder="https://github.com/usuario/repositorio"
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Versão
                </label>
                <input
                  type="text"
                  name="versao"
                  placeholder="Ex: 1.0.0"
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ambiente
                </label>
                <select
                  name="ambiente"
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="">Selecione...</option>
                  <option value="Produção">Produção</option>
                  <option value="Homologação">Homologação</option>
                  <option value="Desenvolvimento">Desenvolvimento</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                name="descricao"
                rows={2}
                placeholder="Descrição do deploy..."
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
                placeholder="Nome do responsável"
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data do Deploy
              </label>
              <input
                type="date"
                name="data"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Observações
              </label>
              <textarea
                name="observacoes"
                rows={3}
                placeholder="Observações sobre o deploy..."
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                <Rocket className="w-4 h-4 mr-2" />
                Criar Deploy
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsDeployModalOpen(false)
                  setProjetoParaDeploy(null)
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </MainLayout>
  )
}

