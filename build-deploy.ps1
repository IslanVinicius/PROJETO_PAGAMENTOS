# ============================================
# SCRIPT DE DEPLOY - PROJETO PAGAMENTOS
# ============================================
# Este script gera o JAR pronto para produção
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BUILD DE PRODUÇÃO - PAGAMENTOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$PROJECT_ROOT = "C:\Users\islan.vinicius\Desktop\GIT\PROJETO_PAGAMENTOS"
Set-Location $PROJECT_ROOT

# Passo 1: Limpar builds anteriores
Write-Host "[1/4] Limpando builds anteriores..." -ForegroundColor Yellow
.\mvnw.cmd clean

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha ao limpar!" -ForegroundColor Red
    exit 1
}

# Passo 2: Build do projeto (inclui frontend automaticamente)
Write-Host ""
Write-Host "[2/4] Fazendo build completo (backend + frontend)..." -ForegroundColor Yellow
.\mvnw.cmd package -DskipTests

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Build falhou!" -ForegroundColor Red
    exit 1
}

# Passo 3: Localizar o JAR gerado
Write-Host ""
Write-Host "[3/4] Localizando arquivo JAR..." -ForegroundColor Yellow
$JAR_FILE = Get-ChildItem -Path "target" -Filter "pagamentos-*.jar" | Where-Object { $_.Name -notmatch "original" } | Select-Object -First 1

if (-not $JAR_FILE) {
    Write-Host "ERRO: Arquivo JAR não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "JAR gerado: $($JAR_FILE.FullName)" -ForegroundColor Green
Write-Host "Tamanho: $([math]::Round($JAR_FILE.Length / 1MB, 2)) MB" -ForegroundColor Green

# Passo 4: Criar pasta de deploy
Write-Host ""
Write-Host "[4/4] Preparando pasta de deploy..." -ForegroundColor Yellow
$DEPLOY_DIR = Join-Path $PROJECT_ROOT "deploy"
if (Test-Path $DEPLOY_DIR) {
    Remove-Item $DEPLOY_DIR -Recurse -Force
}
New-Item -ItemType Directory -Path $DEPLOY_DIR -Force | Out-Null

# Copiar JAR
Copy-Item $JAR_FILE.FullName $DEPLOY_DIR -Force

# Copiar arquivo de configuração de produção
Write-Host "Copiando configuração de produção..." -ForegroundColor Yellow
$PROD_CONFIG = Join-Path $PROJECT_ROOT "src\main\resources\application-prod.properties"
if (Test-Path $PROD_CONFIG) {
    Copy-Item $PROD_CONFIG $DEPLOY_DIR -Force
    Write-Host "application-prod.properties copiado!" -ForegroundColor Green
} else {
    Write-Host "AVISO: application-prod.properties não encontrado" -ForegroundColor Yellow
}

# Criar script de inicialização para Linux
$START_SH = @"
#!/bin/bash
# Script para iniciar a aplicação em produção

APP_NAME="pagamentos"
JAR_FILE="pagamentos-0.0.1-SNAPSHOT.jar"
LOG_FILE="application.log"
PID_FILE="application.pid"

# Configurações
JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC"
SPRING_PROFILES_ACTIVE="prod"

echo "Iniciando \$APP_NAME..."

# Iniciar em background
nohup java \$JAVA_OPTS \
    -Dspring.profiles.active=\$SPRING_PROFILES_ACTIVE \
    -jar \$JAR_FILE > \$LOG_FILE 2>&1 &

# Salvar PID
echo \$! > \$PID_FILE

echo "Aplicação iniciada com PID: \$!"
echo "Logs: \$LOG_FILE"
"@

Set-Content -Path (Join-Path $DEPLOY_DIR "start.sh") -Value $START_SH -Encoding UTF8

# Criar script de parada para Linux
$STOP_SH = @"
#!/bin/bash
# Script para parar a aplicação

PID_FILE="application.pid"

if [ -f "\$PID_FILE" ]; then
    PID=\$(cat \$PID_FILE)
    echo "Parando aplicação (PID: \$PID)..."
    kill \$PID
    rm \$PID_FILE
    echo "Aplicação parada."
else
    echo "Arquivo PID não encontrado. Aplicação pode não estar rodando."
fi
"@

Set-Content -Path (Join-Path $DEPLOY_DIR "stop.sh") -Value $STOP_SH -Encoding UTF8

# Criar script PowerShell para Windows
$START_PS1 = @"
# Script para iniciar a aplicação em produção (Windows)

`$APP_NAME = "pagamentos"
`$JAR_FILE = "pagamentos-0.0.1-SNAPSHOT.jar"
`$LOG_FILE = "application.log"

# Configurações
`$JAVA_OPTS = "-Xms512m -Xmx1024m -XX:+UseG1GC"
`$SPRING_PROFILES_ACTIVE = "prod"

Write-Host "Iniciando `$APP_NAME..." -ForegroundColor Green

# Iniciar aplicação
Start-Process java -ArgumentList "`$JAVA_OPTS", "-Dspring.profiles.active=`$SPRING_PROFILES_ACTIVE", "-jar", "`$JAR_FILE" -RedirectStandardOutput "`$LOG_FILE" -RedirectStandardError "`$LOG_FILE" -NoNewWindow

Write-Host "Aplicação iniciada!" -ForegroundColor Green
Write-Host "Logs: `$LOG_FILE" -ForegroundColor Cyan
"@

Set-Content -Path (Join-Path $DEPLOY_DIR "start.ps1") -Value $START_PS1 -Encoding UTF8

# Criar README de deploy
$README = @"
# 📦 DEPLOY - Sistema de Pagamentos

## 📋 Pré-requisitos

### Servidor Linux
- Java 21 ou superior
- PostgreSQL 14+
- Permissões de execução (chmod +x *.sh)

### Servidor Windows
- Java 21 ou superior
- PostgreSQL 14+
- PowerShell 5.0+

---

## 🗄️ Configuração do Banco de Dados

1. Instale o PostgreSQL
2. Crie o banco de dados:
   ```sql
   CREATE DATABASE "PAGAMENTOS1";
   ```

3. Execute o script SQL (se necessário):
   ```bash
   psql -U postgres -d PAGAMENTOS1 -f schema.sql
   ```

4. Configure as credenciais no arquivo `application-prod.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/PAGAMENTOS1
   spring.datasource.username=postgres
   spring.datasource.password=SUA_SENHA
   ```

---

## 🚀 Deploy em Linux

### Opção 1: Execução Direta
```bash
cd /opt/pagamentos
java -Xms512m -Xmx1024m -jar pagamentos-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

### Opção 2: Usando Scripts
```bash
# Dar permissão de execução
chmod +x start.sh stop.sh

# Iniciar
./start.sh

# Parar
./stop.sh

# Ver logs
tail -f application.log
```

### Opção 3: Como Serviço Systemd (Recomendado)
```bash
sudo nano /etc/systemd/system/pagamentos.service
```

Cole o conteúdo do arquivo `pagamentos.service` incluído nesta pasta.

```bash
# Recarregar systemd
sudo systemctl daemon-reload

# Habilitar e iniciar
sudo systemctl enable pagamentos
sudo systemctl start pagamentos

# Ver status
sudo systemctl status pagamentos

# Ver logs
sudo journalctl -u pagamentos -f
```

---

## 🚀 Deploy em Windows

### Opção 1: Execução Direta
```powershell
cd C:\pagamentos
java -Xms512m -Xmx1024m -jar pagamentos-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

### Opção 2: Usando Script PowerShell
```powershell
.\start.ps1
```

### Opção 3: Como Serviço Windows (NSSM)
1. Baixe NSSM: https://nssm.cc/
2. Instale o serviço:
   ```powershell
   nssm install Pagamentos
   # Path: C:\Program Files\Java\jdk-21\bin\java.exe
   # Arguments: -Xms512m -Xmx1024m -jar C:\pagamentos\pagamentos-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
   ```

---

## 🔧 Configurações Importantes

### Porta do Servidor
Edite `application-prod.properties`:
```properties
server.port=8080
```

### Acesso Externo
O servidor já está configurado para aceitar conexões externas:
```properties
server.address=0.0.0.0
```

### Diretório de Uploads
Configure o caminho absoluto:
```properties
app.upload.dir=/opt/pagamentos/uploads  # Linux
# ou
app.upload.dir=C:/pagamentos/uploads     # Windows
```

---

## 🔒 Segurança

### Variáveis de Ambiente (Recomendado)
Em vez de hardcoded no properties, use:

**Linux:**
```bash
export DB_PASSWORD=minha_senha_secreta
export JWT_SECRET=minha_chave_jwt_secreta
```

**Windows PowerShell:**
```powershell
`$env:DB_PASSWORD = "minha_senha_secreta"
`$env:JWT_SECRET = "minha_chave_jwt_secreta"
```

---

## 📊 Monitoramento

### Verificar se está rodando
```bash
# Linux
ps aux | grep pagamentos
curl http://localhost:8080/actuator/health

# Windows
Get-Process java
Invoke-WebRequest http://localhost:8080/actuator/health
```

### Logs
```bash
# Linux
tail -f application.log
journalctl -u pagamentos -f

# Windows
Get-Content application.log -Wait
```

---

## 🔄 Atualização

1. Pare a aplicação
2. Substitua o JAR pelo novo
3. Reinicie a aplicação

```bash
./stop.sh
cp pagamentos-0.0.1-SNAPSHOT.jar /opt/pagamentos/
./start.sh
```

---

## ❓ Troubleshooting

### Erro: Porta 8080 já em uso
```bash
# Linux
sudo lsof -i :8080
sudo kill -9 <PID>

# Windows
netstat -ano | findstr :8080
taskkill /F /PID <PID>
```

### Erro: Conexão com banco falhou
- Verifique se PostgreSQL está rodando
- Verifique credenciais no application-prod.properties
- Verifique firewall/portas

### Erro: Permissão negada
```bash
chmod +x start.sh stop.sh
chmod 755 pagamentos-0.0.1-SNAPSHOT.jar
```

---

## 📞 Suporte

Para dúvidas ou problemas, consulte os logs em `application.log`.
"@

Set-Content -Path (Join-Path $DEPLOY_DIR "README_DEPLOY.md") -Value $README -Encoding UTF8

# Criar arquivo de serviço systemd
$SERVICE_FILE = @"
[Unit]
Description=Sistema de Pagamentos
After=network.target postgresql.service

[Service]
Type=simple
User=pagamentos
Group=pagamentos
WorkingDirectory=/opt/pagamentos
ExecStart=/usr/bin/java -Xms512m -Xmx1024m -XX:+UseG1GC -Dspring.profiles.active=prod -jar /opt/pagamentos/pagamentos-0.0.1-SNAPSHOT.jar
Restart=on-failure
RestartSec=10
StandardOutput=append:/opt/pagamentos/application.log
StandardError=append:/opt/pagamentos/application-error.log

[Install]
WantedBy=multi-user.target
"@

Set-Content -Path (Join-Path $DEPLOY_DIR "pagamentos.service") -Value $SERVICE_FILE -Encoding UTF8

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DEPLOY PRONTO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Pasta de deploy criada: $DEPLOY_DIR" -ForegroundColor Cyan
Write-Host ""
Write-Host "Arquivos gerados:" -ForegroundColor Yellow
Write-Host "  ✓ pagamentos-0.0.1-SNAPSHOT.jar" -ForegroundColor Green
Write-Host "  ✓ start.sh (Linux)" -ForegroundColor Green
Write-Host "  ✓ stop.sh (Linux)" -ForegroundColor Green
Write-Host "  ✓ start.ps1 (Windows)" -ForegroundColor Green
Write-Host "  ✓ pagamentos.service (Systemd)" -ForegroundColor Green
Write-Host "  ✓ README_DEPLOY.md (Instruções)" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "  1. Copie a pasta 'deploy' para o servidor" -ForegroundColor White
Write-Host "  2. Configure o banco de dados PostgreSQL" -ForegroundColor White
Write-Host "  3. Edite application-prod.properties com as credenciais corretas" -ForegroundColor White
Write-Host "  4. Siga as instruções no README_DEPLOY.md" -ForegroundColor White
Write-Host ""
