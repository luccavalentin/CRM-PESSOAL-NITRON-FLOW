-- ============================================
-- SCRIPT COMPLETO DE MELHORIAS - EXECUTAR UMA VEZ
-- ============================================
-- Este script inclui todas as melhorias necessárias:
-- 1. Categorias financeiras
-- 2. Negociações de dívidas
-- 3. Projetos com preço de venda e quantidade de clientes
-- ============================================

-- ============================================
-- PARTE 1: CATEGORIAS FINANCEIRAS
-- ============================================

DO $$
BEGIN
  -- Criar tabela de categorias se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categorias_financeiras') THEN
    CREATE TABLE categorias_financeiras (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      usuario_id UUID,
      nome VARCHAR(100) NOT NULL,
      tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida', 'ambos')),
      descricao TEXT,
      cor VARCHAR(7), -- Cor em hexadecimal para personalização
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(usuario_id, nome, tipo)
    );

    -- Adicionar foreign key apenas se a tabela usuarios existir
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios') THEN
      ALTER TABLE categorias_financeiras 
      ADD CONSTRAINT fk_categorias_usuario 
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE;
    END IF;

    -- Criar índices para melhor performance
    CREATE INDEX IF NOT EXISTS idx_categorias_usuario ON categorias_financeiras(usuario_id);
    CREATE INDEX IF NOT EXISTS idx_categorias_tipo ON categorias_financeiras(tipo);
    CREATE INDEX IF NOT EXISTS idx_categorias_nome ON categorias_financeiras(nome);
    
    -- Comentários
    COMMENT ON TABLE categorias_financeiras IS 'Armazena categorias personalizadas de transações financeiras';
  END IF;
END $$;

-- ============================================
-- PARTE 2: NEGOCIAÇÕES DE DÍVIDAS
-- ============================================

DO $$
BEGIN
  -- Criar tabela de negociações de dívidas se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'negociacoes_dividas') THEN
    CREATE TABLE negociacoes_dividas (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      usuario_id UUID,
      divida_id UUID,
      descricao VARCHAR(255) NOT NULL,
      credor VARCHAR(255) NOT NULL,
      valor_original DECIMAL(15, 2) NOT NULL,
      valor_atual DECIMAL(15, 2) NOT NULL,
      valor_renegociado DECIMAL(15, 2),
      data_vencimento DATE NOT NULL,
      data_renegociacao DATE,
      numero_parcelas INTEGER,
      taxa_juros DECIMAL(5, 2),
      status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'renegociada', 'quitada', 'vencida')),
      observacoes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Adicionar foreign key apenas se a tabela usuarios existir
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios') THEN
      ALTER TABLE negociacoes_dividas 
      ADD CONSTRAINT fk_negociacoes_usuario 
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE;
    END IF;

    -- Criar índices
    CREATE INDEX IF NOT EXISTS idx_negociacoes_usuario ON negociacoes_dividas(usuario_id);
    CREATE INDEX IF NOT EXISTS idx_negociacoes_status ON negociacoes_dividas(status);
    CREATE INDEX IF NOT EXISTS idx_negociacoes_data_vencimento ON negociacoes_dividas(data_vencimento);

    COMMENT ON TABLE negociacoes_dividas IS 'Gerencia dívidas e renegociações';
  END IF;

  -- Criar tabela de parcelas de renegociação se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'parcelas_renegociacao') THEN
    CREATE TABLE parcelas_renegociacao (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      negociacao_id UUID NOT NULL,
      numero INTEGER NOT NULL,
      valor DECIMAL(15, 2) NOT NULL,
      data_vencimento DATE NOT NULL,
      paga BOOLEAN DEFAULT FALSE,
      data_pagamento DATE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      FOREIGN KEY (negociacao_id) REFERENCES negociacoes_dividas(id) ON DELETE CASCADE,
      UNIQUE(negociacao_id, numero)
    );

    -- Criar índices
    CREATE INDEX IF NOT EXISTS idx_parcelas_negociacao ON parcelas_renegociacao(negociacao_id);
    CREATE INDEX IF NOT EXISTS idx_parcelas_data_vencimento ON parcelas_renegociacao(data_vencimento);
    CREATE INDEX IF NOT EXISTS idx_parcelas_paga ON parcelas_renegociacao(paga);

    COMMENT ON TABLE parcelas_renegociacao IS 'Armazena parcelas de dívidas renegociadas';
  END IF;
END $$;

-- ============================================
-- PARTE 3: FUNÇÃO PARA ATUALIZAR updated_at
-- ============================================

-- Criar função update_updated_at_column se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PARTE 4: TRIGGERS PARA updated_at
-- ============================================

DO $$
BEGIN
  -- Triggers para categorias_financeiras
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categorias_financeiras') THEN
    DROP TRIGGER IF EXISTS update_categorias_updated_at ON categorias_financeiras;
    CREATE TRIGGER update_categorias_updated_at
      BEFORE UPDATE ON categorias_financeiras
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Triggers para negociacoes_dividas
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'negociacoes_dividas') THEN
    DROP TRIGGER IF EXISTS update_negociacoes_updated_at ON negociacoes_dividas;
    CREATE TRIGGER update_negociacoes_updated_at
      BEFORE UPDATE ON negociacoes_dividas
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Triggers para parcelas_renegociacao
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'parcelas_renegociacao') THEN
    DROP TRIGGER IF EXISTS update_parcelas_updated_at ON parcelas_renegociacao;
    CREATE TRIGGER update_parcelas_updated_at
      BEFORE UPDATE ON parcelas_renegociacao
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================
-- PARTE 5: PROJETOS - PREÇO DE VENDA E CLIENTES
-- ============================================

DO $$
BEGIN
  -- Verificar se a tabela projetos existe antes de adicionar colunas
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projetos') THEN
    -- Adicionar coluna preco_venda se não existir
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'projetos' AND column_name = 'preco_venda'
    ) THEN
      ALTER TABLE projetos 
      ADD COLUMN preco_venda DECIMAL(15, 2);
      
      COMMENT ON COLUMN projetos.preco_venda IS 'Preço de venda do projeto';
    END IF;

    -- Adicionar coluna quantidade_clientes se não existir
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'projetos' AND column_name = 'quantidade_clientes'
    ) THEN
      ALTER TABLE projetos 
      ADD COLUMN quantidade_clientes INTEGER DEFAULT 0;
      
      COMMENT ON COLUMN projetos.quantidade_clientes IS 'Quantidade de clientes do projeto';
    END IF;

    -- Criar índices para melhor performance em consultas
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE indexname = 'idx_projetos_preco_venda'
    ) THEN
      CREATE INDEX idx_projetos_preco_venda ON projetos(preco_venda) WHERE preco_venda IS NOT NULL;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE indexname = 'idx_projetos_quantidade_clientes'
    ) THEN
      CREATE INDEX idx_projetos_quantidade_clientes ON projetos(quantidade_clientes) WHERE quantidade_clientes IS NOT NULL;
    END IF;

    -- Criar view para análise de projetos com preço de venda
    CREATE OR REPLACE VIEW vw_projetos_venda AS
    SELECT 
      id,
      nome,
      cliente,
      valor,
      preco_venda,
      quantidade_clientes,
      CASE 
        WHEN preco_venda IS NOT NULL AND quantidade_clientes > 0 
        THEN preco_venda * quantidade_clientes 
        ELSE NULL 
      END as receita_potencial,
      status,
      data_inicio,
      prazo
    FROM projetos
    WHERE preco_venda IS NOT NULL OR quantidade_clientes IS NOT NULL;

    COMMENT ON VIEW vw_projetos_venda IS 'View com análise de projetos incluindo preço de venda e quantidade de clientes';
  ELSE
    -- Se a tabela não existir, apenas registrar um aviso
    RAISE NOTICE 'Tabela projetos não existe. As colunas preco_venda e quantidade_clientes serão adicionadas quando a tabela for criada.';
  END IF;
END $$;

-- ============================================
-- PARTE 6: VIEWS DE ANÁLISE
-- ============================================

DO $$
BEGIN
  -- Criar view de resumo de negociações se as tabelas existirem
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'negociacoes_dividas') 
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'parcelas_renegociacao') THEN
    
    -- Dropar a view se existir (para evitar erro de mudança de colunas)
    DROP VIEW IF EXISTS vw_resumo_negociacoes;
    
    -- Criar a view novamente
    CREATE VIEW vw_resumo_negociacoes AS
    SELECT 
      n.usuario_id,
      n.id as negociacao_id,
      n.descricao,
      n.credor,
      n.valor_original,
      n.valor_atual,
      n.valor_renegociado,
      n.status,
      COUNT(p.id) as total_parcelas,
      COUNT(CASE WHEN p.paga THEN 1 END) as parcelas_pagas,
      COUNT(CASE WHEN NOT p.paga THEN 1 END) as parcelas_pendentes,
      SUM(CASE WHEN p.paga THEN p.valor ELSE 0 END) as valor_pago,
      SUM(CASE WHEN NOT p.paga THEN p.valor ELSE 0 END) as valor_pendente
    FROM negociacoes_dividas n
    LEFT JOIN parcelas_renegociacao p ON n.id = p.negociacao_id
    GROUP BY n.usuario_id, n.id, n.descricao, n.credor, n.valor_original, n.valor_atual, n.valor_renegociado, n.status;

    COMMENT ON VIEW vw_resumo_negociacoes IS 'Resumo consolidado de negociações e parcelas por usuário';
  END IF;
END $$;

-- ============================================
-- COMENTÁRIOS FINAIS
-- ============================================

DO $$
BEGIN
  -- Adicionar comentários nas tabelas (com tratamento de erro)
  BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categorias_financeiras') THEN
      EXECUTE 'COMMENT ON TABLE categorias_financeiras IS ''Armazena categorias personalizadas de transações financeiras''';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'negociacoes_dividas') THEN
      EXECUTE 'COMMENT ON TABLE negociacoes_dividas IS ''Gerencia dívidas e renegociações''';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'parcelas_renegociacao') THEN
      EXECUTE 'COMMENT ON TABLE parcelas_renegociacao IS ''Armazena parcelas de dívidas renegociadas''';
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      -- Ignorar erros de comentários
      NULL;
  END;
END $$;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
-- Script executado com sucesso!
-- Todas as melhorias foram aplicadas.

