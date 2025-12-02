-- ============================================
-- MIGRAÇÃO 008: ACORDOS E DÍVIDAS COMPLETO
-- Sistema completo de mapeamento e renegociação de dívidas
-- ============================================

DO $$
BEGIN
  -- Criar tabela de dívidas se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dividas') THEN
    CREATE TABLE public.dividas (
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
      data_quitacao DATE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Adicionar foreign key apenas se a tabela usuarios existir
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usuarios') THEN
      ALTER TABLE public.dividas 
      ADD CONSTRAINT fk_dividas_usuario 
      FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;
    END IF;

    -- Criar índices
    CREATE INDEX IF NOT EXISTS idx_dividas_usuario ON public.dividas(usuario_id);
    CREATE INDEX IF NOT EXISTS idx_dividas_status ON public.dividas(status);
    CREATE INDEX IF NOT EXISTS idx_dividas_data_vencimento ON public.dividas(data_vencimento);
    CREATE INDEX IF NOT EXISTS idx_dividas_tipo ON public.dividas(tipo_divida);

    COMMENT ON TABLE public.dividas IS 'Gerencia todas as dívidas do usuário para mapeamento e renegociação';
  END IF;

  -- Criar tabela de acordos se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'acordos') THEN
    CREATE TABLE public.acordos (
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
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Adicionar foreign keys
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usuarios') THEN
      ALTER TABLE public.acordos 
      ADD CONSTRAINT fk_acordos_usuario 
      FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dividas') THEN
      ALTER TABLE public.acordos 
      ADD CONSTRAINT fk_acordos_divida 
      FOREIGN KEY (divida_id) REFERENCES public.dividas(id) ON DELETE CASCADE;
    END IF;

    -- Criar índices
    CREATE INDEX IF NOT EXISTS idx_acordos_usuario ON public.acordos(usuario_id);
    CREATE INDEX IF NOT EXISTS idx_acordos_divida ON public.acordos(divida_id);
    CREATE INDEX IF NOT EXISTS idx_acordos_status ON public.acordos(status);
    CREATE INDEX IF NOT EXISTS idx_acordos_data_inicio ON public.acordos(data_inicio);

    COMMENT ON TABLE public.acordos IS 'Gerencia acordos de renegociação de dívidas';
  END IF;

  -- Criar tabela de parcelas de acordo se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'parcelas_acordo') THEN
    CREATE TABLE public.parcelas_acordo (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      acordo_id UUID NOT NULL,
      numero INTEGER NOT NULL,
      valor DECIMAL(15, 2) NOT NULL,
      data_vencimento DATE NOT NULL,
      paga BOOLEAN DEFAULT FALSE,
      data_pagamento DATE,
      juros DECIMAL(15, 2) DEFAULT 0,
      multa DECIMAL(15, 2) DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(acordo_id, numero)
    );

    -- Adicionar foreign key
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'acordos') THEN
      ALTER TABLE public.parcelas_acordo 
      ADD CONSTRAINT fk_parcelas_acordo 
      FOREIGN KEY (acordo_id) REFERENCES public.acordos(id) ON DELETE CASCADE;
    END IF;

    -- Criar índices
    CREATE INDEX IF NOT EXISTS idx_parcelas_acordo ON public.parcelas_acordo(acordo_id);
    CREATE INDEX IF NOT EXISTS idx_parcelas_vencimento ON public.parcelas_acordo(data_vencimento);
    CREATE INDEX IF NOT EXISTS idx_parcelas_paga ON public.parcelas_acordo(paga);

    COMMENT ON TABLE public.parcelas_acordo IS 'Gerencia parcelas dos acordos de renegociação';
  END IF;

END $$;

-- ============================================
-- FUNÇÕES E TRIGGERS (fora do bloco DO)
-- ============================================

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para updated_at
DROP TRIGGER IF EXISTS update_dividas_updated_at ON public.dividas;
CREATE TRIGGER update_dividas_updated_at
  BEFORE UPDATE ON public.dividas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_acordos_updated_at ON public.acordos;
CREATE TRIGGER update_acordos_updated_at
  BEFORE UPDATE ON public.acordos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_parcelas_acordo_updated_at ON public.parcelas_acordo;
CREATE TRIGGER update_parcelas_acordo_updated_at
  BEFORE UPDATE ON public.parcelas_acordo
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar função para calcular valor economizado automaticamente
CREATE OR REPLACE FUNCTION public.calcular_valor_economizado()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.valor_original IS NOT NULL AND NEW.valor_total IS NOT NULL THEN
    NEW.valor_economizado = NEW.valor_original - NEW.valor_total;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para calcular valor economizado
DROP TRIGGER IF EXISTS calcular_economia_acordo ON public.acordos;
CREATE TRIGGER calcular_economia_acordo
  BEFORE INSERT OR UPDATE ON public.acordos
  FOR EACH ROW
  EXECUTE FUNCTION public.calcular_valor_economizado();

-- Criar função para atualizar status da dívida quando acordo é criado
CREATE OR REPLACE FUNCTION public.atualizar_status_divida_ao_criar_acordo()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.dividas
  SET status = 'renegociada',
      valor_atual = NEW.valor_total,
      updated_at = NOW()
  WHERE id = NEW.divida_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar status da dívida
DROP TRIGGER IF EXISTS atualizar_divida_ao_criar_acordo ON public.acordos;
CREATE TRIGGER atualizar_divida_ao_criar_acordo
  AFTER INSERT ON public.acordos
  FOR EACH ROW
  EXECUTE FUNCTION public.atualizar_status_divida_ao_criar_acordo();

-- Criar função para marcar dívida como quitada quando todas as parcelas são pagas
CREATE OR REPLACE FUNCTION public.verificar_quitacao_divida()
RETURNS TRIGGER AS $$
DECLARE
  total_parcelas INTEGER;
  parcelas_pagas INTEGER;
  divida_id_var UUID;
BEGIN
  -- Obter acordo_id
  IF TG_OP = 'UPDATE' THEN
    divida_id_var := (SELECT divida_id FROM public.acordos WHERE id = NEW.acordo_id);
  ELSIF TG_OP = 'INSERT' THEN
    divida_id_var := (SELECT divida_id FROM public.acordos WHERE id = NEW.acordo_id);
  END IF;

  -- Contar parcelas
  SELECT COUNT(*), COUNT(*) FILTER (WHERE paga = TRUE)
  INTO total_parcelas, parcelas_pagas
  FROM public.parcelas_acordo
  WHERE acordo_id = NEW.acordo_id;

  -- Se todas as parcelas foram pagas, marcar acordo como concluído e dívida como quitada
  IF total_parcelas > 0 AND parcelas_pagas = total_parcelas THEN
    UPDATE public.acordos
    SET status = 'concluido',
        data_fim = CURRENT_DATE,
        updated_at = NOW()
    WHERE id = NEW.acordo_id;

    UPDATE public.dividas
    SET status = 'quitada',
        data_quitacao = CURRENT_DATE,
        updated_at = NOW()
    WHERE id = divida_id_var;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para verificar quitação
DROP TRIGGER IF EXISTS verificar_quitacao ON public.parcelas_acordo;
CREATE TRIGGER verificar_quitacao
  AFTER INSERT OR UPDATE ON public.parcelas_acordo
  FOR EACH ROW
  EXECUTE FUNCTION public.verificar_quitacao_divida();

-- ============================================
-- ROW LEVEL SECURITY (RLS) - Opcional
-- ============================================
-- Descomente as linhas abaixo se quiser habilitar RLS

-- ALTER TABLE public.dividas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.acordos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.parcelas_acordo ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS básicas (descomente se usar RLS)
/*
CREATE POLICY "Usuários podem ver apenas suas próprias dívidas"
  ON public.dividas FOR SELECT
  USING (usuario_id = auth.uid());

CREATE POLICY "Usuários podem inserir apenas suas próprias dívidas"
  ON public.dividas FOR INSERT
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Usuários podem atualizar apenas suas próprias dívidas"
  ON public.dividas FOR UPDATE
  USING (usuario_id = auth.uid());

CREATE POLICY "Usuários podem deletar apenas suas próprias dívidas"
  ON public.dividas FOR DELETE
  USING (usuario_id = auth.uid());
*/

-- Comentários finais
COMMENT ON TABLE public.dividas IS 'Sistema completo de mapeamento de dívidas para renegociação';
COMMENT ON TABLE public.acordos IS 'Acordos de renegociação de dívidas com condições personalizadas';
COMMENT ON TABLE public.parcelas_acordo IS 'Parcelas dos acordos de renegociação com controle de pagamento';

