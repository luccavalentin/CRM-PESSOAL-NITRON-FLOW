# 🚀 INSTRUÇÕES COMPLETAS DE DEPLOY - CRM LUCCA

## ✅ O QUE JÁ FOI CONFIGURADO

1. ✅ Estrutura SQL completa criada (`supabase/schema.sql`)
2. ✅ Configuração do Supabase (`lib/supabase.ts`)
3. ✅ Variáveis de ambiente configuradas
4. ✅ Dependências instaladas (`@supabase/supabase-js`)
5. ✅ Arquivo `vercel.json` criado
6. ✅ `.gitignore` atualizado para proteger chaves

## 📋 PASSOS PARA DEPLOY

### PASSO 1: Executar SQL no Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto: `yfawzvuedflczgytcgjc`
3. Vá em **SQL Editor** (menu lateral)
4. Clique em **New Query**
5. Abra o arquivo `supabase/schema.sql` deste projeto
6. **Copie TODO o conteúdo** do arquivo
7. Cole no editor SQL do Supabase
8. Clique em **Run** (ou pressione Ctrl+Enter)
9. Aguarde a mensagem: "Success. No rows returned"

### PASSO 2: Criar arquivo .env.local (Local)

Na raiz do projeto, crie o arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://yfawzvuedflczgytcgjc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmYXd6dnVlZGZsY3pneXRjZ2pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTcyNTQsImV4cCI6MjA4MDE3MzI1NH0.PHrYn6BIPHFV2ke14mJkJJaD9-lRRFliXd6lFQwOhlY
```

### PASSO 3: Configurar Variáveis na Vercel

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto (ou crie um novo)
3. Vá em **Settings** > **Environment Variables**
4. Adicione as seguintes variáveis:

**Variável 1:**
- Name: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `https://yfawzvuedflczgytcgjc.supabase.co`
- Environments: ✅ Production, ✅ Preview, ✅ Development

**Variável 2:**
- Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmYXd6dnVlZGZsY3pneXRjZ2pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTcyNTQsImV4cCI6MjA4MDE3MzI1NH0.PHrYn6BIPHFV2ke14mJkJJaD9-lRRFliXd6lFQwOhlY`
- Environments: ✅ Production, ✅ Preview, ✅ Development

5. Clique em **Save** para cada variável

### PASSO 4: Deploy na Vercel

#### Opção A: Via GitHub (Recomendado)

1. Faça commit e push do código para GitHub:
```bash
git add .
git commit -m "Preparado para deploy"
git push origin main
```

2. Na Vercel:
   - Clique em **Add New Project**
   - Importe seu repositório GitHub
   - As variáveis já configuradas serão usadas automaticamente
   - Clique em **Deploy**

#### Opção B: Via CLI

```bash
# Instalar Vercel CLI (se ainda não tiver)
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Para produção
vercel --prod
```

### PASSO 5: Testar Localmente (Opcional)

```bash
# Instalar dependências (se ainda não fez)
npm install

# Rodar em desenvolvimento
npm run dev

# Acesse: http://localhost:3000
```

## 🔒 SEGURANÇA

### ✅ O QUE FOI FEITO

- ✅ Chaves não estão no código fonte
- ✅ `.env.local` está no `.gitignore`
- ✅ Variáveis de ambiente configuradas
- ✅ RLS (Row Level Security) habilitado no banco

### ⚠️ IMPORTANTE

- **NUNCA** commite o arquivo `.env.local`
- **NUNCA** exponha a Service Role Key
- Use apenas a Anon Key no frontend
- As chaves já estão protegidas no código

## 📊 VERIFICAÇÃO PÓS-DEPLOY

### 1. Verificar Banco de Dados

No Supabase:
- Vá em **Table Editor**
- Verifique se todas as tabelas foram criadas
- Deve haver ~35 tabelas

### 2. Verificar Deploy

Na Vercel:
- Vá em **Deployments**
- Verifique se o deploy foi bem-sucedido
- Clique no link para acessar o site

### 3. Testar Sistema

- Acesse a URL do deploy
- Teste criar um lead
- Teste criar uma tarefa
- Verifique se os dados estão sendo salvos

## 🐛 TROUBLESHOOTING

### Erro: "Missing Supabase environment variables"

**Solução:**
- Verifique se o `.env.local` existe e está correto
- Na Vercel, verifique se as variáveis estão configuradas
- Reinicie o servidor de desenvolvimento

### Erro: "relation does not exist"

**Solução:**
- Execute o schema SQL no Supabase novamente
- Verifique se todas as tabelas foram criadas

### Erro de RLS (Row Level Security)

**Solução:**
- No Supabase, vá em **Authentication** > **Policies**
- Ajuste as políticas conforme necessário
- Ou desabilite temporariamente para testes (não recomendado)

## 📁 ARQUIVOS CRIADOS

- ✅ `supabase/schema.sql` - Estrutura completa do banco
- ✅ `lib/supabase.ts` - Configuração do Supabase
- ✅ `.env.example` - Exemplo de variáveis
- ✅ `vercel.json` - Configuração do Vercel
- ✅ `.gitignore` - Proteção de arquivos sensíveis
- ✅ `DEPLOY.md` - Documentação completa
- ✅ `README_DEPLOY.md` - Instruções rápidas
- ✅ `SETUP_ENV.md` - Configuração de variáveis

## 🎉 PRONTO!

Após seguir todos os passos, seu sistema estará:

- ✅ Online na Vercel
- ✅ Conectado ao Supabase
- ✅ Com banco de dados configurado
- ✅ Seguro e protegido

## 📞 SUPORTE

Se encontrar problemas:
1. Verifique os logs na Vercel
2. Verifique os logs no Supabase
3. Consulte a documentação em `DEPLOY.md`

---

**Última atualização:** 2025-01-12


