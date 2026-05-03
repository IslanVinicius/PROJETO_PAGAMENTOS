#!/bin/bash
# Script para iniciar a aplicaÃ§Ã£o em produÃ§Ã£o

APP_NAME="pagamentos"
JAR_FILE="pagamentos-0.0.1-SNAPSHOT.jar"
LOG_FILE="application.log"
PID_FILE="application.pid"

# ConfiguraÃ§Ãµes
JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC"
SPRING_PROFILES_ACTIVE="prod"

echo "Iniciando \..."

# Iniciar em background
nohup java \ \
    -Dspring.profiles.active=\ \
    -jar \pagamentos-0.0.1-SNAPSHOT.jar > \ 2>&1 &

# Salvar PID
echo \$! > \

echo "AplicaÃ§Ã£o iniciada com PID: \$!"
echo "Logs: \"
