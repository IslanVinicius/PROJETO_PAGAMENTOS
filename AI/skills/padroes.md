# Padrões Arquiteturais e Regras Globais

## 📋 Visão Geral
Padrões arquiteturais, convenções e regras que se aplicam a TODO o projeto Pagamentos.

---

## 🏗️ Padrões Arquiteturais Fundamentais

### 1. Controller → Service → Repository

**Fluxo obrigatório para TODAS as operações**

```
Request HTTP 
    ↓
Controller (validação básica, mapeamento)
    ↓
Service (lógica de negócio, transações, permissões)
    ↓
Repository (acesso a dados JPA)
    ↓
Banco de Dados
```

**Por quê?**: Separação de responsabilidades, testabilidade, manutenibilidade

**Exemplo:**
```java
// Controller - THIN
@PostMapping
public ResponseEntity<OrcamentoDTO> criar(@RequestBody OrcamentoDTO dto) {
    OrcamentoDTO criado = orcamentoService.salvar(dto);
    return ResponseEntity.ok(criado);
}

// Service - LÓGICA DE NEGÓCIO
@Transactional
public OrcamentoDTO salvar(OrcamentoDTO dto) {
    // Verificar permissão
    var usuario = authenticationUtil.getUsuarioAutenticado();
    
    // Validar
    if (dto.getValor() < 0) throw new RuntimeException("Valor inválido");
    
    // Converter DTO → Entity
    OrcamentoModel model = toModel(dto);
    
    // Salvar
    OrcamentoModel salvo = repository.save(model);
    
    // Atualizar preço médio (lógica de negócio)
    atualizarPrecosMedios(salvo);
    
    // Converter Entity → DTO
    return toDTO(salvo);
}

// Repository - ACESSO A DADOS
@Repository
public interface OrcamentoRepository extends JpaRepository<OrcamentoModel, Long> {
    List<OrcamentoModel> findByUsuarioCriador(Usuario usuario);
}
```

---

### 2. DTO Pattern

**NUNCA exponha Entities diretamente na API**

```java
// ERRADO ❌
@GetMapping
public List<OrcamentoModel> listar() {
    return repository.findAll();
}

// CERTO ✅
@GetMapping
public List<OrcamentoDTO> listar() {
    return repository.findAll().stream()
        .map(this::toDTO)
        .collect(Collectors.toList());
}
```

**Por quê?**: Controle sobre o que é exposto, versionamento de API, segurança

**Tipos de DTO:**
- **XxxDTO**: Para operações CRUD básicas
- **XxxCompletoDTO**: Com objetos aninhados completos
- **XxxFiltroDTO**: Para filtros complexos (POST body)

---

### 3. CSS Modules

**TODO estilo deve ter escopo local**

```jsx
// ERRADO ❌
import './styles.css';
<div className="minha-classe">

// CERTO ✅
import styles from './Component.module.css';
<div className={styles.minhaClasse}>
```

**Por quê?**: Evita conflitos de nomes, encapsulamento, manutenção fácil

---

## 🔐 Fluxos Críticos do Sistema

### Fluxo 1: Autenticação JWT

```
1. Frontend: Login form → POST /api/auth/login
2. Backend: Valida credenciais → Gera JWT token (24h)
3. Frontend: Armazena token em localStorage
4. Frontend: Cada request inclui header Authorization: Bearer <token>
5. Backend: JwtAuthenticationFilter valida token
6. Backend: AuthenticationUtil extrai usuário logado
7. Backend: Verifica permissões (ADMIN/EXPANSAO/USER)
```

**Pontos de atenção:**
- Token expira em 24 horas
- Rotas protegidas usam `PrivateRoute`
- Refresh manual necessário após expiração
- **SEMPRE** usar `AuthContext` no frontend, nunca acessar localStorage direto

---

### Fluxo 2: Criação de Orçamento com Itens

```
1. Frontend: Usuário preenche formulário + adiciona itens
   - Itens cadastrados: { itemId: 123, quantidade: 5 }
   - Itens manuais: { itemId: null, nomeManual: "X", descricaoManual: "Y" }

2. Frontend: POST /api/orcamento com JSON

3. Backend: OrcamentoController recebe DTO

4. Backend: OrcamentoService.salvar() processa
   - Valida dados
   - Verifica permissão
   - Itera sobre itens:
     - Se itemId != null → busca ItemModel
     - Se itemId == null → usa campos *Manual
   - Calcula totais
   - Salva orçamento
   - Atualiza preço médio dos itens cadastrados

5. Backend: Retorna DTO criado

6. Frontend: Atualiza lista e mostra mensagem sucesso
```

**⚠️ CRÍTICO**: **SEMPRE** verificar `itemId != null` antes de acessar ItemModel

```java
// No Service
if (itemDTO.getItemId() != null) {
    // Item cadastrado
    ItemModel item = itemRepository.findById(itemDTO.getItemId())
        .orElseThrow(...);
    itemOrcamento.setItem(item);
} else {
    // Item manual
    itemOrcamento.setItem(null);
    itemOrcamento.setNomeManual(itemDTO.getNomeManual());
}
```

---

### Fluxo 3: Geração de PDF

```
1. Frontend: GET /api/orcamento/{id}/pdf

2. Backend: OrcamentoController.buscarOrcamentoCompleto()
   - Busca OrcamentoModel com relações
   - Converte para OrcamentoCompletoDTO
   - ⚠️ VERIFICA NULL em item.getItem()

3. Backend: PdfService.gerarOrcamentoPdf()
   - Usa iText 7 para criar PDF
   - Adiciona logo, cabeçalho, itens, resumo
   - Retorna byte[]

4. Backend: Response com Content-Type: application/pdf

5. Frontend: Abre PDF em nova aba ou download
```

**⚠️ CRÍTICO**: PDF falha se tentar acessar `item.getNome()` sem verificar null

```java
// No OrcamentoCompletoDTO.fromModel()
for (OrcamentoItemModel item : orcamento.getItens()) {
    OrcamentoItemDTO dto = new OrcamentoItemDTO();
    
    if (item.getItem() != null) {
        // Item cadastrado
        dto.setItemId(item.getItem().getId());
        dto.setNome(item.getItem().getNome());
    } else {
        // Item manual
        dto.setNomeManual(item.getNomeManual());
    }
}
```

---

## ✅ Regras Globais Obrigatórias

### 1. Segurança

- **TODAS** operações de escrita verificam permissão
- Usar `AuthenticationUtil.getUsuarioAutenticado()`
- Lançar `AccessDeniedException` se sem permissão
- Roles: ADMIN, EXPANSAO (total), USER (apenas seus)

```java
// Padrão em todos os services
var usuarioLogado = authenticationUtil.getUsuarioAutenticado();

if (!authenticationUtil.hasFullDataAccess() && 
    !registro.getUsuarioCriador().getId().equals(usuarioLogado.getId())) {
    throw new AccessDeniedException("Sem permissão");
}
```

---

### 2. Tratamento de Null

- **SEMPRE** verificar null antes de acessar relações LAZY
- Especialmente crítico em `ItemModel`, `PrestadorModel`, `EmpresaModel`
- Usar Optional ou if null check

```java
// CRÍTICO: Items podem ser manuais (null)
if (orcamentoItem.getItem() != null) {
    String nome = orcamentoItem.getItem().getNome();
} else {
    String nome = orcamentoItem.getNomeManual();
}
```

---

### 3. Transações

- Métodos de escrita anotados com `@Transactional`
- Manter transações curtas
- Não chamar APIs externas dentro de transações

```java
@Transactional
public OrcamentoDTO salvar(OrcamentoDTO dto) {
    // Toda operação de banco aqui é atômica
    // Se algo falhar, tudo é rollback
}
```

---

### 4. Validações

- Validar no frontend (UX) E backend (segurança)
- Mensagens de erro claras e descritivas
- Usar `@Valid` nos Controllers

```java
// Frontend - UX
if (!formData.nome) {
    setMessage({ type: 'error', text: 'Nome é obrigatório' });
    return;
}

// Backend - Segurança
if (dto.getNome() == null || dto.getNome().isEmpty()) {
    throw new RuntimeException("Nome é obrigatório");
}
```

---

### 5. Migrações de Banco

- **NUNCA** modificar migrações já executadas
- Criar nova migração para cada alteração
- Usar `IF NOT EXISTS` para adicionar colunas
- Adicionar `COMMENT ON COLUMN`

```sql
-- V2__add_column_exemplo.sql
ALTER TABLE tabela ADD COLUMN IF NOT EXISTS coluna VARCHAR(100);
COMMENT ON COLUMN tabela.coluna IS 'Descrição da coluna';
```

---

### 6. Código Limpo

- Nomes descritivos para variáveis, métodos, classes
- Métodos curtos e focados (máx 50 linhas ideal)
- Comentários explicam "porquê", não "o quê"
- Seguir convenções de nomenclatura do projeto

---

## ⚠️ NÃO FAZER - Lista Completa

### Backend

#### ❌ NUNCA faça:

**1. Acessar relações sem verificar null**
```java
// ERRADO - NullPointerException garantido se item for manual
String nome = item.getItem().getNome();

// CERTO
if (item.getItem() != null) {
    String nome = item.getItem().getNome();
} else {
    String nome = item.getNomeManual();
}
```

**2. Expor Entities na API**
```java
// ERRADO
public List<OrcamentoModel> listar() { ... }

// CERTO
public List<OrcamentoDTO> listar() { ... }
```

**3. Ignorar verificação de permissão**
```java
// ERRADO
public void deletar(Long id) {
    repository.deleteById(id);
}

// CERTO
public void deletar(Long id) {
    var usuario = authenticationUtil.getUsuarioAutenticado();
    OrcamentoModel orcamento = repository.findById(id)...;
    
    if (!authenticationUtil.hasFullDataAccess() && 
        !orcamento.getUsuarioCriador().equals(usuario)) {
        throw new AccessDeniedException("Sem permissão");
    }
    
    repository.delete(orcamento);
}
```

**4. Concatenar strings em queries (SQL Injection)**
```java
// ERRADO
@Query("SELECT o FROM OrcamentoModel o WHERE o.nome = '" + nome + "'")

// CERTO
@Query("SELECT o FROM OrcamentoModel o WHERE o.nome = :nome")
List<OrcamentoModel> buscar(@Param("nome") String nome);
```

**5. Modificar migrações Flyway executadas**
```
ERRADO: Alterar V1__create_schema.sql depois de executada

CERTO: Criar V2__alter_table_add_column.sql
```

**6. Fazer cálculos no frontend**
```java
// ERRADO - Frontend calcula desconto
const total = valor * 0.9;

// CERTO - Backend envia valor calculado
const total = orcamento.valorTotal; // Já vem calculado
```

---

### Frontend

#### ❌ NUNCA faça:

**1. Usar cores hardcoded**
```jsx
// ERRADO
<div style={{ backgroundColor: '#8B4C4C' }}>

// CERTO
<div className={styles.container}>

/* CSS */
.container {
    background-color: var(--primary-button);
}
```

**2. Acessar localStorage diretamente**
```jsx
// ERRADO
const token = localStorage.getItem('token');

// CERTO
import { useAuth } from '../../contexts/AuthContext';
const { token } = useAuth();
```

**3. Esquecer loading states**
```jsx
// ERRADO
const handleClick = async () => {
    const data = await api.get('/dados');
};

// CERTO
const handleClick = async () => {
    setLoading(true);
    try {
        const data = await api.get('/dados');
    } finally {
        setLoading(false);
    }
};
```

**4. Não tratar erros de API**
```jsx
// ERRADO
const data = await api.get('/dados');

// CERTO
try {
    const data = await api.get('/dados');
} catch (error) {
    setMessage({ type: 'error', text: error.message });
}
```

**5. Usar MultiSelect global complexo em dashboards**
```jsx
// ERRADO - Poluição visual
<div className={styles.filtrosGlobais}>
    <MultiSelect label="Empresas" />
    <MultiSelect label="Prestadores" />
    <MultiSelect label="Usuários" />
    <MultiSelect label="Tipos" />
</div>

// CERTO - Filtros drill-down
<div className={styles.filtrosGlobais}>
    <input type="date" /> {/* Apenas datas */}
</div>

<div className={styles.grafico}>
    <select>Filtrar por Prestador</select> {/* Local */}
</div>
```

---

## 🎨 Padrão de Cores: Marsala + Amarelo + Branco

**Paleta oficial do projeto:**

```css
:root {
    /* Primárias */
    --primary-button: #8B4C4C;        /* Marsala */
    --primary-button-hover: #7A4242;
    
    /* Destaque */
    --warning: #F0AD4E;               /* Amarelo */
    --warning-hover: #EC971F;
    
    /* Status */
    --success: #5CB85C;               /* Verde */
    --danger: #D9534F;                /* Vermelho */
    
    /* Neutras */
    --text-primary: #333333;
    --text-secondary: #666666;
    --bg-primary: #F5F5F5;
    --border-color: #DDDDDD;
}
```

**Regras:**
- ✅ **SEMPRE** usar variáveis CSS
- ✅ Gradientes sutis para botões primários
- ❌ **NUNCA** inventar novas cores
- ❌ **NUNCA** usar cores hardcoded

---

## 📊 Padrão de Dashboards Profissionais

### Filtros Drill-down (SaaS/ERP Style)

**Padrão correto:**
- Filtros globais: APENAS datas (topo)
- Filtros locais: Contextuais por gráfico
- Dados: 100% reais do backend (zero mocks)

```jsx
// Dashboard.jsx
function Dashboard() {
    // Global - apenas datas
    const [filtrosGlobais, setFiltrosGlobais] = useState({
        dataInicio: '',
        dataFim: ''
    });
    
    // Locais - por gráfico
    const [filtroEmpresa, setFiltroEmpresa] = useState({
        prestadorIds: [],
        tiposPagamento: []
    });
    
    return (
        <div>
            {/* Topo - datas apenas */}
            <FiltrosDatas value={filtrosGlobais} />
            
            {/* Gráficos com filtros locais */}
            <GraficoEmpresa>
                <select>Filtrar por Prestador</select>
                <select>Filtrar por Tipo</select>
            </GraficoEmpresa>
        </div>
    );
}
```

**Backend - Dados reais:**
```java
// DashboardDTO.java
private List<Map<String, Object>> empresasDisponiveis; // Do banco
private List<Map<String, Object>> prestadoresDisponiveis; // Do banco
private List<String> tiposPagamentoDisponiveis; // Do banco

// No Service
dashboard.setEmpresasDisponiveis(
    repository.buscarEmpresasDisponiveis(dataInicio, dataFim)
);
```

**❌ PROIBIDO:**
- Mocks de dados
- Hardcode de opções
- MultiSelect global complexo
- Chips de filtros no topo

---

## 🔄 Integração com APIs Externas

### ViaCEP (Busca de Endereço)

**Padrão**: Backend faz proxy da API externa

```java
// Backend - EnderecoController
@GetMapping("/buscar-cep/{cep}")
public ResponseEntity<EnderecoDTO> buscarCep(@PathVariable String cep) {
    // Backend chama ViaCEP
    EnderecoDTO endereco = viaCepService.buscar(cep);
    return ResponseEntity.ok(endereco);
}
```

```javascript
// Frontend - enderecoService.js
async buscarPorCEP(cep) {
    const response = await api.get(`/endereco/buscar-cep/${cep}`);
    return await response.json();
}
```

**⚠️ IMPORTANTE**: API ViaCEP retorna `localidade`, não `cidade`!

```javascript
setFormData(prev => ({
    ...prev,
    cidade: endereco.localidade, // Campo correto
    uf: endereco.uf
}));
```

---

## 📝 Definição de Pronto Completa

### Backend - Novo Recurso
- [ ] Entity criada com annotations corretas
- [ ] Repository com queries necessárias
- [ ] DTOs criados (básico e completo)
- [ ] Service com lógica de negócio completa
- [ ] Service com verificação de permissão em TODOS os métodos
- [ ] Service com @Transactional nos métodos de escrita
- [ ] Controller thin (apenas delega ao Service)
- [ ] Migração Flyway criada e testada
- [ ] Índices adicionados para colunas filtradas
- [ ] Build passa (`mvn clean compile`)

### Frontend - Novo Componente
- [ ] Service API criado
- [ ] Componente principal criado
- [ ] CSS Module criado
- [ ] Variáveis CSS usadas (nenhuma cor hardcoded)
- [ ] Validações implementadas
- [ ] Loading states durante requisições
- [ ] Mensagens de erro/sucesso
- [ ] Rota adicionada e protegida
- [ ] Build passa (`npm run build`)

### Geral
- [ ] Li padroes.md
- [ ] Verifiquei context-map.md
- [ ] Segui padrões existentes
- [ ] Evitei armadilhas listadas
- [ ] Testei manualmente

---

**Última atualização**: 2026-05-01  
**Versão**: 2.0  
**Baseado em**: Memória completa do projeto + lições aprendidas
