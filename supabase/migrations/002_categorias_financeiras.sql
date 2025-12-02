-- ============================================
-- MELHORIAS PARA CATEGORIAS FINANCEIRAS
-- ============================================

-- Garantir que a tabela de categorias financeiras existe e está atualizada
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
  END IF;

  -- Adicionar campos paga e dataPagamento nas tabelas de transações se não existirem
  -- Nota: Como estamos usando Zustand (localStorage), essas colunas podem não ser necessárias no banco
  -- Mas vamos criar views para facilitar consultas futuras se necessário

  -- Comentários
  COMMENT ON TABLE categorias_financeiras IS 'Armazena categorias personalizadas de transações financeiras';
  
  -- Nota: A view vw_categorias_mais_usadas foi removida porque as transações
  -- são armazenadas no localStorage (Zustand) e não no banco de dados.
  -- Se no futuro as transações forem migradas para o banco, esta view pode ser recriada.
END $$;

