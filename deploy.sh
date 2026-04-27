#!/bin/bash

# ============================================
# SCRIPT DE DEPLOY AUTOMATIZADO
# Projeto Pagamentos
# ============================================

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configurações
APP_DIR="/opt/PROJETO_PAGAMENTOS"
BACKUP_DIR="/opt/backups"
LOG_FILE="$APP_DIR/logs/deploy.log"

# Função de log
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a $LOG_FILE
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a $LOG_FILE
}

# Verificar se é root
if [ "$EUID" -ne 0 ]; then 
    error "Por favor execute como root ou com sudo"
fi

log "=========================================="
log "INICIANDO DEPLOY - PROJETO PAGAMENTOS"
log "=========================================="

# 1. Backup do banco de dados
log "1. Fazendo backup do banco de dados..."
mkdir -p $BACKUP_DIR/postgresql
DATE=$(date +%Y%m%d_%H%M%S)

PGPASSWORD="SENHA_SEGURA_AQUI" pg_dump -U app_pagamentos -h localhost projeto_pagamentos | gzip > $BACKUP_DIR/postgresql/backup_$DATE.sql.gz

if [ $? -eq 0 ]; then
    log "✓ Backup realizado: backup_$DATE.sql.gz"
else
    error "Falha no backup do banco de dados"
fi

# 2. Atualizar código do repositório
log "2. Atualizando código do repositório..."
cd $APP_DIR

git pull origin main || error "Falha ao atualizar repositório"

log "✓ Código atualizado"

# 3. Build do Backend
log "3. Compilando backend (Maven)..."
cd $APP_DIR

mvn clean package -DskipTests || error "Falha no build do backend"

log "✓ Backend compilado com sucesso"

# 4. Build do Frontend
log "4. Compilando frontend (Vite)..."
cd $APP_DIR/frontend

npm install || error "Falha ao instalar dependências do frontend"
npm run build || error "Falha no build do frontend"

log "✓ Frontend compilado com sucesso"

# 5. Configurar permissões
log "5. Configurando permissões..."
chown -R www-data:www-data $APP_DIR/frontend/dist
chmod -R 755 $APP_DIR/uploads

log "✓ Permissões configuradas"

# 6. Reiniciar serviços
log "6. Reiniciando serviços..."

# Backend (PM2)
if command -v pm2 &> /dev/null; then
    pm2 restart pagamentos-backend || warn "Falha ao reiniciar PM2"
    log "✓ Backend reiniciado (PM2)"
else
    # Systemd
    systemctl restart pagamentos || warn "Falha ao reiniciar systemd service"
    log "✓ Backend reiniciado (Systemd)"
fi

# Nginx
nginx -t && systemctl reload nginx || error "Falha ao recarregar Nginx"
log "✓ Nginx recarregado"

# 7. Health Check
log "7. Executando health check..."
sleep 5

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/actuator/health || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    log "✓ Backend está saudável (HTTP $HTTP_STATUS)"
else
    warn "Backend retornou HTTP $HTTP_STATUS - Verifique os logs"
fi

# 8. Limpeza
log "8. Limpando arquivos temporários..."

# Remover backups antigos (> 30 dias)
find $BACKUP_DIR/postgresql -name "backup_*.sql.gz" -mtime +30 -delete

# Limpar logs antigos
find $APP_DIR/logs -name "*.log" -mtime +30 -delete

log "✓ Limpeza concluída"

# Resumo
log "=========================================="
log "DEPLOY CONCLUÍDO COM SUCESSO!"
log "=========================================="
log ""
log "Informações:"
log "- Data: $(date)"
log "- Versão: $(git rev-parse --short HEAD)"
log "- Backup: backup_$DATE.sql.gz"
log ""
log "URLs:"
log "- Frontend: https://seudominio.com"
log "- API: https://api.seudominio.com"
log ""
log "Logs:"
log "- Backend: pm2 logs pagamentos-backend"
log "- Nginx: tail -f /var/log/nginx/*.log"
log "- App: tail -f $APP_DIR/logs/*.log"
log ""

exit 0
