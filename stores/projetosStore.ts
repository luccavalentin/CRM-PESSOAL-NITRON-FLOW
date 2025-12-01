import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Projeto, DocumentoEtapa } from '@/types'
import { criarEtapasPadrao } from '@/utils/projetoEtapas'

interface ProjetosStore {
  projetos: Projeto[]
  addProjeto: (projeto: Projeto) => void
  updateProjeto: (id: string, projeto: Partial<Projeto>) => void
  deleteProjeto: (id: string) => void
  getProjetosByStatus: (status: Projeto['status']) => Projeto[]
  getProjetoById: (id: string) => Projeto | undefined
  atualizarEtapa: (projetoId: string, etapaId: string, concluida: boolean) => void
  adicionarDocumentoEtapa: (projetoId: string, etapaId: string, documento: DocumentoEtapa) => void
  adicionarTarefaEtapa: (projetoId: string, etapaId: string, tarefaId: string) => void
}

// Função para migrar projetos antigos que não têm etapas
const migrarProjetosAntigos = (projetos: Projeto[]): Projeto[] => {
  return projetos.map((projeto) => {
    // Se o projeto não tem etapas ou tem menos de 7, adiciona as etapas padrão
    if (!projeto.etapas || projeto.etapas.length === 0) {
      const etapasPadrao = criarEtapasPadrao()
      const etapasConcluidas = etapasPadrao.filter(e => e.concluida).length
      return {
        ...projeto,
        etapas: etapasPadrao,
        totalEtapas: 7,
        etapasConcluidas: etapasConcluidas,
      }
    }
    // Garante que totalEtapas seja 7
    if (projeto.totalEtapas !== 7) {
      return {
        ...projeto,
        totalEtapas: 7,
      }
    }
    return projeto
  })
}

export const useProjetosStore = create<ProjetosStore>()(
  persist(
    (set, get) => ({
      projetos: [],
      addProjeto: (projeto) => {
        // Se o projeto não tem etapas, cria as etapas padrão
        const etapasPadrao = projeto.etapas && projeto.etapas.length > 0 
          ? projeto.etapas 
          : criarEtapasPadrao()
        
        const etapasConcluidas = etapasPadrao.filter(e => e.concluida).length
        
        const projetoComEtapas: Projeto = {
          ...projeto,
          etapas: etapasPadrao,
          totalEtapas: 7,
          etapasConcluidas: etapasConcluidas,
        }
        
        set((state) => ({ projetos: [...state.projetos, projetoComEtapas] }))
      },
      updateProjeto: (id, updates) =>
        set((state) => ({
          projetos: state.projetos.map((p) => {
            if (p.id === id) {
              // Preserva etapas existentes se não foram atualizadas
              const etapas = updates.etapas !== undefined ? updates.etapas : (p.etapas || criarEtapasPadrao())
              const etapasConcluidas = etapas.filter(e => e.concluida).length
              return { 
                ...p, 
                ...updates,
                etapas: etapas,
                etapasConcluidas,
                totalEtapas: 7, // Sempre 7 etapas
              }
            }
            return p
          }),
        })),
      deleteProjeto: (id) =>
        set((state) => ({
          projetos: state.projetos.filter((p) => p.id !== id),
        })),
      getProjetosByStatus: (status) =>
        get().projetos.filter((p) => p.status === status),
      getProjetoById: (id) => get().projetos.find((p) => p.id === id),
      atualizarEtapa: (projetoId, etapaId, concluida) => {
        set((state) => ({
          projetos: state.projetos.map((p) => {
            if (p.id === projetoId) {
              const etapasAtualizadas = p.etapas.map((e) =>
                e.id === etapaId
                  ? { ...e, concluida, dataConclusao: concluida ? new Date().toISOString().split('T')[0] : undefined }
                  : e
              )
              const etapasConcluidas = etapasAtualizadas.filter(e => e.concluida).length
              return {
                ...p,
                etapas: etapasAtualizadas,
                etapasConcluidas,
              }
            }
            return p
          }),
        }))
      },
      adicionarDocumentoEtapa: (projetoId, etapaId, documento) => {
        set((state) => ({
          projetos: state.projetos.map((p) => {
            if (p.id === projetoId) {
              const etapasAtualizadas = p.etapas.map((e) =>
                e.id === etapaId
                  ? { ...e, documentos: [...(e.documentos || []), documento] }
                  : e
              )
              return {
                ...p,
                etapas: etapasAtualizadas,
              }
            }
            return p
          }),
        }))
      },
      adicionarTarefaEtapa: (projetoId, etapaId, tarefaId) => {
        set((state) => ({
          projetos: state.projetos.map((p) => {
            if (p.id === projetoId) {
              const etapasAtualizadas = p.etapas.map((e) =>
                e.id === etapaId
                  ? { ...e, tarefasIds: [...(e.tarefasIds || []), tarefaId] }
                  : e
              )
              return {
                ...p,
                etapas: etapasAtualizadas,
              }
            }
            return p
          }),
        }))
      },
    }),
    {
      name: 'projetos-storage',
      // Migra projetos ao carregar do localStorage
      onRehydrateStorage: () => (state) => {
        if (state && state.projetos) {
          const projetosMigrados = migrarProjetosAntigos(state.projetos)
          if (JSON.stringify(projetosMigrados) !== JSON.stringify(state.projetos)) {
            state.projetos = projetosMigrados
          }
        }
      },
    }
  )
)


