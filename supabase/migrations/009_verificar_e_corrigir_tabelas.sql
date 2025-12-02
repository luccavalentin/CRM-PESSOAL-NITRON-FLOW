-- ============================================
-- SCRIPT DE VERIFICAÇÃO E CORREÇÃO DE TABELAS
-- Sistema CRM - Lucca
-- ============================================
-- Este script verifica e cria/corrige todas as tabelas necessárias
-- para a sincronização completa com Supabase
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORRIGIR TABELA IDEIAS
-- ============================================
-- A tabela ideias no schema original usa 'texto' ao invés de 'titulo'
-- e 'potencial_financeiro' ao invés de 'prioridade'
-- Vamos adicionar os campos que faltam ou renomear se necessário

-- Adicionar coluna 'titulo' se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ideias' 
    AND column_name = 'titulo'
  ) THEN
    -- Se existe 'texto', usamos como base para 'titulo'
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'ideias' 
      AND column_name = 'texto'
    ) THEN
      ALTER TABLE ideias ADD COLUMN titulo VARCHAR(255);
      UPDATE ideias SET titulo = LEFT(texto, 255) WHERE titulo IS NULL;
    ELSE
      ALTER TABLE ideias ADD COLUMN titulo VARCHAR(255);
    END IF;
  END IF;
END $$;

-- Adicionar coluna 'prioridade' se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ideias' 
    AND column_name = 'prioridade'
  ) THEN
    -- Se existe 'potencial_financeiro', convertemos para prioridade
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'ideias' 
      AND column_name = 'potencial_financeiro'
    ) THEN
      ALTER TABLE ideias ADD COLUMN prioridade VARCHAR(20) DEFAULT 'Média';
      UPDATE ideias SET prioridade = 
        CASE 
          WHEN potencial_financeiro >= 8 THEN 'Alta'
          WHEN potencial_financeiro >= 5 THEN 'Média'
          ELSE 'Baixa'
        END
      WHERE prioridade IS NULL;
    ELSE
      ALTER TABLE ideias ADD COLUMN prioridade VARCHAR(20) DEFAULT 'Média';
    END IF;
  END IF;
END $$;

-- Garantir que a tabela ideias tem a estrutura correta
CREATE TABLE IF NOT EXISTS ideias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo VARCHAR(255),
  descricao TEXT,
  categoria VARCHAR(20) DEFAULT 'Outro' CHECK (categoria IN ('Negócio', 'Automação', 'Projeto', 'Conteúdo', 'Outro')),
  prioridade VARCHAR(20) DEFAULT 'Média' CHECK (prioridade IN ('Baixa', 'Média', 'Alta')),
  status VARCHAR(20) DEFAULT 'Explorando' CHECK (status IN ('Explorando', 'Em Análise', 'Em Teste', 'Executando', 'Arquivada')),
  data_criacao DATE DEFAULT CURRENT_DATE,
  tarefa_id UUID,
  projeto_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar campos que podem faltar
ALTER TABLE ideias DROP COLUMN IF EXISTS texto CASCADE;
ALTER TABLE ideias DROP COLUMN IF EXISTS potencial_financeiro CASCADE;

-- ============================================
-- GARANTIR QUE TODAS AS TABELAS NECESSÁRIAS EXISTEM
-- ============================================

-- Tabela de projetos pessoais (garantir que existe com campos corretos)
CREATE TABLE IF NOT EXISTS projetos_pessoais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  status VARCHAR(20) DEFAULT 'Planejamento' CHECK (status IN ('Planejamento', 'Em Andamento', 'Pausado', 'Concluído', 'Cancelado')),
  data_inicio DATE DEFAULT CURRENT_DATE,
  data_fim DATE,
  progresso INTEGER DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar coluna data_fim se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projetos_pessoais' 
    AND column_name = 'data_fim'
  ) THEN
    ALTER TABLE projetos_pessoais ADD COLUMN data_fim DATE;
  END IF;
END $$;

-- Tabela de categorias financeiras (garantir que existe)
CREATE TABLE IF NOT EXISTS categorias_financeiras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida', 'ambos')),
  descricao TEXT,
  cor VARCHAR(7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, nome, tipo)
);

-- Adicionar campos que faltam nas transações financeiras
DO $$
BEGIN
  -- Transações financeiras pessoais
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transacoes_financeiras_pessoais') THEN
    ALTER TABLE transacoes_financeiras_pessoais 
      ADD COLUMN IF NOT EXISTS paga BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS data_pagamento DATE,
      ADD COLUMN IF NOT EXISTS data_vencimento DATE,
      ADD COLUMN IF NOT EXISTS rolou_mes BOOLEAN DEFAULT FALSE;
  END IF;

  -- Transações financeiras empresa
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transacoes_financeiras_empresa') THEN
    ALTER TABLE transacoes_financeiras_empresa 
      ADD COLUMN IF NOT EXISTS paga BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS data_pagamento DATE,
      ADD COLUMN IF NOT EXISTS data_vencimento DATE,
      ADD COLUMN IF NOT EXISTS rolou_mes BOOLEAN DEFAULT FALSE;
  END IF;

  -- Tarefas
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tarefas') THEN
    ALTER TABLE tarefas 
      ADD COLUMN IF NOT EXISTS etiquetas TEXT[],
      ADD COLUMN IF NOT EXISTS tarefa_rapida BOOLEAN DEFAULT FALSE;
  END IF;

  -- Projetos
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projetos') THEN
    ALTER TABLE projetos 
      ADD COLUMN IF NOT EXISTS prioridade VARCHAR(20),
      ADD COLUMN IF NOT EXISTS cliente_id UUID,
      ADD COLUMN IF NOT EXISTS progresso INTEGER DEFAULT 0;
  END IF;
END $$;

-- ============================================
-- CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_ideias_usuario_id ON ideias(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ideias_status ON ideias(status);
CREATE INDEX IF NOT EXISTS idx_ideias_data_criacao ON ideias(data_criacao);

CREATE INDEX IF NOT EXISTS idx_projetos_pessoais_usuario_id ON projetos_pessoais(usuario_id);
CREATE INDEX IF NOT EXISTS idx_projetos_pessoais_status ON projetos_pessoais(status);

CREATE INDEX IF NOT EXISTS idx_categorias_financeiras_usuario_id ON categorias_financeiras(usuario_id);
CREATE INDEX IF NOT EXISTS idx_categorias_financeiras_tipo ON categorias_financeiras(tipo);

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Mostrar todas as tabelas que devem existir
DO $$
DECLARE
  required_tables TEXT[] := ARRAY[
    'usuarios',
    'leads',
    'clientes',
    'tarefas',
    'projetos',
    'projetos_pessoais',
    'ideias',
    'transacoes_financeiras_pessoais',
    'transacoes_financeiras_empresa',
    'lista_compras',
    'categorias_financeiras',
    'dividas',
    'acordos',
    'parcelas_acordo'
  ];
  tbl_name TEXT;
  table_exists BOOLEAN;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICAÇÃO DE TABELAS NECESSÁRIAS';
  RAISE NOTICE '========================================';
  
  FOREACH tbl_name IN ARRAY required_tables
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = tbl_name
    ) INTO table_exists;
    
    IF table_exists THEN
      RAISE NOTICE '✅ Tabela "%" existe', tbl_name;
    ELSE
      RAISE WARNING '❌ Tabela "%" NÃO existe - precisa ser criada!', tbl_name;
    END IF;
  END LOOP;
  
  RAISE NOTICE '========================================';
END $$;

-- ============================================
-- FIM DO SCRIPT
-- ============================================

