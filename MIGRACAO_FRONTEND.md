# Migração Frontend React - Arquitetura Producao

## Visao Geral

O frontend React foi migrado para ser servido como arquivos estaticos pelo Spring Boot, eliminando a dependencia de Node.js em producao.

## O que foi feito

### 1. Integracao Frontend-Backend
- Build do React (Vite) integrado ao processo de build do Maven
- Arquivos estaticos copiados automaticamente para `src/main/resources/static/`
- Configuracao SPA implementada para suportar React Router

### 2. Configuracoes Implementadas

#### Backend (Spring Boot)
- **SpaConfig.java**: Configuração para servir arquivos estáticos e fallback para SPA
- **SecurityConfig.java**: Atualizado para permitir acesso a arquivos estaticos
- CORS configurado para funcionar em mesmo dominio (producao) e dominios diferentes (desenvolvimento)

#### Frontend (React)
- **api.js**: Detecta automaticamente ambiente de producao vs desenvolvimento
- Em producao: usa caminho relativo `/api`
- Em desenvolvimento: usa `http://localhost:8080/api` ou variavel de ambiente

#### Build Automation (Maven)
- **frontend-maven-plugin**: Instala Node.js, executa npm install e npm run build
- **maven-resources-plugin**: Copia build para resources/static automaticamente

## Estrutura Final

```
PROJETO_PAGAMENTOS/
├── frontend/                    # Código fonte React
│   ├── src/
│   ├── dist/                   # Build gerado (não versionado)
│   └── package.json
├── src/main/resources/
│   └── static/                 # Arquivos estáticos do React (gerado automaticamente)
│       ├── index.html
│       ├── assets/
│       │   ├── index-*.js
│       │   └── index-*.css
│       └── *.png, *.ico, etc.
├── pom.xml                     # Configurado com plugins de build
└── MIGRACAO_FRONTEND.md        # Este arquivo
```

## Como Executar

### Desenvolvimento (com hot-reload)

**Opção 1: Frontend separado (recomendado para desenvolvimento)**
```bash
# Terminal 1 - Backend
cd PROJETO_PAGAMENTOS
mvn spring-boot:run

# Terminal 2 - Frontend
cd frontend
npm run dev
```
Acesse: http://localhost:5173

**Opção 2: Usando build integrado**
```bash
# Apenas backend (frontend embutido)
mvn clean package
java -jar target/pagamentos-0.0.1-SNAPSHOT.jar
```
Acesse: http://localhost:8080

### Build para Produção

```bash
# Build completo (frontend + backend)
mvn clean package
```

Isso automaticamente:
1. Instala Node.js e npm (se necessário)
2. Executa `npm install` no frontend
3. Executa `npm run build` 
4. Copia arquivos para `src/main/resources/static/`
5. Compila o backend
6. Gera JAR único em `target/`

### Produção

```bash
# Executar aplicação (sem necessidade de Node.js)
java -jar target/pagamentos-0.0.1-SNAPSHOT.jar
```

Acesse: http://localhost:8080

## Validações Realizadas

✅ Build do React gera arquivos otimizados  
✅ Arquivos estáticos são servidos corretamente  
✅ Rotas SPA funcionam (refresh não quebra)  
✅ Chamadas API usam caminho relativo em produção  
✅ CORS configurado corretamente  
✅ Build Maven automatizado  
✅ Aplicação roda sem Node.js instalado  

## Vantagens desta Arquitetura

1. **Zero dependência de Node.js em produção**
2. **Deploy simplificado** - apenas um JAR
3. **Mesmo domínio** - sem problemas de CORS em produção
4. **Performance** - arquivos estáticos otimizados e minificados
5. **Manutenção** - frontend e backend versionados juntos

## Considerações Importantes

### Variáveis de Ambiente
- Desenvolvimento: crie `.env` no frontend se precisar customizar API_URL
- Produção: sempre usa `/api` (caminho relativo)

### Desenvolvimento vs Produção
- **Desenvolvimento**: Frontend roda em porta separada (5173) com hot-reload
- **Produção**: Frontend é servido pelo Spring Boot na mesma porta (8080)

### Segurança
- Arquivos estáticos são públicos (login, assets)
- Rotas /api/** continuam protegidas por JWT
- SecurityConfig permite acesso a static files sem autenticação

## Troubleshooting

### Problema: Frontend não carrega após build
```bash
# Limpe e rebuild
mvn clean package
```

### Problema: Erro 404 ao atualizar página
Verifique se SpaConfig.java está configurado corretamente.

### Problema: API não responde
Verifique se as chamadas estão usando `/api` como prefixo.

### Desenvolvimento: Querer testar build de produção localmente
```bash
mvn clean package
java -jar target/pagamentos-0.0.1-SNAPSHOT.jar
# Acesse http://localhost:8080
```

## Próximos Passos (Opcional)

1. Configurar CDN para assets estáticos (se necessário)
2. Implementar cache control headers para assets
3. Adicionar compression (gzip/brotli) no Spring Boot
4. Configurar health check endpoint
5. Adicionar monitoring e logging

## Suporte

Para dúvidas ou problemas relacionados à migração, consulte:
- SpaConfig.java - Configuração SPA
- api.js - Configuração de endpoints
- pom.xml - Plugins de build
