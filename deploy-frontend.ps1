# Script para build e deploy do frontend React no Spring Boot
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOY FRONTEND -> SPRING BOOT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$PROJECT_ROOT = "C:\Users\islan.vinicius\Desktop\GIT\PROJETO_PAGAMENTOS"
$FRONTEND_DIR = Join-Path $PROJECT_ROOT "frontend"
$STATIC_DIR = Join-Path $PROJECT_ROOT "src\main\resources\static"

# Passo 1: Build do frontend
Write-Host "[1/3] Fazendo build do frontend..." -ForegroundColor Yellow
Set-Location $FRONTEND_DIR
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Build do frontend falhou!" -ForegroundColor Red
    exit 1
}

# Passo 2: Limpar pasta static
Write-Host ""
Write-Host "[2/3] Limpando pasta static..." -ForegroundColor Yellow
if (Test-Path $STATIC_DIR) {
    Remove-Item $STATIC_DIR -Recurse -Force
}
New-Item -ItemType Directory -Path $STATIC_DIR -Force | Out-Null

# Passo 3: Copiar arquivos buildados
Write-Host "[3/3] Copiando arquivos para static..." -ForegroundColor Yellow
Copy-Item "$FRONTEND_DIR\dist\*" $STATIC_DIR -Recurse -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DEPLOY CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Agora reinicie o Spring Boot para aplicar as mudanças." -ForegroundColor Cyan
Write-Host ""
