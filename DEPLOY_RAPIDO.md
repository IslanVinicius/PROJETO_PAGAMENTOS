# 🚀 DEPLOY RÁPIDO - 10 MINUTOS

## Deploy Automatizado (Recomendado)

### 1. Preparar Servidor
```bash
# Instalar dependências básicas
sudo apt update
sudo apt install -y git curl wget

# Clonar repositório
cd /opt
sudo git clone https://github.com/seu-usuario/PROJETO_PAGAMENTOS.git
cd PROJETO_PAGAMENTOS
```

### 2. Executar Script de Deploy
```bash
# Tornar executável
chmod +x deploy.sh

# Executar (como root ou sudo)
sudo ./deploy.sh
```

**O script automaticamente:**
- ✅ Faz backup do banco
- ✅ Atualiza código
- ✅ Compila backend e frontend
- ✅ Reinicia serviços
- ✅ Executa health check

---

## Deploy Manual (Passo a Passo)

### Pré-requisitos
```bash
# Java 21
sudo apt install openjdk-21-jdk -y

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL 14
sudo apt install postgresql postgresql-contrib -y

# Nginx
sudo apt install nginx -y

# Maven
sudo apt install maven -y
```

### 1. Banco de Dados
```bash
# Importar schema
sudo -u postgres psql projeto_pagamentos < database/schema_completo.sql
```

### 2. Backend
```bash
# Configurar
nano src/main/resources/application-prod.properties

# Build
mvn clean package -DskipTests

# Rodar
java -jar target/pagamentos-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

### 3. Frontend
```bash
cd frontend

# Configurar
echo "VITE_API_URL=https://api.seudominio.com" > .env.production

# Build
npm install
npm run build
```

### 4. Nginx
```bash
# Copiar configs
sudo cp nginx/*.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/*.conf /etc/nginx/sites-enabled/

# Reload
sudo nginx -t && sudo systemctl reload nginx
```

---

## Verificar Deploy

```bash
# Backend
curl http://localhost:8080/api/actuator/health

# Frontend
curl http://localhost

# Logs
tail -f logs/*.log
```

---

## Próximos Passos

1. **Configurar SSL:** `sudo certbot --nginx`
2. **Configurar Backup:** `crontab -e` (ver DEPLOY_GUIA_COMPLETO.md)
3. **Monitorar:** `pm2 monit` ou `htop`

---

**Para detalhes completos, veja:** [DEPLOY_GUIA_COMPLETO.md](./DEPLOY_GUIA_COMPLETO.md)
