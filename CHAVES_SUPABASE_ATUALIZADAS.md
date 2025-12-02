# ✅ CHAVES SUPABASE ATUALIZADAS

## 🔐 NOVAS CREDENCIAIS SUPABASE

**URL:**
```
https://pjbrzajtmgrnltwbvkkj.supabase.co
```

**ANON KEY:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYnJ6YWp0bWdybmx0d2J2a2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MjI3NzcsImV4cCI6MjA4MDE5ODc3N30.tiBE_2MSphmqK7ZzkDPhqPZhnTMRcuzh4qz81AVTZgk
```

## 📝 CONFIGURAÇÃO

### 1. Criar arquivo .env.local (LOCAL)

Na raiz do projeto, crie o arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://pjbrzajtmgrnltwbvkkj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYnJ6YWp0bWdybmx0d2J2a2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MjI3NzcsImV4cCI6MjA4MDE5ODc3N30.tiBE_2MSphmqK7ZzkDPhqPZhnTMRcuzh4qz81AVTZgk
```

### 2. Configurar na Vercel

Vá em **Settings > Environment Variables** e adicione:

**Variável 1:**
- Key: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `https://pjbrzajtmgrnltwbvkkj.supabase.co`
- ✅ Marque: Production, Preview, Development

**Variável 2:**
- Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYnJ6YWp0bWdybmx0d2J2a2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MjI3NzcsImV4cCI6MjA4MDE5ODc3N30.tiBE_2MSphmqK7ZzkDPhqPZhnTMRcuzh4qz81AVTZgk`
- ✅ Marque: Production, Preview, Development

## 🗄️ EXECUTAR SCHEMA SQL

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Clique em **New Query**
5. Abra o arquivo `supabase/schema.sql`
6. Copie TODO o conteúdo
7. Cole no editor SQL
8. Clique em **Run** (ou Ctrl+Enter)
9. Aguarde a execução completa

## ✅ O QUE FOI IMPLEMENTADO

1. ✅ Autenticação integrada com Supabase Auth
2. ✅ Schema SQL completo com todas as tabelas
3. ✅ Row Level Security (RLS) configurado
4. ✅ Trigger automático para criar perfil ao registrar
5. ✅ Todas as tabelas vinculadas ao usuário (usuario_id)

## 🔒 SEGURANÇA

- Todas as tabelas têm RLS habilitado
- Usuários só podem ver/editar seus próprios dados
- Autenticação gerenciada pelo Supabase Auth
- Senhas são hasheadas automaticamente pelo Supabase


