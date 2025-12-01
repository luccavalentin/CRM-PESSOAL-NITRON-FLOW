# Variáveis de Ambiente para Deploy

## Variáveis Necessárias

Adicione estas variáveis na plataforma de deploy (Vercel, Netlify, etc.):

### 1. Supabase URL
**Key:** `NEXT_PUBLIC_SUPABASE_URL`  
**Value:** `https://daucakxmelqbfhspqspw.supabase.co`

### 2. Supabase Anon Key
**Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
**Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhdWNha3htZWxxYmZoc3Bxc3B3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NTg1MTYsImV4cCI6MjA4MDEzNDUxNn0.mvYCQyJiIVCQbIUw-IaflbBtl-dy6oev96oGlShM5E8`

## Como Adicionar

1. Clique em **"+ Add More"** para adicionar uma nova variável
2. Preencha o **Key** com o nome da variável (ex: `NEXT_PUBLIC_SUPABASE_URL`)
3. Preencha o **Value** com o valor correspondente
4. Repita para a segunda variável
5. Clique em **"Deploy"** para aplicar as mudanças

## Importante

⚠️ **NUNCA** commite essas credenciais no código. Elas devem estar apenas nas variáveis de ambiente da plataforma de deploy.

## Formato para Importar .env

Se preferir usar "Import .env", cole este conteúdo:

```
NEXT_PUBLIC_SUPABASE_URL=https://daucakxmelqbfhspqspw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhdWNha3htZWxxYmZoc3Bxc3B3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NTg1MTYsImV4cCI6MjA4MDEzNDUxNn0.mvYCQyJiIVCQbIUw-IaflbBtl-dy6oev96oGlShM5E8
```

