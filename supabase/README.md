# 📊 Schema do Banco de Dados

## 🚀 Como Executar

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral esquerdo)
4. Clique em **New Query**
5. Abra o arquivo `schema.sql` neste diretório
6. Copie TODO o conteúdo
7. Cole no editor SQL
8. Clique em **Run** (ou Ctrl+Enter)
9. Aguarde a execução completa

## ✅ Verificação

Após executar, verifique se todas as tabelas foram criadas:

1. No painel do Supabase, vá em **Table Editor**
2. Você deve ver todas as tabelas listadas

## 📋 Tabelas Criadas

- ✅ usuarios
- ✅ leads
- ✅ clientes
- ✅ tarefas
- ✅ projetos
- ✅ etapas_projeto
- ✅ documentos_etapa
- ✅ projetos_pessoais
- ✅ ideias
- ✅ transacoes_financeiras_empresa
- ✅ metas_financeiras_empresa
- ✅ transacoes_financeiras_pessoais
- ✅ metas_financeiras_pessoais
- ✅ gastos_recorrentes_pessoais
- ✅ lista_compras
- ✅ negociacoes
- ✅ renegociacoes
- ✅ parcelas_renegociacao
- ✅ operacoes_trading
- ✅ configuracoes_trading
- ✅ sessoes_alavancagem
- ✅ operacoes_alavancagem
- ✅ temas_estudo
- ✅ materias_estudo
- ✅ aulas
- ✅ revisoes
- ✅ vicios_habitos
- ✅ atividades_autodesenvolvimento
- ✅ livros
- ✅ metas_pessoais
- ✅ registros_peso
- ✅ registros_alimentacao
- ✅ registros_treinos
- ✅ registros_sono
- ✅ afirmacoes
- ✅ registros_astrologia

## 🔒 Segurança

- Row Level Security (RLS) está habilitado em todas as tabelas
- Ajuste as políticas conforme necessário no painel do Supabase

