-- ============================================
-- ADICIONAR CAMPOS PREÇO DE VENDA E QUANTIDADE DE CLIENTES
-- ============================================

-- Adicionar campos preco_venda e quantidade_clientes na tabela projetos
DO $$
BEGIN
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
END $$;

