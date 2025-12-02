-- ============================================
-- SCHEMA SQL COMPLETO E SEGURO PARA SUPABASE
-- Sistema CRM - Lucca
-- VERSÃO: 1.0 - SEGURO PARA EXECUTAR MÚLTIPLAS VEZES
-- ============================================
-- Este script pode ser executado múltiplas vezes sem duplicar dados
-- Todas as tabelas usam IF NOT EXISTS
-- Todos os dados usam ON CONFLICT para evitar duplicação
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELAS DE AUTENTICAÇÃO E USUÁRIOS
-- ============================================

-- Tabela de usuários do sistema (vinculada ao auth.users do Supabase)
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

-- Tabela de preferências do usuário
CREATE TABLE IF NOT EXISTS preferencias_usuario (
  usuario_id UUID PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
  mostrar_valores BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELAS DE CLIENTES E LEADS
-- ============================================

-- Tabela de leads
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

-- Tabela de clientes
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

-- Tabela de tarefas
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

-- Tabela de projetos
CREATE TABLE IF NOT EXISTS projetos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  status VARCHAR(20) DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Andamento', 'Revisão', 'Entregue', 'Arquivado')),
  cliente VARCHAR(255),
  valor DECIMAL(15, 2),
  etapas_concluidas INTEGER DEFAULT 0,
  total_etapas INTEGER DEFAULT 7,
  data_inicio DATE DEFAULT CURRENT_DATE,
  prazo DATE,
  quantidade_anexos INTEGER DEFAULT 0,
  ideia_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de etapas de projetos
CREATE TABLE IF NOT EXISTS etapas_projeto (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  projeto_id UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  concluida BOOLEAN DEFAULT FALSE,
  data_conclusao DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(projeto_id, numero)
);

-- Tabela de documentos de etapas
CREATE TABLE IF NOT EXISTS documentos_etapa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  etapa_id UUID NOT NULL REFERENCES etapas_projeto(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  conteudo TEXT,
  tipo VARCHAR(20) DEFAULT 'nota' CHECK (tipo IN ('nota', 'link', 'arquivo')),
  url TEXT,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de projetos pessoais
CREATE TABLE IF NOT EXISTS projetos_pessoais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  status VARCHAR(20) DEFAULT 'Planejamento' CHECK (status IN ('Planejamento', 'Em Andamento', 'Pausado', 'Concluído', 'Cancelado')),
  data_inicio DATE DEFAULT CURRENT_DATE,
  prazo DATE,
  progresso INTEGER DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
  tarefas_vinculadas UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELAS DE IDEIAS
-- ============================================

-- Tabela de ideias
CREATE TABLE IF NOT EXISTS ideias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  categoria VARCHAR(20) DEFAULT 'Outro' CHECK (categoria IN ('Negócio', 'Automação', 'Projeto', 'Conteúdo', 'Outro')),
  status VARCHAR(20) DEFAULT 'Explorando' CHECK (status IN ('Explorando', 'Em Análise', 'Em Teste', 'Executando', 'Arquivada')),
  potencial_financeiro INTEGER DEFAULT 1 CHECK (potencial_financeiro >= 1 AND potencial_financeiro <= 10),
  data_criacao DATE DEFAULT CURRENT_DATE,
  tarefa_id UUID,
  projeto_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELAS FINANCEIRAS - EMPRESA
-- ============================================

-- Tabela de transações financeiras da empresa
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de metas financeiras da empresa
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

-- Tabela de transações financeiras pessoais
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de metas financeiras pessoais
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

-- Tabela de gastos recorrentes pessoais
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

-- Tabela de lista de compras
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

-- Tabela de negociações (dívidas pessoais)
CREATE TABLE IF NOT EXISTS negociacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  descricao VARCHAR(255) NOT NULL,
  valor_total DECIMAL(15, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Renegociada', 'Paga')),
  data_criacao DATE DEFAULT CURRENT_DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de renegociações
CREATE TABLE IF NOT EXISTS renegociacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  negociacao_id UUID NOT NULL REFERENCES negociacoes(id) ON DELETE CASCADE,
  numero_parcelas INTEGER NOT NULL,
  valor_parcela DECIMAL(15, 2) NOT NULL,
  taxa_juros DECIMAL(5, 2) DEFAULT 0,
  data_inicio DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'Ativa' CHECK (status IN ('Ativa', 'Concluída', 'Cancelada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de parcelas de renegociação
CREATE TABLE IF NOT EXISTS parcelas_renegociacao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  renegociacao_id UUID NOT NULL REFERENCES renegociacoes(id) ON DELETE CASCADE,
  numero_parcela INTEGER NOT NULL,
  valor DECIMAL(15, 2) NOT NULL,
  data_vencimento DATE NOT NULL,
  paga BOOLEAN DEFAULT FALSE,
  data_pagamento DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(renegociacao_id, numero_parcela)
);

-- ============================================
-- TABELAS DE TRADING
-- ============================================

-- Tabela de operações de trading
CREATE TABLE IF NOT EXISTS operacoes_trading (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  numero_operacao INTEGER,
  ativo VARCHAR(50) NOT NULL,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('CALL', 'PUT')),
  resultado VARCHAR(10) NOT NULL CHECK (resultado IN ('Gain', 'Loss')),
  valor_entrada DECIMAL(15, 2) NOT NULL,
  lucro_prejuizo DECIMAL(15, 2) NOT NULL,
  url_print TEXT,
  observacoes TEXT,
  data_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações de trading
CREATE TABLE IF NOT EXISTS configuracoes_trading (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  capital_total DECIMAL(15, 2) NOT NULL,
  meta_diaria_percentual DECIMAL(5, 2) NOT NULL,
  stop_gain_reais DECIMAL(15, 2) NOT NULL,
  stop_gain_percentual DECIMAL(5, 2) NOT NULL,
  stop_loss_reais DECIMAL(15, 2) NOT NULL,
  stop_loss_percentual DECIMAL(5, 2) NOT NULL,
  valor_maximo_entrada DECIMAL(15, 2) NOT NULL,
  limite_operacoes_dia INTEGER DEFAULT 5,
  data_inicio DATE DEFAULT CURRENT_DATE,
  dia_atual DATE DEFAULT CURRENT_DATE,
  bloqueado BOOLEAN DEFAULT FALSE,
  motivo_bloqueio VARCHAR(20) CHECK (motivo_bloqueio IN ('stop_gain', 'stop_loss', 'limite_operacoes')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id)
);

-- Tabela de sessões de alavancagem
CREATE TABLE IF NOT EXISTS sessoes_alavancagem (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  capital_inicial DECIMAL(15, 2) NOT NULL,
  numero_niveis INTEGER NOT NULL CHECK (numero_niveis >= 1 AND numero_niveis <= 5),
  meta_por_nivel DECIMAL(5, 2) NOT NULL,
  stop_total DECIMAL(15, 2) NOT NULL,
  stop_protegido DECIMAL(15, 2),
  valor_entradas DECIMAL(15, 2) NOT NULL,
  tipo_entrada VARCHAR(20) NOT NULL CHECK (tipo_entrada IN ('percentual', 'fixo')),
  status VARCHAR(20) DEFAULT 'ativa' CHECK (status IN ('ativa', 'concluida')),
  nivel_atual INTEGER DEFAULT 1,
  progresso_por_nivel DECIMAL(5, 2)[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de operações de alavancagem
CREATE TABLE IF NOT EXISTS operacoes_alavancagem (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sessao_id UUID NOT NULL REFERENCES sessoes_alavancagem(id) ON DELETE CASCADE,
  ativo VARCHAR(50) NOT NULL,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('CALL', 'PUT')),
  resultado VARCHAR(10) NOT NULL CHECK (resultado IN ('Gain', 'Loss')),
  valor_entrada DECIMAL(15, 2) NOT NULL,
  lucro_prejuizo DECIMAL(15, 2) NOT NULL,
  nivel INTEGER NOT NULL,
  data_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELAS DE ESTUDOS
-- ============================================

-- Tabela de temas de estudo
CREATE TABLE IF NOT EXISTS temas_estudo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  concluido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de matérias de estudo
CREATE TABLE IF NOT EXISTS materias_estudo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tema_id UUID NOT NULL REFERENCES temas_estudo(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  concluida BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de aulas
CREATE TABLE IF NOT EXISTS aulas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  materia_id UUID REFERENCES materias_estudo(id) ON DELETE CASCADE,
  nicho_id UUID,
  titulo VARCHAR(255) NOT NULL,
  url_video TEXT,
  duracao INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'Não iniciada' CHECK (status IN ('Não iniciada', 'Em andamento', 'Concluída')),
  data_conclusao DATE,
  notas TEXT,
  links TEXT[],
  concluida BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de revisões
CREATE TABLE IF NOT EXISTS revisoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aula_id UUID NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
  data_revisao DATE NOT NULL,
  notas TEXT,
  status VARCHAR(20) DEFAULT 'Agendada' CHECK (status IN ('Agendada', 'Realizada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELAS DE DESENVOLVIMENTO PESSOAL
-- ============================================

-- Tabela de vícios/hábitos
CREATE TABLE IF NOT EXISTS vicios_habitos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('Vício', 'Hábito', 'Mania')),
  data_inicio_controle DATE DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Superado')),
  estrategias_superacao TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de atividades de autodesenvolvimento
CREATE TABLE IF NOT EXISTS atividades_autodesenvolvimento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100),
  status VARCHAR(20) DEFAULT 'Planejada' CHECK (status IN ('Planejada', 'Em Andamento', 'Concluída')),
  progresso INTEGER DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
  data_inicio DATE,
  data_conclusao DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de livros
CREATE TABLE IF NOT EXISTS livros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  autor VARCHAR(255),
  genero VARCHAR(100),
  status VARCHAR(20) DEFAULT 'Quero Ler' CHECK (status IN ('Quero Ler', 'Lendo Agora', 'Lido')),
  nota INTEGER CHECK (nota >= 1 AND nota <= 10),
  data_inicio_leitura DATE,
  data_fim_leitura DATE,
  resenha TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de metas pessoais
CREATE TABLE IF NOT EXISTS metas_pessoais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100),
  status VARCHAR(20) DEFAULT 'Ativa' CHECK (status IN ('Ativa', 'Concluída', 'Cancelada')),
  progresso INTEGER DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
  data_limite DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELAS DE VIDA SAUDÁVEL
-- ============================================

-- Tabela de registros de peso
CREATE TABLE IF NOT EXISTS registros_peso (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  peso DECIMAL(5, 2) NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de registros de alimentação
CREATE TABLE IF NOT EXISTS registros_alimentacao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  alimento TEXT NOT NULL,
  refeicao VARCHAR(50),
  calorias INTEGER DEFAULT 0,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de registros de treinos
CREATE TABLE IF NOT EXISTS registros_treinos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo VARCHAR(100),
  duracao INTEGER DEFAULT 0,
  intensidade VARCHAR(20) CHECK (intensidade IN ('Leve', 'Moderada', 'Alta')),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de registros de sono
CREATE TABLE IF NOT EXISTS registros_sono (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  qualidade VARCHAR(20) CHECK (qualidade IN ('Ruim', 'Regular', 'Boa', 'Excelente')),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELAS DE ESPIRITUALIDADE
-- ============================================

-- Tabela de afirmações (Lei da Atração)
CREATE TABLE IF NOT EXISTS afirmacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  categoria VARCHAR(100),
  data_criacao DATE DEFAULT CURRENT_DATE,
  frequencia INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'Ativa' CHECK (status IN ('Ativa', 'Arquivada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de registros astrológicos
CREATE TABLE IF NOT EXISTS registros_astrologia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('Lua Nova', 'Lua Cheia', 'Eclipse', 'Retrogradação', 'Outro')),
  signo VARCHAR(50),
  descricao TEXT NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA DE CATEGORIAS FINANCEIRAS (OPCIONAL)
-- ============================================

-- Tabela de categorias financeiras
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
-- ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices para usuários
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_status ON usuarios(status);

-- Índices para leads
CREATE INDEX IF NOT EXISTS idx_leads_usuario_id ON leads(usuario_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_data_criacao ON leads(data_criacao);
CREATE INDEX IF NOT EXISTS idx_leads_cidade ON leads(cidade);

-- Índices para clientes
CREATE INDEX IF NOT EXISTS idx_clientes_usuario_id ON clientes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_clientes_status ON clientes(status);
CREATE INDEX IF NOT EXISTS idx_clientes_data_cadastro ON clientes(data_cadastro);

-- Índices para tarefas
CREATE INDEX IF NOT EXISTS idx_tarefas_usuario_id ON tarefas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_status ON tarefas(status);
CREATE INDEX IF NOT EXISTS idx_tarefas_data ON tarefas(data);
CREATE INDEX IF NOT EXISTS idx_tarefas_projeto_id ON tarefas(projeto_id);

-- Índices para projetos
CREATE INDEX IF NOT EXISTS idx_projetos_usuario_id ON projetos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_projetos_status ON projetos(status);
CREATE INDEX IF NOT EXISTS idx_projetos_data_inicio ON projetos(data_inicio);

-- Índices para transações financeiras
CREATE INDEX IF NOT EXISTS idx_transacoes_empresa_usuario_id ON transacoes_financeiras_empresa(usuario_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_empresa_tipo ON transacoes_financeiras_empresa(tipo);
CREATE INDEX IF NOT EXISTS idx_transacoes_empresa_data ON transacoes_financeiras_empresa(data);
CREATE INDEX IF NOT EXISTS idx_transacoes_pessoais_usuario_id ON transacoes_financeiras_pessoais(usuario_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_pessoais_tipo ON transacoes_financeiras_pessoais(tipo);
CREATE INDEX IF NOT EXISTS idx_transacoes_pessoais_data ON transacoes_financeiras_pessoais(data);

-- Índices para operações de trading
CREATE INDEX IF NOT EXISTS idx_operacoes_trading_usuario_id ON operacoes_trading(usuario_id);
CREATE INDEX IF NOT EXISTS idx_operacoes_trading_data_hora ON operacoes_trading(data_hora);
CREATE INDEX IF NOT EXISTS idx_operacoes_trading_ativo ON operacoes_trading(ativo);

-- Índices para estudos
CREATE INDEX IF NOT EXISTS idx_aulas_usuario_id ON aulas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_aulas_materia_id ON aulas(materia_id);
CREATE INDEX IF NOT EXISTS idx_aulas_status ON aulas(status);
CREATE INDEX IF NOT EXISTS idx_materias_tema_id ON materias_estudo(tema_id);

-- Índices para categorias financeiras
CREATE INDEX IF NOT EXISTS idx_categorias_usuario ON categorias_financeiras(usuario_id);
CREATE INDEX IF NOT EXISTS idx_categorias_tipo ON categorias_financeiras(tipo);
CREATE INDEX IF NOT EXISTS idx_categorias_nome ON categorias_financeiras(nome);

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas com updated_at
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

-- Função para criar usuário automaticamente e confirmar email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- FORÇA confirmação do email imediatamente após criação
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id AND email_confirmed_at IS NULL;
  
  -- Garante que o perfil seja criado na tabela usuarios
  INSERT INTO usuarios (id, nome, email, status, data_registro)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    'Ativo',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar trigger para novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Função para confirmar email de um usuário específico
CREATE OR REPLACE FUNCTION public.confirm_user_email(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = LOWER(TRIM(user_email));
  
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para revalidar sessão e confirmar email
CREATE OR REPLACE FUNCTION public.revalidate_user_session(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = LOWER(TRIM(user_email));
  
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- FORÇA confirmação
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar updated_at de categorias financeiras
CREATE OR REPLACE FUNCTION update_categorias_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para categorias financeiras
DROP TRIGGER IF EXISTS trigger_update_categorias_updated_at ON categorias_financeiras;
CREATE TRIGGER trigger_update_categorias_updated_at
  BEFORE UPDATE ON categorias_financeiras
  FOR EACH ROW
  EXECUTE FUNCTION update_categorias_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
DO $$
DECLARE
  tbl_name TEXT;
BEGIN
  FOR tbl_name IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename NOT LIKE 'pg_%'
    AND tablename != 'usuarios'
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl_name);
  END LOOP;
END $$;

-- Política para usuarios: usuários podem ver e editar apenas seus próprios dados
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON usuarios;
CREATE POLICY "Usuários podem ver seus próprios dados"
  ON usuarios FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON usuarios;
CREATE POLICY "Usuários podem atualizar seus próprios dados"
  ON usuarios FOR UPDATE
  USING (auth.uid() = id);

-- Política genérica: usuários autenticados podem ver/editar apenas seus próprios dados
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
-- CONFIRMAR TODOS OS EMAILS EXISTENTES
-- ============================================

-- FORÇAR confirmação de TODOS os emails existentes
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- ============================================
-- FIM DO SCHEMA
-- ============================================

-- Verificação final: contar tabelas criadas
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';
  
  RAISE NOTICE '✅ Schema criado com sucesso! Total de tabelas: %', table_count;
END $$;

