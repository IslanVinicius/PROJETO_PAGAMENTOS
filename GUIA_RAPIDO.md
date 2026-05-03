# Guia Rápido - Comandos Essenciais

## Desenvolvimento

### Opção 1: Frontend com Hot-Reload (Recomendado)
```bash
# Terminal 1 - Backend
mvnw.cmd spring-boot:run

# Terminal 2 - Frontend
cd frontend
npm run dev
```
Acesse: http://localhost:5173

### Opção 2: Build Integrado
```bash
mvnw.cmd clean package
java -jar target\pagamentos-0.0.1-SNAPSHOT.jar
```
Acesse: http://localhost:8080

---

## Produção

### Build
```bash
mvnw.cmd clean package
```

### Executar
```bash
java -jar target\pagamentos-0.0.1-SNAPSHOT.jar
```

Acesse: http://localhost:8080

**Nota**: Não requer Node.js instalado!

---

## Limpeza

### Remover builds antigos
```bash
mvnw.cmd clean
```

### Rebuild completo
```bash
mvnw.cmd clean package
```

---

## Verificações

### Testar frontend
```powershell
curl http://localhost:8080/
```

### Testar API
```powershell
curl http://localhost:8080/api/auth/login -Method POST -ContentType "application/json" -Body '{"username":"test","password":"test"}'
```

### Verificar assets
```powershell
curl http://localhost:8080/assets/index-*.js
```

---

## Estrutura de Pastas

```
PROJETO_PAGAMENTOS/
├── frontend/              # Código React (desenvolvimento)
├── src/main/resources/static/  # Build React (produção)
├── target/                # JAR compilado
└── pom.xml               # Configuração Maven
```

---

## Problemas Comuns

| Problema | Solução |
|----------|---------|
| Frontend não carrega | `mvnw.cmd clean package` |
| Erro 404 em rotas | Verifique SpaConfig.java |
| API não responde | Verifique autenticação JWT |
| Porta em uso | Altere `server.port` em application.properties |

---

## Arquivos Importantes

- **SpaConfig.java** - Configuração SPA fallback
- **SecurityConfig.java** - Segurança e CORS
- **api.js** - Configuração de endpoints da API
- **pom.xml** - Plugins de build automatizado

---

## Logs Úteis

Procure por estas mensagens no startup:
```
Adding welcome page: class path resource [static/index.html]
Tomcat started on port 8080 (http)
Started PagamentosApplication in X seconds
```

---

Para documentação completa, consulte:
- `MIGRACAO_FRONTEND.md` - Detalhes técnicos
- `RESUMO_MIGRACAO.md` - Resumo da migração
