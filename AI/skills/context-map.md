# Context Map - Mapa do Projeto

## 📍 Onde Fica Cada Coisa

Este documento serve como mapa de navegação do projeto. Use para encontrar rapidamente onde implementar algo.

---

## 🗂️ Estrutura Completa do Projeto

```
PROJETO_PAGAMENTOS/
├── src/main/java/org/example/pagamentos/
│   ├── DTO/                      # Data Transfer Objects
│   │   ├── OrcamentoDTO.java
│   │   ├── OrcamentoItemDTO.java
│   │   ├── OrcamentoCompletoDTO.java
│   │   ├── ItemDTO.java
│   │   ├── PrestadorDTO.java
│   │   ├── EmpresaDTO.java
│   │   ├── UsuarioDTO.java
│   │   └── ... (19 total)
│   │
│   ├── Enums/                    # Enumerações
│   │   ├── TipoUnitarioEnum.java
│   │   ├── StatusEnum.java
│   │   └── ... (4 total)
│   │
│   ├── config/                   # Configurações Spring
│   │   ├── SecurityConfig.java
│   │   └── CorsConfig.java
│   │
│   ├── controller/               # Controllers REST API
│   │   ├── AuthController.java           # /api/auth/*
│   │   ├── OrcamentoController.java      # /api/orcamento/*
│   │   ├── ItemController.java           # /api/item/*
│   │   ├── PrestadorController.java      # /api/prestador/*
│   │   ├── EmpresaController.java        # /api/empresa/*
│   │   ├── UsuarioController.java        # /api/usuario/*
│   │   └── ... (11 total)
│   │
│   ├── exception/                # Tratamento de exceções
│   │   ├── GlobalExceptionHandler.java
│   │   ├── ErrorResponse.java
│   │   └── AccessDeniedException.java
│   │
│   ├── model/                    # Entidades JPA
│   │   ├── OrcamentoModel.java
│   │   ├── OrcamentoItemModel.java
│   │   ├── ItemModel.java
│   │   ├── PrestadorModel.java
│   │   ├── EmpresaModel.java
│   │   ├── UsuarioModel.java
│   │   ├── EnderecoModel.java
│   │   ├── Dados_BancariosModel.java
│   │   ├── OrcamentoImagemModel.java
│   │   └── ... (13 total)
│   │
│   ├── repository/               # Repositórios JPA
│   │   ├── OrcamentoRepository.java
│   │   ├── ItemRepository.java
│   │   ├── PrestadorRepository.java
│   │   └── ... (13 total, 1 por entity)
│   │
│   ├── security/                 # JWT e segurança
│   │   ├── JwtAuthenticationFilter.java
│   │   ├── JwtTokenProvider.java
│   │   ├── AuthenticationUtil.java
│   │   └── UserDetailsServiceImpl.java
│   │
│   ├── service/                  # Lógica de negócio
│   │   ├── OrcamentoService.java
│   │   ├── ItemService.java
│   │   ├── PrestadorService.java
│   │   ├── AuthService.java
│   │   ├── PdfService.java              # Geração PDF
│   │   ├── FileUploadService.java       # Upload imagens
│   │   └── ... (12 total)
│   │
│   └── PagamentosApplication.java       # Main class
│
├── src/main/resources/
│   ├── application.properties           # Config dev
│   ├── application-prod.properties      # Config prod
│   ├── db/migration/                    # Migrações Flyway
│   │   ├── V1__create_initial_schema.sql
│   │   ├── V2__add_manual_items.sql
│   │   ├── V3__add_nome_manual_column.sql
│   │   └── ... (novas migrações aqui)
│   └── images/                          # Assets estáticos
│       └── logo.png
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Login.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── MainPage/               # Páginas CRUD principais
│   │   │   │   ├── MainPage.jsx
│   │   │   │   ├── OrcamentoCadastro.jsx
│   │   │   │   ├── OrcamentoCadastro-novo.module.css
│   │   │   │   ├── ItemCadastro.jsx
│   │   │   │   ├── PrestadorCadastro.jsx
│   │   │   │   ├── EmpresaCadastro.jsx
│   │   │   │   ├── UserCadastro.jsx
│   │   │   │   ├── EnderecoCadastro.jsx
│   │   │   │   ├── ModalPesquisa.jsx
│   │   │   │   ├── ModalPesquisaItens.jsx
│   │   │   │   └── ... (vários componentes)
│   │   │   │
│   │   │   ├── Shared/                 # Componentes reutilizáveis
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── ConfirmModal.jsx
│   │   │   │   ├── ApprovalModal.jsx
│   │   │   │   └── FormLayout.jsx
│   │   │   │
│   │   │   └── common/                 # Componentes comuns
│   │   │       ├── BarraPesquisa.jsx
│   │   │       ├── ResultadosPesquisa.jsx
│   │   │       └── index.js
│   │   │
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx         # Contexto de autenticação
│   │   │
│   │   ├── hooks/                      # Custom hooks
│   │   │   ├── useMensagemTemporaria.js
│   │   │   ├── usePesquisa.js
│   │   │   └── ...
│   │   │
│   │   ├── services/                   # Serviços API
│   │   │   ├── api.js                  # Axios configurado
│   │   │   ├── orcamentoService.js
│   │   │   ├── itemService.js
│   │   │   ├── prestadorService.js
│   │   │   ├── empresaService.js
│   │   │   ├── authService.js
│   │   │   └── ... (1 por entidade)
│   │   │
│   │   ├── routes/
│   │   │   └── PrivateRoute.jsx        # Proteção de rotas
│   │   │
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── formatters.js
│   │   │
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │   ├── variables.css
│   │   │   └── theme.css
│   │   │
│   │   ├── App.jsx                     # Componente raiz + rotas
│   │   └── main.jsx                    # Entry point React
│   │
│   ├── public/                         # Assets estáticos
│   │   ├── logo.png
│   │   └── iconeaba.ico
│   │
│   ├── .env                            # Variáveis ambiente dev
│   ├── .env.production                 # Variáveis ambiente prod
│   ├── vite.config.js                  # Config Vite
│   └── package.json
│
├── deploy/                             # Pasta gerada pelo build
│   ├── pagamentos-0.0.1-SNAPSHOT.jar
│   ├── application-prod.properties
│   ├── start.sh
│   └── README_DEPLOY.md
│
├── AI/skills/                          # Documentação para agents
│   ├── backend.md
│   ├── frontend.md
│   ├── padroes.md
│   └── context-map.md (este arquivo)
│
├── pom.xml                             # Maven config
├── build-deploy.ps1                    # Script build completo
└── README*.md                          # Documentações diversas
```

---

## 🎯 Onde Implementar O Quê

### Quero adicionar um NOVO CADASTRO (CRUD completo)

Siga esta ordem:

1. **Backend - Entity**
   - Arquivo: `src/main/java/org/example/pagamentos/model/NovoModel.java`
   - Exemplo: Ver `ItemModel.java`

2. **Backend - Repository**
   - Arquivo: `src/main/java/org/example/pagamentos/repository/NovoRepository.java`
   - Exemplo: Ver `ItemRepository.java`

3. **Backend - DTOs**
   - Arquivo: `src/main/java/org/example/pagamentos/DTO/NovoDTO.java`
   - Exemplo: Ver `ItemDTO.java`

4. **Backend - Service**
   - Arquivo: `src/main/java/org/example/pagamentos/service/NovoService.java`
   - Exemplo: Ver `ItemService.java`

5. **Backend - Controller**
   - Arquivo: `src/main/java/org/example/pagamentos/controller/NovoController.java`
   - Exemplo: Ver `ItemController.java`

6. **Banco - Migração**
   - Arquivo: `src/main/resources/db/migration/V{proximo}__create_novo_table.sql`
   - Exemplo: Ver `V1__create_initial_schema.sql`

7. **Frontend - Service API**
   - Arquivo: `frontend/src/services/novoService.js`
   - Exemplo: Ver `itemService.js`

8. **Frontend - Componente**
   - Arquivo: `frontend/src/components/MainPage/NovoCadastro.jsx`
   - Arquivo CSS: `frontend/src/components/MainPage/NovoCadastro.module.css`
   - Exemplo: Ver `ItemCadastro.jsx`

9. **Frontend - Rota**
   - Arquivo: `frontend/src/App.jsx`
   - Adicionar: `<Route path="novo" element={<NovoCadastro />} />`

---

### Quero modificar uma ENTIDADE existente

1. **Entity**: `src/main/java/org/example/pagamentos/model/XxxModel.java`
2. **DTO**: `src/main/java/org/example/pagamentos/DTO/XxxDTO.java`
3. **Migração**: `src/main/resources/db/migration/V{nova}__alter_xxx.sql`
4. **Service**: Atualizar mapeamento em `XxxService.toDTO()`
5. **Frontend**: Atualizar componente correspondente

**Exemplo real**: Adicionar campo `nomeManual` em itens
- Modificado: `OrcamentoItemModel.java`
- Modificado: `OrcamentoItemDTO.java`
- Criado: `V3__add_nome_manual_column.sql`
- Modificado: `OrcamentoService.toDTO()`
- Modificado: `OrcamentoCadastro.jsx`

---

### Quero adicionar um ENDPOINT novo em recurso existente

1. **Controller**: Adicionar método em `XxxController.java`
2. **Service**: Adicionar lógica em `XxxService.java`
3. **Frontend Service**: Adicionar função em `xxxService.js`
4. **Frontend Component**: Chamar novo endpoint

**Exemplo**: Adicionar endpoint para aprovar orçamento
```java
// OrcamentoController.java
@PutMapping("/{id}/aprovar")
public ResponseEntity<Void> aprovar(@PathVariable Long id) {
    orcamentoService.aprovar(id);
    return ResponseEntity.ok().build();
}

// OrcamentoService.java
@Transactional
public void aprovar(Long id) {
    OrcamentoModel orcamento = repository.findById(id)...;
    orcamento.setStatus(StatusEnum.APROVADO);
    repository.save(orcamento);
}

// orcamentoService.js (frontend)
aprovar: async (id) => {
    await api.put(`/orcamento/${id}/aprovar`);
}
```

---

### Quero modificar a INTERFACE (UI/UX)

1. **Componente principal**: `frontend/src/components/MainPage/XxxCadastro.jsx`
2. **Estilos**: `frontend/src/components/MainPage/XxxCadastro.module.css`
3. **Componentes compartilhados**: `frontend/src/components/Shared/`
4. **Variáveis globais**: `frontend/src/styles/variables.css`

**Exemplo**: Mudar cor do botão salvar
```css
/* OrcamentoCadastro-novo.module.css */
.btnSave {
    background: linear-gradient(135deg, var(--success) 0%, #2d8645 100%);
}
```

---

### Quero adicionar VALIDAÇÃO nova

**Backend**:
- Arquivo: `XxxService.java` no método `salvar()` ou `atualizar()`
- Exemplo: Ver validações em `OrcamentoService.salvar()`

**Frontend**:
- Arquivo: `XxxCadastro.jsx` na função `handleSalvar()`
- Exemplo: Ver validações em `OrcamentoCadastro.handleSave()`

---

### Quero alterar AUTENTICAÇÃO/PERMISSÕES

1. **Security Config**: `src/main/java/org/example/pagamentos/config/SecurityConfig.java`
2. **JWT Provider**: `src/main/java/org/example/pagamentos/security/JwtTokenProvider.java`
3. **Auth Util**: `src/main/java/org/example/pagamentos/security/AuthenticationUtil.java`
4. **Frontend Auth**: `frontend/src/contexts/AuthContext.jsx`

---

### Quero gerar PDF diferente

1. **Service PDF**: `src/main/java/org/example/pagamentos/service/PdfService.java`
2. **Controller**: `OrcamentoController.gerarPdf()`
3. **Frontend**: Botão em `OrcamentoCadastro.jsx` chama endpoint

---

### Quero adicionar UPLOAD de arquivo

1. **Service Upload**: `src/main/java/org/example/pagamentos/service/FileUploadService.java`
2. **Model**: `OrcamentoImagemModel.java` (exemplo)
3. **Controller**: Endpoint em `OrcamentoController.uploadImagem()`
4. **Frontend**: Input file em componente + chamada API

---

## 📖 Exemplos Reais de Implementação

### Exemplo 1: Adicionar Campo Novo (nomeManual)

**Problema**: Itens manuais precisam ter nome personalizado persistido

**Arquivos modificados** (em ordem):

1. `src/main/java/org/example/pagamentos/model/OrcamentoItemModel.java`
   ```java
   @Column(name = "NOME_MANUAL", length = 200)
   private String nomeManual;
   ```

2. `src/main/java/org/example/pagamentos/DTO/OrcamentoItemDTO.java`
   ```java
   private String nomeManual;
   ```

3. `src/main/resources/db/migration/V3__add_nome_manual_column.sql`
   ```sql
   ALTER TABLE ORCAMENTO_ITENS ADD COLUMN NOME_MANUAL VARCHAR(200);
   ```

4. `src/main/java/org/example/pagamentos/service/OrcamentoService.java`
   - Método `salvar()`: Adicionar `setNomeManual()`
   - Método `toDTO()`: Adicionar `getNomeManual()`

5. `frontend/src/components/MainPage/OrcamentoCadastro.jsx`
   - Estado `itemManual.nome`
   - Função `handleAdicionarItemManual()` inclui `nomeManual`
   - `handleSave()` envia `nomeManual` no JSON

**Lição**: Mudança simples requer alteração em 5+ arquivos

---

### Exemplo 2: Corrigir Bug de Modal Transparente

**Problema**: Modal de item manual aparecia transparente

**Causa**: Classes CSS não existiam no arquivo correto

**Arquivo modificado**:
- `frontend/src/components/MainPage/OrcamentoCadastro-novo.module.css`

**Adicionado**:
```css
.modalOverlay { position: fixed; background-color: rgba(0,0,0,0.5); }
.modalContent { background-color: white; }
.modalBody input { background-color: white !important; }
```

**Lição**: CSS Modules exigem classes no arquivo `.module.css` correto

---

### Exemplo 3: Suportar Itens Manuais e Cadastrados

**Problema**: Mesma tabela precisa suportar dois tipos de itens

**Solução**: Campos nullable + lógica condicional

**Arquivos modificados**:
1. `OrcamentoItemModel.java` - Tornar ITEM_ID nullable
2. `OrcamentoService.java` - If/else para tipos diferentes
3. `OrcamentoCompletoDTO.java` - Verificar null em getItem()
4. `PdfService.java` - Usar nomeManual se item for null
5. `OrcamentoCadastro.jsx` - Dois botões diferentes

**Lição**: Nullable fields permitem flexibilidade sem duplicar tabelas

---

## 🔍 Como Encontrar Coisas Rapidamente

### Preciso ver como algo funciona?

1. **Buscar por palavra-chave**:
   ```bash
   # No VS Code: Ctrl+Shift+F
   # Buscar: "precoMedio"
   ```

2. **Ver entity relacionada**:
   - Entities estão em `src/main/java/org/example/pagamentos/model/`
   - Nome padrão: `XxxModel.java`

3. **Ver endpoints disponíveis**:
   - Controllers em `src/main/java/org/example/pagamentos/controller/`
   - Buscar por `@RequestMapping` ou `@GetMapping`

4. **Ver serviços**:
   - Services em `src/main/java/org/example/pagamentos/service/`
   - Nome padrão: `XxxService.java`

5. **Ver componentes frontend**:
   - Components em `frontend/src/components/MainPage/`
   - Buscar por nome da funcionalidade

---

### Preciso debugar algo?

1. **Backend logs**:
   ```bash
   # Executar com logs detalhados
   .\mvnw.cmd spring-boot:run
   
   # Ver arquivo de log (se configurado)
   tail -f logs/application.log
   ```

2. **Frontend console**:
   - Abrir DevTools (F12)
   - Aba Console
   - Procurar por `console.log`, `console.error`

3. **Network requests**:
   - DevTools → Network
   - Filtrar por XHR/Fetch
   - Ver request/response

4. **Banco de dados**:
   ```sql
   -- Ver últimos orçamentos
   SELECT * FROM ORCAMENTOS ORDER BY DATA_CRIACAO DESC LIMIT 10;
   
   -- Ver itens manuais
   SELECT * FROM ORCAMENTO_ITENS WHERE ITEM_ID IS NULL;
   ```

---

## 📌 Pontos de Atenção Críticos

### 1. Itens Manuais vs Cadastrados
**Sempre verificar null antes de acessar ItemModel**
```java
if (item.getItem() != null) {
    // Item cadastrado
} else {
    // Item manual - usar campos *Manual
}
```

**Arquivos relacionados**:
- `OrcamentoItemModel.java`
- `OrcamentoService.java` (métodos salvar, toDTO)
- `OrcamentoCompletoDTO.java` (fromModel)
- `PdfService.java` (adicionarItens)

---

### 2. Autenticação JWT
**Token expira em 24 horas**

**Arquivos relacionados**:
- `JwtTokenProvider.java` - Geração e validação
- `AuthenticationUtil.java` - Obter usuário logado
- `AuthContext.jsx` - Frontend auth state
- `PrivateRoute.jsx` - Proteção de rotas

---

### 3. Permissões por Role
**ADMIN/EXPANSAO veem tudo, USER vê apenas seus**

**Padrão em todos os services**:
```java
if (!authenticationUtil.hasFullDataAccess() && 
    !recurso.getUsuarioCriador().equals(usuarioLogado)) {
    throw new AccessDeniedException("Sem permissão");
}
```

---

### 4. Migrações Flyway
**NUNCA modificar migrações já executadas**

**Local**: `src/main/resources/db/migration/`
**Padrão**: `V{numero}__{descricao}.sql`
**Próxima versão**: Ver último arquivo e incrementar

---

### 5. CSS Modules
**TODO estilo deve estar no arquivo .module.css correto**

Se classe não existe → elemento fica sem estilo ou transparente

**Local**: Mesmo diretório do componente JSX
**Import**: `import styles from './Component.module.css'`
**Uso**: `className={styles.minhaClasse}`

---

## 🚀 Comandos Rápidos

```bash
# Backend
.\mvnw.cmd clean package          # Build
.\mvnw.cmd spring-boot:run        # Executar
.\mvnw.cmd test                   # Testes

# Frontend
cd frontend
npm run dev                       # Dev server
npm run build                     # Build prod
npm run lint                      # Lint check

# Deploy
.\build-deploy.ps1                # Build + prepare deploy
```

---

**Última atualização**: 2026-05-01  
**Versão**: 2.0

Este arquivo deve ser atualizado sempre que nova estrutura ou padrão for adicionado ao projeto.
