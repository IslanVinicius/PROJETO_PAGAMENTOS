# ðŸ“¦ DEPLOY - Sistema de Pagamentos

## ðŸ“‹ PrÃ©-requisitos

### Servidor Linux
- Java 21 ou superior
- PostgreSQL 14+
- PermissÃµes de execuÃ§Ã£o (chmod +x *.sh)

### Servidor Windows
- Java 21 ou superior
- PostgreSQL 14+
- PowerShell 5.0+

---

## ðŸ—„ï¸ ConfiguraÃ§Ã£o do Banco de Dados

1. Instale o PostgreSQL
2. Crie o banco de dados:
   `sql
   CREATE DATABASE "PAGAMENTOS1";
   `

3. Execute o script SQL (se necessÃ¡rio):
   `ash
   psql -U postgres -d PAGAMENTOS1 -f schema.sql
   `

4. Configure as credenciais no arquivo pplication-prod.properties:
   `properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/PAGAMENTOS1
   spring.datasource.username=postgres
   spring.datasource.password=SUA_SENHA
   `

---

## ðŸš€ Deploy em Linux

### OpÃ§Ã£o 1: ExecuÃ§Ã£o Direta
`ash
cd /opt/pagamentos
java -Xms512m -Xmx1024m -jar pagamentos-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
`

### OpÃ§Ã£o 2: Usando Scripts
`ash
# Dar permissÃ£o de execuÃ§Ã£o
chmod +x start.sh stop.sh

# Iniciar
./start.sh

# Parar
./stop.sh

# Ver logs
tail -f application.log
`

### OpÃ§Ã£o 3: Como ServiÃ§o Systemd (Recomendado)
`ash
sudo nano /etc/systemd/system/pagamentos.service
`

Cole o conteÃºdo do arquivo pagamentos.service incluÃ­do nesta pasta.

`ash
# Recarregar systemd
sudo systemctl daemon-reload

# Habilitar e iniciar
sudo systemctl enable pagamentos
sudo systemctl start pagamentos

# Ver status
sudo systemctl status pagamentos

# Ver logs
sudo journalctl -u pagamentos -f
`

---

## ðŸš€ Deploy em Windows

### OpÃ§Ã£o 1: ExecuÃ§Ã£o Direta
`powershell
cd C:\pagamentos
java -Xms512m -Xmx1024m -jar pagamentos-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
`

### OpÃ§Ã£o 2: Usando Script PowerShell
`powershell
.\start.ps1
`

### OpÃ§Ã£o 3: Como ServiÃ§o Windows (NSSM)
1. Baixe NSSM: https://nssm.cc/
2. Instale o serviÃ§o:
   `powershell
   nssm install Pagamentos
   # Path: C:\Program Files\Java\jdk-21\bin\java.exe
   # Arguments: -Xms512m -Xmx1024m -jar C:\pagamentos\pagamentos-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
   `

---

## ðŸ”§ ConfiguraÃ§Ãµes Importantes

### Porta do Servidor
Edite pplication-prod.properties:
`properties
server.port=8080
`

### Acesso Externo
O servidor jÃ¡ estÃ¡ configurado para aceitar conexÃµes externas:
`properties
server.address=0.0.0.0
`

### DiretÃ³rio de Uploads
Configure o caminho absoluto:
`properties
app.upload.dir=/opt/pagamentos/uploads  # Linux
# ou
app.upload.dir=C:/pagamentos/uploads     # Windows
`

---

## ðŸ”’ SeguranÃ§a

### VariÃ¡veis de Ambiente (Recomendado)
Em vez de hardcoded no properties, use:

**Linux:**
`ash
export DB_PASSWORD=minha_senha_secreta
export JWT_SECRET=minha_chave_jwt_secreta
`

**Windows PowerShell:**
`powershell
$env:DB_PASSWORD = "minha_senha_secreta"
$env:JWT_SECRET = "minha_chave_jwt_secreta"
`

---

## ðŸ“Š Monitoramento

### Verificar se estÃ¡ rodando
`ash
# Linux
ps aux | grep pagamentos
curl http://localhost:8080/actuator/health

# Windows
Get-Process java
Invoke-WebRequest http://localhost:8080/actuator/health
`

### Logs
`ash
# Linux
tail -f application.log
journalctl -u pagamentos -f

# Windows
Get-Content application.log -Wait
`

---

## ðŸ”„ AtualizaÃ§Ã£o

1. Pare a aplicaÃ§Ã£o
2. Substitua o JAR pelo novo
3. Reinicie a aplicaÃ§Ã£o

`ash
./stop.sh
cp pagamentos-0.0.1-SNAPSHOT.jar /opt/pagamentos/
./start.sh
`

---

## â“ Troubleshooting

### Erro: Porta 8080 jÃ¡ em uso
`ash
# Linux
sudo lsof -i :8080
sudo kill -9 <PID>

# Windows
netstat -ano | findstr :8080
taskkill /F /PID <PID>
`

### Erro: ConexÃ£o com banco falhou
- Verifique se PostgreSQL estÃ¡ rodando
- Verifique credenciais no application-prod.properties
- Verifique firewall/portas

### Erro: PermissÃ£o negada
`ash
chmod +x start.sh stop.sh
chmod 755 pagamentos-0.0.1-SNAPSHOT.jar
`

---

## ðŸ“ž Suporte

Para dÃºvidas ou problemas, consulte os logs em pplication.log.
