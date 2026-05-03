# ============================================
# SCRIPT DE DEPLOY - WINDOWS SERVER
# ============================================
# Execute este script no Windows Server para configurar a aplicação
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOY - WINDOWS SERVER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configurações
$APP_DIR = "C:\pagamentos"
$JAVA_MIN_VERSION = 21
$DB_NAME = "PAGAMENTOS1"
$DB_USER = "postgres"

# Passo 1: Verificar Java
Write-Host "[1/6] Verificando Java..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1 | Select-String "version" | Select-Object -First 1
    Write-Host "Java encontrado: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Java não está instalado!" -ForegroundColor Red
    Write-Host "Baixe e instale: https://adoptium.net/temurin/releases/?version=21" -ForegroundColor Yellow
    exit 1
}

# Passo 2: Verificar PostgreSQL
Write-Host ""
Write-Host "[2/6] Verificando PostgreSQL..." -ForegroundColor Yellow
try {
    $pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    if ($pgService) {
        Write-Host "PostgreSQL encontrado: $($pgService.DisplayName)" -ForegroundColor Green
        Write-Host "Status: $($pgService.Status)" -ForegroundColor $(if($pgService.Status -eq 'Running'){'Green'}else{'Yellow'})
        
        if ($pgService.Status -ne 'Running') {
            Write-Host "Iniciando PostgreSQL..." -ForegroundColor Yellow
            Start-Service $pgService.Name
        }
    } else {
        Write-Host "AVISO: Serviço PostgreSQL não encontrado" -ForegroundColor Yellow
        Write-Host "Certifique-se de que PostgreSQL está instalado e o banco '$DB_NAME' foi criado" -ForegroundColor Yellow
    }
} catch {
    Write-Host "AVISO: Não foi possível verificar PostgreSQL" -ForegroundColor Yellow
}

# Passo 3: Criar diretório da aplicação
Write-Host ""
Write-Host "[3/6] Preparando diretório da aplicação..." -ForegroundColor Yellow
if (-not (Test-Path $APP_DIR)) {
    New-Item -ItemType Directory -Path $APP_DIR -Force | Out-Null
    Write-Host "Diretório criado: $APP_DIR" -ForegroundColor Green
} else {
    Write-Host "Diretório já existe: $APP_DIR" -ForegroundColor Green
}

# Criar subdiretórios
$subdirs = @("uploads", "logs", "backup")
foreach ($dir in $subdirs) {
    $fullPath = Join-Path $APP_DIR $dir
    if (-not (Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
    }
}

# Passo 4: Copiar arquivos do deploy
Write-Host ""
Write-Host "[4/6] Copiando arquivos..." -ForegroundColor Yellow
$deploySource = Join-Path $PSScriptRoot "deploy"

if (Test-Path $deploySource) {
    Copy-Item "$deploySource\*" $APP_DIR -Recurse -Force
    Write-Host "Arquivos copiados com sucesso!" -ForegroundColor Green
} else {
    Write-Host "ERRO: Pasta 'deploy' não encontrada em: $deploySource" -ForegroundColor Red
    Write-Host "Execute '.\build-deploy.ps1' primeiro na máquina de desenvolvimento" -ForegroundColor Yellow
    exit 1
}

# Passo 5: Configurar application-prod.properties
Write-Host ""
Write-Host "[5/6] Configurando application-prod.properties..." -ForegroundColor Yellow
$configFile = Join-Path $APP_DIR "application-prod.properties"

if (Test-Path $configFile) {
    Write-Host "Arquivo de configuração encontrado" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANTE: Edite o arquivo abaixo com as credenciais corretas:" -ForegroundColor Cyan
    Write-Host "$configFile" -ForegroundColor White
    Write-Host ""
    
    $edit = Read-Host "Deseja editar agora? (S/N)"
    if ($edit -eq 'S' -or $edit -eq 's') {
        notepad $configFile
    }
} else {
    Write-Host "AVISO: application-prod.properties não encontrado" -ForegroundColor Yellow
}

# Passo 6: Configurar Firewall
Write-Host ""
Write-Host "[6/6] Configurando Firewall do Windows..." -ForegroundColor Yellow
try {
    $firewallRule = Get-NetFirewallRule -DisplayName "Pagamentos App" -ErrorAction SilentlyContinue
    
    if (-not $firewallRule) {
        New-NetFirewallRule -DisplayName "Pagamentos App" `
                           -Direction Inbound `
                           -LocalPort 8080 `
                           -Protocol TCP `
                           -Action Allow `
                           -Profile Any | Out-Null
        Write-Host "Regra de firewall criada (porta 8080)" -ForegroundColor Green
    } else {
        Write-Host "Regra de firewall já existe" -ForegroundColor Green
    }
} catch {
    Write-Host "AVISO: Não foi possível configurar firewall automaticamente" -ForegroundColor Yellow
    Write-Host "Configure manualmente: Permitir porta 8080 TCP inbound" -ForegroundColor Yellow
}

# Resumo
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  CONFIGURAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Diretório da aplicação: $APP_DIR" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Edite: $configFile" -ForegroundColor White
Write-Host "   - Configure URL do banco de dados" -ForegroundColor Gray
Write-Host "   - Configure usuário e senha" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Teste a conexão com o banco:" -ForegroundColor White
Write-Host "   psql -U $DB_USER -d $DB_NAME" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Inicie a aplicação:" -ForegroundColor White
Write-Host "   cd $APP_DIR" -ForegroundColor Gray
Write-Host "   .\start.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Acesse no navegador:" -ForegroundColor White
Write-Host "   http://localhost:8080" -ForegroundColor Cyan
Write-Host "   ou" -ForegroundColor White
Write-Host "   http://SEU_IP:8080" -ForegroundColor Cyan
Write-Host ""
