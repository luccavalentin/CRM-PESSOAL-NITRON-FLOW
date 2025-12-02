-- ============================================
-- MIGRAÇÃO 007: ACORDOS E DÍVIDAS COMPLETO
-- Sistema completo de mapeamento e renegociação de dívidas
-- ============================================

-- Habilitar extensão UUID se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: dividas
-- Armazena todas as dívidas do usuário
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dividas') THEN
    CREATE TABLE dividas (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      usuario_id UUID,
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
      data_quitacao TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Adicionar foreign key apenas se a tabela usuarios existir
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios') THEN
      ALTER TABLE dividas 
      ADD CONSTRAINT fk_dividas_usuario 
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE;
    END IF;

    -- Criar índices
    CREATE INDEX IF NOT EXISTS idx_dividas_usuario ON dividas(usuario_id);
    CREATE INDEX IF NOT EXISTS idx_dividas_status ON dividas(status);
    CREATE INDEX IF NOT EXISTS idx_dividas_tipo ON dividas(tipo_divida);
    CREATE INDEX IF NOT EXISTS idx_dividas_vencimento ON dividas(data_vencimento);
    CREATE INDEX IF NOT EXISTS idx_dividas_created_at ON dividas(created_at);

    COMMENT ON TABLE dividas IS 'Armazena todas as dívidas do usuário para mapeamento e renegociação';
  END IF;
END $$;

-- ============================================
-- TABELA: acordos
-- Armazena os acordos de renegociação
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'acordos') THEN
    CREATE TABLE acordos (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      usuario_id UUID,
      divida_id UUID NOT NULL,
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
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT fk_acordos_divida FOREIGN KEY (divida_id) REFERENCES dividas(id) ON DELETE CASCADE
    );

    -- Adicionar foreign key apenas se a tabela usuarios existir
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios') THEN
      ALTER TABLE acordos 
      ADD CONSTRAINT fk_acordos_usuario 
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE;
    END IF;

    -- Criar índices
    CREATE INDEX IF NOT EXISTS idx_acordos_usuario ON acordos(usuario_id);
    CREATE INDEX IF NOT EXISTS idx_acordos_divida ON acordos(divida_id);
    CREATE INDEX IF NOT EXISTS idx_acordos_status ON acordos(status);
    CREATE INDEX IF NOT EXISTS idx_acordos_data_inicio ON acordos(data_inicio);

    COMMENT ON TABLE acordos IS 'Armazena acordos de renegociação de dívidas';
  END IF;
END $$;

-- ============================================
-- TABELA: parcelas_acordo
-- Armazena as parcelas de cada acordo
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'parcelas_acordo') THEN
    CREATE TABLE parcelas_acordo (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      acordo_id UUID NOT NULL,
      numero INTEGER NOT NULL,
      valor DECIMAL(15, 2) NOT NULL,
      data_vencimento DATE NOT NULL,
      data_pagamento DATE,
      paga BOOLEAN DEFAULT FALSE,
      juros DECIMAL(15, 2) DEFAULT 0,
      multa DECIMAL(15, 2) DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT fk_parcelas_acordo FOREIGN KEY (acordo_id) REFERENCES acordos(id) ON DELETE CASCADE,
      UNIQUE(acordo_id, numero)
    );

    -- Criar índices
    CREATE INDEX IF NOT EXISTS idx_parcelas_acordo ON parcelas_acordo(acordo_id);
    CREATE INDEX IF NOT EXISTS idx_parcelas_vencimento ON parcelas_acordo(data_vencimento);
    CREATE INDEX IF NOT EXISTS idx_parcelas_paga ON parcelas_acordo(paga);

    COMMENT ON TABLE parcelas_acordo IS 'Armazena as parcelas de cada acordo de renegociação';
  END IF;
END $$;

-- ============================================
-- TRIGGER: Atualizar updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em dividas
DROP TRIGGER IF EXISTS update_dividas_updated_at ON dividas;
CREATE TRIGGER update_dividas_updated_at
  BEFORE UPDATE ON dividas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Aplicar trigger em acordos
DROP TRIGGER IF EXISTS update_acordos_updated_at ON acordos;
CREATE TRIGGER update_acordos_updated_at
  BEFORE UPDATE ON acordos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Aplicar trigger em parcelas_acordo
DROP TRIGGER IF EXISTS update_parcelas_acordo_updated_at ON parcelas_acordo;
CREATE TRIGGER update_parcelas_acordo_updated_at
  BEFORE UPDATE ON parcelas_acordo
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNÇÃO: Calcular valor economizado no acordo
-- ============================================
CREATE OR REPLACE FUNCTION calcular_valor_economizado()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.valor_original IS NOT NULL AND NEW.valor_total IS NOT NULL THEN
    NEW.valor_economizado = NEW.valor_original - NEW.valor_total;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger para calcular economia
DROP TRIGGER IF EXISTS trigger_calcular_economia ON acordos;
CREATE TRIGGER trigger_calcular_economia
  BEFORE INSERT OR UPDATE ON acordos
  FOR EACH ROW
  EXECUTE FUNCTION calcular_valor_economizado();

-- ============================================
-- FUNÇÃO: Atualizar status da dívida quando acordo é criado
-- ============================================
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

-- ============================================
-- FUNÇÃO: Atualizar status da dívida quando acordo é cancelado
-- ============================================
CREATE OR REPLACE FUNCTION atualizar_status_divida_ao_cancelar_acordo()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelado' AND OLD.status != 'cancelado' THEN
    UPDATE dividas
    SET status = 'ativa',
        valor_atual = NEW.valor_original,
        updated_at = NOW()
    WHERE id = NEW.divida_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_divida_ao_cancelar_acordo ON acordos;
CREATE TRIGGER trigger_atualizar_divida_ao_cancelar_acordo
  AFTER UPDATE ON acordos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_status_divida_ao_cancelar_acordo();

-- ============================================
-- FUNÇÃO: Marcar dívida como quitada quando todas as parcelas são pagas
-- ============================================
CREATE OR REPLACE FUNCTION verificar_quitacao_divida()
RETURNS TRIGGER AS $$
DECLARE
  todas_pagas BOOLEAN;
  acordo_status VARCHAR(20);
BEGIN
  -- Verificar se todas as parcelas do acordo foram pagas
  SELECT 
    COUNT(*) = COUNT(*) FILTER (WHERE paga = TRUE),
    a.status
  INTO todas_pagas, acordo_status
  FROM parcelas_acordo pa
  JOIN acordos a ON a.id = pa.acordo_id
  WHERE pa.acordo_id = NEW.acordo_id
  GROUP BY a.status;

  -- Se todas as parcelas foram pagas, atualizar status do acordo e dívida
  IF todas_pagas AND acordo_status = 'ativo' THEN
    UPDATE acordos
    SET status = 'concluido',
        updated_at = NOW()
    WHERE id = NEW.acordo_id;

    UPDATE dividas
    SET status = 'quitada',
        data_quitacao = NOW(),
        updated_at = NOW()
    WHERE id = (SELECT divida_id FROM acordos WHERE id = NEW.acordo_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_verificar_quitacao ON parcelas_acordo;
CREATE TRIGGER trigger_verificar_quitacao
  AFTER UPDATE ON parcelas_acordo
  FOR EACH ROW
  WHEN (NEW.paga = TRUE AND OLD.paga = FALSE)
  EXECUTE FUNCTION verificar_quitacao_divida();

-- ============================================
-- VIEW: Resumo de dívidas e acordos
-- ============================================
CREATE OR REPLACE VIEW vw_resumo_dividas_acordos AS
SELECT 
  d.usuario_id,
  COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'ativa') as total_dividas_ativas,
  COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'renegociada') as total_dividas_renegociadas,
  COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'quitada') as total_dividas_quitadas,
  COALESCE(SUM(d.valor_atual) FILTER (WHERE d.status = 'ativa'), 0) as valor_total_dividas_ativas,
  COALESCE(SUM(a.valor_total) FILTER (WHERE a.status = 'ativo'), 0) as valor_total_acordos_ativos,
  COALESCE(SUM(a.valor_economizado) FILTER (WHERE a.status IN ('ativo', 'concluido')), 0) as valor_total_economizado,
  COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'ativo') as total_acordos_ativos
FROM dividas d
LEFT JOIN acordos a ON a.divida_id = d.id
GROUP BY d.usuario_id;

COMMENT ON VIEW vw_resumo_dividas_acordos IS 'View com resumo consolidado de dívidas e acordos por usuário';

-- ============================================
-- RLS (Row Level Security) - Se necessário
-- ============================================
-- Descomente e ajuste conforme sua política de segurança
/*
ALTER TABLE dividas ENABLE ROW LEVEL SECURITY;
ALTER TABLE acordos ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelas_acordo ENABLE ROW LEVEL SECURITY;

-- Política para dividas
CREATE POLICY "Usuários podem ver apenas suas próprias dívidas"
  ON dividas FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem inserir suas próprias dívidas"
  ON dividas FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem atualizar suas próprias dívidas"
  ON dividas FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem deletar suas próprias dívidas"
  ON dividas FOR DELETE
  USING (auth.uid() = usuario_id);

-- Política para acordos
CREATE POLICY "Usuários podem ver apenas seus próprios acordos"
  ON acordos FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem inserir seus próprios acordos"
  ON acordos FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem atualizar seus próprios acordos"
  ON acordos FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem deletar seus próprios acordos"
  ON acordos FOR DELETE
  USING (auth.uid() = usuario_id);

-- Política para parcelas_acordo
CREATE POLICY "Usuários podem ver apenas suas próprias parcelas"
  ON parcelas_acordo FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM acordos a 
      WHERE a.id = parcelas_acordo.acordo_id 
      AND a.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem atualizar suas próprias parcelas"
  ON parcelas_acordo FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM acordos a 
      WHERE a.id = parcelas_acordo.acordo_id 
      AND a.usuario_id = auth.uid()
    )
  );
*/

-- ============================================
-- FIM DA MIGRAÇÃO
-- ============================================


