-- =====================================================
-- SCHEMA COMPLETO DO BANCO DE DADOS - CRM LUCCA
-- Sistema de Gestão Empresarial e Pessoal
-- =====================================================

-- =====================================================
-- 1. AUTENTICAÇÃO E USUÁRIOS
-- =====================================================

CREATE TABLE usuarios (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    remember_me BOOLEAN DEFAULT FALSE,
    is_authenticated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

CREATE TABLE preferencias_usuario (
    usuario_id VARCHAR(36) PRIMARY KEY,
    mostrar_valores BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- =====================================================
-- 2. LEADS E CLIENTES
-- =====================================================

CREATE TABLE leads (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20),
    estado VARCHAR(2) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    nicho VARCHAR(100),
    observacoes TEXT,
    status ENUM('Novo', 'Contatado', 'Qualificado', 'Convertido', 'Perdido') DEFAULT 'Novo',
    data_criacao DATE NOT NULL,
    origem VARCHAR(100),
    contactado BOOLEAN DEFAULT FALSE,
    data_contato DATE,
    tem_site BOOLEAN,
    lead_quente BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_estado (estado),
    INDEX idx_cidade (cidade),
    INDEX idx_nicho (nicho),
    INDEX idx_lead_quente (lead_quente),
    INDEX idx_data_criacao (data_criacao)
);

CREATE TABLE clientes (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20),
    empresa VARCHAR(255),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    status ENUM('Ativo', 'Inativo', 'Prospecto') DEFAULT 'Prospecto',
    valor_total DECIMAL(15, 2) DEFAULT 0.00,
    ultima_interacao DATE,
    observacoes TEXT,
    lead_id VARCHAR(36),
    data_cadastro DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_lead_id (lead_id),
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
);

-- =====================================================
-- 3. TAREFAS (UNIFICADAS - PESSOAIS E EMPRESARIAIS)
-- =====================================================

CREATE TABLE tarefas (
    id VARCHAR(36) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    prioridade ENUM('Baixa', 'Média', 'Alta', 'Urgente') DEFAULT 'Média',
    categoria ENUM('Pessoal', 'Empresarial', 'Projeto', 'Outro') DEFAULT 'Geral',
    data DATE NOT NULL,
    status ENUM('Pendente', 'Em Andamento', 'Em Revisão', 'Concluída') DEFAULT 'Pendente',
    tarefa_rapida BOOLEAN DEFAULT FALSE,
    projeto_id VARCHAR(36),
    recorrente BOOLEAN DEFAULT FALSE,
    target VARCHAR(255),
    concluida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_prioridade (prioridade),
    INDEX idx_categoria (categoria),
    INDEX idx_data (data),
    INDEX idx_projeto_id (projeto_id),
    INDEX idx_concluida (concluida)
);

CREATE TABLE tarefa_etiquetas (
    id VARCHAR(36) PRIMARY KEY,
    tarefa_id VARCHAR(36) NOT NULL,
    etiqueta VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tarefa_id) REFERENCES tarefas(id) ON DELETE CASCADE,
    INDEX idx_tarefa_id (tarefa_id)
);

-- =====================================================
-- 4. PROJETOS EMPRESARIAIS
-- =====================================================

CREATE TABLE projetos (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    status ENUM('Pendente', 'Andamento', 'Revisão', 'Entregue', 'Arquivado') DEFAULT 'Pendente',
    cliente VARCHAR(255),
    valor DECIMAL(15, 2),
    etapas_concluidas INT DEFAULT 0,
    total_etapas INT DEFAULT 0,
    data_inicio DATE NOT NULL,
    prazo DATE,
    quantidade_anexos INT DEFAULT 0,
    ideia_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_data_inicio (data_inicio),
    INDEX idx_ideia_id (ideia_id)
);

-- =====================================================
-- 5. PROJETOS PESSOAIS
-- =====================================================

CREATE TABLE projetos_pessoais (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    status ENUM('Planejamento', 'Em Andamento', 'Pausado', 'Concluído', 'Cancelado') DEFAULT 'Planejamento',
    data_inicio DATE NOT NULL,
    prazo DATE,
    progresso INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
);

CREATE TABLE projeto_pessoal_tarefas (
    id VARCHAR(36) PRIMARY KEY,
    projeto_id VARCHAR(36) NOT NULL,
    tarefa_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projeto_id) REFERENCES projetos_pessoais(id) ON DELETE CASCADE,
    FOREIGN KEY (tarefa_id) REFERENCES tarefas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_vinculo (projeto_id, tarefa_id)
);

-- =====================================================
-- 6. IDEIAS
-- =====================================================

CREATE TABLE ideias (
    id VARCHAR(36) PRIMARY KEY,
    texto TEXT NOT NULL,
    categoria ENUM('Negócio', 'Automação', 'Projeto', 'Conteúdo', 'Outro') DEFAULT 'Outro',
    status ENUM('Explorando', 'Em Análise', 'Em Teste', 'Executando', 'Arquivada') DEFAULT 'Explorando',
    potencial_financeiro INT DEFAULT 1 CHECK (potencial_financeiro >= 1 AND potencial_financeiro <= 10),
    data_criacao DATE NOT NULL,
    tarefa_id VARCHAR(36),
    projeto_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_categoria (categoria),
    INDEX idx_data_criacao (data_criacao),
    INDEX idx_tarefa_id (tarefa_id),
    INDEX idx_projeto_id (projeto_id)
);

-- =====================================================
-- 7. BRAINSTORM
-- =====================================================

CREATE TABLE brainstorm_ideias (
    id VARCHAR(36) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    autor VARCHAR(255) NOT NULL,
    categoria VARCHAR(100),
    prioridade ENUM('Baixa', 'Média', 'Alta') DEFAULT 'Média',
    status ENUM('Nova', 'Em Análise', 'Aprovada', 'Rejeitada', 'Implementada') DEFAULT 'Nova',
    data_criacao DATE NOT NULL,
    votos INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_prioridade (prioridade)
);

CREATE TABLE brainstorm_participantes (
    id VARCHAR(36) PRIMARY KEY,
    ideia_id VARCHAR(36) NOT NULL,
    participante VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ideia_id) REFERENCES brainstorm_ideias(id) ON DELETE CASCADE,
    INDEX idx_ideia_id (ideia_id)
);

-- =====================================================
-- 8. FINANÇAS EMPRESARIAIS
-- =====================================================

CREATE TABLE transacoes_empresa (
    id VARCHAR(36) PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    data DATE NOT NULL,
    tipo ENUM('entrada', 'saida') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tipo (tipo),
    INDEX idx_data (data),
    INDEX idx_categoria (categoria)
);

CREATE TABLE metas_financeiras_empresa (
    id VARCHAR(36) PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor_meta DECIMAL(15, 2) NOT NULL,
    valor_atual DECIMAL(15, 2) DEFAULT 0.00,
    data_limite DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE reserva_emergencia_empresa (
    id VARCHAR(36) PRIMARY KEY DEFAULT 'reserva-empresa-1',
    valor_atual DECIMAL(15, 2) DEFAULT 0.00,
    meta DECIMAL(15, 2) NOT NULL,
    descricao VARCHAR(255) DEFAULT 'Reserva de Emergência',
    data_criacao DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE aplicacoes_empresa (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    valor_investido DECIMAL(15, 2) NOT NULL,
    valor_atual DECIMAL(15, 2) NOT NULL,
    rentabilidade DECIMAL(10, 2) NOT NULL,
    data_aplicacao DATE NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_data_aplicacao (data_aplicacao)
);

-- =====================================================
-- 9. FINANÇAS PESSOAIS
-- =====================================================

CREATE TABLE transacoes_pessoais (
    id VARCHAR(36) PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    data DATE NOT NULL,
    tipo ENUM('entrada', 'saida') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tipo (tipo),
    INDEX idx_data (data),
    INDEX idx_categoria (categoria)
);

CREATE TABLE metas_financeiras_pessoais (
    id VARCHAR(36) PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor_meta DECIMAL(15, 2) NOT NULL,
    valor_atual DECIMAL(15, 2) DEFAULT 0.00,
    data_limite DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE gastos_recorrentes (
    id VARCHAR(36) PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,
    proxima_data DATE NOT NULL,
    recorrencia ENUM('mensal', 'anual') DEFAULT 'mensal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_proxima_data (proxima_data)
);

CREATE TABLE reserva_emergencia_pessoal (
    id VARCHAR(36) PRIMARY KEY DEFAULT 'reserva-pessoal-1',
    valor_atual DECIMAL(15, 2) DEFAULT 0.00,
    meta DECIMAL(15, 2) NOT NULL,
    descricao VARCHAR(255) DEFAULT 'Reserva de Emergência Pessoal',
    data_criacao DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE aplicacoes_pessoais (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    valor_investido DECIMAL(15, 2) NOT NULL,
    valor_atual DECIMAL(15, 2) NOT NULL,
    rentabilidade DECIMAL(10, 2) NOT NULL,
    data_aplicacao DATE NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_data_aplicacao (data_aplicacao)
);

CREATE TABLE lista_compras (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    quantidade INT DEFAULT 1,
    valor_estimado DECIMAL(10, 2) NOT NULL,
    categoria ENUM('Mercado', 'Diversas') DEFAULT 'Diversas',
    status ENUM('Pendente', 'Comprado') DEFAULT 'Pendente',
    recorrencia_mensal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_categoria (categoria)
);

-- =====================================================
-- 10. TRADING
-- =====================================================

CREATE TABLE operacoes_trading (
    id VARCHAR(36) PRIMARY KEY,
    ativo VARCHAR(50) NOT NULL,
    tipo ENUM('CALL', 'PUT') NOT NULL,
    resultado ENUM('Gain', 'Loss') NOT NULL,
    valor_entrada DECIMAL(15, 2) NOT NULL,
    lucro_prejuizo DECIMAL(15, 2) NOT NULL,
    url_print VARCHAR(500),
    observacoes TEXT,
    data_hora DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_data_hora (data_hora),
    INDEX idx_resultado (resultado),
    INDEX idx_tipo (tipo)
);

CREATE TABLE configuracao_trading (
    id VARCHAR(36) PRIMARY KEY DEFAULT 'config-trading-1',
    capital_total DECIMAL(15, 2) NOT NULL,
    meta_diaria_percentual DECIMAL(5, 2) NOT NULL,
    stop_gain_reais DECIMAL(15, 2) NOT NULL,
    stop_gain_percentual DECIMAL(5, 2) NOT NULL,
    stop_loss_reais DECIMAL(15, 2) NOT NULL,
    stop_loss_percentual DECIMAL(5, 2) NOT NULL,
    valor_maximo_entrada DECIMAL(15, 2) NOT NULL,
    limite_operacoes_dia INT NOT NULL,
    data_inicio DATE NOT NULL,
    dia_atual DATE NOT NULL,
    bloqueado BOOLEAN DEFAULT FALSE,
    motivo_bloqueio ENUM('stop_gain', 'stop_loss', 'limite_operacoes'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE sessoes_alavancagem (
    id VARCHAR(36) PRIMARY KEY,
    capital_inicial DECIMAL(15, 2) NOT NULL,
    numero_niveis INT NOT NULL CHECK (numero_niveis >= 1 AND numero_niveis <= 5),
    meta_por_nivel DECIMAL(15, 2) NOT NULL,
    stop_total DECIMAL(15, 2) NOT NULL,
    stop_protegido DECIMAL(15, 2),
    valor_entradas DECIMAL(15, 2) NOT NULL,
    tipo_entrada ENUM('percentual', 'fixo') DEFAULT 'percentual',
    status ENUM('ativa', 'concluida') DEFAULT 'ativa',
    nivel_atual INT DEFAULT 1,
    progresso_por_nivel JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
);

-- =====================================================
-- 11. GESTÃO PESSOAL - ESTUDOS
-- =====================================================

CREATE TABLE materias (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    cor VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE nichos (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    cor VARCHAR(7) DEFAULT '#8B5CF6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE aulas (
    id VARCHAR(36) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    materia_id VARCHAR(36),
    nicho_id VARCHAR(36),
    url_video VARCHAR(500),
    duracao INT NOT NULL COMMENT 'em minutos',
    status ENUM('Não iniciada', 'Em andamento', 'Concluída') DEFAULT 'Não iniciada',
    data_inicio DATE,
    data_conclusao DATE,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_materia_id (materia_id),
    INDEX idx_nicho_id (nicho_id),
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE SET NULL,
    FOREIGN KEY (nicho_id) REFERENCES nichos(id) ON DELETE SET NULL
);

CREATE TABLE revisoes (
    id VARCHAR(36) PRIMARY KEY,
    aula_id VARCHAR(36) NOT NULL,
    data_revisao DATE NOT NULL,
    notas TEXT,
    status ENUM('Agendada', 'Realizada') DEFAULT 'Agendada',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_aula_id (aula_id),
    INDEX idx_status (status),
    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE
);

-- =====================================================
-- 12. GESTÃO PESSOAL - LIVROS
-- =====================================================

CREATE TABLE livros (
    id VARCHAR(36) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(255) NOT NULL,
    genero VARCHAR(100),
    status ENUM('Quero Ler', 'Lendo', 'Lido', 'Abandonado') DEFAULT 'Quero Ler',
    data_inicio DATE,
    data_fim DATE,
    nota INT CHECK (nota >= 0 AND nota <= 10),
    resenha TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_genero (genero)
);

-- =====================================================
-- 13. GESTÃO PESSOAL - HÁBITOS E VÍCIOS
-- =====================================================

CREATE TABLE habitos_vicios (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo ENUM('Vício', 'Hábito', 'Mania') NOT NULL,
    data_inicio_controle DATE NOT NULL,
    status ENUM('Ativo', 'Superado') DEFAULT 'Ativo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_tipo (tipo)
);

CREATE TABLE estrategias_superacao (
    id VARCHAR(36) PRIMARY KEY,
    habito_id VARCHAR(36) NOT NULL,
    estrategia TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (habito_id) REFERENCES habitos_vicios(id) ON DELETE CASCADE,
    INDEX idx_habito_id (habito_id)
);

-- =====================================================
-- 14. GESTÃO PESSOAL - ALIMENTAÇÃO
-- =====================================================

CREATE TABLE registros_alimentacao (
    id VARCHAR(36) PRIMARY KEY,
    data DATE NOT NULL,
    refeicao VARCHAR(100) NOT NULL,
    alimentos TEXT NOT NULL,
    calorias INT,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_data (data),
    INDEX idx_refeicao (refeicao)
);

-- =====================================================
-- 15. GESTÃO PESSOAL - TREINOS
-- =====================================================

CREATE TABLE treinos (
    id VARCHAR(36) PRIMARY KEY,
    data DATE NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    exercicios TEXT NOT NULL,
    duracao INT NOT NULL COMMENT 'em minutos',
    intensidade ENUM('Leve', 'Moderada', 'Intensa') DEFAULT 'Moderada',
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_data (data),
    INDEX idx_intensidade (intensidade)
);

-- =====================================================
-- 16. GESTÃO PESSOAL - SONO
-- =====================================================

CREATE TABLE registros_sono (
    id VARCHAR(36) PRIMARY KEY,
    data DATE NOT NULL,
    hora_dormir TIME NOT NULL,
    hora_acordar TIME NOT NULL,
    qualidade ENUM('Excelente', 'Boa', 'Regular', 'Ruim') DEFAULT 'Boa',
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_data (data),
    INDEX idx_qualidade (qualidade)
);

-- =====================================================
-- 17. GESTÃO PESSOAL - AUTODESENVOLVIMENTO
-- =====================================================

CREATE TABLE atividades_desenvolvimento (
    id VARCHAR(36) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    data DATE NOT NULL,
    status ENUM('Planejada', 'Em Andamento', 'Concluída') DEFAULT 'Planejada',
    progresso INT DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_categoria (categoria),
    INDEX idx_data (data)
);

-- =====================================================
-- 18. GESTÃO PESSOAL - METAS ANUAIS
-- =====================================================

CREATE TABLE metas_anuais (
    id VARCHAR(36) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    progresso INT DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
    status ENUM('Planejamento', 'Em Andamento', 'Concluída', 'Cancelada') DEFAULT 'Planejamento',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_categoria (categoria)
);

-- =====================================================
-- 19. GESTÃO PESSOAL - LEI DA ATRAÇÃO
-- =====================================================

CREATE TABLE afirmacoes (
    id VARCHAR(36) PRIMARY KEY,
    texto TEXT NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    data_criacao DATE NOT NULL,
    frequencia INT DEFAULT 1,
    status ENUM('Ativa', 'Arquivada') DEFAULT 'Ativa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_categoria (categoria)
);

CREATE TABLE bilhetes_positivos (
    id VARCHAR(36) PRIMARY KEY,
    texto TEXT NOT NULL,
    cor VARCHAR(7) DEFAULT '#FFD700',
    tamanho ENUM('Pequeno', 'Médio', 'Grande') DEFAULT 'Médio',
    categoria ENUM('Motivacional', 'Afirmação', 'Gratidão', 'Outro') DEFAULT 'Motivacional',
    fonte VARCHAR(100),
    emoji VARCHAR(10),
    formato ENUM('Quadrado', 'Retângulo', 'Círculo') DEFAULT 'Quadrado',
    posicao_x INT DEFAULT 0,
    posicao_y INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- 20. GESTÃO PESSOAL - ASTROLOGIA
-- =====================================================

CREATE TABLE registros_astrologia (
    id VARCHAR(36) PRIMARY KEY,
    data DATE NOT NULL,
    tipo ENUM('Lua Nova', 'Lua Cheia', 'Eclipse', 'Retrogradação', 'Outro') NOT NULL,
    signo VARCHAR(50) NOT NULL,
    descricao TEXT NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_data (data),
    INDEX idx_tipo (tipo),
    INDEX idx_signo (signo)
);

-- =====================================================
-- 21. USUÁRIOS E LICENÇAS (APLICAÇÕES)
-- =====================================================

CREATE TABLE usuarios_aplicacoes (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    status ENUM('Ativo', 'Inativo') DEFAULT 'Ativo',
    plano VARCHAR(100) NOT NULL,
    aplicativo_vinculado VARCHAR(255) NOT NULL,
    data_registro DATE NOT NULL,
    ultimo_acesso DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_plano (plano),
    INDEX idx_aplicativo (aplicativo_vinculado)
);

-- =====================================================
-- 22. SUPORTE
-- =====================================================

CREATE TABLE tickets_suporte (
    id VARCHAR(36) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    prioridade ENUM('Baixa', 'Média', 'Alta', 'Urgente') DEFAULT 'Média',
    status ENUM('Aberto', 'Em Andamento', 'Resolvido', 'Fechado') DEFAULT 'Aberto',
    solicitante VARCHAR(255) NOT NULL,
    responsavel VARCHAR(255),
    data_abertura DATE NOT NULL,
    data_resolucao DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_prioridade (prioridade),
    INDEX idx_categoria (categoria)
);

-- =====================================================
-- 23. DEPLOYS
-- =====================================================

CREATE TABLE deploys (
    id VARCHAR(36) PRIMARY KEY,
    versao VARCHAR(50) NOT NULL,
    ambiente VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    responsavel VARCHAR(255) NOT NULL,
    data DATE NOT NULL,
    status ENUM('Sucesso', 'Falha', 'Em Andamento') DEFAULT 'Em Andamento',
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_ambiente (ambiente),
    INDEX idx_data (data)
);

-- =====================================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- =====================================================

-- Índices compostos para consultas frequentes
CREATE INDEX idx_leads_estado_cidade ON leads(estado, cidade);
CREATE INDEX idx_tarefas_status_data ON tarefas(status, data);
CREATE INDEX idx_transacoes_tipo_data ON transacoes_empresa(tipo, data);
CREATE INDEX idx_transacoes_pessoais_tipo_data ON transacoes_pessoais(tipo, data);
CREATE INDEX idx_operacoes_trading_data_resultado ON operacoes_trading(data_hora, resultado);

-- =====================================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

DELIMITER //

CREATE TRIGGER atualizar_lead_quente
BEFORE UPDATE ON leads
FOR EACH ROW
BEGIN
    IF NEW.tem_site = FALSE THEN
        SET NEW.lead_quente = TRUE;
    ELSE
        SET NEW.lead_quente = FALSE;
    END IF;
END//

CREATE TRIGGER calcular_fluxo_caixa_empresa
AFTER INSERT ON transacoes_empresa
FOR EACH ROW
BEGIN
    -- Trigger para recalcular fluxo de caixa (pode ser implementado via stored procedure)
    -- Por enquanto, deixamos a lógica na aplicação
END//

CREATE TRIGGER calcular_saldo_pessoal
AFTER INSERT ON transacoes_pessoais
FOR EACH ROW
BEGIN
    -- Trigger para recalcular saldo (pode ser implementado via stored procedure)
    -- Por enquanto, deixamos a lógica na aplicação
END//

DELIMITER ;

-- =====================================================
-- VIEWS ÚTEIS PARA RELATÓRIOS
-- =====================================================

CREATE VIEW vw_leads_quentes AS
SELECT 
    id,
    nome,
    email,
    telefone,
    cidade,
    estado,
    data_criacao,
    status
FROM leads
WHERE lead_quente = TRUE;

CREATE VIEW vw_leads_convertidos AS
SELECT 
    l.id,
    l.nome,
    l.email,
    l.data_criacao,
    c.id AS cliente_id,
    c.valor_total,
    c.data_cadastro
FROM leads l
INNER JOIN clientes c ON c.lead_id = l.id
WHERE l.status = 'Convertido';

CREATE VIEW vw_tarefas_pendentes AS
SELECT 
    id,
    titulo,
    prioridade,
    categoria,
    data,
    status
FROM tarefas
WHERE status != 'Concluída' AND concluida = FALSE
ORDER BY 
    CASE prioridade
        WHEN 'Urgente' THEN 1
        WHEN 'Alta' THEN 2
        WHEN 'Média' THEN 3
        WHEN 'Baixa' THEN 4
    END,
    data ASC;

CREATE VIEW vw_financeiro_empresa_mensal AS
SELECT 
    DATE_FORMAT(data, '%Y-%m') AS mes,
    tipo,
    SUM(valor) AS total,
    COUNT(*) AS quantidade
FROM transacoes_empresa
GROUP BY DATE_FORMAT(data, '%Y-%m'), tipo
ORDER BY mes DESC;

CREATE VIEW vw_financeiro_pessoal_mensal AS
SELECT 
    DATE_FORMAT(data, '%Y-%m') AS mes,
    tipo,
    SUM(valor) AS total,
    COUNT(*) AS quantidade
FROM transacoes_pessoais
GROUP BY DATE_FORMAT(data, '%Y-%m'), tipo
ORDER BY mes DESC;

CREATE VIEW vw_trading_estatisticas AS
SELECT 
    DATE(data_hora) AS data,
    COUNT(*) AS total_operacoes,
    SUM(CASE WHEN resultado = 'Gain' THEN 1 ELSE 0 END) AS ganhos,
    SUM(CASE WHEN resultado = 'Loss' THEN 1 ELSE 0 END) AS perdas,
    SUM(lucro_prejuizo) AS lucro_total,
    ROUND((SUM(CASE WHEN resultado = 'Gain' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) AS win_rate
FROM operacoes_trading
GROUP BY DATE(data_hora)
ORDER BY data DESC;

-- =====================================================
-- STORED PROCEDURES ÚTEIS
-- =====================================================

DELIMITER //

CREATE PROCEDURE sp_calcular_fluxo_caixa_empresa()
BEGIN
    DECLARE total_entradas DECIMAL(15, 2);
    DECLARE total_saidas DECIMAL(15, 2);
    DECLARE fluxo_caixa DECIMAL(15, 2);
    
    SELECT COALESCE(SUM(valor), 0) INTO total_entradas
    FROM transacoes_empresa
    WHERE tipo = 'entrada';
    
    SELECT COALESCE(SUM(valor), 0) INTO total_saidas
    FROM transacoes_empresa
    WHERE tipo = 'saida';
    
    SET fluxo_caixa = total_entradas - total_saidas;
    
    SELECT fluxo_caixa AS fluxo_caixa;
END//

CREATE PROCEDURE sp_calcular_saldo_pessoal()
BEGIN
    DECLARE total_entradas DECIMAL(15, 2);
    DECLARE total_saidas DECIMAL(15, 2);
    DECLARE saldo DECIMAL(15, 2);
    
    SELECT COALESCE(SUM(valor), 0) INTO total_entradas
    FROM transacoes_pessoais
    WHERE tipo = 'entrada';
    
    SELECT COALESCE(SUM(valor), 0) INTO total_saidas
    FROM transacoes_pessoais
    WHERE tipo = 'saida';
    
    SET saldo = total_entradas - total_saidas;
    
    SELECT saldo AS saldo_atual;
END//

CREATE PROCEDURE sp_obter_tarefas_do_dia(IN data_consulta DATE)
BEGIN
    SELECT *
    FROM tarefas
    WHERE data = data_consulta
    ORDER BY 
        CASE prioridade
            WHEN 'Urgente' THEN 1
            WHEN 'Alta' THEN 2
            WHEN 'Média' THEN 3
            WHEN 'Baixa' THEN 4
        END;
END//

DELIMITER ;

-- =====================================================
-- DADOS INICIAIS (SEED DATA)
-- =====================================================

-- Inserir usuário padrão (senha deve ser hash em produção)
INSERT INTO usuarios (id, nome, email, senha_hash, remember_me, is_authenticated) 
VALUES ('user-default-1', 'Usuário Padrão', 'admin@crm.com', 'hash_aqui', FALSE, FALSE);

-- Inserir preferências padrão
INSERT INTO preferencias_usuario (usuario_id, mostrar_valores) 
VALUES ('user-default-1', TRUE);

-- Inserir reservas de emergência padrão
INSERT INTO reserva_emergencia_empresa (id, valor_atual, meta, descricao, data_criacao)
VALUES ('reserva-empresa-1', 0.00, 50000.00, 'Reserva de Emergência', CURDATE());

INSERT INTO reserva_emergencia_pessoal (id, valor_atual, meta, descricao, data_criacao)
VALUES ('reserva-pessoal-1', 0.00, 20000.00, 'Reserva de Emergência Pessoal', CURDATE());

-- =====================================================
-- COMENTÁRIOS FINAIS
-- =====================================================

-- Este schema foi criado para suportar todas as funcionalidades do sistema CRM
-- Todas as tabelas usam VARCHAR(36) para IDs (UUIDs)
-- Datas são armazenadas como DATE ou DATETIME conforme necessário
-- Valores monetários usam DECIMAL(15, 2) para precisão
-- Índices foram criados para otimizar consultas frequentes
-- Triggers garantem consistência de dados (ex: lead_quente baseado em tem_site)
-- Views facilitam relatórios e dashboards
-- Stored procedures para cálculos complexos

-- IMPORTANTE: 
-- 1. Em produção, substitua 'hash_aqui' por hash real da senha (bcrypt, argon2, etc.)
-- 2. Configure backups regulares
-- 3. Ajuste índices conforme uso real do sistema
-- 4. Considere particionamento para tabelas grandes (transacoes, operacoes_trading)
-- 5. Implemente soft delete se necessário (adicionar campo deleted_at)
-- 6. Adicione auditoria (created_by, updated_by) se necessário

