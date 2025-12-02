# ⚠️ ERRO: Missing Supabase environment variables

## 🔧 SOLUÇÃO RÁPIDA

### Opção 1: Usar o Script PowerShell (Recomendado)

1. Abra o PowerShell na raiz do projeto
2. Execute:
```powershell
.\criar-env-local.ps1
```

### Opção 2: Criar Manualmente

1. Na raiz do projeto (mesma pasta que `package.json`), crie um arquivo chamado `.env.local`
2. Cole EXATAMENTE este conteúdo:

```env
NEXT_PUBLIC_SUPABASE_URL=https://pjbrzajtmgrnltwbvkkj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYnJ6YWp0bWdybmx0d2J2a2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MjI3NzcsImV4cCI6MjA4MDE5ODc3N30.tiBE_2MSphmqK7ZzkDPhqPZhnTMRcuzh4qz81AVTZgk
```

3. Salve o arquivo

### ⚠️ IMPORTANTE: Reiniciar o Servidor

Após criar o arquivo `.env.local`:

1. **Pare o servidor** (Ctrl+C no terminal)
2. **Execute novamente**: `npm run dev`
3. O erro deve desaparecer!

## 📍 Onde criar o arquivo?

O arquivo `.env.local` deve estar na **raiz do projeto**, na mesma pasta que:
- ✅ `package.json`
- ✅ `next.config.js`
- ✅ `app/`
- ✅ `lib/`

## ✅ Verificar se funcionou

1. Reinicie o servidor
2. Acesse: `http://localhost:3000/verificar-conexao`
3. Deve mostrar: ✅ Variáveis configuradas e ✅ Conexão estabelecida

## 🐛 Ainda com erro?

1. Verifique se o arquivo está realmente na raiz do projeto
2. Verifique se não há espaços extras nas variáveis
3. Verifique se copiou a KEY completa (é muito longa)
4. Reinicie o servidor após criar o arquivo


