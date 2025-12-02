-- ============================================
-- TABELAS DE DÍVIDAS E ACORDOS
-- ============================================

-- Tabela de Dívidas
CREATE TABLE IF NOT EXISTS dividas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  descricao VARCHAR(255) NOT NULL,
  credor VARCHAR(255) NOT NULL,
  valor_original DECIMAL(15, 2) NOT NULL,
  valor_atual DECIMAL(15, 2) NOT NULL,
  data_vencimento DATE NOT NULL,
  taxa_juros_original DECIMAL(5, 2),
  tipo_divida VARCHAR(20) NOT NULL CHECK (tipo_divida IN ('cartao', 'emprestimo', 'financiamento', 'outros')),
  observacoes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'renegociada', 'quitada')),
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_quitacao TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE dividas IS 'Armazena todas as dívidas do usuário para mapeamento e renegociação';

-- Tabela de Acordos
CREATE TABLE IF NOT EXISTS acordos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  divida_id UUID REFERENCES dividas(id) ON DELETE CASCADE,
  descricao VARCHAR(255) NOT NULL,
  valor_total DECIMAL(15, 2) NOT NULL,
  valor_original DECIMAL(15, 2) NOT NULL,
  numero_parcelas INTEGER NOT NULL,
  taxa_juros DECIMAL(5, 2),
  taxa_desconto DECIMAL(5, 2),
  data_inicio DATE NOT NULL,
  data_fim DATE,
  observacoes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'concluido', 'cancelado')),
  valor_economizado DECIMAL(15, 2),
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE acordos IS 'Armazena acordos de renegociação de dívidas';

-- Tabela de Parcelas de Acordo
CREATE TABLE IF NOT EXISTS parcelas_acordo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  acordo_id UUID REFERENCES acordos(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  valor DECIMAL(15, 2) NOT NULL,
  data_vencimento DATE NOT NULL,
  paga BOOLEAN DEFAULT FALSE,
  data_pagamento DATE,
  juros DECIMAL(15, 2),
  multa DECIMAL(15, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(acordo_id, numero)
);

COMMENT ON TABLE parcelas_acordo IS 'Armazena as parcelas de cada acordo de renegociação';

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_dividas_usuario ON dividas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_dividas_status ON dividas(status);
CREATE INDEX IF NOT EXISTS idx_dividas_tipo ON dividas(tipo_divida);
CREATE INDEX IF NOT EXISTS idx_dividas_vencimento ON dividas(data_vencimento);

CREATE INDEX IF NOT EXISTS idx_acordos_usuario ON acordos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_acordos_divida ON acordos(divida_id);
CREATE INDEX IF NOT EXISTS idx_acordos_status ON acordos(status);

CREATE INDEX IF NOT EXISTS idx_parcelas_acordo ON parcelas_acordo(acordo_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_vencimento ON parcelas_acordo(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_parcelas_paga ON parcelas_acordo(paga);

-- Função para atualizar updated_at
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
DROP TRIGGER IF EXISTS update_dividas_updated_at_trigger ON dividas;
CREATE TRIGGER update_dividas_updated_at_trigger
  BEFORE UPDATE ON dividas
  FOR EACH ROW
  EXECUTE FUNCTION update_dividas_updated_at();

DROP TRIGGER IF EXISTS update_acordos_updated_at_trigger ON acordos;
CREATE TRIGGER update_acordos_updated_at_trigger
  BEFORE UPDATE ON acordos
  FOR EACH ROW
  EXECUTE FUNCTION update_acordos_updated_at();

DROP TRIGGER IF EXISTS update_parcelas_updated_at_trigger ON parcelas_acordo;
CREATE TRIGGER update_parcelas_updated_at_trigger
  BEFORE UPDATE ON parcelas_acordo
  FOR EACH ROW
  EXECUTE FUNCTION update_parcelas_updated_at();

-- Função para calcular valor economizado automaticamente
CREATE OR REPLACE FUNCTION calculate_valor_economizado()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.valor_original > 0 AND NEW.valor_total > 0 THEN
    NEW.valor_economizado = NEW.valor_original - NEW.valor_total;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_valor_economizado_trigger ON acordos;
CREATE TRIGGER calculate_valor_economizado_trigger
  BEFORE INSERT OR UPDATE ON acordos
  FOR EACH ROW
  EXECUTE FUNCTION calculate_valor_economizado();

-- Função para atualizar status da dívida quando acordo é criado
CREATE OR REPLACE FUNCTION update_divida_status_on_acordo()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE dividas
    SET status = 'renegociada',
        valor_atual = NEW.valor_total,
        updated_at = NOW()
    WHERE id = NEW.divida_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE dividas
    SET status = 'ativa',
        valor_atual = (SELECT valor_original FROM acordos WHERE id = OLD.id),
        updated_at = NOW()
    WHERE id = OLD.divida_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_divida_status_on_acordo_insert ON acordos;
CREATE TRIGGER update_divida_status_on_acordo_insert
  AFTER INSERT ON acordos
  FOR EACH ROW
  EXECUTE FUNCTION update_divida_status_on_acordo();

DROP TRIGGER IF EXISTS update_divida_status_on_acordo_delete ON acordos;
CREATE TRIGGER update_divida_status_on_acordo_delete
  AFTER DELETE ON acordos
  FOR EACH ROW
  EXECUTE FUNCTION update_divida_status_on_acordo();

-- Função para atualizar status do acordo quando todas as parcelas são pagas
CREATE OR REPLACE FUNCTION check_acordo_concluido()
RETURNS TRIGGER AS $$
DECLARE
  total_parcelas INTEGER;
  parcelas_pagas INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_parcelas
  FROM parcelas_acordo
  WHERE acordo_id = COALESCE(NEW.acordo_id, OLD.acordo_id);
  
  SELECT COUNT(*) INTO parcelas_pagas
  FROM parcelas_acordo
  WHERE acordo_id = COALESCE(NEW.acordo_id, OLD.acordo_id)
    AND paga = TRUE;
  
  IF total_parcelas > 0 AND parcelas_pagas = total_parcelas THEN
    UPDATE acordos
    SET status = 'concluido',
        updated_at = NOW()
    WHERE id = COALESCE(NEW.acordo_id, OLD.acordo_id);
    
    UPDATE dividas
    SET status = 'quitada',
        data_quitacao = NOW(),
        updated_at = NOW()
    WHERE id = (SELECT divida_id FROM acordos WHERE id = COALESCE(NEW.acordo_id, OLD.acordo_id));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_acordo_concluido_trigger ON parcelas_acordo;
CREATE TRIGGER check_acordo_concluido_trigger
  AFTER INSERT OR UPDATE ON parcelas_acordo
  FOR EACH ROW
  EXECUTE FUNCTION check_acordo_concluido();

-- Habilitar RLS
ALTER TABLE dividas ENABLE ROW LEVEL SECURITY;
ALTER TABLE acordos ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelas_acordo ENABLE ROW LEVEL SECURITY;

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
      SELECT 1 FROM acordos
      WHERE acordos.id = parcelas_acordo.acordo_id
      AND acordos.usuario_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Usuários podem inserir suas próprias parcelas" ON parcelas_acordo;
CREATE POLICY "Usuários podem inserir suas próprias parcelas"
  ON parcelas_acordo FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM acordos
      WHERE acordos.id = parcelas_acordo.acordo_id
      AND acordos.usuario_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias parcelas" ON parcelas_acordo;
CREATE POLICY "Usuários podem atualizar suas próprias parcelas"
  ON parcelas_acordo FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM acordos
      WHERE acordos.id = parcelas_acordo.acordo_id
      AND acordos.usuario_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Usuários podem deletar suas próprias parcelas" ON parcelas_acordo;
CREATE POLICY "Usuários podem deletar suas próprias parcelas"
  ON parcelas_acordo FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM acordos
      WHERE acordos.id = parcelas_acordo.acordo_id
      AND acordos.usuario_id = auth.uid()
    )
  );

-- ============================================
-- COMENTÁRIOS FINAIS
-- ============================================
COMMENT ON COLUMN dividas.valor_original IS 'Valor original da dívida quando foi criada';
COMMENT ON COLUMN dividas.valor_atual IS 'Valor atual da dívida (pode ser reduzido após acordo)';
COMMENT ON COLUMN acordos.valor_economizado IS 'Valor economizado com o acordo (calculado automaticamente)';
COMMENT ON COLUMN parcelas_acordo.juros IS 'Juros aplicados nesta parcela';
COMMENT ON COLUMN parcelas_acordo.multa IS 'Multa aplicada nesta parcela (se houver atraso)';

