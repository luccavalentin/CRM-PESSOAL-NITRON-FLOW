# Script para criar arquivo .env.local no Windows
# Execute: .\setup-env.ps1

$envContent = @"
# Adicione suas variáveis de ambiente aqui
"@

$envContent | Out-File -FilePath .env.local -Encoding utf8 -NoNewline
Write-Host "Arquivo .env.local criado com sucesso!" -ForegroundColor Green


