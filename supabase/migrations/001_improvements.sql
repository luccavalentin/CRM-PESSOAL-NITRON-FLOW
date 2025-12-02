-- ============================================
-- MELHORIAS E FUNCIONALIDADES ADICIONAIS
-- ============================================

-- Tabela para armazenar categorias personalizadas
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

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_categorias_usuario ON categorias_financeiras(usuario_id);
CREATE INDEX IF NOT EXISTS idx_categorias_tipo ON categorias_financeiras(tipo);

-- Tabela para negociações de dívidas (melhorias)
CREATE TABLE IF NOT EXISTS negociacoes_dividas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  divida_id UUID, -- Referência à dívida original (pode ser de outra tabela ou externa)
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

-- Tabela para parcelas de renegociação
CREATE TABLE IF NOT EXISTS parcelas_renegociacao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  negociacao_id UUID REFERENCES negociacoes_dividas(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  valor DECIMAL(15, 2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  paga BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(negociacao_id, numero)
);

-- Índices para negociações
CREATE INDEX IF NOT EXISTS idx_negociacoes_usuario ON negociacoes_dividas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_negociacoes_status ON negociacoes_dividas(status);
CREATE INDEX IF NOT EXISTS idx_parcelas_negociacao ON parcelas_renegociacao(negociacao_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_vencimento ON parcelas_renegociacao(data_vencimento);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_categorias_updated_at
  BEFORE UPDATE ON categorias_financeiras
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_negociacoes_updated_at
  BEFORE UPDATE ON negociacoes_dividas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parcelas_updated_at
  BEFORE UPDATE ON parcelas_renegociacao
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- View para análise financeira por categoria e período
CREATE OR REPLACE VIEW vw_analise_categoria_periodo AS
SELECT 
  usuario_id,
  categoria,
  tipo,
  DATE_TRUNC('month', data) as mes,
  DATE_TRUNC('year', data) as ano,
  COUNT(*) as quantidade,
  SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) as total_entradas,
  SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as total_saidas,
  SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE -valor END) as saldo
FROM transacoes_financeiras_pessoais
GROUP BY usuario_id, categoria, tipo, DATE_TRUNC('month', data), DATE_TRUNC('year', data)
UNION ALL
SELECT 
  usuario_id,
  categoria,
  tipo,
  DATE_TRUNC('month', data) as mes,
  DATE_TRUNC('year', data) as ano,
  COUNT(*) as quantidade,
  SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) as total_entradas,
  SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as total_saidas,
  SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE -valor END) as saldo
FROM transacoes_financeiras_empresa
GROUP BY usuario_id, categoria, tipo, DATE_TRUNC('month', data), DATE_TRUNC('year', data);

-- View para resumo de negociações
CREATE OR REPLACE VIEW vw_resumo_negociacoes AS
SELECT 
  n.usuario_id,
  COUNT(DISTINCT n.id) as total_dividas,
  COUNT(DISTINCT CASE WHEN n.status = 'pendente' THEN n.id END) as dividas_pendentes,
  COUNT(DISTINCT CASE WHEN n.status = 'renegociada' THEN n.id END) as dividas_renegociadas,
  SUM(n.valor_atual) as valor_total_pendente,
  SUM(n.valor_renegociado) as valor_total_renegociado,
  COUNT(p.id) as total_parcelas,
  COUNT(CASE WHEN p.paga THEN 1 END) as parcelas_pagas,
  SUM(CASE WHEN NOT p.paga THEN p.valor ELSE 0 END) as valor_parcelas_pendentes
FROM negociacoes_dividas n
LEFT JOIN parcelas_renegociacao p ON n.id = p.negociacao_id
GROUP BY n.usuario_id;

-- Comentários nas tabelas
COMMENT ON TABLE categorias_financeiras IS 'Armazena categorias personalizadas de transações financeiras';
COMMENT ON TABLE negociacoes_dividas IS 'Gerencia dívidas e renegociações';
COMMENT ON TABLE parcelas_renegociacao IS 'Armazena parcelas de dívidas renegociadas';
COMMENT ON VIEW vw_analise_categoria_periodo IS 'Análise financeira agrupada por categoria e período (mensal/anual)';
COMMENT ON VIEW vw_resumo_negociacoes IS 'Resumo consolidado de negociações e parcelas por usuário';

