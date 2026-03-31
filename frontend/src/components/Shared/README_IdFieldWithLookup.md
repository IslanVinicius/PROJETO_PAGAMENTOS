# Componente IdFieldWithLookup

## Visão Geral

O componente `IdFieldWithLookup` é um campo de formulário reutilizável que exibe automaticamente o nome associado a um ID de chave estrangeira, melhorando a usabilidade dos formulários.

## Funcionalidades

- **Busca Automática**: Ao preencher um ID, o componente busca automaticamente o registro correspondente e exibe o nome associado
- **Layout Horizontal**: ID e nome são exibidos lado a lado em telas grandes para melhor clareza visual
- **Feedback Visual**: O nome é exibido em um campo destacado ao lado do ID com borda colorida
- **Atualização Dinâmica**: O nome é atualizado sempre que o ID é alterado
- **Estado de Carregamento**: Exibe indicador enquanto busca os dados
- **Tratamento de Erros**: Lida graciosamente com IDs inválidos ou erros na API
- **Responsivo**: Adapta-se automaticamente para layout vertical em dispositivos móveis

## Uso

### Importação

```jsx
import IdFieldWithLookup from '../Shared/IdFieldWithLookup';
```

### Exemplo Básico

```jsx
<IdFieldWithLookup
    id={idPrestador}
    onIdChange={setIdPrestador}
    getService={prestadorService.obter}
    idLabel="ID PRESTADOR *"
    nameLabel="PRESTADOR"
    nameField="nome"
    disabled={camposDesabilitados}
    placeholder="Código do prestador"
/>
```

## Props

| Prop | Tipo | Obrigatória | Padrão | Descrição |
|------|------|-------------|--------|-----------|
| `id` | string\|number | Sim | - | O valor do ID |
| `onIdChange` | function | Sim | - | Callback quando o ID é alterado |
| `getService` | function | Sim | - | Função do serviço para buscar o registro pelo ID |
| `idLabel` | string | Sim | - | Label do campo ID |
| `nameLabel` | string | Sim | - | Label do campo nome |
| `nameField` | string | Não | `'nome'` | Nome do campo que contém o nome no objeto retornado pela API |
| `disabled` | boolean | Não | `false` | Se o campo está desabilitado |
| `placeholder` | string | Não | `'Código'` | Placeholder do campo ID |

## Serviços Compatíveis

O componente funciona com qualquer serviço que possua um método `obter(id)` que retorne os dados do registro. Exemplos:

```javascript
// prestadorService.obter(id)
// Retorna: { id: 1, nome: "João Silva", cpfCnpj: "123..." }

// empresaService.obter(id)
// Retorna: { idEmpresa: 1, nome: "Empresa XPTO", razaoSocial: "XPTO Ltda" }

// grupoItemService.obter(id)
// Retorna: { id: 1, nome: "Grupo A", descricao: "..." }
```

## Fallback para Nomes Alternativos

O componente tenta automaticamente os seguintes campos no retorno da API:
1. `nameField` (padrão: `'nome'`)
2. `razaoSocial`
3. `nomeFantasia`

## Exemplos de Aplicação

### Orçamento (OrcamentoCadastro.jsx)

```jsx
// ID Prestador com nome
<IdFieldWithLookup
    id={idPrestador}
    onIdChange={setIdPrestador}
    getService={prestadorService.obter}
    idLabel="ID PRESTADOR *"
    nameLabel="PRESTADOR"
    disabled={camposDesabilitados}
/>

// ID Empresa com nome
<IdFieldWithLookup
    id={empresaID}
    onIdChange={setEmpresaID}
    getService={empresaService.obter}
    idLabel="EMPRESA ID *"
    nameLabel="EMPRESA"
    disabled={camposDesabilitados}
/>
```

### Dados Bancários (DadosBancariosCadastro.jsx)

```jsx
<IdFieldWithLookup
    id={codPrestador}
    onIdChange={setCodPrestador}
    getService={prestadorService.obter}
    idLabel="CÓDIGO PRESTADOR *"
    nameLabel="PRESTADOR"
    disabled={camposDesabilitados}
/>
```

## Vantagens

1. **Melhor Usabilidade**: Usuários não precisam memorizar IDs
2. **Feedback Imediato**: Confirmação visual do registro selecionado
3. **Redução de Erros**: Validação automática do ID
4. **Consistência**: Padrão visual em todos os formulários
5. **Código Reutilizável**: Fácil de aplicar em novos formulários
6. **Layout Otimizado**: Campos lado a lado economizam espaço vertical
7. **Clareza Visual**: Relacionamento óbvio entre ID e nome
8. **Responsivo**: Adapta-se perfeitamente a qualquer tamanho de tela

## Migração de Formulários Existentes

### Antes (Padrão Antigo)

```jsx
<div className={styles.formGroup}>
    <label>ID PRESTADOR *</label>
    <div className={styles.inputGroup}>
        <input
            type="number"
            value={idPrestador || ''}
            onChange={(e) => setIdPrestador(e.target.value)}
            placeholder="Código do prestador"
            disabled={camposDesabilitados}
        />
        <button
            className={styles.searchIconButton}
            onClick={() => setModalPrestadorAberto(true)}
            disabled={camposDesabilitados}
            type="button"
            title="Pesquisar prestador"
        >
            <Search size={16} />
        </button>
    </div>
</div>
```

### Depois (Padrão Novo)

```jsx
<IdFieldWithLookup
    id={idPrestador}
    onIdChange={setIdPrestador}
    getService={prestadorService.obter}
    idLabel="ID PRESTADOR *"
    nameLabel="PRESTADOR"
    nameField="nome"
    disabled={camposDesabilitados}
    placeholder="Código do prestador"
/>
```

**Nota**: O botão de pesquisa ainda pode ser mantido se desejar, mas o componente já fornece a funcionalidade de busca automática do nome.

## Estilização

O componente possui estilos próprios definidos em `IdFieldWithLookup.module.css`, que utilizam as variáveis de tema do sistema:

- `--bg-primary`, `--bg-secondary`: Cores de fundo
- `--text-primary`, `--text-secondary`, `--text-tertiary`: Cores de texto
- `--primary-color`: Cor primária para destaques
- `--border-color`: Cor de bordas
- `--radius-md`: Bordas arredondadas
- `--spacing-*`: Espaçamentos padronizados
- `--transition-fast`: Transições suaves

## Considerações de Performance

- O componente usa `useEffect` com dependências otimizadas para evitar chamadas desnecessárias à API
- A busca só é executada quando o ID é um número válido
- O estado de loading previne múltiplas chamadas simultâneas

## Troubleshooting

### O nome não está aparecendo

1. Verifique se o ID é um número válido
2. Confirme se o serviço `getService` está correto
3. Verifique no console do navegador se há erros na requisição
4. Certifique-se de que o campo `nameField` existe no retorno da API

### Múltiplas chamadas à API

- Verifique se as dependências do `useEffect` estão corretas
- Use `useCallback` para funções passadas como `getService` se necessário

## Próximos Passos

Aplicar este componente em todos os formulários que possuem campos com IDs estrangeiros:

- [x] OrcamentoCadastro.jsx
- [x] DadosBancariosCadastro.jsx
- [ ] SolicitacaoAprovacaoCadastro.jsx (se aplicável)
- [ ] AprovacaoCadastro.jsx (se aplicável)
- [ ] Outros formulários com FKs

## Manutenção

Para atualizar o comportamento do componente:

1. Edite `IdFieldWithLookup.jsx` para lógica
2. Edite `IdFieldWithLookup.module.css` para estilos
3. Teste em todos os formulários que utilizam o componente
4. Atualize esta documentação se necessário
