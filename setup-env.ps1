# Script para criar arquivo .env.local no Windows
# Execute: .\setup-env.ps1

$envContent = @"
NEXT_PUBLIC_SUPABASE_URL=https://daucakxmelqbfhspqspw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhdWNha3htZWxxYmZoc3Bxc3B3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NTg1MTYsImV4cCI6MjA4MDEzNDUxNn0.mvYCQyJiIVCQbIUw-IaflbBtl-dy6oev96oGlShM5E8
"@

$envContent | Out-File -FilePath .env.local -Encoding utf8 -NoNewline
Write-Host "Arquivo .env.local criado com sucesso!" -ForegroundColor Green

