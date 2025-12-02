-- ============================================
-- CRIAÇÃO DA TABELA DE CATEGORIAS FINANCEIRAS
-- ============================================
-- Este script cria a tabela para armazenar categorias personalizadas
-- As categorias também são salvas no localStorage via Zustand, mas esta tabela
-- permite sincronização futura com o Supabase se necessário

-- Garantir que a tabela usuarios existe
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo')),
  plano VARCHAR(100),
  aplicativo_vinculado VARCHAR(255),
  data_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ultimo_acesso TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de categorias financeiras
CREATE TABLE IF NOT EXISTS categorias_financeiras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida', 'ambos')),
  descricao TEXT,
  cor VARCHAR(7), -- Cor em hexadecimal para personalização
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, nome, tipo)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_categorias_usuario ON categorias_financeiras(usuario_id);
CREATE INDEX IF NOT EXISTS idx_categorias_tipo ON categorias_financeiras(tipo);
CREATE INDEX IF NOT EXISTS idx_categorias_nome ON categorias_financeiras(nome);

-- Comentários
COMMENT ON TABLE categorias_financeiras IS 'Armazena categorias personalizadas de transações financeiras';
COMMENT ON COLUMN categorias_financeiras.tipo IS 'Tipo de transação: entrada, saida ou ambos';
COMMENT ON COLUMN categorias_financeiras.cor IS 'Cor em hexadecimal para personalização visual';

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_categorias_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_categorias_updated_at ON categorias_financeiras;
CREATE TRIGGER trigger_update_categorias_updated_at
  BEFORE UPDATE ON categorias_financeiras
  FOR EACH ROW
  EXECUTE FUNCTION update_categorias_updated_at();

-- ============================================
-- NOTA IMPORTANTE:
-- ============================================
-- As categorias são atualmente salvas no localStorage via Zustand
-- Esta tabela está pronta para futura sincronização com o Supabase
-- quando necessário. O sistema funciona perfeitamente sem esta tabela
-- usando apenas o localStorage.
-- ============================================



