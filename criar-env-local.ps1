# Script para criar arquivo .env.local
# Execute este script na raiz do projeto

$envContent = @"
NEXT_PUBLIC_SUPABASE_URL=https://pjbrzajtmgrnltwbvkkj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYnJ6YWp0bWdybmx0d2J2a2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MjI3NzcsImV4cCI6MjA4MDE5ODc3N30.tiBE_2MSphmqK7ZzkDPhqPZhnTMRcuzh4qz81AVTZgk
"@

$envContent | Out-File -FilePath ".env.local" -Encoding utf8 -NoNewline

Write-Host "✅ Arquivo .env.local criado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️ IMPORTANTE: Reinicie o servidor (npm run dev)" -ForegroundColor Yellow

