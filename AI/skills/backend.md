# Backend - Guia Completo de Implementação

## 📋 Visão Geral
Guia completo para implementação backend no Projeto Pagamentos, incluindo padrões, convenções e exemplos reais.

---

## 🏗️ Arquitetura do Projeto

### Stack Tecnológica
- **Java 21** (LTS)
- **Spring Boot 4.0.2**
- **Spring Data JPA / Hibernate**
- **PostgreSQL** (banco principal)
- **JWT** (autenticação)
- **Maven** (build)
- **Flyway** (migrações de banco)
- **Lombok** (redução de boilerplate)
- **iText 7** (geração de PDFs)

### Estrutura de Pacotes
```
src/main/java/org/example/pagamentos/
├── DTO/                    # Data Transfer Objects
├── Enums/                  # Enumerações
├── controller/             # Controllers REST API
├── exception/              # Tratamento de exceções
├── model/                  # Entidades JPA
├── repository/             # Repositórios JPA
├── security/               # JWT e segurança
├── service/                # Lógica de negócio
└── PagamentosApplication.java
```

---

## 🔄 Fluxo de Criação de Novo Recurso (CRUD)

### Ordem OBRIGATÓRIA de Implementação

#### 1️⃣ **Entity (Model)** - `model/XxxModel.java`

```java
package org.example.pagamentos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "NOME_TABELA")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class XxxModel {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;
    
    @Column(name = "NOME", nullable = false, length = 100)
    private String nome;
    
    // Relacionamentos
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "FOREIGN_KEY_ID")
    private YyyModel yyy;
}
```

**Regras:**
- ✅ Usar `@Table(name = "MAIUSCULAS")` - padrão PostgreSQL
- ✅ Colunas sempre em MAIÚSCULAS com underscore
- ✅ `nullable = false` apenas para campos obrigatórios
- ✅ `fetch = FetchType.LAZY` em relacionamentos (performance)
- ✅ Sempre usar Lombok annotations
- ❌ NUNCA expor Entity diretamente na API

---

#### 2️⃣ **Repository** - `repository/XxxRepository.java`

```java
package org.example.pagamentos.repository;

import org.example.pagamentos.model.XxxModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface XxxRepository extends JpaRepository<XxxModel, Long> {
    
    // Queries automáticas pelo nome do método
    Optional<XxxModel> findByNome(String nome);
    List<XxxModel> findByAtivoTrue();
    
    // Queries customizadas com JPQL
    @Query("SELECT x FROM XxxModel x WHERE x.nome LIKE %:nome%")
    List<XxxModel> buscarPorNomeParcial(@Param("nome") String nome);
    
    // Queries nativas SQL (quando necessário)
    @Query(value = "SELECT * FROM xxx WHERE coluna = :valor", nativeQuery = true)
    List<XxxModel> buscarNativo(@Param("valor") String valor);
}
```

**Regras:**
- ✅ Estender `JpaRepository<Entity, Long>`
- ✅ Spring Data gera queries automaticamente pelo nome do método
- ✅ Usar JPQL preferencialmente (portabilidade)
- ✅ Queries nativas apenas quando JPQL não suporta
- ✅ Usar `@Param` para parâmetros nomeados
- ❌ NUNCA concatenar strings em queries (SQL injection)

---

#### 3️⃣ **DTOs** - `DTO/XxxDTO.java`, `XxxCompletoDTO.java`

```java
package org.example.pagamentos.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class XxxDTO {
    private Long id;
    private String nome;
    private String descricao;
    private LocalDate dataCriacao;
    
    // IDs de relacionamentos (para frontend)
    private Long yyyId;
}
```

**Tipos de DTO:**
- **XxxDTO**: Para listagens e operações simples
- **XxxCompletoDTO**: Com objetos aninhados completos
- **XxxFiltroDTO**: Para filtros complexos (POST body)

**Regras:**
- ✅ NUNCA expor Entity na API - sempre usar DTO
- ✅ DTOs são imutáveis após criação (sem setters se possível)
- ✅ Separar DTO de criação, atualização e resposta
- ✅ Incluir IDs de FK para frontend montar selects
- ❌ NUNCA incluir senha ou dados sensíveis em DTOs

---

#### 4️⃣ **Service** - `service/XxxService.java`

```java
package org.example.pagamentos.service;

import org.example.pagamentos.DTO.XxxDTO;
import org.example.pagamentos.model.XxxModel;
import org.example.pagamentos.repository.XxxRepository;
import org.example.pagamentos.security.AuthenticationUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class XxxService {
    
    private final XxxRepository repository;
    private final AuthenticationUtil authenticationUtil;
    
    public XxxService(XxxRepository repository, AuthenticationUtil authenticationUtil) {
        this.repository = repository;
        this.authenticationUtil = authenticationUtil;
    }
    
    @Transactional
    public XxxDTO salvar(XxxDTO dto) {
        // 1. Obter usuário autenticado
        var usuarioLogado = authenticationUtil.getUsuarioAutenticado();
        
        // 2. Validar dados
        if (dto.getNome() == null || dto.getNome().isEmpty()) {
            throw new RuntimeException("Nome é obrigatório");
        }
        
        // 3. Converter DTO → Entity
        XxxModel model = new XxxModel();
        model.setNome(dto.getNome());
        model.setDescricao(dto.getDescricao());
        model.setUsuarioCriador(usuarioLogado);
        
        // 4. Salvar
        XxxModel salvo = repository.save(model);
        
        // 5. Converter Entity → DTO e retornar
        return toDTO(salvo);
    }
    
    public List<XxxDTO> listarTodos() {
        var usuarioLogado = authenticationUtil.getUsuarioAutenticado();
        
        // ADMIN/EXPANSAO veem tudo, USER vê apenas seus
        if (authenticationUtil.hasFullDataAccess()) {
            return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        } else {
            return repository.findByUsuarioCriador(usuarioLogado).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        }
    }
    
    public XxxDTO buscarPorId(Long id) {
        var usuarioLogado = authenticationUtil.getUsuarioAutenticado();
        
        XxxModel model = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Registro não encontrado"));
        
        // Verificar permissão
        if (!authenticationUtil.hasFullDataAccess() && 
            !model.getUsuarioCriador().getId().equals(usuarioLogado.getId())) {
            throw new AccessDeniedException("Sem permissão para acessar");
        }
        
        return toDTO(model);
    }
    
    @Transactional
    public void deletar(Long id) {
        var usuarioLogado = authenticationUtil.getUsuarioAutenticado();
        
        XxxModel model = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Registro não encontrado"));
        
        // Verificar permissão
        if (!authenticationUtil.hasFullDataAccess() && 
            !model.getUsuarioCriador().getId().equals(usuarioLogado.getId())) {
            throw new AccessDeniedException("Sem permissão para deletar");
        }
        
        repository.delete(model);
    }
    
    // Mapper interno
    private XxxDTO toDTO(XxxModel model) {
        XxxDTO dto = new XxxDTO();
        dto.setId(model.getId());
        dto.setNome(model.getNome());
        dto.setDescricao(model.getDescricao());
        dto.setDataCriacao(model.getDataCriacao());
        
        // FK para frontend
        if (model.getYyy() != null) {
            dto.setYyyId(model.getYyy().getId());
        }
        
        return dto;
    }
}
```

**Regras CRÍTICAS:**
- ✅ **SEMPRE** verificar permissão em TODAS as operações
- ✅ **SEMPRE** usar `@Transactional` em métodos de escrita
- ✅ **SEMPRE** obter usuário logado via `AuthenticationUtil`
- ✅ **SEMPRE** validar dados antes de salvar
- ✅ **SEMPRE** converter Entity → DTO antes de retornar
- ✅ Lançar `AccessDeniedException` se sem permissão
- ❌ NUNCA ignorar verificação de permissão
- ❌ NUNCA expor Entity no retorno
- ❌ NUNCA fazer cálculos no frontend - lógica de negócio APENAS no backend

---

#### 5️⃣ **Controller** - `controller/XxxController.java`

```java
package org.example.pagamentos.controller;

import org.example.pagamentos.DTO.XxxDTO;
import org.example.pagamentos.service.XxxService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/xxx")
public class XxxController {
    
    private final XxxService service;
    
    public XxxController(XxxService service) {
        this.service = service;
    }
    
    @PostMapping
    public ResponseEntity<XxxDTO> criar(@RequestBody XxxDTO dto) {
        XxxDTO criado = service.salvar(dto);
        return ResponseEntity.ok(criado);
    }
    
    @GetMapping
    public ResponseEntity<List<XxxDTO>> listar() {
        List<XxxDTO> lista = service.listarTodos();
        return ResponseEntity.ok(lista);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<XxxDTO> buscar(@PathVariable Long id) {
        XxxDTO dto = service.buscarPorId(id);
        return ResponseEntity.ok(dto);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<XxxDTO> atualizar(@PathVariable Long id, @RequestBody XxxDTO dto) {
        // Implementar lógica de atualização no Service
        return ResponseEntity.ok(dto);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
```

**Regras:**
- ✅ Controller é THIN - apenas recebe request e delega ao Service
- ✅ Usar `ResponseEntity` para controle total da resposta HTTP
- ✅ Validar input básico (@Valid se usar Bean Validation)
- ✅ Retornar status HTTP apropriado (200, 201, 204, 404)
- ❌ NUNCA colocar lógica de negócio no Controller
- ❌ NUNCA acessar Repository diretamente do Controller

---

#### 6️⃣ **Migração Flyway** - `resources/db/migration/V{N}__descricao.sql`

```sql
-- V1__create_xxx_table.sql
CREATE TABLE IF NOT EXISTS xxx (
    ID SERIAL PRIMARY KEY,
    NOME VARCHAR(100) NOT NULL,
    DESCRICAO TEXT,
    DATA_CRIACAO TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    USUARIO_CRIADOR_ID BIGINT,
    FOREIGN KEY (USUARIO_CRIADOR_ID) REFERENCES usuarios(ID)
);

COMMENT ON TABLE xxx IS 'Tabela de exemplo';
COMMENT ON COLUMN xxx.NOME IS 'Nome do registro';
COMMENT ON COLUMN xxx.USUARIO_CRIADOR_ID IS 'Usuário que criou o registro';

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_xxx_usuario ON xxx(USUARIO_CRIADOR_ID);
```

**Regras:**
- ✅ Nome padrão: `V{numero sequencial}__descricao_snake_case.sql`
- ✅ **NUNCA** modificar migrações já executadas
- ✅ Usar `IF NOT EXISTS` para evitar erros
- ✅ Adicionar `COMMENT ON` para documentação
- ✅ Criar índices para colunas frequentemente filtradas
- ✅ Foreign keys sempre declaradas
- ❌ NUNCA usar DROP TABLE em produção
- ❌ NUNCA alterar dados existentes sem backup

---

## 🔐 Segurança e Permissões

### Roles do Sistema

```java
// Roles disponíveis
ADMIN       // Acesso total a todos os dados
EXPANSAO    // Acesso total a todos os dados
USER        // Acesso apenas aos dados criados por ele
```

### Padrão de Verificação de Permissão

```java
// No Service - TODOS os métodos devem ter:

var usuarioLogado = authenticationUtil.getUsuarioAutenticado();

// Opção 1: Verificar role
if (!authenticationUtil.hasFullDataAccess()) {
    // USER só vê seus próprios registros
    if (!registro.getUsuarioCriador().getId().equals(usuarioLogado.getId())) {
        throw new AccessDeniedException("Sem permissão");
    }
}

// Opção 2: Filtrar na query
if (authenticationUtil.hasFullDataAccess()) {
    return repository.findAll();
} else {
    return repository.findByUsuarioCriador(usuarioLogado);
}
```

---

## 💡 Padrões Específicos do Projeto

### 1. Itens Manuais vs Cadastrados (Orçamentos)

**Problema**: Mesma tabela suporta dois tipos de itens

**Solução**: Campos nullable + verificação de null

```java
// OrcamentoItemModel.java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "ITEM_ID")  // Nullable!
private ItemModel item;

@Column(name = "NOME_MANUAL")  // Usado se item == null
private String nomeManual;

// No Service - SEMPRE verificar null
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

**Arquivos relacionados:**
- `OrcamentoItemModel.java`
- `OrcamentoService.java` (métodos salvar, toDTO)
- `OrcamentoCompletoDTO.java` (fromModel)
- `PdfService.java` (adicionarItens)

---

### 2. Cálculo Automático de Preço Médio

**Regra**: Toda vez que um orçamento é salvo, atualizar preço médio dos itens

```java
// No OrcamentoService.salvar()
@Transactional
public OrcamentoDTO salvar(OrcamentoDTO dto) {
    // ... salvar orçamento ...
    
    // Atualizar precoMedio de todos os itens deste orçamento
    for (OrcamentoItemDTO itemDTO : dto.getItens()) {
        if (itemDTO.getItemId() != null) { // Apenas itens cadastrados
            try {
                itemService.calcularEAtualizarPrecoMedio(itemDTO.getItemId());
            } catch (Exception e) {
                System.err.println("Erro ao atualizar precoMedio: " + e.getMessage());
            }
        }
    }
    
    return toDTO(orcamentoSalvo);
}
```

---

### 3. Dashboard com Filtros Drill-down

**Padrão**: Filtros globais (datas) no topo + filtros locais por gráfico

```java
// DashboardDTO.java
@Getter @Setter
public class DashboardDTO {
    // KPIs
    private Integer totalOrcamentos;
    private Float valorTotal;
    
    // Dados gráficos
    private List<Map<String, Object>> orcamentosPorEmpresa;
    
    // Opções para filtros locais (drill-down) - dados REAIS
    private List<Map<String, Object>> empresasDisponiveis;
    private List<Map<String, Object>> prestadoresDisponiveis;
    private List<String> tiposPagamentoDisponiveis;
}

// No Service - Popular opções do banco
dashboard.setEmpresasDisponiveis(
    repository.buscarEmpresasDisponiveis(dataInicio, dataFim)
);
```

**Queries DISTINCT eficientes:**
```java
@Query("SELECT DISTINCT o.empresa.id as id, o.empresa.nome as nome " +
       "FROM OrcamentoModel o " +
       "WHERE o.movimento >= :dataInicio AND o.movimento <= :dataFim")
List<Map<String, Object>> buscarEmpresasDisponiveis(...);
```

---

### 4. Geração de PDF com iText 7

```java
// PdfService.java
@Service
public class PdfService {
    
    public byte[] gerarOrcamentoPdf(OrcamentoCompletoDTO orcamento) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);
        
        // Adicionar logo
        ImageData logo = ImageDataFactory.create("classpath:/images/logo.png");
        Image img = new Image(logo);
        document.add(img);
        
        // Adicionar conteúdo
        Paragraph titulo = new Paragraph("Orçamento #" + orcamento.getId())
            .setFontSize(18)
            .setBold();
        document.add(titulo);
        
        // Tabela de itens
        Table table = new Table(UnitValue.createPercentArray(4))
            .useAllAvailableWidth();
        
        // Header
        table.addHeaderCell("Item");
        table.addHeaderCell("Qtd");
        table.addHeaderCell("Unitário");
        table.addHeaderCell("Total");
        
        // Linhas - VERIFICAR NULL em items manuais!
        for (OrcamentoItemDTO item : orcamento.getItens()) {
            String nome = item.getItem() != null 
                ? item.getItem().getNome() 
                : item.getNomeManual();
            
            table.addCell(nome);
            table.addCell(String.valueOf(item.getQuantidade()));
            table.addCell(formatarMoeda(item.getValorUnitario()));
            table.addCell(formatarMoeda(item.getValorTotal()));
        }
        
        document.add(table);
        document.close();
        
        return baos.toByteArray();
    }
}
```

**⚠️ CRÍTICO**: Sempre verificar `item.getItem() != null` antes de acessar propriedades do ItemModel!

---

## ⚠️ Armadilhas Comuns (NÃO FAZER)

### ❌ 1. Acessar Relações LAZY sem Verificar Null

```java
// ERRADO - NullPointerException garantido
String nome = orcamento.getItem().getNome();

// CERTO
if (orcamento.getItem() != null) {
    String nome = orcamento.getItem().getNome();
} else {
    String nome = orcamento.getNomeManual();
}
```

---

### ❌ 2. Expor Entity na API

```java
// ERRADO
@GetMapping
public List<OrcamentoModel> listar() {
    return repository.findAll();
}

// CERTO
@GetMapping
public List<OrcamentoDTO> listar() {
    return repository.findAll().stream()
        .map(this::toDTO)
        .collect(Collectors.toList());
}
```

---

### ❌ 3. Ignorar Verificação de Permissão

```java
// ERRADO - Qualquer usuário pode deletar qualquer registro
@DeleteMapping("/{id}")
public void deletar(@PathVariable Long id) {
    repository.deleteById(id);
}

// CERTO - Verifica dono do registro
@DeleteMapping("/{id}")
public void deletar(@PathVariable Long id) {
    var usuarioLogado = authenticationUtil.getUsuarioAutenticado();
    OrcamentoModel orcamento = repository.findById(id)
        .orElseThrow(...);
    
    if (!authenticationUtil.hasFullDataAccess() && 
        !orcamento.getUsuarioCriador().getId().equals(usuarioLogado.getId())) {
        throw new AccessDeniedException("Sem permissão");
    }
    
    repository.delete(orcamento);
}
```

---

### ❌ 4. Concatenar Strings em Queries (SQL Injection)

```java
// ERRADO - Vulnerável a SQL injection
@Query("SELECT o FROM OrcamentoModel o WHERE o.nome = '" + nome + "'")

// CERTO - Usar parâmetros nomeados
@Query("SELECT o FROM OrcamentoModel o WHERE o.nome = :nome")
List<OrcamentoModel> buscarPorNome(@Param("nome") String nome);
```

---

### ❌ 5. Modificar Migrações Flyway Executadas

```
ERRADO: Alterar V1__create_schema.sql depois de já executada

CERTO: Criar nova migração V2__alter_table_add_column.sql
```

---

## ✅ Checklist de Definição de Pronto

### Novo Recurso CRUD
- [ ] Entity criada com annotations corretas
- [ ] Repository com queries necessárias
- [ ] DTOs criados (básico e completo se necessário)
- [ ] Service com lógica de negócio completa
- [ ] Service com verificação de permissão em TODOS os métodos
- [ ] Service com @Transactional nos métodos de escrita
- [ ] Controller thin (apenas delega ao Service)
- [ ] Migração Flyway criada e testada
- [ ] Índices adicionados para colunas filtradas
- [ ] Build passa sem erros (`mvn clean compile`)
- [ ] Endpoints testados manualmente ou com testes automatizados

### Modificação em Recurso Existente
- [ ] Entity modificada (se necessário)
- [ ] DTO atualizado
- [ ] Migração Flyway criada para alterações de schema
- [ ] Service atualizado (lógica e mapeamento)
- [ ] Controller atualizado (se mudar endpoint)
- [ ] Frontend sincronizado (se mudar contrato API)
- [ ] Build passa
- [ ] Testes manuais realizados

---

## 📖 Exemplos Reais do Projeto

### Exemplo 1: Adicionar Campo `nomeManual` em Itens

**Contexto**: Itens manuais precisam persistir nome personalizado

**Arquivos modificados:**
1. `OrcamentoItemModel.java` - Adicionar campo `nomeManual`
2. `OrcamentoItemDTO.java` - Adicionar campo `nomeManual`
3. `V3__add_nome_manual_column.sql` - Migração Flyway
4. `OrcamentoService.toDTO()` - Mapear campo
5. `OrcamentoCadastro.jsx` - Frontend envia/recebe campo

**Lição**: Mudança simples requer alteração em 5+ arquivos

---

### Exemplo 2: Corrigir Bug de Modal Transparente

**Problema**: Modal aparecia transparente

**Causa**: Classes CSS não existiam no arquivo `.module.css` correto

**Solução**: Adicionar classes no `OrcamentoCadastro-novo.module.css`

**Lição**: CSS Modules exigem classes no arquivo correto

---

### Exemplo 3: Dashboard com Filtros Avançados

**Implementação**:
- Backend: POST `/api/orcamento/dashboard` com `DashboardFiltroDTO`
- Queries otimizadas com GROUP BY e agregações
- Filtros opcionais usando datas extremas (1900-01-01 a 9999-12-31)
- Frontend: Filtros drill-down por gráfico
- Dados 100% reais (zero mocks)

**Lição**: Dashboards profissionais usam filtros contextuais, não globais

---

## 🚀 Comandos Úteis

```bash
# Build completo
.\mvnw.cmd clean package -DskipTests

# Executar backend
.\mvnw.cmd spring-boot:run

# Executar testes
.\mvnw.cmd test

# Ver logs em tempo real
tail -f logs/application.log

# Conectar ao PostgreSQL
psql -U postgres -d pagamentos
```

---

**Última atualização**: 2026-05-01  
**Versão**: 2.0  
**Baseado em**: Memória completa do projeto + lições aprendidas
