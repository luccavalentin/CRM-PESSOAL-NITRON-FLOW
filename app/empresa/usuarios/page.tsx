'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { Plus, Users, Shield, Trash2, Edit2, Mail, Calendar } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface Usuario {
  id: string
  nome: string
  email: string
  cargo: string
  status: 'Ativo' | 'Inativo'
  plano: string
  dataRegistro: string
  ultimoAcesso?: string
}

export default function UsuariosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('usuarios-empresa')
    if (saved) {
      setUsuarios(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('usuarios-empresa', JSON.stringify(usuarios))
  }, [usuarios])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const novoUsuario: Usuario = {
      id: editingUsuario?.id || uuidv4(),
      nome: formData.get('nome') as string,
      email: formData.get('email') as string,
      cargo: formData.get('cargo') as string,
      status: (formData.get('status') as Usuario['status']) || 'Ativo',
      plano: formData.get('plano') as string,
      dataRegistro: editingUsuario?.dataRegistro || new Date().toISOString().split('T')[0],
      ultimoAcesso: editingUsuario?.ultimoAcesso,
    }

    if (editingUsuario) {
      setUsuarios(usuarios.map(u => u.id === editingUsuario.id ? novoUsuario : u))
    } else {
      setUsuarios([...usuarios, novoUsuario])
    }

    setIsModalOpen(false)
    setEditingUsuario(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsuarios(usuarios.filter(u => u.id !== id))
    }
  }

  const usuariosAtivos = usuarios.filter(u => u.status === 'Ativo').length
  const usuariosInativos = usuarios.filter(u => u.status === 'Inativo').length

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Usuários e Licenças</h1>
            <p className="text-gray-400">Gerencie usuários e licenças do sistema</p>
          </div>
          <Button
            onClick={() => {
              setEditingUsuario(null)
              setIsModalOpen(true)
            }}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent-electric to-accent-cyan text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-lg shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70 hover:scale-105 transition-all duration-200 border-2 border-accent-electric/30"
          >
            <Plus className="w-5 h-5" />
            Novo Usuário
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Usuários"
            value={usuarios.length}
            icon={Users}
          />
          <StatCard
            title="Usuários Ativos"
            value={usuariosAtivos}
            icon={Shield}
            valueColor="text-emerald-400"
          />
          <StatCard
            title="Usuários Inativos"
            value={usuariosInativos}
            icon={Users}
            valueColor="text-gray-400"
          />
        </div>

        <div className="bg-card-bg/80 backdrop-blur-sm border border-card-border/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-accent-electric" />
            Lista de Usuários
          </h2>
          {usuarios.length > 0 ? (
            <div className="space-y-3">
              {usuarios.map((usuario) => (
                <div
                  key={usuario.id}
                  className="p-5 bg-dark-black/50 border border-card-border/50 rounded-xl hover:border-accent-electric/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold text-lg">{usuario.nome}</h3>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                          usuario.status === 'Ativo' 
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' 
                            : 'bg-gray-500/15 text-gray-400 border-gray-500/20'
                        }`}>
                          {usuario.status}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-accent-electric/15 text-accent-electric border border-accent-electric/20">
                          {usuario.plano}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Mail className="w-4 h-4" />
                          <span>{usuario.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Cargo: </span>
                          <span className="text-white font-semibold">{usuario.cargo}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>Registrado em {new Date(usuario.dataRegistro).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                      {usuario.ultimoAcesso && (
                        <p className="text-xs text-gray-500 mt-2">
                          Último acesso: {new Date(usuario.ultimoAcesso).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          setEditingUsuario(usuario)
                          setIsModalOpen(true)
                        }}
                        className="p-2 text-accent-electric hover:bg-accent-electric/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(usuario.id)}
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
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Nenhum usuário cadastrado</p>
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingUsuario(null)
          }}
          title={editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  name="nome"
                  defaultValue={editingUsuario?.nome}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editingUsuario?.email}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cargo *
                </label>
                <input
                  type="text"
                  name="cargo"
                  defaultValue={editingUsuario?.cargo}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Plano *
                </label>
                <select
                  name="plano"
                  defaultValue={editingUsuario?.plano}
                  className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
                >
                  <option value="">Selecione</option>
                  <option value="Básico">Básico</option>
                  <option value="Profissional">Profissional</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                defaultValue={editingUsuario?.status || 'Ativo'}
                className="w-full px-4 py-3 bg-card-bg border border-card-border rounded-xl text-white focus:outline-none focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20 transition-all"
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingUsuario ? 'Salvar Alterações' : 'Criar Usuário'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingUsuario(null)
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


