-- =====================================================
-- SCHEMA COMPLETO DO BANCO DE DADOS - CRM LUCCA
-- Sistema de Gestão Empresarial e Pessoal
-- VERSÃO POSTGRESQL
-- =====================================================

-- =====================================================
-- 1. TIPOS ENUM
-- =====================================================

CREATE TYPE status_lead AS ENUM ('Novo', 'Contatado', 'Qualificado', 'Convertido', 'Perdido');
CREATE TYPE status_cliente AS ENUM ('Ativo', 'Inativo', 'Prospecto');
CREATE TYPE prioridade_tarefa AS ENUM ('Baixa', 'Média', 'Alta', 'Urgente');
CREATE TYPE categoria_tarefa AS ENUM ('Pessoal', 'Empresarial', 'Projeto', 'Outro');
CREATE TYPE status_tarefa AS ENUM ('Pendente', 'Em Andamento', 'Em Revisão', 'Concluída');
CREATE TYPE status_projeto AS ENUM ('Pendente', 'Andamento', 'Revisão', 'Entregue', 'Arquivado');
CREATE TYPE status_projeto_pessoal AS ENUM ('Planejamento', 'Em Andamento', 'Pausado', 'Concluído', 'Cancelado');
CREATE TYPE categoria_ideia AS ENUM ('Negócio', 'Automação', 'Projeto', 'Conteúdo', 'Outro');
CREATE TYPE status_ideia AS ENUM ('Explorando', 'Em Análise', 'Em Teste', 'Executando', 'Arquivada');
CREATE TYPE prioridade_brainstorm AS ENUM ('Baixa', 'Média', 'Alta');
CREATE TYPE status_brainstorm AS ENUM ('Nova', 'Em Análise', 'Aprovada', 'Rejeitada', 'Implementada');
CREATE TYPE tipo_transacao AS ENUM ('entrada', 'saida');
CREATE TYPE tipo_recorrencia AS ENUM ('mensal', 'anual');
CREATE TYPE categoria_compra AS ENUM ('Mercado', 'Diversas');
CREATE TYPE status_compra AS ENUM ('Pendente', 'Comprado');
CREATE TYPE tipo_operacao AS ENUM ('CALL', 'PUT');
CREATE TYPE resultado_operacao AS ENUM ('Gain', 'Loss');
CREATE TYPE motivo_bloqueio AS ENUM ('stop_gain', 'stop_loss', 'limite_operacoes');
CREATE TYPE tipo_entrada_alavancagem AS ENUM ('percentual', 'fixo');
CREATE TYPE status_sessao_alavancagem AS ENUM ('ativa', 'concluida');
CREATE TYPE status_aula AS ENUM ('Não iniciada', 'Em andamento', 'Concluída');
CREATE TYPE status_revisao AS ENUM ('Agendada', 'Realizada');
CREATE TYPE status_livro AS ENUM ('Quero Ler', 'Lendo', 'Lido', 'Abandonado');
CREATE TYPE tipo_habito AS ENUM ('Vício', 'Hábito', 'Mania');
CREATE TYPE status_habito AS ENUM ('Ativo', 'Superado');
CREATE TYPE intensidade_treino AS ENUM ('Leve', 'Moderada', 'Intensa');
CREATE TYPE qualidade_sono AS ENUM ('Excelente', 'Boa', 'Regular', 'Ruim');
CREATE TYPE status_desenvolvimento AS ENUM ('Planejada', 'Em Andamento', 'Concluída');
CREATE TYPE status_meta_anual AS ENUM ('Planejamento', 'Em Andamento', 'Concluída', 'Cancelada');
CREATE TYPE status_afirmacao AS ENUM ('Ativa', 'Arquivada');
CREATE TYPE tamanho_bilhete AS ENUM ('Pequeno', 'Médio', 'Grande');
CREATE TYPE categoria_bilhete AS ENUM ('Motivacional', 'Afirmação', 'Gratidão', 'Outro');
CREATE TYPE formato_bilhete AS ENUM ('Quadrado', 'Retângulo', 'Círculo');
CREATE TYPE tipo_astrologia AS ENUM ('Lua Nova', 'Lua Cheia', 'Eclipse', 'Retrogradação', 'Outro');
CREATE TYPE status_usuario_app AS ENUM ('Ativo', 'Inativo');
CREATE TYPE prioridade_ticket AS ENUM ('Baixa', 'Média', 'Alta', 'Urgente');
CREATE TYPE status_ticket AS ENUM ('Aberto', 'Em Andamento', 'Resolvido', 'Fechado');
CREATE TYPE status_deploy AS ENUM ('Sucesso', 'Falha', 'Em Andamento');

-- =====================================================
-- 2. FUNÇÃO PARA ATUALIZAR updated_at AUTOMATICAMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 3. AUTENTICAÇÃO E USUÁRIOS
-- =====================================================

CREATE TABLE usuarios (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    remember_me BOOLEAN DEFAULT FALSE,
    is_authenticated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email ON usuarios(email);

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE preferencias_usuario (
    usuario_id VARCHAR(36) PRIMARY KEY,
    mostrar_valores BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TRIGGER update_preferencias_usuario_updated_at BEFORE UPDATE ON preferencias_usuario
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. LEADS E CLIENTES
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
    status status_lead DEFAULT 'Novo',
    data_criacao DATE NOT NULL,
    origem VARCHAR(100),
    contactado BOOLEAN DEFAULT FALSE,
    data_contato DATE,
    tem_site BOOLEAN,
    lead_quente BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_estado ON leads(estado);
CREATE INDEX idx_leads_cidade ON leads(cidade);
CREATE INDEX idx_leads_nicho ON leads(nicho);
CREATE INDEX idx_leads_lead_quente ON leads(lead_quente);
CREATE INDEX idx_leads_data_criacao ON leads(data_criacao);
CREATE INDEX idx_leads_estado_cidade ON leads(estado, cidade);

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE clientes (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20),
    empresa VARCHAR(255),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    status status_cliente DEFAULT 'Prospecto',
    valor_total DECIMAL(15, 2) DEFAULT 0.00,
    ultima_interacao DATE,
    observacoes TEXT,
    lead_id VARCHAR(36),
    data_cadastro DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clientes_status ON clientes(status);
CREATE INDEX idx_clientes_lead_id ON clientes(lead_id);
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE clientes ADD CONSTRAINT fk_clientes_lead_id 
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL;

-- =====================================================
-- 5. TAREFAS (UNIFICADAS - PESSOAIS E EMPRESARIAIS)
-- =====================================================

CREATE TABLE tarefas (
    id VARCHAR(36) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    prioridade prioridade_tarefa DEFAULT 'Média',
    categoria categoria_tarefa DEFAULT 'Outro',
    data DATE NOT NULL,
    status status_tarefa DEFAULT 'Pendente',
    tarefa_rapida BOOLEAN DEFAULT FALSE,
    projeto_id VARCHAR(36),
    recorrente BOOLEAN DEFAULT FALSE,
    target VARCHAR(255),
    concluida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tarefas_status ON tarefas(status);
CREATE INDEX idx_tarefas_prioridade ON tarefas(prioridade);
CREATE INDEX idx_tarefas_categoria ON tarefas(categoria);
CREATE INDEX idx_tarefas_data ON tarefas(data);
CREATE INDEX idx_tarefas_projeto_id ON tarefas(projeto_id);
CREATE INDEX idx_tarefas_concluida ON tarefas(concluida);
CREATE INDEX idx_tarefas_status_data ON tarefas(status, data);

CREATE TRIGGER update_tarefas_updated_at BEFORE UPDATE ON tarefas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE tarefa_etiquetas (
    id VARCHAR(36) PRIMARY KEY,
    tarefa_id VARCHAR(36) NOT NULL,
    etiqueta VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tarefa_id) REFERENCES tarefas(id) ON DELETE CASCADE
);

CREATE INDEX idx_tarefa_etiquetas_tarefa_id ON tarefa_etiquetas(tarefa_id);

-- =====================================================
-- 6. PROJETOS EMPRESARIAIS
-- =====================================================

CREATE TABLE projetos (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    status status_projeto DEFAULT 'Pendente',
    cliente VARCHAR(255),
    valor DECIMAL(15, 2),
    etapas_concluidas INT DEFAULT 0,
    total_etapas INT DEFAULT 0,
    data_inicio DATE NOT NULL,
    prazo DATE,
    quantidade_anexos INT DEFAULT 0,
    ideia_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projetos_status ON projetos(status);
CREATE INDEX idx_projetos_data_inicio ON projetos(data_inicio);
CREATE INDEX idx_projetos_ideia_id ON projetos(ideia_id);

CREATE TRIGGER update_projetos_updated_at BEFORE UPDATE ON projetos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. PROJETOS PESSOAIS
-- =====================================================

CREATE TABLE projetos_pessoais (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    status status_projeto_pessoal DEFAULT 'Planejamento',
    data_inicio DATE NOT NULL,
    prazo DATE,
    progresso INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projetos_pessoais_status ON projetos_pessoais(status);

CREATE TRIGGER update_projetos_pessoais_updated_at BEFORE UPDATE ON projetos_pessoais
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE projeto_pessoal_tarefas (
    id VARCHAR(36) PRIMARY KEY,
    projeto_id VARCHAR(36) NOT NULL,
    tarefa_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projeto_id) REFERENCES projetos_pessoais(id) ON DELETE CASCADE,
    FOREIGN KEY (tarefa_id) REFERENCES tarefas(id) ON DELETE CASCADE,
    CONSTRAINT unique_vinculo UNIQUE (projeto_id, tarefa_id)
);

-- =====================================================
-- 8. IDEIAS
-- =====================================================

CREATE TABLE ideias (
    id VARCHAR(36) PRIMARY KEY,
    texto TEXT NOT NULL,
    categoria categoria_ideia DEFAULT 'Outro',
    status status_ideia DEFAULT 'Explorando',
    potencial_financeiro INT DEFAULT 1 CHECK (potencial_financeiro >= 1 AND potencial_financeiro <= 10),
    data_criacao DATE NOT NULL,
    tarefa_id VARCHAR(36),
    projeto_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ideias_status ON ideias(status);
CREATE INDEX idx_ideias_categoria ON ideias(categoria);
CREATE INDEX idx_ideias_data_criacao ON ideias(data_criacao);
CREATE INDEX idx_ideias_tarefa_id ON ideias(tarefa_id);
CREATE INDEX idx_ideias_projeto_id ON ideias(projeto_id);

CREATE TRIGGER update_ideias_updated_at BEFORE UPDATE ON ideias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. BRAINSTORM
-- =====================================================

CREATE TABLE brainstorm_ideias (
    id VARCHAR(36) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    autor VARCHAR(255) NOT NULL,
    categoria VARCHAR(100),
    prioridade prioridade_brainstorm DEFAULT 'Média',
    status status_brainstorm DEFAULT 'Nova',
    data_criacao DATE NOT NULL,
    votos INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_brainstorm_ideias_status ON brainstorm_ideias(status);
CREATE INDEX idx_brainstorm_ideias_prioridade ON brainstorm_ideias(prioridade);

CREATE TRIGGER update_brainstorm_ideias_updated_at BEFORE UPDATE ON brainstorm_ideias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE brainstorm_participantes (
    id VARCHAR(36) PRIMARY KEY,
    ideia_id VARCHAR(36) NOT NULL,
    participante VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ideia_id) REFERENCES brainstorm_ideias(id) ON DELETE CASCADE
);

CREATE INDEX idx_brainstorm_participantes_ideia_id ON brainstorm_participantes(ideia_id);

-- =====================================================
-- 10. FINANÇAS EMPRESARIAIS
-- =====================================================

CREATE TABLE transacoes_empresa (
    id VARCHAR(36) PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    data DATE NOT NULL,
    tipo tipo_transacao NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transacoes_empresa_tipo ON transacoes_empresa(tipo);
CREATE INDEX idx_transacoes_empresa_data ON transacoes_empresa(data);
CREATE INDEX idx_transacoes_empresa_categoria ON transacoes_empresa(categoria);
CREATE INDEX idx_transacoes_empresa_tipo_data ON transacoes_empresa(tipo, data);

CREATE TRIGGER update_transacoes_empresa_updated_at BEFORE UPDATE ON transacoes_empresa
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE metas_financeiras_empresa (
    id VARCHAR(36) PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor_meta DECIMAL(15, 2) NOT NULL,
    valor_atual DECIMAL(15, 2) DEFAULT 0.00,
    data_limite DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_metas_financeiras_empresa_updated_at BEFORE UPDATE ON metas_financeiras_empresa
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE reserva_emergencia_empresa (
    id VARCHAR(36) PRIMARY KEY DEFAULT 'reserva-empresa-1',
    valor_atual DECIMAL(15, 2) DEFAULT 0.00,
    meta DECIMAL(15, 2) NOT NULL,
    descricao VARCHAR(255) DEFAULT 'Reserva de Emergência',
    data_criacao DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_reserva_emergencia_empresa_updated_at BEFORE UPDATE ON reserva_emergencia_empresa
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_aplicacoes_empresa_data_aplicacao ON aplicacoes_empresa(data_aplicacao);

CREATE TRIGGER update_aplicacoes_empresa_updated_at BEFORE UPDATE ON aplicacoes_empresa
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 11. FINANÇAS PESSOAIS
-- =====================================================

CREATE TABLE transacoes_pessoais (
    id VARCHAR(36) PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    data DATE NOT NULL,
    tipo tipo_transacao NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transacoes_pessoais_tipo ON transacoes_pessoais(tipo);
CREATE INDEX idx_transacoes_pessoais_data ON transacoes_pessoais(data);
CREATE INDEX idx_transacoes_pessoais_categoria ON transacoes_pessoais(categoria);
CREATE INDEX idx_transacoes_pessoais_tipo_data ON transacoes_pessoais(tipo, data);

CREATE TRIGGER update_transacoes_pessoais_updated_at BEFORE UPDATE ON transacoes_pessoais
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE metas_financeiras_pessoais (
    id VARCHAR(36) PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor_meta DECIMAL(15, 2) NOT NULL,
    valor_atual DECIMAL(15, 2) DEFAULT 0.00,
    data_limite DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_metas_financeiras_pessoais_updated_at BEFORE UPDATE ON metas_financeiras_pessoais
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE gastos_recorrentes (
    id VARCHAR(36) PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,
    proxima_data DATE NOT NULL,
    recorrencia tipo_recorrencia DEFAULT 'mensal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gastos_recorrentes_proxima_data ON gastos_recorrentes(proxima_data);

CREATE TRIGGER update_gastos_recorrentes_updated_at BEFORE UPDATE ON gastos_recorrentes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE reserva_emergencia_pessoal (
    id VARCHAR(36) PRIMARY KEY DEFAULT 'reserva-pessoal-1',
    valor_atual DECIMAL(15, 2) DEFAULT 0.00,
    meta DECIMAL(15, 2) NOT NULL,
    descricao VARCHAR(255) DEFAULT 'Reserva de Emergência Pessoal',
    data_criacao DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_reserva_emergencia_pessoal_updated_at BEFORE UPDATE ON reserva_emergencia_pessoal
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_aplicacoes_pessoais_data_aplicacao ON aplicacoes_pessoais(data_aplicacao);

CREATE TRIGGER update_aplicacoes_pessoais_updated_at BEFORE UPDATE ON aplicacoes_pessoais
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE lista_compras (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    quantidade INT DEFAULT 1,
    valor_estimado DECIMAL(10, 2) NOT NULL,
    categoria categoria_compra DEFAULT 'Diversas',
    status status_compra DEFAULT 'Pendente',
    recorrencia_mensal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lista_compras_status ON lista_compras(status);
CREATE INDEX idx_lista_compras_categoria ON lista_compras(categoria);

CREATE TRIGGER update_lista_compras_updated_at BEFORE UPDATE ON lista_compras
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 12. TRADING
-- =====================================================

CREATE TABLE operacoes_trading (
    id VARCHAR(36) PRIMARY KEY,
    ativo VARCHAR(50) NOT NULL,
    tipo tipo_operacao NOT NULL,
    resultado resultado_operacao NOT NULL,
    valor_entrada DECIMAL(15, 2) NOT NULL,
    lucro_prejuizo DECIMAL(15, 2) NOT NULL,
    url_print VARCHAR(500),
    observacoes TEXT,
    data_hora TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_operacoes_trading_data_hora ON operacoes_trading(data_hora);
CREATE INDEX idx_operacoes_trading_resultado ON operacoes_trading(resultado);
CREATE INDEX idx_operacoes_trading_tipo ON operacoes_trading(tipo);
CREATE INDEX idx_operacoes_trading_data_resultado ON operacoes_trading(data_hora, resultado);

CREATE TRIGGER update_operacoes_trading_updated_at BEFORE UPDATE ON operacoes_trading
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
    motivo_bloqueio motivo_bloqueio,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_configuracao_trading_updated_at BEFORE UPDATE ON configuracao_trading
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE sessoes_alavancagem (
    id VARCHAR(36) PRIMARY KEY,
    capital_inicial DECIMAL(15, 2) NOT NULL,
    numero_niveis INT NOT NULL CHECK (numero_niveis >= 1 AND numero_niveis <= 5),
    meta_por_nivel DECIMAL(15, 2) NOT NULL,
    stop_total DECIMAL(15, 2) NOT NULL,
    stop_protegido DECIMAL(15, 2),
    valor_entradas DECIMAL(15, 2) NOT NULL,
    tipo_entrada tipo_entrada_alavancagem DEFAULT 'percentual',
    status status_sessao_alavancagem DEFAULT 'ativa',
    nivel_atual INT DEFAULT 1,
    progresso_por_nivel JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessoes_alavancagem_status ON sessoes_alavancagem(status);

CREATE TRIGGER update_sessoes_alavancagem_updated_at BEFORE UPDATE ON sessoes_alavancagem
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 13. GESTÃO PESSOAL - ESTUDOS
-- =====================================================

CREATE TABLE materias (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    cor VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_materias_updated_at BEFORE UPDATE ON materias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE nichos (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    cor VARCHAR(7) DEFAULT '#8B5CF6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_nichos_updated_at BEFORE UPDATE ON nichos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE aulas (
    id VARCHAR(36) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    materia_id VARCHAR(36),
    nicho_id VARCHAR(36),
    url_video VARCHAR(500),
    duracao INT NOT NULL, -- em minutos
    status status_aula DEFAULT 'Não iniciada',
    data_inicio DATE,
    data_conclusao DATE,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_aulas_status ON aulas(status);
CREATE INDEX idx_aulas_materia_id ON aulas(materia_id);
CREATE INDEX idx_aulas_nicho_id ON aulas(nicho_id);

CREATE TRIGGER update_aulas_updated_at BEFORE UPDATE ON aulas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE aulas ADD CONSTRAINT fk_aulas_materia_id 
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE SET NULL;
ALTER TABLE aulas ADD CONSTRAINT fk_aulas_nicho_id 
    FOREIGN KEY (nicho_id) REFERENCES nichos(id) ON DELETE SET NULL;

CREATE TABLE revisoes (
    id VARCHAR(36) PRIMARY KEY,
    aula_id VARCHAR(36) NOT NULL,
    data_revisao DATE NOT NULL,
    notas TEXT,
    status status_revisao DEFAULT 'Agendada',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_revisoes_aula_id ON revisoes(aula_id);
CREATE INDEX idx_revisoes_status ON revisoes(status);

CREATE TRIGGER update_revisoes_updated_at BEFORE UPDATE ON revisoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE revisoes ADD CONSTRAINT fk_revisoes_aula_id 
    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE;

-- =====================================================
-- 14. GESTÃO PESSOAL - LIVROS
-- =====================================================

CREATE TABLE livros (
    id VARCHAR(36) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(255) NOT NULL,
    genero VARCHAR(100),
    status status_livro DEFAULT 'Quero Ler',
    data_inicio DATE,
    data_fim DATE,
    nota INT CHECK (nota >= 0 AND nota <= 10),
    resenha TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_livros_status ON livros(status);
CREATE INDEX idx_livros_genero ON livros(genero);

CREATE TRIGGER update_livros_updated_at BEFORE UPDATE ON livros
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 15. GESTÃO PESSOAL - HÁBITOS E VÍCIOS
-- =====================================================

CREATE TABLE habitos_vicios (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo tipo_habito NOT NULL,
    data_inicio_controle DATE NOT NULL,
    status status_habito DEFAULT 'Ativo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_habitos_vicios_status ON habitos_vicios(status);
CREATE INDEX idx_habitos_vicios_tipo ON habitos_vicios(tipo);

CREATE TRIGGER update_habitos_vicios_updated_at BEFORE UPDATE ON habitos_vicios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE estrategias_superacao (
    id VARCHAR(36) PRIMARY KEY,
    habito_id VARCHAR(36) NOT NULL,
    estrategia TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (habito_id) REFERENCES habitos_vicios(id) ON DELETE CASCADE
);

CREATE INDEX idx_estrategias_superacao_habito_id ON estrategias_superacao(habito_id);

-- =====================================================
-- 16. GESTÃO PESSOAL - ALIMENTAÇÃO
-- =====================================================

CREATE TABLE registros_alimentacao (
    id VARCHAR(36) PRIMARY KEY,
    data DATE NOT NULL,
    refeicao VARCHAR(100) NOT NULL,
    alimentos TEXT NOT NULL,
    calorias INT,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_registros_alimentacao_data ON registros_alimentacao(data);
CREATE INDEX idx_registros_alimentacao_refeicao ON registros_alimentacao(refeicao);

CREATE TRIGGER update_registros_alimentacao_updated_at BEFORE UPDATE ON registros_alimentacao
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 17. GESTÃO PESSOAL - TREINOS
-- =====================================================

CREATE TABLE treinos (
    id VARCHAR(36) PRIMARY KEY,
    data DATE NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    exercicios TEXT NOT NULL,
    duracao INT NOT NULL, -- em minutos
    intensidade intensidade_treino DEFAULT 'Moderada',
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_treinos_data ON treinos(data);
CREATE INDEX idx_treinos_intensidade ON treinos(intensidade);

CREATE TRIGGER update_treinos_updated_at BEFORE UPDATE ON treinos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 18. GESTÃO PESSOAL - SONO
-- =====================================================

CREATE TABLE registros_sono (
    id VARCHAR(36) PRIMARY KEY,
    data DATE NOT NULL,
    hora_dormir TIME NOT NULL,
    hora_acordar TIME NOT NULL,
    qualidade qualidade_sono DEFAULT 'Boa',
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_registros_sono_data ON registros_sono(data);
CREATE INDEX idx_registros_sono_qualidade ON registros_sono(qualidade);

CREATE TRIGGER update_registros_sono_updated_at BEFORE UPDATE ON registros_sono
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 19. GESTÃO PESSOAL - AUTODESENVOLVIMENTO
-- =====================================================

CREATE TABLE atividades_desenvolvimento (
    id VARCHAR(36) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    data DATE NOT NULL,
    status status_desenvolvimento DEFAULT 'Planejada',
    progresso INT DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_atividades_desenvolvimento_status ON atividades_desenvolvimento(status);
CREATE INDEX idx_atividades_desenvolvimento_categoria ON atividades_desenvolvimento(categoria);
CREATE INDEX idx_atividades_desenvolvimento_data ON atividades_desenvolvimento(data);

CREATE TRIGGER update_atividades_desenvolvimento_updated_at BEFORE UPDATE ON atividades_desenvolvimento
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 20. GESTÃO PESSOAL - METAS ANUAIS
-- =====================================================

CREATE TABLE metas_anuais (
    id VARCHAR(36) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    progresso INT DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
    status status_meta_anual DEFAULT 'Planejamento',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_metas_anuais_status ON metas_anuais(status);
CREATE INDEX idx_metas_anuais_categoria ON metas_anuais(categoria);

CREATE TRIGGER update_metas_anuais_updated_at BEFORE UPDATE ON metas_anuais
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 21. GESTÃO PESSOAL - LEI DA ATRAÇÃO
-- =====================================================

CREATE TABLE afirmacoes (
    id VARCHAR(36) PRIMARY KEY,
    texto TEXT NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    data_criacao DATE NOT NULL,
    frequencia INT DEFAULT 1,
    status status_afirmacao DEFAULT 'Ativa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_afirmacoes_status ON afirmacoes(status);
CREATE INDEX idx_afirmacoes_categoria ON afirmacoes(categoria);

CREATE TRIGGER update_afirmacoes_updated_at BEFORE UPDATE ON afirmacoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE bilhetes_positivos (
    id VARCHAR(36) PRIMARY KEY,
    texto TEXT NOT NULL,
    cor VARCHAR(7) DEFAULT '#FFD700',
    tamanho tamanho_bilhete DEFAULT 'Médio',
    categoria categoria_bilhete DEFAULT 'Motivacional',
    fonte VARCHAR(100),
    emoji VARCHAR(10),
    formato formato_bilhete DEFAULT 'Quadrado',
    posicao_x INT DEFAULT 0,
    posicao_y INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_bilhetes_positivos_updated_at BEFORE UPDATE ON bilhetes_positivos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 22. GESTÃO PESSOAL - ASTROLOGIA
-- =====================================================

CREATE TABLE registros_astrologia (
    id VARCHAR(36) PRIMARY KEY,
    data DATE NOT NULL,
    tipo tipo_astrologia NOT NULL,
    signo VARCHAR(50) NOT NULL,
    descricao TEXT NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_registros_astrologia_data ON registros_astrologia(data);
CREATE INDEX idx_registros_astrologia_tipo ON registros_astrologia(tipo);
CREATE INDEX idx_registros_astrologia_signo ON registros_astrologia(signo);

CREATE TRIGGER update_registros_astrologia_updated_at BEFORE UPDATE ON registros_astrologia
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 23. USUÁRIOS E LICENÇAS (APLICAÇÕES)
-- =====================================================

CREATE TABLE usuarios_aplicacoes (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    status status_usuario_app DEFAULT 'Ativo',
    plano VARCHAR(100) NOT NULL,
    aplicativo_vinculado VARCHAR(255) NOT NULL,
    data_registro DATE NOT NULL,
    ultimo_acesso DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_aplicacoes_status ON usuarios_aplicacoes(status);
CREATE INDEX idx_usuarios_aplicacoes_plano ON usuarios_aplicacoes(plano);
CREATE INDEX idx_usuarios_aplicacoes_aplicativo ON usuarios_aplicacoes(aplicativo_vinculado);

CREATE TRIGGER update_usuarios_aplicacoes_updated_at BEFORE UPDATE ON usuarios_aplicacoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 24. SUPORTE
-- =====================================================

CREATE TABLE tickets_suporte (
    id VARCHAR(36) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    prioridade prioridade_ticket DEFAULT 'Média',
    status status_ticket DEFAULT 'Aberto',
    solicitante VARCHAR(255) NOT NULL,
    responsavel VARCHAR(255),
    data_abertura DATE NOT NULL,
    data_resolucao DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tickets_suporte_status ON tickets_suporte(status);
CREATE INDEX idx_tickets_suporte_prioridade ON tickets_suporte(prioridade);
CREATE INDEX idx_tickets_suporte_categoria ON tickets_suporte(categoria);

CREATE TRIGGER update_tickets_suporte_updated_at BEFORE UPDATE ON tickets_suporte
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 25. DEPLOYS
-- =====================================================

CREATE TABLE deploys (
    id VARCHAR(36) PRIMARY KEY,
    versao VARCHAR(50) NOT NULL,
    ambiente VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    responsavel VARCHAR(255) NOT NULL,
    data DATE NOT NULL,
    status status_deploy DEFAULT 'Em Andamento',
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_deploys_status ON deploys(status);
CREATE INDEX idx_deploys_ambiente ON deploys(ambiente);
CREATE INDEX idx_deploys_data ON deploys(data);

CREATE TRIGGER update_deploys_updated_at BEFORE UPDATE ON deploys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 26. TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA DE DADOS
-- =====================================================

-- Trigger para atualizar lead_quente baseado em tem_site
CREATE OR REPLACE FUNCTION atualizar_lead_quente()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tem_site = FALSE THEN
        NEW.lead_quente = TRUE;
    ELSE
        NEW.lead_quente = FALSE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_lead_quente
BEFORE UPDATE ON leads
FOR EACH ROW
WHEN (OLD.tem_site IS DISTINCT FROM NEW.tem_site)
EXECUTE FUNCTION atualizar_lead_quente();

-- =====================================================
-- 27. VIEWS ÚTEIS PARA RELATÓRIOS
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
    TO_CHAR(data, 'YYYY-MM') AS mes,
    tipo,
    SUM(valor) AS total,
    COUNT(*) AS quantidade
FROM transacoes_empresa
GROUP BY TO_CHAR(data, 'YYYY-MM'), tipo
ORDER BY mes DESC;

CREATE VIEW vw_financeiro_pessoal_mensal AS
SELECT 
    TO_CHAR(data, 'YYYY-MM') AS mes,
    tipo,
    SUM(valor) AS total,
    COUNT(*) AS quantidade
FROM transacoes_pessoais
GROUP BY TO_CHAR(data, 'YYYY-MM'), tipo
ORDER BY mes DESC;

CREATE VIEW vw_trading_estatisticas AS
SELECT 
    DATE(data_hora) AS data,
    COUNT(*) AS total_operacoes,
    SUM(CASE WHEN resultado = 'Gain' THEN 1 ELSE 0 END) AS ganhos,
    SUM(CASE WHEN resultado = 'Loss' THEN 1 ELSE 0 END) AS perdas,
    SUM(lucro_prejuizo) AS lucro_total,
    ROUND((SUM(CASE WHEN resultado = 'Gain' THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100, 2) AS win_rate
FROM operacoes_trading
GROUP BY DATE(data_hora)
ORDER BY data DESC;

-- =====================================================
-- 28. STORED PROCEDURES ÚTEIS
-- =====================================================

CREATE OR REPLACE FUNCTION sp_calcular_fluxo_caixa_empresa()
RETURNS DECIMAL(15, 2) AS $$
DECLARE
    total_entradas DECIMAL(15, 2);
    total_saidas DECIMAL(15, 2);
    fluxo_caixa DECIMAL(15, 2);
BEGIN
    SELECT COALESCE(SUM(valor), 0) INTO total_entradas
    FROM transacoes_empresa
    WHERE tipo = 'entrada';
    
    SELECT COALESCE(SUM(valor), 0) INTO total_saidas
    FROM transacoes_empresa
    WHERE tipo = 'saida';
    
    fluxo_caixa := total_entradas - total_saidas;
    
    RETURN fluxo_caixa;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_calcular_saldo_pessoal()
RETURNS DECIMAL(15, 2) AS $$
DECLARE
    total_entradas DECIMAL(15, 2);
    total_saidas DECIMAL(15, 2);
    saldo DECIMAL(15, 2);
BEGIN
    SELECT COALESCE(SUM(valor), 0) INTO total_entradas
    FROM transacoes_pessoais
    WHERE tipo = 'entrada';
    
    SELECT COALESCE(SUM(valor), 0) INTO total_saidas
    FROM transacoes_pessoais
    WHERE tipo = 'saida';
    
    saldo := total_entradas - total_saidas;
    
    RETURN saldo;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_obter_tarefas_do_dia(data_consulta DATE)
RETURNS TABLE (
    id VARCHAR(36),
    titulo VARCHAR(255),
    descricao TEXT,
    prioridade prioridade_tarefa,
    categoria categoria_tarefa,
    data DATE,
    status status_tarefa,
    tarefa_rapida BOOLEAN,
    projeto_id VARCHAR(36),
    recorrente BOOLEAN,
    target VARCHAR(255),
    concluida BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.titulo,
        t.descricao,
        t.prioridade,
        t.categoria,
        t.data,
        t.status,
        t.tarefa_rapida,
        t.projeto_id,
        t.recorrente,
        t.target,
        t.concluida,
        t.created_at,
        t.updated_at
    FROM tarefas t
    WHERE t.data = data_consulta
    ORDER BY 
        CASE t.prioridade
            WHEN 'Urgente' THEN 1
            WHEN 'Alta' THEN 2
            WHEN 'Média' THEN 3
            WHEN 'Baixa' THEN 4
        END;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 29. DADOS INICIAIS (SEED DATA)
-- =====================================================

-- Inserir usuário padrão (senha deve ser hash em produção)
INSERT INTO usuarios (id, nome, email, senha_hash, remember_me, is_authenticated) 
VALUES ('user-default-1', 'Usuário Padrão', 'admin@crm.com', 'hash_aqui', FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Inserir preferências padrão
INSERT INTO preferencias_usuario (usuario_id, mostrar_valores) 
VALUES ('user-default-1', TRUE)
ON CONFLICT (usuario_id) DO NOTHING;

-- Inserir reservas de emergência padrão
INSERT INTO reserva_emergencia_empresa (id, valor_atual, meta, descricao, data_criacao)
VALUES ('reserva-empresa-1', 0.00, 50000.00, 'Reserva de Emergência', CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO reserva_emergencia_pessoal (id, valor_atual, meta, descricao, data_criacao)
VALUES ('reserva-pessoal-1', 0.00, 20000.00, 'Reserva de Emergência Pessoal', CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- COMENTÁRIOS FINAIS
-- =====================================================

-- Este schema foi criado para suportar todas as funcionalidades do sistema CRM
-- Versão PostgreSQL - Compatível com PostgreSQL 12+
-- Todas as tabelas usam VARCHAR(36) para IDs (UUIDs)
-- Datas são armazenadas como DATE ou TIMESTAMP conforme necessário
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
-- 7. Para PostgreSQL, use pgcrypto para hash de senhas: CREATE EXTENSION IF NOT EXISTS pgcrypto;

