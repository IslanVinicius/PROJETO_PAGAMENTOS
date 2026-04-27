# 🚀 GUIA COMPLETO DE DEPLOY - PROJETO PAGAMENTOS

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Servidor](#configuração-do-servidor)
3. [Banco de Dados](#banco-de-dados)
4. [Backend (Spring Boot)](#backend-spring-boot)
5. [Frontend (React + Vite)](#frontend-react--vite)
6. [Nginx (Proxy Reverso)](#nginx-proxy-reverso)
7. [SSL/HTTPS (Let's Encrypt)](#sslhttps-lets-encrypt)
8. [Process Manager (PM2/Systemd)](#process-manager)
9. [Manutenção e Monitoramento](#manutenção-e-monitoramento)
10. [Troubleshooting](#troubleshooting)

---

## 🔧 PRÉ-REQUISITOS

### Hardware Mínimo
- **CPU:** 2 cores
- **RAM:** 4GB (recomendado 8GB)
- **Storage:** 20GB SSD
- **SO:** Ubuntu 22.04 LTS / CentOS 8+ / Debian 11+

### Software Necessário
```bash
# Java
Java 21 JDK

# Node.js
Node.js 18+ ou 20+

# Banco de Dados
PostgreSQL 14+ ou 15+

# Web Server
Nginx 1.18+

# Build Tools
Maven 3.8+
npm 9+ ou yarn 1.22+

# Process Manager
PM2 ou Systemd
```

---

## 🖥️ CONFIGURAÇÃO DO SERVIDOR

### 1. Atualizar Sistema
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 2. Instalar Dependências
```bash
# Java 21
sudo apt install openjdk-21-jdk -y
java -version  # Verificar instalação

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v

# PostgreSQL 14
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Nginx
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# Maven
sudo apt install maven -y
mvn -version

# Git
sudo apt install git -y
```

### 3. Configurar Firewall
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
sudo ufw status
```

---

## 🗄️ BANCO DE DADOS

### 1. Acessar PostgreSQL
```bash
sudo -u postgres psql
```

### 2. Criar Database e Usuário
```sql
-- Executar o script schema_completo.sql
\i /caminho/para/schema_completo.sql

-- Ou manualmente:
CREATE DATABASE projeto_pagamentos;
CREATE USER app_pagamentos WITH PASSWORD 'SENHA_SEGURA_AQUI';
GRANT ALL PRIVILEGES ON DATABASE projeto_pagamentos TO app_pagamentos;
\c projeto_pagamentos
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_pagamentos;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_pagamentos;
\q
```

### 3. Importar Schema
```bash
sudo -u postgres psql projeto_pagamentos < /caminho/para/schema_completo.sql
```

### 4. Testar Conexão
```bash
psql -U app_pagamentos -d projeto_pagamentos -h localhost
\dt
\q
```

---

## ⚙️ BACKEND (SPRING BOOT)

### 1. Clonar Repositório
```bash
cd /opt
sudo git clone https://github.com/seu-usuario/PROJETO_PAGAMENTOS.git
cd PROJETO_PAGAMENTOS
sudo chown -R $USER:$USER .
```

### 2. Configurar application.properties
```bash
nano src/main/resources/application-prod.properties
```

**Conteúdo:**
```properties
# Server
server.port=8080
server.servlet.context-path=/api

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/projeto_pagamentos?useSSL=false&serverTimezone=UTC
spring.datasource.username=app_pagamentos
spring.datasource.password=SENHA_SEGURA_AQUI
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# JWT
jwt.secret=SUA_CHAVE_SECRETA_MUITO_LONGA_E_SEGURA_AQUI_MINIMO_256_BITS
jwt.expiration=86400000

# File Upload
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
app.upload-dir=./uploads

# Logging
logging.level.org.example.pagamentos=INFO
logging.file.name=./logs/pagamentos.log
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
```

### 3. Build do Projeto
```bash
# Limpar e compilar
mvn clean package -DskipTests

# O arquivo JAR será gerado em:
# target/pagamentos-0.0.1-SNAPSHOT.jar
```

### 4. Criar Diretórios Necessários
```bash
mkdir -p uploads/orcamentos
mkdir -p logs
```

### 5. Testar Localmente
```bash
java -jar target/pagamentos-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod

# Testar API
curl http://localhost:8080/api/actuator/health
```

---

## 🌐 FRONTEND (REACT + VITE)

### 1. Configurar Variáveis de Ambiente
```bash
cd /opt/PROJETO_PAGAMENTOS/frontend
nano .env.production
```

**Conteúdo:**
```env
VITE_API_URL=https://seudominio.com/api
```

### 2. Build de Produção
```bash
# Instalar dependências
npm install

# Build otimizado
npm run build

# Os arquivos estáticos estarão em:
# frontend/dist/
```

### 3. Testar Build Local
```bash
npm run preview
# Acesse: http://localhost:4173
```

---

## 🔄 NGINX (PROXY REVERSO)

### 1. Configurar Backend API
```bash
sudo nano /etc/nginx/sites-available/pagamentos-api
```

**Conteúdo:**
```nginx
server {
    listen 80;
    server_name api.seudominio.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # Logs
    access_log /var/log/nginx/pagamentos-api-access.log;
    error_log /var/log/nginx/pagamentos-api-error.log;
}
```

### 2. Configurar Frontend
```bash
sudo nano /etc/nginx/sites-available/pagamentos-frontend
```

**Conteúdo:**
```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;
    root /opt/PROJETO_PAGAMENTOS/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Static files cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logs
    access_log /var/log/nginx/pagamentos-frontend-access.log;
    error_log /var/log/nginx/pagamentos-frontend-error.log;
}
```

### 3. Habilitar Sites
```bash
sudo ln -s /etc/nginx/sites-available/pagamentos-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/pagamentos-frontend /etc/nginx/sites-enabled/

# Remover default
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🔒 SSL/HTTPS (LET'S ENCRYPT)

### 1. Instalar Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Gerar Certificados
```bash
# Backend API
sudo certbot --nginx -d api.seudominio.com

# Frontend
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
```

### 3. Auto-Renovação
```bash
# Testar renovação
sudo certbot renew --dry-run

# Agendar renovação automática (já configurado pelo certbot)
sudo systemctl status certbot.timer
```

---

## 🔄 PROCESS MANAGER

### Opção 1: PM2 (Recomendado)

#### 1. Instalar PM2
```bash
sudo npm install -g pm2
```

#### 2. Criar Ecosystem File
```bash
cd /opt/PROJETO_PAGAMENTOS
nano ecosystem.config.js
```

**Conteúdo:**
```javascript
module.exports = {
  apps: [{
    name: 'pagamentos-backend',
    script: 'target/pagamentos-0.0.1-SNAPSHOT.jar',
    interpreter: 'java',
    interpreter_args: '-jar',
    args: '--spring.profiles.active=prod',
    cwd: '/opt/PROJETO_PAGAMENTOS',
    
    // Environment
    env: {
      NODE_ENV: 'production',
      JAVA_OPTS: '-Xms512m -Xmx2g'
    },
    
    // Restart policy
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '2G',
    
    // Logging
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Advanced
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
};
```

#### 3. Iniciar Aplicação
```bash
pm2 start ecosystem.config.js

# Verificar status
pm2 status

# Ver logs
pm2 logs pagamentos-backend

# Salvar configuração para iniciar no boot
pm2 save
pm2 startup systemd
```

#### 4. Comandos Úteis PM2
```bash
pm2 stop pagamentos-backend      # Parar
pm2 restart pagamentos-backend   # Reiniciar
pm2 reload pagamentos-backend    # Reload sem downtime
pm2 delete pagamentos-backend    # Remover
pm2 monit                        # Monitorar em tempo real
```

### Opção 2: Systemd

#### 1. Criar Service File
```bash
sudo nano /etc/systemd/system/pagamentos.service
```

**Conteúdo:**
```ini
[Unit]
Description=Projeto Pagamentos Backend
After=syslog.target network.target mysql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/PROJETO_PAGAMENTOS
ExecStart=/usr/bin/java -Xms512m -Xmx2g -jar target/pagamentos-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
Restart=always
RestartSec=10

# Logging
StandardOutput=append:/opt/PROJETO_PAGAMENTOS/logs/app.log
StandardError=append:/opt/PROJETO_PAGAMENTOS/logs/error.log

# Security
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

#### 2. Habilitar e Iniciar
```bash
sudo systemctl daemon-reload
sudo systemctl enable pagamentos
sudo systemctl start pagamentos

# Verificar status
sudo systemctl status pagamentos

# Ver logs
sudo journalctl -u pagamentos -f
```

---

## 📊 MANUTENÇÃO E MONITORAMENTO

### 1. Backup Automático do Banco

#### Script de Backup
```bash
sudo nano /opt/scripts/backup-db.sh
```

**Conteúdo:**
```bash
#!/bin/bash

# Configurações
DB_USER="app_pagamentos"
DB_NAME="projeto_pagamentos"
BACKUP_DIR="/opt/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Criar diretório
mkdir -p $BACKUP_DIR

# Fazer backup
PGPASSWORD="SENHA_SEGURA_AQUI" pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Remover backups antigos
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup concluído: backup_$DATE.sql.gz"
```

```bash
sudo chmod +x /opt/scripts/backup-db.sh
```

#### Agendar com Cron
```bash
crontab -e

# Backup diário às 2h da manhã
0 2 * * * /opt/scripts/backup-db.sh >> /var/log/backup-db.log 2>&1
```

### 2. Monitoramento de Logs

#### Log Rotation
```bash
sudo nano /etc/logrotate.d/pagamentos
```

**Conteúdo:**
```
/opt/PROJETO_PAGAMENTOS/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 www-data www-data
    sharedscripts
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
    endscript
}
```

### 3. Health Check
```bash
# Criar endpoint de health check
curl https://api.seudominio.com/actuator/health

# Monitorar com cron
*/5 * * * * curl -sf https://api.seudominio.com/actuator/health || echo "ALERT: API down!" | mail -s "API Alert" admin@seudominio.com
```

### 4. Atualizações de Segurança
```bash
# Atualizar sistema semanalmente
sudo apt update && sudo apt upgrade -y

# Renovar certificados SSL
sudo certbot renew --quiet

# Reiniciar serviços após atualizações
sudo systemctl restart nginx
sudo systemctl restart mysql
pm2 restart all
```

---

## 🐛 TROUBLESHOOTING

### Problema: Backend não inicia
```bash
# Verificar logs
pm2 logs pagamentos-backend
# ou
sudo journalctl -u pagamentos -f

# Verificar porta em uso
sudo lsof -i :8080

# Verificar Java
java -version

# Verificar conexão com banco
psql -U app_pagamentos -d projeto_pagamentos -h localhost -c "SELECT 1;"
```

### Problema: Erro 502 Bad Gateway
```bash
# Verificar se backend está rodando
pm2 status
curl http://localhost:8080/api/actuator/health

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/pagamentos-api-error.log

# Testar configuração Nginx
sudo nginx -t
sudo systemctl restart nginx
```

### Problema: Frontend não carrega
```bash
# Verificar arquivos build
ls -la /opt/PROJETO_PAGAMENTOS/frontend/dist/

# Verificar permissões
sudo chown -R www-data:www-data /opt/PROJETO_PAGAMENTOS/frontend/dist

# Verificar logs Nginx
sudo tail -f /var/log/nginx/pagamentos-frontend-error.log
```

### Problema: Erro de conexão com banco
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar credenciais
psql -U app_pagamentos -d projeto_pagamentos -h localhost

# Verificar application.properties
cat src/main/resources/application-prod.properties | grep datasource

# Verificar logs do PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Problema: Upload de arquivos falha
```bash
# Verificar diretório uploads
ls -la /opt/PROJETO_PAGAMENTOS/uploads/
sudo chown -R www-data:www-data /opt/PROJETO_PAGAMENTOS/uploads

# Verificar permissões
chmod -R 755 /opt/PROJETO_PAGAMENTOS/uploads

# Verificar tamanho máximo no Nginx
sudo nano /etc/nginx/nginx.conf
# Adicionar: client_max_body_size 10M;
```

---

## 📈 OTIMIZAÇÕES DE PERFORMANCE

### 1. JVM Tuning
```bash
# No ecosystem.config.js ou service file
JAVA_OPTS='-Xms1g -Xmx4g -XX:+UseG1GC -XX:MaxGCPauseMillis=200'
```

### 2. PostgreSQL Optimization
```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
```

**Adicionar/Alterar:**
```ini
# Memory
shared_buffers = 2GB
effective_cache_size = 6GB
work_mem = 64MB
maintenance_work_mem = 512MB

# Connections
max_connections = 200

# WAL
wal_buffers = 16MB
checkpoint_completion_target = 0.9

# Query Planning
random_page_cost = 1.1
effective_io_concurrency = 200
```

```bash
sudo systemctl restart postgresql
```

### 3. Nginx Optimization
```bash
sudo nano /etc/nginx/nginx.conf
```

**Adicionar no http block:**
```nginx
worker_processes auto;
worker_connections 1024;

gzip on;
gzip_comp_level 6;
gzip_vary on;

open_file_cache max=10000 inactive=30s;
```

---

## ✅ CHECKLIST DE DEPLOY

- [ ] Servidor configurado (Ubuntu/CentOS)
- [ ] Firewall ativo (UFW)
- [ ] Java 21 instalado
- [ ] Node.js 20 instalado
- [ ] MySQL 8.0 instalado e configurado
- [ ] Database criada e schema importado
- [ ] Backend compilado (mvn package)
- [ ] application-prod.properties configurado
- [ ] Frontend buildado (npm run build)
- [ ] .env.production configurado
- [ ] Nginx instalado e configurado
- [ ] SSL/HTTPS configurado (Certbot)
- [ ] Process manager configurado (PM2 ou Systemd)
- [ ] Backups automáticos agendados
- [ ] Log rotation configurado
- [ ] Health checks funcionando
- [ ] Testes de carga realizados
- [ ] Documentação atualizada

---

## 🎯 COMANDOS RÁPIDOS

### Deploy Completo
```bash
# 1. Backend
cd /opt/PROJETO_PAGAMENTOS
git pull
mvn clean package -DskipTests
pm2 restart pagamentos-backend

# 2. Frontend
cd frontend
git pull
npm install
npm run build

# 3. Nginx
sudo systemctl reload nginx
```

### Monitoramento
```bash
# Status geral
pm2 status
sudo systemctl status nginx
sudo systemctl status mysql

# Logs em tempo real
pm2 logs
sudo tail -f /var/log/nginx/*.log

# Recursos do servidor
htop
df -h
free -h
```

### Backup Manual
```bash
/opt/scripts/backup-db.sh
```

---

## 📞 SUPORTE

Em caso de problemas:
1. Verifique os logs (`pm2 logs`, `journalctl`, `/var/log/nginx/`)
2. Consulte a documentação oficial (Spring Boot, React, Nginx, MySQL)
3. Verifique recursos do servidor (CPU, RAM, Disk)
4. Teste conectividade (ping, curl, telnet)

---

**Deploy realizado com sucesso! 🚀**

*Última atualização: 27/04/2026*
