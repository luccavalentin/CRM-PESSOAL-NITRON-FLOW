# 🚀 INSTRUÇÕES COMPLETAS - INTEGRAÇÃO SUPABASE

## ✅ O QUE FOI FEITO

1. ✅ **Schema SQL Completo** - Criado em `supabase/schema.sql`
2. ✅ **Autenticação Integrada** - Sistema agora usa Supabase Auth
3. ✅ **Credenciais Atualizadas** - Todas as referências atualizadas
4. ✅ **Row Level Security** - RLS configurado em todas as tabelas

## 📋 PASSO A PASSO

### 1. Executar o Schema SQL no Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto (ou crie um novo)
3. Vá em **SQL Editor** (menu lateral)
4. Clique em **New Query**
5. Abra o arquivo `supabase/schema.sql` do projeto
6. **Copie TODO o conteúdo** do arquivo
7. Cole no editor SQL do Supabase
8. Clique em **Run** (ou pressione Ctrl+Enter)
9. Aguarde a execução completa (pode levar alguns minutos)

### 2. Verificar se as Tabelas Foram Criadas

1. No painel do Supabase, vá em **Table Editor**
2. Você deve ver todas as tabelas listadas:
   - ✅ usuarios
   - ✅ leads
   - ✅ clientes
   - ✅ tarefas
   - ✅ projetos
   - ✅ transacoes_financeiras_empresa
   - ✅ transacoes_financeiras_pessoais
   - E todas as outras...

### 3. Configurar Variáveis de Ambiente

#### Local (.env.local)

Crie o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://pjbrzajtmgrnltwbvkkj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYnJ6YWp0bWdybmx0d2J2a2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MjI3NzcsImV4cCI6MjA4MDE5ODc3N30.tiBE_2MSphmqK7ZzkDPhqPZhnTMRcuzh4qz81AVTZgk
```

#### Vercel (Produção)

1. Acesse: https://vercel.com
2. Vá em seu projeto
3. **Settings** > **Environment Variables**
4. Adicione as variáveis:

**Variável 1:**
- Key: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `https://pjbrzajtmgrnltwbvkkj.supabase.co`
- ✅ Marque: Production, Preview, Development

**Variável 2:**
- Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYnJ6YWp0bWdybmx0d2J2a2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MjI3NzcsImV4cCI6MjA4MDE5ODc3N30.tiBE_2MSphmqK7ZzkDPhqPZhnTMRcuzh4qz81AVTZgk`
- ✅ Marque: Production, Preview, Development

### 4. Verificar Conexão

1. Inicie o servidor local: `npm run dev`
2. Acesse: `http://localhost:3000/verificar-conexao`
3. A página deve mostrar:
   - ✅ Variáveis de ambiente configuradas
   - ✅ Conexão com banco de dados estabelecida

### 5. Testar Autenticação

1. Acesse: `http://localhost:3000/cadastro`
2. Crie uma nova conta
3. O sistema deve:
   - ✅ Criar usuário no Supabase Auth
   - ✅ Criar perfil na tabela `usuarios`
   - ✅ Fazer login automaticamente
   - ✅ Redirecionar para o dashboard

## 🔒 SEGURANÇA

### Row Level Security (RLS)

- ✅ Todas as tabelas têm RLS habilitado
- ✅ Usuários só podem ver/editar seus próprios dados
- ✅ Políticas baseadas em `usuario_id` = `auth.uid()`

### Autenticação

- ✅ Senhas são hasheadas automaticamente pelo Supabase
- ✅ Tokens JWT gerenciados pelo Supabase
- ✅ Sessões persistentes configuradas

## 📊 ESTRUTURA DO BANCO

### Tabelas Principais

- **usuarios** - Perfis dos usuários (vinculado ao auth.users)
- **leads** - Leads de vendas
- **clientes** - Clientes cadastrados
- **tarefas** - Tarefas do sistema
- **projetos** - Projetos empresariais
- **transacoes_financeiras_empresa** - Receitas/Despesas empresa
- **transacoes_financeiras_pessoais** - Receitas/Despesas pessoal
- E muitas outras...

### Relacionamentos

- Todas as tabelas têm `usuario_id` vinculado a `usuarios.id`
- `usuarios.id` é vinculado a `auth.users.id` (Supabase Auth)
- Cascade delete configurado (ao deletar usuário, deleta todos os dados)

## 🐛 TROUBLESHOOTING

### Erro: "Missing Supabase environment variables"

**Solução:** Crie o arquivo `.env.local` com as variáveis corretas

### Erro: "relation does not exist"

**Solução:** Execute o schema SQL completo no Supabase

### Erro: "permission denied"

**Solução:** Verifique as políticas RLS no Supabase (Authentication > Policies)

### Usuário não está sendo salvo

**Solução:** 
1. Verifique se o trigger `on_auth_user_created` foi criado
2. Verifique os logs do Supabase (Logs > Postgres Logs)
3. Verifique se a tabela `usuarios` existe

## ✅ CHECKLIST FINAL

- [ ] Schema SQL executado no Supabase
- [ ] Todas as tabelas criadas (verificar no Table Editor)
- [ ] Arquivo `.env.local` criado localmente
- [ ] Variáveis configuradas na Vercel
- [ ] Conexão verificada em `/verificar-conexao`
- [ ] Teste de cadastro funcionando
- [ ] Teste de login funcionando
- [ ] Dados sendo salvos no banco

## 🎯 PRÓXIMOS PASSOS

Após configurar tudo:

1. Teste o cadastro de um novo usuário
2. Verifique se o usuário aparece na tabela `usuarios` no Supabase
3. Teste o login
4. Verifique se os dados estão sendo salvos corretamente

