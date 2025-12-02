-- ============================================
-- MELHORIAS COMPLETAS - CATEGORIAS E PROJETOS
-- ============================================
-- Este script combina as melhorias de categorias financeiras e projetos

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
    
    -- Nota: A view vw_categorias_mais_usadas foi removida porque as transações
    -- são armazenadas no localStorage (Zustand) e não no banco de dados.
    -- Se no futuro as transações forem migradas para o banco, esta view pode ser recriada.
  END IF;
END $$;

-- ============================================
-- PARTE 2: PROJETOS - PREÇO DE VENDA E CLIENTES
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

