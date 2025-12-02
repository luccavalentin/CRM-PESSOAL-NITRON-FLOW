# 📊 DOCUMENTAÇÃO COMPLETA DO BANCO DE DADOS - CRM LUCCA

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Estrutura de Tabelas](#estrutura-de-tabelas)
3. [Relacionamentos](#relacionamentos)
4. [Índices e Performance](#índices-e-performance)
5. [Views e Stored Procedures](#views-e-stored-procedures)
6. [Triggers](#triggers)
7. [Considerações de Implementação](#considerações-de-implementação)

---

## 🎯 VISÃO GERAL

Este banco de dados foi projetado para suportar um sistema completo de CRM (Customer Relationship Management) com gestão empresarial e pessoal integrada.

### Características Principais:
- **Total de Tabelas**: 40+ tabelas
- **Suporte a**: Leads, Clientes, Tarefas, Projetos, Finanças, Trading, Gestão Pessoal
- **Tipo de IDs**: UUID (VARCHAR(36))
- **Precisão Monetária**: DECIMAL(15, 2)
- **Timezone**: UTC (recomendado)

---

## 📊 ESTRUTURA DE TABELAS

### 1. AUTENTICAÇÃO E USUÁRIOS

#### `usuarios`
Armazena informações de autenticação dos usuários do sistema.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único do usuário |
| nome | VARCHAR(255) | Nome completo |
| email | VARCHAR(255) | Email (único) |
| senha_hash | VARCHAR(255) | Hash da senha (bcrypt/argon2) |
| remember_me | BOOLEAN | Se deve manter sessão |
| is_authenticated | BOOLEAN | Status de autenticação |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Última atualização |

#### `preferencias_usuario`
Preferências do usuário (ex: mostrar/ocultar valores).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| usuario_id | VARCHAR(36) | FK para usuarios |
| mostrar_valores | BOOLEAN | Toggle para exibir valores monetários |

---

### 2. LEADS E CLIENTES

#### `leads`
Gestão de leads e oportunidades de negócio.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| nome | VARCHAR(255) | Nome do lead |
| email | VARCHAR(255) | Email (opcional) |
| telefone | VARCHAR(20) | Telefone (opcional) |
| estado | VARCHAR(2) | Sigla do estado (ex: SP) |
| cidade | VARCHAR(100) | Nome da cidade |
| bairro | VARCHAR(100) | Bairro |
| observacoes | TEXT | Observações gerais |
| status | ENUM | Novo, Contatado, Qualificado, Convertido, Perdido |
| data_criacao | DATE | Data de criação do lead |
| origem | VARCHAR(100) | Origem do lead (Site, Facebook, etc.) |
| contactado | BOOLEAN | Se foi contactado |
| data_contato | DATE | Data do primeiro contato |
| **tem_site** | BOOLEAN | **Se a empresa tem site** |
| **lead_quente** | BOOLEAN | **Se é lead quente (sem site)** |

**Regra de Negócio**: Se `tem_site = FALSE`, então `lead_quente = TRUE` (trigger automático)

#### `clientes`
Clientes convertidos de leads ou cadastrados diretamente.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| nome | VARCHAR(255) | Nome do cliente |
| email | VARCHAR(255) | Email |
| telefone | VARCHAR(20) | Telefone |
| empresa | VARCHAR(255) | Nome da empresa |
| endereco | TEXT | Endereço completo |
| cidade | VARCHAR(100) | Cidade |
| estado | VARCHAR(2) | Estado |
| status | ENUM | Ativo, Inativo, Prospecto |
| valor_total | DECIMAL(15,2) | Valor total faturado |
| ultima_interacao | DATE | Data da última interação |
| observacoes | TEXT | Observações |
| lead_id | VARCHAR(36) | FK para leads (se convertido) |
| data_cadastro | DATE | Data de cadastro |

---

### 3. TAREFAS (UNIFICADAS)

#### `tarefas`
Tarefas pessoais e empresariais unificadas.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| titulo | VARCHAR(255) | Título da tarefa |
| descricao | TEXT | Descrição detalhada |
| prioridade | ENUM | Baixa, Média, Alta, Urgente |
| categoria | ENUM | Pessoal, Empresarial, Projeto, Outro |
| data | DATE | Data da tarefa |
| status | ENUM | Pendente, Em Andamento, Em Revisão, Concluída |
| tarefa_rapida | BOOLEAN | Se é tarefa rápida (2min) |
| projeto_id | VARCHAR(36) | FK para projetos (opcional) |
| recorrente | BOOLEAN | Se é recorrente |
| target | VARCHAR(255) | Meta/objetivo relacionado |
| concluida | BOOLEAN | Status de conclusão |

#### `tarefa_etiquetas`
Etiquetas/tags das tarefas (relação N:N).

---

### 4. PROJETOS

#### `projetos`
Projetos empresariais.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| nome | VARCHAR(255) | Nome do projeto |
| descricao | TEXT | Descrição |
| status | ENUM | Pendente, Andamento, Revisão, Entregue, Arquivado |
| cliente | VARCHAR(255) | Nome do cliente |
| valor | DECIMAL(15,2) | Valor do projeto |
| etapas_concluidas | INT | Etapas concluídas |
| total_etapas | INT | Total de etapas |
| data_inicio | DATE | Data de início |
| prazo | DATE | Prazo de entrega |
| quantidade_anexos | INT | Número de anexos |
| ideia_id | VARCHAR(36) | FK para ideias (opcional) |

#### `projetos_pessoais`
Projetos pessoais.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| nome | VARCHAR(255) | Nome do projeto |
| descricao | TEXT | Descrição |
| status | ENUM | Planejamento, Em Andamento, Pausado, Concluído, Cancelado |
| data_inicio | DATE | Data de início |
| prazo | DATE | Prazo |
| progresso | INT | Progresso (0-100) |

#### `projeto_pessoal_tarefas`
Relação entre projetos pessoais e tarefas.

---

### 5. IDEIAS

#### `ideias`
Ideias de negócio, automação, projetos, etc.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| texto | TEXT | Descrição da ideia |
| categoria | ENUM | Negócio, Automação, Projeto, Conteúdo, Outro |
| status | ENUM | Explorando, Em Análise, Em Teste, Executando, Arquivada |
| potencial_financeiro | INT | Potencial de 1-10 |
| data_criacao | DATE | Data de criação |
| tarefa_id | VARCHAR(36) | FK para tarefas (opcional) |
| projeto_id | VARCHAR(36) | FK para projetos (opcional) |

#### `brainstorm_ideias`
Ideias de brainstorming em equipe.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| titulo | VARCHAR(255) | Título |
| descricao | TEXT | Descrição |
| autor | VARCHAR(255) | Autor da ideia |
| categoria | VARCHAR(100) | Categoria |
| prioridade | ENUM | Baixa, Média, Alta |
| status | ENUM | Nova, Em Análise, Aprovada, Rejeitada, Implementada |
| data_criacao | DATE | Data de criação |
| votos | INT | Número de votos |

#### `brainstorm_participantes`
Participantes de cada ideia de brainstorm.

---

### 6. FINANÇAS EMPRESARIAIS

#### `transacoes_empresa`
Transações financeiras da empresa (entradas e saídas).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| descricao | VARCHAR(255) | Descrição da transação |
| valor | DECIMAL(15,2) | Valor |
| categoria | VARCHAR(100) | Categoria (cliente para entrada, tipo para saída) |
| data | DATE | Data da transação |
| tipo | ENUM | entrada, saida |

#### `metas_financeiras_empresa`
Metas financeiras da empresa.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| descricao | VARCHAR(255) | Descrição da meta |
| valor_meta | DECIMAL(15,2) | Valor objetivo |
| valor_atual | DECIMAL(15,2) | Valor atual |
| data_limite | DATE | Data limite (opcional) |

#### `reserva_emergencia_empresa`
Reserva de emergência da empresa.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | ID fixo: 'reserva-empresa-1' |
| valor_atual | DECIMAL(15,2) | Valor atual |
| meta | DECIMAL(15,2) | Meta desejada |
| descricao | VARCHAR(255) | Descrição |
| data_criacao | DATE | Data de criação |

#### `aplicacoes_empresa`
Investimentos/aplicações da empresa.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| nome | VARCHAR(255) | Nome do investimento |
| tipo | VARCHAR(100) | Tipo (Ações, FIIs, etc.) |
| valor_investido | DECIMAL(15,2) | Valor investido |
| valor_atual | DECIMAL(15,2) | Valor atual |
| rentabilidade | DECIMAL(10,2) | Rentabilidade em % |
| data_aplicacao | DATE | Data da aplicação |
| observacoes | TEXT | Observações |

---

### 7. FINANÇAS PESSOAIS

#### `transacoes_pessoais`
Transações financeiras pessoais.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| descricao | VARCHAR(255) | Descrição |
| valor | DECIMAL(15,2) | Valor |
| categoria | VARCHAR(100) | Categoria |
| data | DATE | Data |
| tipo | ENUM | entrada, saida |

#### `metas_financeiras_pessoais`
Metas financeiras pessoais.

#### `gastos_recorrentes`
Gastos recorrentes mensais/anuais.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| descricao | VARCHAR(255) | Descrição |
| valor | DECIMAL(15,2) | Valor |
| proxima_data | DATE | Próxima data de vencimento |
| recorrencia | ENUM | mensal, anual |

#### `reserva_emergencia_pessoal`
Reserva de emergência pessoal.

#### `aplicacoes_pessoais`
Investimentos pessoais.

#### `lista_compras`
Lista de compras pessoais.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| nome | VARCHAR(255) | Nome do item |
| quantidade | INT | Quantidade |
| valor_estimado | DECIMAL(10,2) | Valor estimado |
| categoria | ENUM | Mercado, Diversas |
| status | ENUM | Pendente, Comprado |
| recorrencia_mensal | BOOLEAN | Se é recorrente mensalmente |

---

### 8. TRADING

#### `operacoes_trading`
Operações de trading realizadas.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| ativo | VARCHAR(50) | Ativo negociado |
| tipo | ENUM | CALL, PUT |
| resultado | ENUM | Gain, Loss |
| valor_entrada | DECIMAL(15,2) | Valor de entrada |
| lucro_prejuizo | DECIMAL(15,2) | Lucro ou prejuízo |
| url_print | VARCHAR(500) | URL do print (opcional) |
| observacoes | TEXT | Observações |
| data_hora | DATETIME | Data e hora da operação |

#### `configuracao_trading`
Configurações de trading (stop gain/loss, limites, etc.).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | ID fixo: 'config-trading-1' |
| capital_total | DECIMAL(15,2) | Capital total |
| meta_diaria_percentual | DECIMAL(5,2) | Meta diária em % |
| stop_gain_reais | DECIMAL(15,2) | Stop gain em reais |
| stop_gain_percentual | DECIMAL(5,2) | Stop gain em % |
| stop_loss_reais | DECIMAL(15,2) | Stop loss em reais |
| stop_loss_percentual | DECIMAL(5,2) | Stop loss em % |
| valor_maximo_entrada | DECIMAL(15,2) | Valor máximo por entrada |
| limite_operacoes_dia | INT | Limite de operações por dia |
| data_inicio | DATE | Data de início |
| dia_atual | DATE | Dia atual |
| bloqueado | BOOLEAN | Se está bloqueado |
| motivo_bloqueio | ENUM | stop_gain, stop_loss, limite_operacoes |

#### `sessoes_alavancagem`
Sessões de trading com alavancagem.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| capital_inicial | DECIMAL(15,2) | Capital inicial |
| numero_niveis | INT | Número de níveis (1-5) |
| meta_por_nivel | DECIMAL(15,2) | Meta por nível |
| stop_total | DECIMAL(15,2) | Stop total |
| stop_protegido | DECIMAL(15,2) | Stop protegido (opcional) |
| valor_entradas | DECIMAL(15,2) | Valor das entradas |
| tipo_entrada | ENUM | percentual, fixo |
| status | ENUM | ativa, concluida |
| nivel_atual | INT | Nível atual |
| progresso_por_nivel | JSON | Array de progresso por nível |

---

### 9. GESTÃO PESSOAL - ESTUDOS

#### `materias`
Matérias de estudo.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| nome | VARCHAR(255) | Nome da matéria |
| descricao | TEXT | Descrição |
| cor | VARCHAR(7) | Cor em hex (#RRGGBB) |

#### `nichos`
Nichos de estudo.

#### `aulas`
Aulas/lições estudadas.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| titulo | VARCHAR(255) | Título da aula |
| materia_id | VARCHAR(36) | FK para materias |
| nicho_id | VARCHAR(36) | FK para nichos |
| url_video | VARCHAR(500) | URL do vídeo |
| duracao | INT | Duração em minutos |
| status | ENUM | Não iniciada, Em andamento, Concluída |
| data_inicio | DATE | Data de início |
| data_conclusao | DATE | Data de conclusão |
| notas | TEXT | Notas sobre a aula |

#### `revisoes`
Revisões agendadas das aulas.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| aula_id | VARCHAR(36) | FK para aulas |
| data_revisao | DATE | Data da revisão |
| notas | TEXT | Notas da revisão |
| status | ENUM | Agendada, Realizada |

---

### 10. GESTÃO PESSOAL - LIVROS

#### `livros`
Biblioteca pessoal de livros.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| titulo | VARCHAR(255) | Título |
| autor | VARCHAR(255) | Autor |
| genero | VARCHAR(100) | Gênero |
| status | ENUM | Quero Ler, Lendo, Lido, Abandonado |
| data_inicio | DATE | Data de início da leitura |
| data_fim | DATE | Data de término |
| nota | INT | Nota de 0-10 |
| resenha | TEXT | Resenha do livro |

---

### 11. GESTÃO PESSOAL - HÁBITOS E VÍCIOS

#### `habitos_vicios`
Hábitos e vícios a serem controlados.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| nome | VARCHAR(255) | Nome do hábito/vício |
| descricao | TEXT | Descrição |
| tipo | ENUM | Vício, Hábito, Mania |
| data_inicio_controle | DATE | Data de início do controle |
| status | ENUM | Ativo, Superado |

#### `estrategias_superacao`
Estratégias para superar cada hábito/vício.

---

### 12. GESTÃO PESSOAL - ALIMENTAÇÃO

#### `registros_alimentacao`
Registros de refeições.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| data | DATE | Data da refeição |
| refeicao | VARCHAR(100) | Tipo de refeição |
| alimentos | TEXT | Alimentos consumidos |
| calorias | INT | Calorias (opcional) |
| observacoes | TEXT | Observações |

---

### 13. GESTÃO PESSOAL - TREINOS

#### `treinos`
Registros de treinos/exercícios.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| data | DATE | Data do treino |
| tipo | VARCHAR(100) | Tipo de treino |
| exercicios | TEXT | Exercícios realizados |
| duracao | INT | Duração em minutos |
| intensidade | ENUM | Leve, Moderada, Intensa |
| observacoes | TEXT | Observações |

---

### 14. GESTÃO PESSOAL - SONO

#### `registros_sono`
Registros de sono.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| data | DATE | Data |
| hora_dormir | TIME | Hora de dormir |
| hora_acordar | TIME | Hora de acordar |
| qualidade | ENUM | Excelente, Boa, Regular, Ruim |
| observacoes | TEXT | Observações |

---

### 15. GESTÃO PESSOAL - AUTODESENVOLVIMENTO

#### `atividades_desenvolvimento`
Atividades de autodesenvolvimento.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| titulo | VARCHAR(255) | Título |
| descricao | TEXT | Descrição |
| categoria | VARCHAR(100) | Categoria |
| data | DATE | Data |
| status | ENUM | Planejada, Em Andamento, Concluída |
| progresso | INT | Progresso (0-100) |
| observacoes | TEXT | Observações |

---

### 16. GESTÃO PESSOAL - METAS ANUAIS

#### `metas_anuais`
Metas anuais pessoais.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| titulo | VARCHAR(255) | Título |
| descricao | TEXT | Descrição |
| categoria | VARCHAR(100) | Categoria |
| data_inicio | DATE | Data de início |
| data_fim | DATE | Data de término |
| progresso | INT | Progresso (0-100) |
| status | ENUM | Planejamento, Em Andamento, Concluída, Cancelada |

---

### 17. GESTÃO PESSOAL - LEI DA ATRAÇÃO

#### `afirmacoes`
Afirmações positivas.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| texto | TEXT | Texto da afirmação |
| categoria | VARCHAR(100) | Categoria |
| data_criacao | DATE | Data de criação |
| frequencia | INT | Frequência de uso |
| status | ENUM | Ativa, Arquivada |

#### `bilhetes_positivos`
Bilhetes positivos na tela.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| texto | TEXT | Texto do bilhete |
| cor | VARCHAR(7) | Cor em hex |
| tamanho | ENUM | Pequeno, Médio, Grande |
| categoria | ENUM | Motivacional, Afirmação, Gratidão, Outro |
| fonte | VARCHAR(100) | Fonte |
| emoji | VARCHAR(10) | Emoji |
| formato | ENUM | Quadrado, Retângulo, Círculo |
| posicao_x | INT | Posição X na tela |
| posicao_y | INT | Posição Y na tela |

---

### 18. GESTÃO PESSOAL - ASTROLOGIA

#### `registros_astrologia`
Registros de eventos astrológicos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| data | DATE | Data do evento |
| tipo | ENUM | Lua Nova, Lua Cheia, Eclipse, Retrogradação, Outro |
| signo | VARCHAR(50) | Signo |
| descricao | TEXT | Descrição |
| observacoes | TEXT | Observações pessoais |

---

### 19. USUÁRIOS E LICENÇAS

#### `usuarios_aplicacoes`
Usuários de aplicações vinculadas.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| nome | VARCHAR(255) | Nome |
| email | VARCHAR(255) | Email |
| status | ENUM | Ativo, Inativo |
| plano | VARCHAR(100) | Plano contratado |
| aplicativo_vinculado | VARCHAR(255) | Nome do aplicativo |
| data_registro | DATE | Data de registro |
| ultimo_acesso | DATE | Último acesso |

---

### 20. SUPORTE

#### `tickets_suporte`
Tickets de suporte.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| titulo | VARCHAR(255) | Título do ticket |
| descricao | TEXT | Descrição |
| categoria | VARCHAR(100) | Categoria |
| prioridade | ENUM | Baixa, Média, Alta, Urgente |
| status | ENUM | Aberto, Em Andamento, Resolvido, Fechado |
| solicitante | VARCHAR(255) | Nome do solicitante |
| responsavel | VARCHAR(255) | Responsável (opcional) |
| data_abertura | DATE | Data de abertura |
| data_resolucao | DATE | Data de resolução (opcional) |

---

### 21. DEPLOYS

#### `deploys`
Registros de deploys realizados.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR(36) | UUID único |
| versao | VARCHAR(50) | Versão deployada |
| ambiente | VARCHAR(100) | Ambiente (Produção, Homologação, etc.) |
| descricao | TEXT | Descrição do deploy |
| responsavel | VARCHAR(255) | Responsável pelo deploy |
| data | DATE | Data do deploy |
| status | ENUM | Sucesso, Falha, Em Andamento |
| observacoes | TEXT | Observações |

---

## 🔗 RELACIONAMENTOS

### Relacionamentos Principais:

1. **Leads → Clientes**: Um lead pode ser convertido em um cliente (`clientes.lead_id`)
2. **Tarefas → Projetos**: Tarefas podem estar vinculadas a projetos (`tarefas.projeto_id`)
3. **Tarefas → Ideias**: Tarefas podem ser criadas a partir de ideias (`tarefas.ideia_id`)
4. **Projetos → Ideias**: Projetos podem originar de ideias (`projetos.ideia_id`)
5. **Projetos Pessoais → Tarefas**: Relação N:N via `projeto_pessoal_tarefas`
6. **Aulas → Matérias/Nichos**: Aulas vinculadas a matérias e nichos
7. **Revisões → Aulas**: Revisões vinculadas a aulas específicas
8. **Estratégias → Hábitos**: Estratégias de superação vinculadas a hábitos/vícios

---

## 📈 ÍNDICES E PERFORMANCE

### Índices Criados:

- **Leads**: `status`, `estado`, `cidade`, `lead_quente`, `data_criacao`
- **Clientes**: `status`, `lead_id`
- **Tarefas**: `status`, `prioridade`, `categoria`, `data`, `projeto_id`, `concluida`
- **Transações**: `tipo`, `data`, `categoria`
- **Operações Trading**: `data_hora`, `resultado`, `tipo`
- **Índices Compostos**: Para consultas frequentes (ex: `leads(estado, cidade)`)

---

## 👁️ VIEWS E STORED PROCEDURES

### Views Criadas:

1. **vw_leads_quentes**: Leads marcados como quentes
2. **vw_leads_convertidos**: Leads convertidos em clientes
3. **vw_tarefas_pendentes**: Tarefas pendentes ordenadas por prioridade
4. **vw_financeiro_empresa_mensal**: Resumo financeiro mensal da empresa
5. **vw_financeiro_pessoal_mensal**: Resumo financeiro mensal pessoal
6. **vw_trading_estatisticas**: Estatísticas diárias de trading

### Stored Procedures:

1. **sp_calcular_fluxo_caixa_empresa()**: Calcula fluxo de caixa da empresa
2. **sp_calcular_saldo_pessoal()**: Calcula saldo pessoal
3. **sp_obter_tarefas_do_dia(data_consulta)**: Retorna tarefas de um dia específico

---

## ⚙️ TRIGGERS

### Triggers Implementados:

1. **atualizar_lead_quente**: Atualiza automaticamente `lead_quente` quando `tem_site` muda
2. **calcular_fluxo_caixa_empresa**: Recalcula fluxo de caixa após inserção de transação
3. **calcular_saldo_pessoal**: Recalcula saldo após inserção de transação pessoal

---

## ⚠️ CONSIDERAÇÕES DE IMPLEMENTAÇÃO

### Segurança:

1. **Senhas**: Use bcrypt ou argon2 para hash de senhas
2. **SQL Injection**: Use prepared statements sempre
3. **Validação**: Valide todos os inputs no backend
4. **Permissões**: Implemente controle de acesso baseado em roles

### Performance:

1. **Particionamento**: Considere particionar tabelas grandes (transacoes, operacoes_trading) por data
2. **Cache**: Use Redis para cache de consultas frequentes
3. **Backups**: Configure backups automáticos diários
4. **Índices**: Monitore e ajuste índices conforme uso real

### Escalabilidade:

1. **Soft Delete**: Considere adicionar `deleted_at` para soft delete
2. **Auditoria**: Adicione `created_by` e `updated_by` se necessário
3. **Logs**: Implemente tabela de logs para auditoria
4. **Replicação**: Configure replicação para alta disponibilidade

### Migrações:

1. Use ferramentas de migração (ex: Flyway, Liquibase)
2. Versionamento de schema
3. Rollback seguro

---

## 📝 NOTAS FINAIS

- Todos os IDs são UUIDs (VARCHAR(36))
- Valores monetários usam DECIMAL(15, 2) para precisão
- Datas são armazenadas como DATE ou DATETIME
- ENUMs garantem consistência de dados
- Índices otimizam consultas frequentes
- Triggers garantem integridade de dados
- Views facilitam relatórios e dashboards

---

**Versão do Schema**: 1.0.0  
**Data de Criação**: 2025-01-12  
**Última Atualização**: 2025-01-12




