/**
 * Utilitário para criar etapas padrão de projetos
 */

import { EtapaProjeto } from '@/types'
import { v4 as uuidv4 } from 'uuid'

/**
 * Cria as 7 etapas padrão para um projeto
 */
export const criarEtapasPadrao = (): EtapaProjeto[] => {
  return [
    {
      id: uuidv4(),
      numero: 1,
      nome: 'ETAPA 1 – Brainstorming (Ideação)',
      descricao: `Chuva de ideias
Público-alvo / personas
Objetivo do sistema
Requisitos soltos
Valores e propósito
Funções que o sistema deve ter
Escalabilidade e visão`,
      concluida: false,
      documentos: [],
      tarefasIds: [],
    },
    {
      id: uuidv4(),
      numero: 2,
      nome: 'ETAPA 2 – Sprint 0: Planejamento & Setup',
      descricao: `Configurar repositório (GitHub)
Criar estrutura base do projeto
Configurar ambiente de desenvolvimento
Definir protótipo inicial (wireframe básico)
Planejar telas essenciais`,
      concluida: false,
      documentos: [],
      tarefasIds: [],
    },
    {
      id: uuidv4(),
      numero: 3,
      nome: 'ETAPA 3 – Sprint 1: Design & Estrutura do Front-end',
      descricao: `Criar layout
Criar telas principais
Criar navegação
Estruturar componentes`,
      concluida: false,
      documentos: [],
      tarefasIds: [],
    },
    {
      id: uuidv4(),
      numero: 4,
      nome: 'ETAPA 4 – Sprint 2: Funcionalidades Principais (MVP)',
      descricao: `Implementar funções mínimas
Fluxo principal funcionando
Sistema usável`,
      concluida: false,
      documentos: [],
      tarefasIds: [],
    },
    {
      id: uuidv4(),
      numero: 5,
      nome: 'ETAPA 5 – Sprint 3: Testes & Refinamento',
      descricao: `Testes manuais
Correções
Melhorias
Ajustes de UX/UI`,
      concluida: false,
      documentos: [],
      tarefasIds: [],
    },
    {
      id: uuidv4(),
      numero: 6,
      nome: 'ETAPA 6 – Sprint 4: Banco de Dados & Back-end',
      descricao: `Modelagem do banco
Conexão com o front
CRUDs
Autenticação
API
Integrações necessárias`,
      concluida: false,
      documentos: [],
      tarefasIds: [],
    },
    {
      id: uuidv4(),
      numero: 7,
      nome: 'ETAPA 7 – Sprint 5: Versão Final, Deploy & Documentação',
      descricao: `Versão final
Deploy
Integração completa
Documentação técnica
Documentação do usuário`,
      concluida: false,
      documentos: [],
      tarefasIds: [],
    },
  ]
}

