# 🚀 Guia de Deploy - CRM Lucca

## 📋 Pré-requisitos

1. Conta no Supabase (https://supabase.com)
2. Conta na Vercel (https://vercel.com)
3. Node.js 18+ instalado

## 🔧 Configuração do Banco de Dados (Supabase)

### 1. Criar Projeto no Supabase

1. Acesse https://supabase.com
2. Crie um novo projeto
3. Anote a URL do projeto e a API Key (anon key)

### 2. Executar o Schema SQL

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Copie todo o conteúdo do arquivo `supabase/schema.sql`
4. Cole no editor e clique em **Run**
5. Aguarde a execução completa

### 3. Configurar Row Level Security (RLS)

O schema já inclui RLS habilitado. Você pode ajustar as políticas conforme necessário no painel do Supabase em **Authentication > Policies**.

## 🔐 Configuração de Variáveis de Ambiente

### Local (.env.local)

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://yfawzvuedflczgytcgjc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
```

### Vercel

1. Acesse seu projeto na Vercel
2. Vá em **Settings > Environment Variables**
3. Adicione as seguintes variáveis:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://yfawzvuedflczgytcgjc.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = sua chave anon do Supabase

## 📦 Instalação de Dependências

```bash
npm install
```

## 🏗️ Build Local

```bash
npm run build
```

## 🚀 Deploy na Vercel

### Opção 1: Via CLI

1. Instale a Vercel CLI:
```bash
npm i -g vercel
```

2. Faça login:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

### Opção 2: Via GitHub

1. Faça push do código para um repositório GitHub
2. Acesse https://vercel.com
3. Clique em **Add New Project**
4. Importe seu repositório
5. Configure as variáveis de ambiente
6. Clique em **Deploy**

## 🔒 Segurança

### ⚠️ IMPORTANTE

- **NUNCA** commite o arquivo `.env.local` no Git
- **NUNCA** exponha a Service Role Key no frontend
- Use apenas a Anon Key no frontend
- Configure RLS (Row Level Security) no Supabase para proteger seus dados

### Variáveis de Ambiente

- `NEXT_PUBLIC_SUPABASE_URL`: URL pública do seu projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave pública (anon) - pode ser exposta no frontend
- `SUPABASE_SERVICE_ROLE_KEY`: Chave privada - **NUNCA** exponha no frontend!

## 📊 Estrutura do Banco de Dados

O schema SQL inclui todas as tabelas necessárias:

- ✅ Usuários
- ✅ Leads e Clientes
- ✅ Projetos e Tarefas
- ✅ Finanças (Empresa e Pessoal)
- ✅ Trading e Alavancagem
- ✅ Estudos
- ✅ Desenvolvimento Pessoal
- ✅ Vida Saudável
- ✅ Espiritualidade

## 🐛 Troubleshooting

### Erro: "Missing Supabase environment variables"

- Verifique se as variáveis estão configuradas no `.env.local`
- No Vercel, verifique se as variáveis estão configuradas corretamente

### Erro: "relation does not exist"

- Execute o schema SQL no Supabase
- Verifique se todas as tabelas foram criadas

### Erro de RLS (Row Level Security)

- Ajuste as políticas no painel do Supabase
- Ou desabilite temporariamente para testes (não recomendado em produção)

## 📝 Próximos Passos

1. Execute o schema SQL no Supabase
2. Configure as variáveis de ambiente
3. Teste localmente com `npm run dev`
4. Faça o deploy na Vercel
5. Configure as políticas de segurança no Supabase

## 🎉 Sucesso!

Após o deploy, seu sistema estará disponível em uma URL da Vercel!

