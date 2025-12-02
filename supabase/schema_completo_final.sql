-- ============================================
-- SCHEMA SQL COMPLETO E ÚNICO PARA SUPABASE
-- Sistema CRM - Lucca
-- VERSÃO: FINAL - SEGURO PARA EXECUTAR MÚLTIPLAS VEZES
-- ============================================
-- Este é o ÚNICO script que você precisa executar
-- Pode ser executado múltiplas vezes sem problemas
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELAS DE AUTENTICAÇÃO E USUÁRIOS
-- ============================================

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

CREATE TABLE IF NOT EXISTS preferencias_usuario (
  usuario_id UUID PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
  mostrar_valores BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELAS DE CLIENTES E LEADS
-- ============================================

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  estado VARCHAR(100),
  cidade VARCHAR(100),
  bairro VARCHAR(100),
  nicho VARCHAR(255),
  observacoes TEXT,
  status VARCHAR(20) DEFAULT 'Novo' CHECK (status IN ('Novo', 'Contatado', 'Qualificado', 'Convertido', 'Perdido')),
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  origem VARCHAR(255),
  contactado BOOLEAN DEFAULT FALSE,
  data_contato TIMESTAMP WITH TIME ZONE,
  tem_site BOOLEAN DEFAULT FALSE,
  lead_quente BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  empresa VARCHAR(255),
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(100),
  status VARCHAR(20) DEFAULT 'Prospecto' CHECK (status IN ('Ativo', 'Inativo', 'Prospecto')),
  valor_total DECIMAL(15, 2) DEFAULT 0,
  ultima_interacao TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELAS DE PROJETOS E TAREFAS
-- ============================================

CREATE TABLE IF NOT EXISTS tarefas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  prioridade VARCHAR(20) DEFAULT 'Média' CHECK (prioridade IN ('Baixa', 'Média', 'Alta', 'Urgente')),
  categoria VARCHAR(20) DEFAULT 'Pessoal' CHECK (categoria IN ('Pessoal', 'Empresarial', 'Projeto', 'Outro')),
  data DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Em Andamento', 'Em Revisão', 'Concluída')),
  tarefa_rapida BOOLEAN DEFAULT FALSE,
  projeto_id UUID,
  recorrente BOOLEAN DEFAULT FALSE,
  target VARCHAR(255),
  etiquetas TEXT[],
  concluida BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projetos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  status VARCHAR(20) DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Andamento', 'Revisão', 'Entregue', 'Arquivado')),
  prioridade VARCHAR(20),
  cliente_id UUID,
  cliente VARCHAR(255),
  valor DECIMAL(15, 2),
  progresso INTEGER DEFAULT 0,
  etapas_concluidas INTEGER DEFAULT 0,
  total_etapas INTEGER DEFAULT 7,
  data_inicio DATE DEFAULT CURRENT_DATE,
  data_fim DATE,
  prazo DATE,
  quantidade_anexos INTEGER DEFAULT 0,
  ideia_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projetos_pessoais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  status VARCHAR(20) DEFAULT 'Planejamento' CHECK (status IN ('Planejamento', 'Em Andamento', 'Pausado', 'Concluído', 'Cancelado')),
  data_inicio DATE DEFAULT CURRENT_DATE,
  data_fim DATE,
  progresso INTEGER DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
  tarefas_vinculadas UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELAS DE IDEIAS
-- ============================================

CREATE TABLE IF NOT EXISTS ideias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo VARCHAR(255),
  descricao TEXT,
  categoria VARCHAR(20) DEFAULT 'Outro' CHECK (categoria IN ('Negócio', 'Automação', 'Projeto', 'Conteúdo', 'Outro')),
  prioridade VARCHAR(20) DEFAULT 'Média' CHECK (prioridade IN ('Baixa', 'Média', 'Alta')),
  status VARCHAR(20) DEFAULT 'Explorando' CHECK (status IN ('Explorando', 'Em Análise', 'Em Teste', 'Executando', 'Arquivada')),
  data_criacao DATE DEFAULT CURRENT_DATE,
  tarefa_id UUID,
  projeto_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Remover colunas antigas se existirem (migração)
DO $$
BEGIN
  ALTER TABLE ideias DROP COLUMN IF EXISTS texto CASCADE;
  ALTER TABLE ideias DROP COLUMN IF EXISTS potencial_financeiro CASCADE;
END $$;

-- ============================================
-- TABELAS FINANCEIRAS - EMPRESA
-- ============================================

CREATE TABLE IF NOT EXISTS transacoes_financeiras_empresa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  descricao VARCHAR(255) NOT NULL,
  valor DECIMAL(15, 2) NOT NULL,
  categoria VARCHAR(100),
  data DATE NOT NULL,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  recorrente BOOLEAN DEFAULT FALSE,
  tipo_recorrencia VARCHAR(20) CHECK (tipo_recorrencia IN ('diaria', 'semanal', 'quinzenal', 'mensal', 'bimestral', 'trimestral', 'semestral', 'anual')),
  data_fim DATE,
  transacao_original_id UUID,
  quantidade_recorrencias INTEGER,
  paga BOOLEAN DEFAULT FALSE,
  data_pagamento DATE,
  data_vencimento DATE,
  rolou_mes BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS metas_financeiras_empresa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  descricao VARCHAR(255) NOT NULL,
  valor_meta DECIMAL(15, 2) NOT NULL,
  valor_atual DECIMAL(15, 2) DEFAULT 0,
  data_limite DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELAS FINANCEIRAS - PESSOAL
-- ============================================

CREATE TABLE IF NOT EXISTS transacoes_financeiras_pessoais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  descricao VARCHAR(255) NOT NULL,
  valor DECIMAL(15, 2) NOT NULL,
  categoria VARCHAR(100),
  data DATE NOT NULL,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  recorrente BOOLEAN DEFAULT FALSE,
  tipo_recorrencia VARCHAR(20) CHECK (tipo_recorrencia IN ('diaria', 'semanal', 'quinzenal', 'mensal', 'bimestral', 'trimestral', 'semestral', 'anual')),
  data_fim DATE,
  transacao_original_id UUID,
  quantidade_recorrencias INTEGER,
  paga BOOLEAN DEFAULT FALSE,
  data_pagamento DATE,
  data_vencimento DATE,
  rolou_mes BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS metas_financeiras_pessoais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  descricao VARCHAR(255) NOT NULL,
  valor_meta DECIMAL(15, 2) NOT NULL,
  valor_atual DECIMAL(15, 2) DEFAULT 0,
  data_limite DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gastos_recorrentes_pessoais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  descricao VARCHAR(255) NOT NULL,
  valor DECIMAL(15, 2) NOT NULL,
  proxima_data DATE NOT NULL,
  recorrencia VARCHAR(10) NOT NULL CHECK (recorrencia IN ('mensal', 'anual')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lista_compras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  quantidade INTEGER DEFAULT 1,
  valor_estimado DECIMAL(10, 2) DEFAULT 0,
  categoria VARCHAR(20) DEFAULT 'Diversas' CHECK (categoria IN ('Mercado', 'Diversas')),
  status VARCHAR(20) DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Comprado')),
  recorrencia_mensal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categorias_financeiras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida', 'ambos')),
  descricao TEXT,
  cor VARCHAR(7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, nome, tipo)
);

-- ============================================
-- TABELAS DE DÍVIDAS E ACORDOS
-- ============================================

CREATE TABLE IF NOT EXISTS dividas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  descricao VARCHAR(255) NOT NULL,
  credor VARCHAR(255) NOT NULL,
  valor_original DECIMAL(15, 2) NOT NULL,
  valor_atual DECIMAL(15, 2) NOT NULL,
  data_vencimento DATE,
  taxa_juros_original DECIMAL(5, 2),
  tipo_divida VARCHAR(50) DEFAULT 'Pessoal' CHECK (tipo_divida IN ('Pessoal', 'Cartão de Crédito', 'Empréstimo', 'Financiamento', 'Outro')),
  observacoes TEXT,
  status VARCHAR(20) DEFAULT 'ativa' CHECK (status IN ('ativa', 'renegociada', 'quitada', 'vencida')),
  data_criacao DATE DEFAULT CURRENT_DATE,
  data_quitacao DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS acordos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  divida_id UUID REFERENCES dividas(id) ON DELETE CASCADE,
  descricao VARCHAR(255),
  valor_total DECIMAL(15, 2) NOT NULL,
  valor_original DECIMAL(15, 2) NOT NULL,
  numero_parcelas INTEGER NOT NULL,
  taxa_juros DECIMAL(5, 2) DEFAULT 0,
  taxa_desconto DECIMAL(5, 2) DEFAULT 0,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  observacoes TEXT,
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'concluido', 'cancelado')),
  valor_economizado DECIMAL(15, 2) DEFAULT 0,
  data_criacao DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parcelas_acordo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  acordo_id UUID REFERENCES acordos(id) ON DELETE CASCADE,
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

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_status ON usuarios(status);

CREATE INDEX IF NOT EXISTS idx_leads_usuario_id ON leads(usuario_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_data_criacao ON leads(data_criacao);
CREATE INDEX IF NOT EXISTS idx_leads_cidade ON leads(cidade);

CREATE INDEX IF NOT EXISTS idx_clientes_usuario_id ON clientes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_clientes_status ON clientes(status);
CREATE INDEX IF NOT EXISTS idx_clientes_data_cadastro ON clientes(data_cadastro);

CREATE INDEX IF NOT EXISTS idx_tarefas_usuario_id ON tarefas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_status ON tarefas(status);
CREATE INDEX IF NOT EXISTS idx_tarefas_data ON tarefas(data);
CREATE INDEX IF NOT EXISTS idx_tarefas_projeto_id ON tarefas(projeto_id);

CREATE INDEX IF NOT EXISTS idx_projetos_usuario_id ON projetos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_projetos_status ON projetos(status);
CREATE INDEX IF NOT EXISTS idx_projetos_data_inicio ON projetos(data_inicio);

CREATE INDEX IF NOT EXISTS idx_projetos_pessoais_usuario_id ON projetos_pessoais(usuario_id);
CREATE INDEX IF NOT EXISTS idx_projetos_pessoais_status ON projetos_pessoais(status);

CREATE INDEX IF NOT EXISTS idx_ideias_usuario_id ON ideias(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ideias_status ON ideias(status);
CREATE INDEX IF NOT EXISTS idx_ideias_data_criacao ON ideias(data_criacao);

CREATE INDEX IF NOT EXISTS idx_transacoes_empresa_usuario_id ON transacoes_financeiras_empresa(usuario_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_empresa_tipo ON transacoes_financeiras_empresa(tipo);
CREATE INDEX IF NOT EXISTS idx_transacoes_empresa_data ON transacoes_financeiras_empresa(data);

CREATE INDEX IF NOT EXISTS idx_transacoes_pessoais_usuario_id ON transacoes_financeiras_pessoais(usuario_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_pessoais_tipo ON transacoes_financeiras_pessoais(tipo);
CREATE INDEX IF NOT EXISTS idx_transacoes_pessoais_data ON transacoes_financeiras_pessoais(data);

CREATE INDEX IF NOT EXISTS idx_lista_compras_usuario_id ON lista_compras(usuario_id);
CREATE INDEX IF NOT EXISTS idx_lista_compras_status ON lista_compras(status);

CREATE INDEX IF NOT EXISTS idx_categorias_financeiras_usuario_id ON categorias_financeiras(usuario_id);
CREATE INDEX IF NOT EXISTS idx_categorias_financeiras_tipo ON categorias_financeiras(tipo);

CREATE INDEX IF NOT EXISTS idx_dividas_usuario_id ON dividas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_dividas_status ON dividas(status);
CREATE INDEX IF NOT EXISTS idx_acordos_usuario_id ON acordos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_acordos_divida_id ON acordos(divida_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_acordo_id ON parcelas_acordo(acordo_id);

-- ============================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas com updated_at (CORRIGIDO - sem ambiguidade)
DO $$
DECLARE
  tbl_name TEXT;
BEGIN
  FOR tbl_name IN 
    SELECT t.tablename FROM pg_tables t
    WHERE t.schemaname = 'public' 
    AND t.tablename NOT LIKE 'pg_%'
    AND EXISTS (
      SELECT 1 FROM information_schema.columns c
      WHERE c.table_schema = 'public' 
      AND c.table_name = t.tablename 
      AND c.column_name = 'updated_at'
    )
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%s_updated_at ON %I;
      CREATE TRIGGER update_%s_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    ', tbl_name, tbl_name, tbl_name, tbl_name);
  END LOOP;
END $$;

-- ============================================
-- FUNÇÕES PARA ACORDOS
-- ============================================

-- Função para calcular valor economizado
CREATE OR REPLACE FUNCTION calcular_valor_economizado()
RETURNS TRIGGER AS $$
BEGIN
  NEW.valor_economizado = GREATEST(0, NEW.valor_original - NEW.valor_total);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular valor economizado
DROP TRIGGER IF EXISTS trigger_calcular_valor_economizado ON acordos;
CREATE TRIGGER trigger_calcular_valor_economizado
  BEFORE INSERT OR UPDATE ON acordos
  FOR EACH ROW
  EXECUTE FUNCTION calcular_valor_economizado();

-- Função para atualizar status da dívida ao criar acordo
CREATE OR REPLACE FUNCTION atualizar_status_divida_ao_criar_acordo()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE dividas
  SET status = 'renegociada',
      valor_atual = NEW.valor_total
  WHERE id = NEW.divida_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar status da dívida
DROP TRIGGER IF EXISTS trigger_atualizar_status_divida_ao_criar_acordo ON acordos;
CREATE TRIGGER trigger_atualizar_status_divida_ao_criar_acordo
  AFTER INSERT ON acordos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_status_divida_ao_criar_acordo();

-- Função para verificar quitação da dívida
CREATE OR REPLACE FUNCTION verificar_quitacao_divida()
RETURNS TRIGGER AS $$
DECLARE
  total_parcelas INTEGER;
  parcelas_pagas INTEGER;
BEGIN
  IF NEW.paga = TRUE THEN
    SELECT COUNT(*) INTO total_parcelas
    FROM parcelas_acordo
    WHERE acordo_id = NEW.acordo_id;
    
    SELECT COUNT(*) INTO parcelas_pagas
    FROM parcelas_acordo
    WHERE acordo_id = NEW.acordo_id AND paga = TRUE;
    
    IF parcelas_pagas = total_parcelas THEN
      UPDATE acordos
      SET status = 'concluido',
          data_fim = CURRENT_DATE
      WHERE id = NEW.acordo_id;
      
      UPDATE dividas
      SET status = 'quitada',
          data_quitacao = CURRENT_DATE
      WHERE id = (SELECT divida_id FROM acordos WHERE id = NEW.acordo_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para verificar quitação
DROP TRIGGER IF EXISTS trigger_verificar_quitacao_divida ON parcelas_acordo;
CREATE TRIGGER trigger_verificar_quitacao_divida
  AFTER UPDATE ON parcelas_acordo
  FOR EACH ROW
  EXECUTE FUNCTION verificar_quitacao_divida();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas (CORRIGIDO - sem ambiguidade)
DO $$
DECLARE
  tbl_name TEXT;
BEGIN
  FOR tbl_name IN 
    SELECT t.tablename FROM pg_tables t
    WHERE t.schemaname = 'public' 
    AND t.tablename NOT LIKE 'pg_%'
    AND t.tablename != 'usuarios'
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl_name);
  END LOOP;
END $$;

-- Política para usuarios
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON usuarios;
CREATE POLICY "Usuários podem ver seus próprios dados"
  ON usuarios FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON usuarios;
CREATE POLICY "Usuários podem atualizar seus próprios dados"
  ON usuarios FOR UPDATE
  USING (auth.uid() = id);

-- Política genérica para todas as outras tabelas (CORRIGIDO - sem ambiguidade)
DO $$
DECLARE
  tbl_name TEXT;
BEGIN
  FOR tbl_name IN 
    SELECT t.tablename FROM pg_tables t
    WHERE t.schemaname = 'public' 
    AND t.tablename NOT LIKE 'pg_%'
    AND t.tablename != 'usuarios'
    AND EXISTS (
      SELECT 1 FROM information_schema.columns c
      WHERE c.table_schema = 'public' 
      AND c.table_name = t.tablename 
      AND c.column_name = 'usuario_id'
    )
  LOOP
    -- Política de SELECT
    EXECUTE format('
      DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON %I;
      CREATE POLICY "Usuários podem ver seus próprios dados"
        ON %I FOR SELECT
        USING (auth.uid() = usuario_id);
    ', tbl_name, tbl_name);
    
    -- Política de INSERT
    EXECUTE format('
      DROP POLICY IF EXISTS "Usuários podem inserir seus próprios dados" ON %I;
      CREATE POLICY "Usuários podem inserir seus próprios dados"
        ON %I FOR INSERT
        WITH CHECK (auth.uid() = usuario_id);
    ', tbl_name, tbl_name);
    
    -- Política de UPDATE
    EXECUTE format('
      DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON %I;
      CREATE POLICY "Usuários podem atualizar seus próprios dados"
        ON %I FOR UPDATE
        USING (auth.uid() = usuario_id);
    ', tbl_name, tbl_name);
    
    -- Política de DELETE
    EXECUTE format('
      DROP POLICY IF EXISTS "Usuários podem deletar seus próprios dados" ON %I;
      CREATE POLICY "Usuários podem deletar seus próprios dados"
        ON %I FOR DELETE
        USING (auth.uid() = usuario_id);
    ', tbl_name, tbl_name);
  END LOOP;
END $$;

-- ============================================
-- FUNÇÃO PARA CRIAR USUÁRIO NO PERFIL
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome, email, data_registro)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FIM DO SCHEMA
-- ============================================

-- Mensagem de confirmação
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SCHEMA CRIADO COM SUCESSO!';
  RAISE NOTICE 'Todas as tabelas foram criadas/verificadas';
  RAISE NOTICE 'Índices, triggers e RLS configurados';
  RAISE NOTICE '========================================';
END $$;

