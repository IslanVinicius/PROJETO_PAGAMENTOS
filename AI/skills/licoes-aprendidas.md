# Lições Aprendidas e Armadilhas Comuns

## 📋 Visão Geral
Compilação de todas as lições aprendidas durante o desenvolvimento do Projeto Pagamentos. Este documento é baseado em problemas reais enfrentados e soluções implementadas.

---

## 🔥 Problemas Críticos Resolvidos

### 1. Itens Manuais vs Cadastrados - NullPointerException

**Problema**: Mesma tabela `ORCAMENTO_ITENS` suporta dois tipos de itens, mas código não verificava null antes de acessar ItemModel.

**Sintoma**: 
```
java.lang.NullPointerException: Cannot invoke "ItemModel.getNome()" 
because "orcamentoItem.getItem()" is null
```

**Causa Raiz**: Campo `ITEM_ID` é nullable, mas código assumia sempre existir.

**Solução Implementada**:

**Backend:**
```java
// OrcamentoService.java - SEMPRE verificar null
if (itemDTO.getItemId() != null) {
    // Item cadastrado
    ItemModel item = itemRepository.findById(itemDTO.getItemId())
        .orElseThrow(() -> new RuntimeException("Item não encontrado"));
    itemOrcamento.setItem(item);
} else {
    // Item manual
    itemOrcamento.setItem(null);
    itemOrcamento.setNomeManual(itemDTO.getNomeManual());
    itemOrcamento.setDescricaoManual(itemDTO.getDescricaoManual());
}
```

**PDF Generation:**
```java
// PdfService.java - CRÍTICO verificar antes de acessar
for (OrcamentoItemDTO item : orcamento.getItens()) {
    String nome;
    
    if (item.getItem() != null) {
        // Item cadastrado
        nome = item.getItem().getNome();
    } else {
        // Item manual
        nome = item.getNomeManual();
    }
    
    table.addCell(nome);
}
```

**DTO Mapping:**
```java
// OrcamentoCompletoDTO.fromModel()
if (itemModel.getItem() != null) {
    dto.setItemId(itemModel.getItem().getId());
    dto.setNome(itemModel.getItem().getNome());
} else {
    dto.setNomeManual(itemModel.getNomeManual());
}
```

**Arquivos Afetados:**
- `OrcamentoItemModel.java` - Campo ITEM_ID nullable
- `OrcamentoService.java` - Métodos salvar(), toDTO()
- `OrcamentoCompletoDTO.java` - Método fromModel()
- `PdfService.java` - Método adicionarItens()
- `OrcamentoCadastro.jsx` - Dois botões diferentes para adicionar

**Lição**: Quando uma tabela suporta múltiplos tipos, **SEMPRE** verificar null antes de acessar relacionamentos.

---

### 2. Modal Transparente - CSS Modules

**Problema**: Modal de item manual aparecia transparente/invisível.

**Sintoma**: Modal renderizado no DOM mas não visível na tela.

**Causa Raiz**: Classes CSS usadas no JSX não existiam no arquivo `.module.css` correto.

**Solução**:
```css
/* OrcamentoCadastro-novo.module.css */
.modalOverlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.5); /* Fundo escuro semi-transparente */
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modalContent {
    background-color: white; /* Fundo branco sólido */
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    max-width: 600px;
    width: 90%;
}

.modalBody input {
    background-color: white !important; /* Forçar fundo branco nos inputs */
}
```

**Lição**: CSS Modules exigem que classes estejam no arquivo `.module.css` correto. Se classe não existe → elemento fica sem estilo ou transparente.

---

### 3. DATE_FORMAT no PostgreSQL

**Problema**: Query JPQL usava função MySQL `DATE_FORMAT()` que não existe no PostgreSQL.

**Sintoma**:
```
ERROR: function date_format(date, unknown) does not exist
Dica: No function matches the given name and argument types.
```

**Causa Raiz**: Sintaxe MySQL usada em banco PostgreSQL.

**Solução**:
```java
// ERRADO - MySQL
@Query("SELECT FUNCTION('DATE_FORMAT', o.movimento, '%Y-%m') as periodo...")

// CERTO - PostgreSQL
@Query("SELECT TO_CHAR(o.movimento, 'YYYY-MM') as periodo...")
```

**Lição**: Usar funções SQL padrão ou específicas do PostgreSQL quando usar este banco.

---

### 4. Tipo Incompatível String vs LocalDate

**Problema**: Controller recebia String do frontend, mas queries JPQL esperavam LocalDate.

**Sintoma**:
```
Argument to query parameter has an incompatible type 
(java.lang.String is not assignable to java.time.LocalDate)
```

**Causa Raiz**: Campo `movimento` é LocalDate no model, mas API recebia String.

**Solução**:
```java
// OrcamentoService.java - Converter antes de passar para Repository
LocalDate dataInicio = (dataInicioStr != null && !dataInicioStr.isEmpty()) 
    ? LocalDate.parse(dataInicioStr) 
    : LocalDate.of(1900, 1, 1); // Data mínima se null

LocalDate dataFim = (dataFimStr != null && !dataFimStr.isEmpty()) 
    ? LocalDate.parse(dataFimStr) 
    : LocalDate.of(9999, 12, 31); // Data máxima se null
```

**Lição**: Alinhar tipos entre API (String JSON) e JPA (LocalDate) com conversão explícita no Service.

---

### 5. PostgreSQL Não Determina Tipo de Parâmetro Null

**Problema**: Query com parâmetro opcional falhava quando valor era null.

**Sintoma**:
```
ERROR: could not determine data type of parameter $1
SQLState: 42P18
```

**Tentativa 1 - CAST explícito**:
```java
@Query("WHERE (:dataInicio IS NULL OR o.movimento >= CAST(:dataInicio AS date))")
```

**Erro resultante**:
```
ERROR: cannot cast type bytea to date
```

**Solução Final - Datas Extremas**:
```java
// Service - NUNCA passa null, usa datas extremas
LocalDate dataInicio = (dataInicioStr != null && !dataInicioStr.isEmpty()) 
    ? LocalDate.parse(dataInicioStr) 
    : LocalDate.of(1900, 1, 1); // Mínimo

LocalDate dataFim = (dataFimStr != null && !dataFimStr.isEmpty()) 
    ? LocalDate.parse(dataFimStr) 
    : LocalDate.of(9999, 12, 31); // Máximo

// Repository - Query simples sem IS NULL
@Query("WHERE o.movimento >= :dataInicio AND o.movimento <= :dataFim")
```

**Vantagens**:
- Sem lógica condicional complexa na query
- Sem CAST problemático
- Query mais simples e eficiente
- Indexes funcionam perfeitamente

**Lição**: PostgreSQL tem tipagem forte. Usar valores sentinelas (datas extremas) ao invés de null para parâmetros opcionais.

---

### 6. Reiniciar Backend Após Alterações de Permissão

**Problema**: Após modificar SecurityConfig ou roles, endpoints retornavam 403 mesmo com token válido.

**Sintoma**: Erro 403 Forbidden em endpoints que deveriam estar acessíveis.

**Causa Raiz**: Spring Security cacheia configurações. Alterações não são aplicadas até restart.

**Solução**:
```powershell
# Parar backend (Ctrl+C)
# Reiniciar
.\mvnw.cmd spring-boot:run
```

**Lição**: Sempre reiniciar backend após alterações em:
- `SecurityConfig.java`
- Roles/Permissões
- JWT configuration
- CorsConfig.java

---

### 7. ViaCEP - Campo "localidade" vs "cidade"

**Problema**: Frontend tentava acessar `endereco.cidade` mas API retorna `endereco.localidade`.

**Sintoma**: Campo cidade ficava vazio após autofill de CEP.

**Causa Raiz**: API ViaCEP usa nomenclatura diferente.

**Solução**:
```javascript
// enderecoService.js
const endereco = await api.get(`/endereco/buscar-cep/${cep}`);

setFormData(prev => ({
    ...prev,
    logradouro: endereco.logradouro,
    bairro: endereco.bairro,
    cidade: endereco.localidade, // ⚠️ Campo é "localidade" na API
    uf: endereco.uf
}));
```

**Lição**: Sempre consultar documentação da API externa para mapeamento correto de campos.

---

### 8. Filtros de Dashboard - Dados Mockados

**Problema**: Tipos de pagamento hardcoded no frontend não refletiam dados reais do banco.

**Sintoma**: Filtro mostrava opções que não existiam ou faltavam opções existentes.

**Causa Raiz**: Array fixo no frontend ao invés de buscar do backend.

**Solução**:
```java
// Backend - DashboardDTO.java
private List<String> tiposPagamentoDisponiveis; // Do banco

// OrcamentoRepository.java
@Query("SELECT DISTINCT o.tipoPagamento FROM OrcamentoModel o " +
       "WHERE o.movimento >= :dataInicio AND o.movimento <= :dataFim " +
       "AND o.tipoPagamento IS NOT NULL")
List<String> buscarTiposPagamentoDisponiveis(...);

// OrcamentoService.java
dashboard.setTiposPagamentoDisponiveis(
    repository.buscarTiposPagamentoDisponiveis(dataInicio, dataFim)
);
```

```jsx
// Frontend - Dashboard.jsx
<select>
    <option>Filtrar por Tipo</option>
    {dados?.tiposPagamentoDisponiveis?.map(tipo => (
        <option key={tipo} value={tipo}>{tipo}</option>
    ))}
</select>
```

**Lição**: Dashboards profissionais usam dados 100% reais do backend. Zero mocks ou hardcode.

---

### 9. Filtros Globais Excessivos em Dashboard

**Problema**: MultiSelect global com 6+ campos poluía UI e confundia usuário.

**Sintoma**: Dashboard parecia formulário complexo, não dashboard analítico.

**Causa Raiz**: Padrão incorreto - todos filtros no topo.

**Solução - Padrão Drill-down**:
```jsx
// Topo - APENAS datas
<div className={styles.filtrosGlobais}>
    <input type="date" />
    <input type="date" />
    <button>Aplicar</button>
</div>

// Cada gráfico - Filtros contextuais
<div className={styles.graficoEmpresa}>
    <h3>Orçamentos por Empresa</h3>
    <select>Filtrar por Prestador</select>
    <select>Filtrar por Tipo</select>
</div>
```

**Resultado**: UX profissional tipo Power BI/Tableau.

**Lição**: Dashboards SaaS/ERP usam filtros globais mínimos (datas) + filtros locais contextuais por gráfico.

---

### 10. URL da API no Frontend - ERR_NAME_NOT_RESOLVED

**Problema**: Frontend tentava acessar API em URL incorreta.

**Sintoma**: 
```
ERR_NAME_NOT_RESOLVED
Failed to fetch
```

**Causa Raiz**: Variável de ambiente `VITE_API_URL` configurada incorretamente.

**Solução**:
```env
# frontend/.env
VITE_API_URL=http://localhost:8080/api
```

```javascript
// services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
```

**Lição**: Verificar variáveis de ambiente do frontend quando houver erros de conexão.

---

## 🎯 Padrões Descobertos

### 1. Uso de POST com DTO para Filtros Complexos

**Cenário**: Endpoint precisa aceitar múltiplos valores (arrays) e combinar vários critérios.

**Decisão**: Mudar de GET para POST com DTO no body.

```java
// ANTES - GET limitado
@GetMapping("/dashboard")
public ResponseEntity<DashboardDTO> obterDashboard(
    @RequestParam(required = false) Long empresaId,
    @RequestParam(required = false) Long prestadorId
) { ... }

// DEPOIS - POST flexível
@PostMapping("/dashboard")
public ResponseEntity<DashboardDTO> obterDashboard(
    @RequestBody DashboardFiltroDTO filtros
) { ... }

// DTO
public class DashboardFiltroDTO {
    private Set<Long> empresaIds;      // Múltiplos valores
    private Set<Long> prestadorIds;    // Múltiplos valores
    private Set<String> tiposPagamento;
    private String dataInicio;
    private String dataFim;
}
```

**Vantagens**:
- Suporta arrays/sets
- URL não fica longa
- Mais legível
- Facilita versionamento

**Quando usar**: Dashboards, relatórios, listas avançadas com filtros complexos.

---

### 2. Queries com IN para Filtros Múltiplos

**Padrão**: Usar `IN` ao invés de `=` para suportar múltiplos valores.

```java
// Repository
@Query("SELECT o FROM OrcamentoModel o " +
       "WHERE (:empresaIds IS NULL OR o.empresa.id IN :empresaIds)")
List<OrcamentoModel> filtrar(@Param("empresaIds") Set<Long> empresaIds);
```

**Performance**: 
- Uma única query serve para 0, 1 ou N valores
- Zero N+1 problems
- Indexes utilizados corretamente

---

### 3. Lógica de Negócio Exclusivamente no Backend

**Regra**: Frontend apenas exibe dados processados. Backend faz TODOS os cálculos.

```java
// Backend - OrcamentoService.java
@Transactional
public OrcamentoDTO salvar(OrcamentoDTO dto) {
    // Calcular totais
    orcamento.calcularTotais();
    
    // Aplicar descontos
    aplicarDescontos(orcamento);
    
    // Atualizar preço médio
    atualizarPrecosMedios(orcamento);
    
    return toDTO(orcamento);
}
```

```jsx
// Frontend - Apenas exibe
<div>
    Total: {formatarMoeda(orcamento.valorTotal)} {/* Já vem calculado */}
</div>
```

**Por quê?**:
- Segurança (frontend pode ser manipulado)
- Consistência (única fonte de verdade)
- Manutenibilidade (lógica centralizada)

---

### 4. Norma de Filtro de Dados por Role

**Padrão**: ADMIN/EXPANSAO veem tudo, USER vê apenas seus registros.

```java
// Service - Padrão em TODOS os métodos de listagem
public List<XxxDTO> listarTodos() {
    var usuarioLogado = authenticationUtil.getUsuarioAutenticado();
    
    if (authenticationUtil.hasFullDataAccess()) {
        // ADMIN/EXPANSAO - veem tudo
        return repository.findAll().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    } else {
        // USER - vê apenas seus
        return repository.findByUsuarioCriador(usuarioLogado).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
}
```

**Implementação consistente em**:
- OrcamentoService
- ItemService
- PrestadorService
- EmpresaService
- UserService

---

## 📊 Estatísticas do Projeto

### Arquivos Principais
- **Backend Java**: 84 arquivos
- **Frontend React**: ~50 componentes
- **Migrações Flyway**: 3+ versões
- **Endpoints REST**: 40+ rotas

### Tecnologias
- **Backend**: Java 21, Spring Boot 4.0.2, PostgreSQL
- **Frontend**: React 19.2.0, Vite 7.3.1
- **Build**: Maven, npm

### Funcionalidades Implementadas
- ✅ CRUD completo (6 entidades principais)
- ✅ Autenticação JWT com roles
- ✅ Orçamentos com itens manuais/cadastrados
- ✅ Geração de PDF
- ✅ Upload de imagens
- ✅ Dashboard administrativo com drill-down
- ✅ Busca de CEP via backend proxy
- ✅ Cálculo automático de preço médio
- ✅ Sistema de aprovação de orçamentos

---

## 🚀 Checklist de Debugging

### Backend - Erro 500
1. Verificar logs: `tail -f logs/application.log`
2. Checar NullPointerException (relacionamentos LAZY)
3. Validar transações (@Transactional)
4. Verificar migrações Flyway executadas
5. Reiniciar servidor (se mudou SecurityConfig)

### Frontend - Erro de Conexão
1. Verificar `VITE_API_URL` em `.env`
2. Confirmar backend rodando em porta 8080
3. Checar CORS configurado corretamente
4. Verificar token JWT válido no localStorage
5. Abrir DevTools → Network para ver request/response

### Banco de Dados
1. Conectar: `psql -U postgres -d pagamentos`
2. Ver tabelas: `\dt`
3. Ver últimos registros: `SELECT * FROM orcamentos ORDER BY data_criacao DESC LIMIT 10;`
4. Ver itens manuais: `SELECT * FROM orcamento_itens WHERE item_id IS NULL;`

---

## 💡 Dicas de Ouro

### 1. Sempre Verificar Null em Relacionamentos LAZY
```java
if (entity.getRelacionamento() != null) {
    // Acessar propriedades
}
```

### 2. Usar Datas Extremas ao Invés de Null
```java
LocalDate data = valor != null ? LocalDate.parse(valor) : LocalDate.of(9999, 12, 31);
```

### 3. Reiniciar Backend Após Mudanças de Segurança
```powershell
Ctrl+C → .\mvnw.cmd spring-boot:run
```

### 4. CSS Modules - Classes no Arquivo Correto
```jsx
import styles from './Component.module.css'; // Classes DEVEM estar aqui
```

### 5. ViaCEP - Campo é "localidade"
```javascript
cidade: endereco.localidade // Não "cidade"
```

### 6. Dashboard - Dados Reais, Zero Mocks
```java
dashboard.setOpcoes(repository.buscarDistinct(...)); // Do banco
```

### 7. Itens Manuais - Dois Botões Diferentes
```jsx
<button>Adicionar Item Cadastrado</button>
<button>Adicionar Item Manual</button>
```

---

**Última atualização**: 2026-05-01  
**Versão**: 1.0  
**Baseado em**: Todos os problemas reais enfrentados e resolvidos no projeto
