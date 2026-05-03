# 🚀 GUIA RÁPIDO DE DEPLOY

## ✅ Checklist de Preparação

### 1. Configurar Banco de Dados
- [ ] Instalar PostgreSQL no servidor
- [ ] Criar banco de dados `PAGAMENTOS1`
- [ ] Criar usuário e definir senha
- [ ] Executar script SQL (se necessário)

### 2. Configurar Backend
- [ ] Editar `src/main/resources/application-prod.properties`:
  - [ ] URL do banco de dados
  - [ ] Usuário e senha do banco
  - [ ] Porta do servidor (padrão: 8080)
  - [ ] Diretório de uploads

### 3. Configurar Frontend
- [ ] Editar `frontend/.env.production`:
  - [ ] Definir `VITE_API_URL=/api` (mesmo servidor)
  - [ ] OU `VITE_API_URL=http://IP_DO_SERVIDOR:8080/api` (servidores separados)

---

## 📦 Gerar Pacote de Deploy

Execute na raiz do projeto:

```powershell
.\build-deploy.ps1
```

Isso vai criar a pasta `deploy/` com:
- ✓ JAR da aplicação
- ✓ Scripts de inicialização (Linux e Windows)
- ✓ Arquivo de serviço systemd
- ✓ README completo

---

## 🖥️ Deploy em Linux

### Método 1: Execução Direta (Simples)

```bash
# 1. Copiar arquivos para o servidor
scp -r deploy/* usuario@servidor:/opt/pagamentos/

# 2. Acessar o servidor
ssh usuario@servidor

# 3. Dar permissões
cd /opt/pagamentos
chmod +x start.sh stop.sh

# 4. Iniciar
./start.sh

# 5. Ver logs
tail -f application.log
```

### Método 2: Como Serviço Systemd (Recomendado)

```bash
# 1. Copiar arquivos
sudo cp pagamentos.service /etc/systemd/system/
sudo cp pagamentos-0.0.1-SNAPSHOT.jar /opt/pagamentos/

# 2. Criar usuário dedicado
sudo useradd -r -s /bin/false pagamentos
sudo chown -R pagamentos:pagamentos /opt/pagamentos

# 3. Habilitar e iniciar
sudo systemctl daemon-reload
sudo systemctl enable pagamentos
sudo systemctl start pagamentos

# 4. Verificar status
sudo systemctl status pagamentos

# 5. Ver logs
sudo journalctl -u pagamentos -f
```

---

## 🖥️ Deploy em Windows

### Método 1: Execução Direta

```powershell
# 1. Copiar pasta deploy para C:\pagamentos

# 2. Abrir PowerShell como Administrador
cd C:\pagamentos

# 3. Iniciar
.\start.ps1
```

### Método 2: Como Serviço Windows (NSSM)

```powershell
# 1. Baixar NSSM: https://nssm.cc/

# 2. Instalar serviço
nssm install Pagamentos
# Path: C:\Program Files\Java\jdk-21\bin\java.exe
# Arguments: -Xms512m -Xmx1024m -Dspring.profiles.active=prod -jar C:\pagamentos\pagamentos-0.0.1-SNAPSHOT.jar

# 3. Iniciar serviço
net start Pagamentos
```

---

## 🔧 Configurações Importantes

### Firewall

**Linux (UFW):**
```bash
sudo ufw allow 8080/tcp
sudo ufw reload
```

**Windows:**
```powershell
New-NetFirewallRule -DisplayName "Pagamentos App" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
```

### HTTPS (Produção)

Use Nginx como reverse proxy:

```nginx
server {
    listen 443 ssl;
    server_name seu-dominio.com;

    ssl_certificate /etc/ssl/certs/seu-cert.pem;
    ssl_certificate_key /etc/ssl/private/seu-key.key;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🧪 Testes Pós-Deploy

```bash
# 1. Verificar se está rodando
curl http://localhost:8080/

# 2. Testar API
curl http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"senha"}'

# 3. Verificar logs
tail -f application.log
```

---

## 🔄 Atualização

```bash
# 1. Parar aplicação
./stop.sh  # ou sudo systemctl stop pagamentos

# 2. Backup do JAR antigo
mv pagamentos-0.0.1-SNAPSHOT.jar pagamentos-old.jar

# 3. Copiar novo JAR
cp /caminho/do/novo/pagamentos-0.0.1-SNAPSHOT.jar .

# 4. Reiniciar
./start.sh  # ou sudo systemctl start pagamentos

# 5. Verificar
tail -f application.log
```

---

## ❓ Troubleshooting

### Erro: "Port 8080 already in use"
```bash
# Encontrar processo
sudo lsof -i :8080

# Matar processo
sudo kill -9 <PID>
```

### Erro: "Connection refused to database"
- Verifique se PostgreSQL está rodando
- Verifique credenciais no `application-prod.properties`
- Verifique se o banco existe

### Erro: "Permission denied"
```bash
chmod +x start.sh stop.sh
chmod 755 pagamentos-0.0.1-SNAPSHOT.jar
```

### Logs não aparecem
```bash
# Verificar permissões
ls -la application.log

# Corrigir
touch application.log
chmod 666 application.log
```

---

## 📊 Monitoramento Básico

```bash
# Uso de memória
ps aux | grep java

# Uso de CPU
top -p $(pgrep -f pagamentos)

# Espaço em disco
df -h /opt/pagamentos

# Tamanho dos logs
du -sh /opt/pagamentos/*.log
```

---

## 🔒 Segurança

### Variáveis de Ambiente (Recomendado)

Crie arquivo `.env` no servidor:
```bash
export DB_PASSWORD=sua_senha_secreta
export JWT_SECRET=sua_chave_jwt_muito_longa_e_segura
```

Carregue antes de iniciar:
```bash
source .env
./start.sh
```

### Não Comitar Senhas!
- Nunca commite senhas no Git
- Use variáveis de ambiente
- Use gerenciadores de segredos (Vault, AWS Secrets Manager)

---

## 📞 Suporte

Para problemas, verifique:
1. Logs da aplicação: `application.log`
2. Logs do sistema: `journalctl -u pagamentos`
3. Status do PostgreSQL: `systemctl status postgresql`
4. Conectividade: `ping`, `telnet localhost 5432`
