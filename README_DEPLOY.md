# 🚀 Instruções Rápidas de Deploy

## 1️⃣ Executar SQL no Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)
4. Clique em **New Query**
5. Abra o arquivo `supabase/schema.sql` deste projeto
6. Copie TODO o conteúdo
7. Cole no editor SQL do Supabase
8. Clique em **Run** (ou pressione Ctrl+Enter)
9. Aguarde a mensagem de sucesso

## 2️⃣ Configurar Variáveis na Vercel

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto (ou crie um novo)
3. Vá em **Settings** > **Environment Variables**
4. Adicione:

```
NEXT_PUBLIC_SUPABASE_URL = https://yfawzvuedflczgytcgjc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmYXd6dnVlZGZsY3pneXRjZ2pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTcyNTQsImV4cCI6MjA4MDE3MzI1NH0.PHrYn6BIPHFV2ke14mJkJJaD9-lRRFliXd6lFQwOhlY
```

5. Selecione **Production**, **Preview** e **Development**
6. Clique em **Save**

## 3️⃣ Deploy

### Via GitHub (Recomendado)
1. Faça push do código para GitHub
2. Na Vercel, clique em **Add New Project**
3. Importe o repositório
4. As variáveis já configuradas serão usadas
5. Clique em **Deploy**

### Via CLI
```bash
npm i -g vercel
vercel login
vercel
```

## ✅ Pronto!

Seu sistema estará online em alguns minutos!



