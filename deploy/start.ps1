# Script para iniciar a aplicaÃ§Ã£o em produÃ§Ã£o (Windows)

$APP_NAME = "pagamentos"
$JAR_FILE = "pagamentos-0.0.1-SNAPSHOT.jar"
$LOG_FILE = "application.log"

# ConfiguraÃ§Ãµes
$JAVA_OPTS = "-Xms512m -Xmx1024m -XX:+UseG1GC"
$SPRING_PROFILES_ACTIVE = "prod"

Write-Host "Iniciando $APP_NAME..." -ForegroundColor Green

# Iniciar aplicaÃ§Ã£o
Start-Process java -ArgumentList "$JAVA_OPTS", "-Dspring.profiles.active=$SPRING_PROFILES_ACTIVE", "-jar", "$JAR_FILE" -RedirectStandardOutput "$LOG_FILE" -RedirectStandardError "$LOG_FILE" -NoNewWindow

Write-Host "AplicaÃ§Ã£o iniciada!" -ForegroundColor Green
Write-Host "Logs: $LOG_FILE" -ForegroundColor Cyan
