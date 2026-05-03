# ============================================
# INSTALAR COMO SERVIÇO WINDOWS (NSSM)
# ============================================
# Este script instala a aplicação como serviço do Windows
# Requer NSSM: https://nssm.cc/
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INSTALAR SERVIÇO WINDOWS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$APP_DIR = "C:\pagamentos"
$SERVICE_NAME = "Pagamentos"
$JAVA_PATH = "java"
$JAR_FILE = Join-Path $APP_DIR "pagamentos-0.0.1-SNAPSHOT.jar"
$NSSM_URL = "https://nssm.cc/release/nssm-2.24.zip"

# Verificar se JAR existe
if (-not (Test-Path $JAR_FILE)) {
    Write-Host "ERRO: Arquivo JAR não encontrado em: $JAR_FILE" -ForegroundColor Red
    exit 1
}

# Passo 1: Verificar/Instalar NSSM
Write-Host "[1/4] Verificando NSSM..." -ForegroundColor Yellow
$nssmPath = Get-Command nssm -ErrorAction SilentlyContinue

if (-not $nssmPath) {
    Write-Host "NSSM não encontrado. Deseja baixar automaticamente? (S/N)" -ForegroundColor Yellow
    $download = Read-Host
    
    if ($download -eq 'S' -or $download -eq 's') {
        Write-Host "Baixando NSSM..." -ForegroundColor Yellow
        
        $tempDir = [System.IO.Path]::GetTempPath()
        $zipFile = Join-Path $tempDir "nssm.zip"
        $extractDir = Join-Path $tempDir "nssm"
        
        # Download
        Invoke-WebRequest -Uri $NSSM_URL -OutFile $zipFile
        
        # Extrair
        Expand-Archive -Path $zipFile -DestinationPath $extractDir -Force
        
        # Copiar para System32
        $nssmExe = Get-ChildItem -Path $extractDir -Filter "nssm.exe" -Recurse | 
                   Where-Object { $_.FullName -like "*win64*" } | 
                   Select-Object -First 1
        
        if ($nssmExe) {
            Copy-Item $nssmExe.FullName "C:\Windows\System32\nssm.exe" -Force
            Write-Host "NSSM instalado com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "ERRO: Não foi possível encontrar nssm.exe no arquivo baixado" -ForegroundColor Red
            Write-Host "Baixe manualmente em: $NSSM_URL" -ForegroundColor Yellow
            exit 1
        }
        
        # Limpar
        Remove-Item $zipFile -Force
        Remove-Item $extractDir -Recurse -Force
    } else {
        Write-Host "Por favor, baixe e instale NSSM manualmente:" -ForegroundColor Yellow
        Write-Host "1. Acesse: $NSSM_URL" -ForegroundColor White
        Write-Host "2. Extraia e copie nssm.exe para C:\Windows\System32\" -ForegroundColor White
        exit 1
    }
} else {
    Write-Host "NSSM encontrado: $($nssmPath.Source)" -ForegroundColor Green
}

# Passo 2: Encontrar Java
Write-Host ""
Write-Host "[2/4] Localizando Java..." -ForegroundColor Yellow
try {
    $javaHome = $env:JAVA_HOME
    if ($javaHome) {
        $JAVA_PATH = Join-Path $javaHome "bin\java.exe"
        Write-Host "Java encontrado (JAVA_HOME): $JAVA_PATH" -ForegroundColor Green
    } else {
        $javaCmd = Get-Command java -ErrorAction Stop
        $JAVA_PATH = $javaCmd.Source
        Write-Host "Java encontrado (PATH): $JAVA_PATH" -ForegroundColor Green
    }
} catch {
    Write-Host "ERRO: Java não encontrado no PATH ou JAVA_HOME" -ForegroundColor Red
    Write-Host "Defina JAVA_HOME ou adicione Java ao PATH" -ForegroundColor Yellow
    exit 1
}

# Passo 3: Instalar Serviço
Write-Host ""
Write-Host "[3/4] Instalando serviço '$SERVICE_NAME'..." -ForegroundColor Yellow

# Remover serviço se já existir
$existingService = Get-Service -Name $SERVICE_NAME -ErrorAction SilentlyContinue
if ($existingService) {
    Write-Host "Serviço já existe. Deseja reinstalar? (S/N)" -ForegroundColor Yellow
    $reinstall = Read-Host
    
    if ($reinstall -eq 'S' -or $reinstall -eq 's') {
        Write-Host "Parando serviço..." -ForegroundColor Yellow
        Stop-Service -Name $SERVICE_NAME -Force -ErrorAction SilentlyContinue
        
        Write-Host "Removendo serviço antigo..." -ForegroundColor Yellow
        nssm remove $SERVICE_NAME confirm
    } else {
        exit 0
    }
}

# Configurar parâmetros do Java
$javaArgs = @(
    "-Xms512m",
    "-Xmx1024m",
    "-XX:+UseG1GC",
    "-Dspring.profiles.active=prod",
    "-jar",
    "`"$JAR_FILE`""
)

# Instalar serviço com NSSM
nssm install $SERVICE_NAME "`"$JAVA_PATH`""
nssm set $SERVICE_NAME AppDirectory "`"$APP_DIR`""
nssm set $SERVICE_NAME AppParameters ($javaArgs -join " ")
nssm set $SERVICE_NAME DisplayName "Sistema de Pagamentos"
nssm set $SERVICE_NAME Description "Aplicação de gerenciamento de orçamentos e pagamentos"
nssm set $SERVICE_NAME Start SERVICE_AUTO_START

# Configurar logs
$logDir = Join-Path $APP_DIR "logs"
nssm set $SERVICE_NAME AppStdout "`"$logDir\service.log`""
nssm set $SERVICE_NAME AppStderr "`"$logDir\service-error.log`""
nssm set $SERVICE_NAME AppRotateFiles 1
nssm set $SERVICE_NAME AppRotateOnline 1
nssm set $SERVICE_NAME AppRotateBytes 10485760  # 10MB

# Configurar restart automático em caso de falha
nssm set $SERVICE_NAME AppRestartDelay 5000
nssm set $SERVICE_NAME AppExit Default Restart
nssm set $SERVICE_NAME AppThrottle 60000

Write-Host "Serviço instalado com sucesso!" -ForegroundColor Green

# Passo 4: Iniciar Serviço
Write-Host ""
Write-Host "[4/4] Iniciando serviço..." -ForegroundColor Yellow

try {
    Start-Service -Name $SERVICE_NAME
    Write-Host "Serviço iniciado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "ERRO ao iniciar serviço:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifique os logs em:" -ForegroundColor Yellow
    Write-Host "$logDir\service.log" -ForegroundColor White
    exit 1
}

# Resumo
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  SERVIÇO INSTALADO COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Nome do serviço: $SERVICE_NAME" -ForegroundColor Cyan
Write-Host "Diretório: $APP_DIR" -ForegroundColor Cyan
Write-Host "Java: $JAVA_PATH" -ForegroundColor Cyan
Write-Host ""
Write-Host "Comandos úteis:" -ForegroundColor Yellow
Write-Host "  Iniciar:   Start-Service $SERVICE_NAME" -ForegroundColor White
Write-Host "  Parar:     Stop-Service $SERVICE_NAME" -ForegroundColor White
Write-Host "  Reiniciar: Restart-Service $SERVICE_NAME" -ForegroundColor White
Write-Host "  Status:    Get-Service $SERVICE_NAME" -ForegroundColor White
Write-Host "  Logs:      Get-Content $logDir\service.log -Wait" -ForegroundColor White
Write-Host ""
Write-Host "Ou use services.msc para gerenciar graficamente" -ForegroundColor Cyan
Write-Host ""
