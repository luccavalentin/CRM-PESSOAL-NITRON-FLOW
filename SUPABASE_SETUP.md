# Configuração do Supabase

## Passo 1: Criar arquivo .env.local

Crie um arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```env
NEXT_PUBLIC_SUPABASE_URL=https://daucakxmelqbfhspqspw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhdWNha3htZWxxYmZoc3Bxc3B3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NTg1MTYsImV4cCI6MjA4MDEzNDUxNn0.mvYCQyJiIVCQbIUw-IaflbBtl-dy6oev96oGlShM5E8
```

⚠️ **IMPORTANTE**: Este arquivo já está protegido pelo `.gitignore` e NÃO será commitado no repositório.

## Passo 2: Executar o Schema SQL

Execute o arquivo `database_schema_postgresql.sql` no seu banco de dados Supabase:

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Vá em "SQL Editor"
3. Cole o conteúdo do arquivo `database_schema_postgresql.sql`
4. Execute o script

## Passo 3: Usar o Cliente Supabase

O cliente Supabase já está configurado em `lib/supabase.ts`. Use assim:

```typescript
import { supabase } from '@/lib/supabase'

// Exemplo: Buscar leads
const { data, error } = await supabase
  .from('leads')
  .select('*')
  .order('created_at', { ascending: false })

// Exemplo: Inserir lead
const { data, error } = await supabase
  .from('leads')
  .insert({
    id: uuidv4(),
    nome: 'Nome do Lead',
    email: 'email@example.com',
    estado: 'SP',
    cidade: 'São Paulo',
    bairro: 'Centro',
    data_criacao: new Date().toISOString().split('T')[0],
  })

// Exemplo: Atualizar lead
const { data, error } = await supabase
  .from('leads')
  .update({ status: 'Convertido' })
  .eq('id', leadId)

// Exemplo: Deletar lead
const { error } = await supabase
  .from('leads')
  .delete()
  .eq('id', leadId)
```

## Segurança

- ✅ As credenciais estão em `.env.local` (não commitado)
- ✅ O arquivo `.gitignore` protege arquivos `.env*`
- ✅ Use sempre variáveis de ambiente, nunca hardcode credenciais
- ✅ A API key anon é segura para uso no cliente (tem permissões limitadas)

