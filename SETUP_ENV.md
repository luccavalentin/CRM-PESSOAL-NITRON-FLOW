# 🔐 Configuração de Variáveis de Ambiente

## ⚠️ IMPORTANTE: Criar arquivo .env.local

Crie manualmente um arquivo chamado `.env.local` na raiz do projeto com o seguinte conteúdo:

```env
NEXT_PUBLIC_SUPABASE_URL=https://yfawzvuedflczgytcgjc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmYXd6dnVlZGZsY3pneXRjZ2pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTcyNTQsImV4cCI6MjA4MDE3MzI1NH0.PHrYn6BIPHFV2ke14mJkJJaD9-lRRFliXd6lFQwOhlY
```

## 📝 Passos

1. Na raiz do projeto, crie o arquivo `.env.local`
2. Cole o conteúdo acima
3. Salve o arquivo
4. O arquivo já está no `.gitignore` e não será commitado

## ✅ Verificação

Após criar o arquivo, execute:

```bash
npm run dev
```

Se não houver erros relacionados ao Supabase, está configurado corretamente!



