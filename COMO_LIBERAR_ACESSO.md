# 🚀 Guia Rápido - Liberar Acesso na Rede

## ✅ O que foi feito:

1. **Backend configurado** para aceitar conexões externas (0.0.0.0:8080)
2. **Frontend configurado** para permitir acesso na rede (0.0.0.0:5173)
3. **CORS liberado** para todas as origens na rede local
4. **Variáveis de ambiente** criadas para configuração flexível

---

## 🔥 Como usar (RÁPIDO):

### 1️⃣ Executar o script de firewall (como Administrador):

```powershell
# Clique com botão direito no PowerShell > Executar como Administrador
cd C:\Users\islan.vinicius\Desktop\GIT\PROJETO_PAGAMENTOS
.\configurar-firewall.ps1
```

### 2️⃣ Iniciar o sistema:

**Terminal 1 - Backend:**
```bash
mvnw spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 3️⃣ Descobrir seu IP:

O próprio script já mostra! Ou execute:
```powershell
ipconfig
```
Procure por "Endereço IPv4" (ex: `192.168.1.100`)

### 4️⃣ Acessar de outros computadores:

- **Frontend**: `http://SEU_IP:5173`
- **Backend**: `http://SEU_IP:8080/api`

---

## 📝 Arquivos criados/modificados:

### Backend:
- ✅ `src/main/resources/application.properties` - Já tinha `server.address=0.0.0.0`
- ✅ `src/main/java/.../security/SecurityConfig.java` - CORS liberado para todas as origens
- ✅ Todos os controllers - Removidas restrições `@CrossOrigin` específicas

### Frontend:
- ✅ `frontend/vite.config.js` - Configurado para `host: '0.0.0.0'`
- ✅ `frontend/.env` - URL da API configurável
- ✅ `frontend/.env.production` - Configuração para produção
- ✅ `frontend/src/services/api.js` - Usa variável de ambiente
- ✅ `frontend/.gitignore` - Ignora arquivos .env

### Scripts:
- ✅ `configurar-firewall.ps1` - Script automático para liberar portas
- ✅ `CONFIGURACAO_REDE.md` - Documentação completa
- ✅ `COMO_LIBERAR_ACESSO.md` - Este guia rápido

---

## 🔧 Comandos úteis:

### Verificar portas liberadas:
```powershell
netstat -an | findstr "8080"
netstat -an | findstr "5173"
```

### Remover regras do firewall:
```powershell
Remove-NetFirewallRule -DisplayName "Pagamentos Backend"
Remove-NetFirewallRule -DisplayName "Pagamentos Frontend"
```

### Testar conexão (de outro PC):
```powershell
curl http://IP_DO_SERVIDOR:8080/api/empresa
```

---

## ⚠️ Importante:

- Todos os PCs devem estar na **mesma rede local**
- Execute o script do firewall **como Administrador**
- Para produção, use HTTPS e domínios específicos
- O arquivo `.env` não deve ser commitado no Git

---

## 🛡️ Segurança:

Em produção, altere no `SecurityConfig.java`:
```java
// Ao invés de addAllowedOriginPattern("*")
configuration.setAllowedOrigins(Arrays.asList(
    "https://seu-dominio.com",
    "http://192.168.1.100:5173"
));
```
