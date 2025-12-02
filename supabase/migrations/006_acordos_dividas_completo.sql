-- ============================================
-- TABELAS DE ACORDOS E DÍVIDAS - VERSÃO COMPLETA
-- ============================================
-- Este script cria tabelas completas para gerenciamento de dívidas e acordos
-- Permite mapear todas as dívidas e renegociar com taxas, prazos e condições

-- Tabela de Dívidas
CREATE TABLE IF NOT EXISTS dividas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  descricao VARCHAR(255) NOT NULL,
  credor VARCHAR(255) NOT NULL,
  valor_original DECIMAL(15, 2) NOT NULL,
  valor_atual DECIMAL(15, 2) NOT NULL,
  data_vencimento DATE NOT NULL,
  taxa_juros_original DECIMAL(5, 2),
  tipo_divida VARCHAR(20) DEFAULT 'outros' CHECK (tipo_divida IN ('cartao', 'emprestimo', 'financiamento', 'outros')),
  observacoes TEXT,
  status VARCHAR(20) DEFAULT 'ativa' CHECK (status IN ('ativa', 'renegociada', 'quitada')),
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_quitacao DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE dividas IS 'Armazena todas as dívidas do usuário para mapeamento completo';

-- Tabela de Acordos (Renegociações)
CREATE TABLE IF NOT EXISTS acordos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  divida_id UUID NOT NULL REFERENCES dividas(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  descricao VARCHAR(255) NOT NULL,
  valor_total DECIMAL(15, 2) NOT NULL,
  valor_original DECIMAL(15, 2) NOT NULL,
  numero_parcelas INTEGER NOT NULL,
  taxa_juros DECIMAL(5, 2),
  taxa_desconto DECIMAL(5, 2),
  data_inicio DATE NOT NULL,
  data_fim DATE,
  observacoes TEXT,
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'concluido', 'cancelado')),
  valor_economizado DECIMAL(15, 2),
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE acordos IS 'Armazena acordos de renegociação com condições melhoradas';

-- Tabela de Parcelas de Acordo
CREATE TABLE IF NOT EXISTS parcelas_acordo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  acordo_id UUID NOT NULL REFERENCES acordos(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  valor DECIMAL(15, 2) NOT NULL,
  data_vencimento DATE NOT NULL,
  paga BOOLEAN DEFAULT FALSE,
  data_pagamento DATE,
  juros DECIMAL(10, 2) DEFAULT 0,
  multa DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(acordo_id, numero)
);

COMMENT ON TABLE parcelas_acordo IS 'Armazena as parcelas de cada acordo de renegociação';

-- Tabela de Histórico de Renegociações
CREATE TABLE IF NOT EXISTS historico_renegociacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  divida_id UUID NOT NULL REFERENCES dividas(id) ON DELETE CASCADE,
  acordo_id UUID REFERENCES acordos(id) ON DELETE SET NULL,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  valor_anterior DECIMAL(15, 2) NOT NULL,
  valor_novo DECIMAL(15, 2) NOT NULL,
  taxa_juros_anterior DECIMAL(5, 2),
  taxa_juros_nova DECIMAL(5, 2),
  numero_parcelas_anterior INTEGER,
  numero_parcelas_novo INTEGER,
  motivo TEXT,
  data_renegociacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE historico_renegociacoes IS 'Histórico completo de todas as renegociações realizadas';

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_dividas_usuario ON dividas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_dividas_status ON dividas(status);
CREATE INDEX IF NOT EXISTS idx_dividas_tipo ON dividas(tipo_divida);
CREATE INDEX IF NOT EXISTS idx_dividas_vencimento ON dividas(data_vencimento);

CREATE INDEX IF NOT EXISTS idx_acordos_divida ON acordos(divida_id);
CREATE INDEX IF NOT EXISTS idx_acordos_usuario ON acordos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_acordos_status ON acordos(status);

CREATE INDEX IF NOT EXISTS idx_parcelas_acordo ON parcelas_acordo(acordo_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_vencimento ON parcelas_acordo(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_parcelas_paga ON parcelas_acordo(paga);

CREATE INDEX IF NOT EXISTS idx_historico_divida ON historico_renegociacoes(divida_id);
CREATE INDEX IF NOT EXISTS idx_historico_usuario ON historico_renegociacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historico_data ON historico_renegociacoes(data_renegociacao);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_dividas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_acordos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_parcelas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS trigger_update_dividas_updated_at ON dividas;
CREATE TRIGGER trigger_update_dividas_updated_at
  BEFORE UPDATE ON dividas
  FOR EACH ROW
  EXECUTE FUNCTION update_dividas_updated_at();

DROP TRIGGER IF EXISTS trigger_update_acordos_updated_at ON acordos;
CREATE TRIGGER trigger_update_acordos_updated_at
  BEFORE UPDATE ON acordos
  FOR EACH ROW
  EXECUTE FUNCTION update_acordos_updated_at();

DROP TRIGGER IF EXISTS trigger_update_parcelas_updated_at ON parcelas_acordo;
CREATE TRIGGER trigger_update_parcelas_updated_at
  BEFORE UPDATE ON parcelas_acordo
  FOR EACH ROW
  EXECUTE FUNCTION update_parcelas_updated_at();

-- Função para calcular valor economizado automaticamente
CREATE OR REPLACE FUNCTION calcular_valor_economizado()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.valor_original IS NOT NULL AND NEW.valor_total IS NOT NULL THEN
    NEW.valor_economizado = NEW.valor_original - NEW.valor_total;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calcular_economia ON acordos;
CREATE TRIGGER trigger_calcular_economia
  BEFORE INSERT OR UPDATE ON acordos
  FOR EACH ROW
  EXECUTE FUNCTION calcular_valor_economizado();

-- Função para atualizar status da dívida quando acordo é criado
CREATE OR REPLACE FUNCTION atualizar_status_divida_ao_criar_acordo()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE dividas
  SET status = 'renegociada',
      valor_atual = NEW.valor_total,
      updated_at = NOW()
  WHERE id = NEW.divida_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_divida_ao_criar_acordo ON acordos;
CREATE TRIGGER trigger_atualizar_divida_ao_criar_acordo
  AFTER INSERT ON acordos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_status_divida_ao_criar_acordo();

-- Função para marcar dívida como quitada quando todas as parcelas são pagas
CREATE OR REPLACE FUNCTION verificar_quitacao_divida()
RETURNS TRIGGER AS $$
DECLARE
  total_parcelas INTEGER;
  parcelas_pagas INTEGER;
  divida_id_var UUID;
BEGIN
  -- Obter acordo_id e divida_id
  SELECT acordo_id INTO divida_id_var FROM parcelas_acordo WHERE id = NEW.id;
  SELECT a.divida_id INTO divida_id_var FROM acordos a WHERE a.id = (SELECT acordo_id FROM parcelas_acordo WHERE id = NEW.id);
  
  -- Contar parcelas
  SELECT COUNT(*), COUNT(*) FILTER (WHERE paga = TRUE)
  INTO total_parcelas, parcelas_pagas
  FROM parcelas_acordo
  WHERE acordo_id = (SELECT acordo_id FROM parcelas_acordo WHERE id = NEW.id);
  
  -- Se todas as parcelas foram pagas, marcar dívida como quitada
  IF parcelas_pagas = total_parcelas THEN
    UPDATE dividas
    SET status = 'quitada',
        data_quitacao = CURRENT_DATE,
        updated_at = NOW()
    WHERE id = divida_id_var;
    
    UPDATE acordos
    SET status = 'concluido',
        updated_at = NOW()
    WHERE id = (SELECT acordo_id FROM parcelas_acordo WHERE id = NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_verificar_quitacao ON parcelas_acordo;
CREATE TRIGGER trigger_verificar_quitacao
  AFTER UPDATE OF paga ON parcelas_acordo
  FOR EACH ROW
  WHEN (NEW.paga = TRUE AND OLD.paga = FALSE)
  EXECUTE FUNCTION verificar_quitacao_divida();

-- Habilitar RLS (Row Level Security)
ALTER TABLE dividas ENABLE ROW LEVEL SECURITY;
ALTER TABLE acordos ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelas_acordo ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_renegociacoes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para dividas
DROP POLICY IF EXISTS "Usuários podem ver suas próprias dívidas" ON dividas;
CREATE POLICY "Usuários podem ver suas próprias dívidas"
  ON dividas FOR SELECT
  USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Usuários podem inserir suas próprias dívidas" ON dividas;
CREATE POLICY "Usuários podem inserir suas próprias dívidas"
  ON dividas FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias dívidas" ON dividas;
CREATE POLICY "Usuários podem atualizar suas próprias dívidas"
  ON dividas FOR UPDATE
  USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Usuários podem deletar suas próprias dívidas" ON dividas;
CREATE POLICY "Usuários podem deletar suas próprias dívidas"
  ON dividas FOR DELETE
  USING (auth.uid() = usuario_id);

-- Políticas RLS para acordos
DROP POLICY IF EXISTS "Usuários podem ver seus próprios acordos" ON acordos;
CREATE POLICY "Usuários podem ver seus próprios acordos"
  ON acordos FOR SELECT
  USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Usuários podem inserir seus próprios acordos" ON acordos;
CREATE POLICY "Usuários podem inserir seus próprios acordos"
  ON acordos FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios acordos" ON acordos;
CREATE POLICY "Usuários podem atualizar seus próprios acordos"
  ON acordos FOR UPDATE
  USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Usuários podem deletar seus próprios acordos" ON acordos;
CREATE POLICY "Usuários podem deletar seus próprios acordos"
  ON acordos FOR DELETE
  USING (auth.uid() = usuario_id);

-- Políticas RLS para parcelas_acordo
DROP POLICY IF EXISTS "Usuários podem ver suas próprias parcelas" ON parcelas_acordo;
CREATE POLICY "Usuários podem ver suas próprias parcelas"
  ON parcelas_acordo FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM acordos a
      WHERE a.id = parcelas_acordo.acordo_id
      AND a.usuario_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Usuários podem inserir suas próprias parcelas" ON parcelas_acordo;
CREATE POLICY "Usuários podem inserir suas próprias parcelas"
  ON parcelas_acordo FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM acordos a
      WHERE a.id = parcelas_acordo.acordo_id
      AND a.usuario_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias parcelas" ON parcelas_acordo;
CREATE POLICY "Usuários podem atualizar suas próprias parcelas"
  ON parcelas_acordo FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM acordos a
      WHERE a.id = parcelas_acordo.acordo_id
      AND a.usuario_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Usuários podem deletar suas próprias parcelas" ON parcelas_acordo;
CREATE POLICY "Usuários podem deletar suas próprias parcelas"
  ON parcelas_acordo FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM acordos a
      WHERE a.id = parcelas_acordo.acordo_id
      AND a.usuario_id = auth.uid()
    )
  );

-- Políticas RLS para historico_renegociacoes
DROP POLICY IF EXISTS "Usuários podem ver seu próprio histórico" ON historico_renegociacoes;
CREATE POLICY "Usuários podem ver seu próprio histórico"
  ON historico_renegociacoes FOR SELECT
  USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Usuários podem inserir seu próprio histórico" ON historico_renegociacoes;
CREATE POLICY "Usuários podem inserir seu próprio histórico"
  ON historico_renegociacoes FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View para resumo de dívidas
CREATE OR REPLACE VIEW vw_resumo_dividas AS
SELECT 
  d.usuario_id,
  COUNT(*) FILTER (WHERE d.status = 'ativa') as total_ativas,
  COUNT(*) FILTER (WHERE d.status = 'renegociada') as total_renegociadas,
  COUNT(*) FILTER (WHERE d.status = 'quitada') as total_quitadas,
  SUM(d.valor_atual) FILTER (WHERE d.status = 'ativa') as valor_total_ativas,
  SUM(d.valor_atual) FILTER (WHERE d.status = 'renegociada') as valor_total_renegociadas,
  MIN(d.data_vencimento) FILTER (WHERE d.status = 'ativa') as proximo_vencimento
FROM dividas d
GROUP BY d.usuario_id;

-- View para resumo de acordos
CREATE OR REPLACE VIEW vw_resumo_acordos AS
SELECT 
  a.usuario_id,
  COUNT(*) FILTER (WHERE a.status = 'ativo') as total_ativos,
  COUNT(*) FILTER (WHERE a.status = 'concluido') as total_concluidos,
  SUM(a.valor_economizado) FILTER (WHERE a.status = 'ativo') as economia_total_ativa,
  SUM(a.valor_economizado) as economia_total_geral
FROM acordos a
GROUP BY a.usuario_id;

-- ============================================
-- FUNÇÕES ÚTEIS
-- ============================================

-- Função para obter próximo vencimento
CREATE OR REPLACE FUNCTION get_proximo_vencimento(user_id UUID)
RETURNS TABLE (
  parcela_id UUID,
  acordo_id UUID,
  divida_id UUID,
  valor DECIMAL(15, 2),
  data_vencimento DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.acordo_id,
    a.divida_id,
    p.valor,
    p.data_vencimento
  FROM parcelas_acordo p
  INNER JOIN acordos a ON a.id = p.acordo_id
  WHERE a.usuario_id = user_id
    AND a.status = 'ativo'
    AND p.paga = FALSE
    AND p.data_vencimento >= CURRENT_DATE
  ORDER BY p.data_vencimento ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para calcular economia total
CREATE OR REPLACE FUNCTION calcular_economia_total(user_id UUID)
RETURNS DECIMAL(15, 2) AS $$
DECLARE
  economia DECIMAL(15, 2);
BEGIN
  SELECT COALESCE(SUM(valor_economizado), 0)
  INTO economia
  FROM acordos
  WHERE usuario_id = user_id
    AND status IN ('ativo', 'concluido');
  
  RETURN economia;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMENTÁRIOS FINAIS
-- ============================================
COMMENT ON FUNCTION get_proximo_vencimento IS 'Retorna a próxima parcela a vencer do usuário';
COMMENT ON FUNCTION calcular_economia_total IS 'Calcula o valor total economizado em acordos';

