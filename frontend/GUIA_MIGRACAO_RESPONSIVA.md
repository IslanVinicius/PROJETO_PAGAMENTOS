# 🚀 GUIA RÁPIDO DE MIGRAÇÃO PARA CSS RESPONSIVO

## Como adaptar seus formulários existentes em 5 passos

---

## PASSO 1: Importar CSS Global (Opcional)

Seu formulário já tem acesso automático às classes globais através do `global.css`.

**Não precisa fazer nada!** As classes já estão disponíveis.

---

## PASSO 2: Substituir Container Fixo por Responsivo

### ANTES:
```jsx
<div className={styles.container}>
  {/* conteúdo */}
</div>
```

```css
.container {
    width: 100%;
    max-width: 1200px;
    padding: 30px;
}
```

### DEPOIS (Opção A - Usar classes globais):
```jsx
<div className="container-responsive">
  {/* conteúdo */}
</div>
```

### DEPOIS (Opção B - Adicionar media queries):
```css
.container {
    width: 100%;
    max-width: 1200px;
    padding: var(--spacing-md); /* Reduzido para mobile */
}

@media (min-width: 768px) {
    .container {
        padding: var(--spacing-lg);
    }
}

@media (min-width: 1024px) {
    .container {
        padding: var(--spacing-xl);
    }
}
```

---

## PASSO 3: Transformar Grids Fixos em Responsivos

### ANTES:
```jsx
<div style={{ display: 'grid', gridTemplateColumns: '300px 300px' }}>
  <input />
  <input />
</div>
```

### DEPOIS (Opção A - Classe global):
```jsx
<div className="form-grid">
  <div className="form-group">
    <input className="form-input" />
  </div>
  <div className="form-group">
    <input className="form-input" />
  </div>
</div>
```

**Resultado:**
- Mobile: 1 coluna
- Tablet: 2 colunas
- Desktop: 3 colunas
- Wide: 4 colunas

### DEPOIS (Opção B - CSS personalizado):
```css
.formGrid {
    display: grid;
    gap: var(--spacing-md);
    grid-template-columns: 1fr; /* Mobile: 1 coluna */
}

@media (min-width: 480px) {
    .formGrid {
        grid-template-columns: repeat(2, 1fr); /* 2 colunas */
    }
}

@media (min-width: 768px) {
    .formGrid {
        gap: var(--spacing-lg);
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (min-width: 1024px) {
    .formGrid {
        grid-template-columns: repeat(3, 1fr); /* 3 colunas */
    }
}
```

---

## PASSO 4: Inputs e Botões Responsivos

### ANTES:
```jsx
<input 
  style={{ width: '280px', height: '40px' }}
/>
<button 
  style={{ width: '150px', height: '40px' }}
>
  Salvar
</button>
```

### DEPOIS (Opção A - Classes globais):
```jsx
<input className="form-input" />
<button className="form-button">Salvar</button>
```

### DEPOIS (Opção B - CSS no módulo):
```css
.input {
    width: 100%;
    min-height: 48px; /* Área de toque mínima */
    font-size: 16px; /* Previne zoom no iOS */
    padding: var(--spacing-md);
}

.button {
    width: 100%;
    min-height: 48px;
}

@media (min-width: 480px) {
    .button {
        width: auto; /* Largura automática em telas maiores */
    }
}
```

---

## PASSO 5: Tabelas Responsivas

### Opção A: Scroll Horizontal (Mais simples)

```jsx
<div className="table-wrapper">
  <table className="data-table">
    <thead>
      <tr>
        <th>Nome</th>
        <th>Email</th>
        <th>Ações</th>
      </tr>
    </thead>
    <tbody>
      {/* linhas */}
    </tbody>
  </table>
</div>
```

### Opção B: Cards no Mobile (Melhor UX)

```jsx
{/* Desktop: tabela normal */}
<div className="hide-mobile">
  <table className="data-table">
    {/* conteúdo da tabela */}
  </table>
</div>

{/* Mobile: cards */}
<div className="data-table-cards hide-desktop">
  {data.map(item => (
    <div className="data-card">
      <div className="data-card-row">
        <span className="data-card-label">Nome:</span>
        <span className="data-card-value">{item.nome}</span>
      </div>
      <div className="data-card-row">
        <span className="data-card-label">Email:</span>
        <span className="data-card-value">{item.email}</span>
      </div>
    </div>
  ))}
</div>
```

---

## 📋 CHECKLIST DE MIGRAÇÃO

Para cada formulário, verifique:

- [ ] **Container principal** tem padding responsivo
- [ ] **Grids** adaptam de 1→2→3→4 colunas
- [ ] **Inputs** têm `width: 100%` e `min-height: 48px`
- [ ] **Botões** são full-width no mobile
- [ ] **Fontes** usam `rem` ou têm media queries
- [ ] **Imagens** têm `max-width: 100%`
- [ ] **Tabelas** têm scroll horizontal ou viram cards
- [ ] **Sem width/height fixos** em px (exceto borders)
- [ ] **Hover effects** apenas em desktop (opcional)
- [ ] **Testado** em mobile, tablet e desktop

---

## 🎯 EXEMPLO COMPLETO: EmpresaCadastro

### Estrutura JSX sugerida:

```jsx
import styles from './EmpresaCadastro-novo.module.css';

function EmpresaCadastro() {
  return (
    <div className="container-responsive">
      <div className={styles.card}>
        <h2 className="text-responsive">Cadastro de Empresa</h2>
        
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Nome</label>
            <input className="form-input" type="text" />
          </div>
          
          <div className="form-group">
            <label className="form-label">CNPJ</label>
            <input className="form-input" type="text" />
          </div>
          
          <div className="form-group form-group-full">
            <label className="form-label">Razão Social</label>
            <input className="form-input" type="text" />
          </div>
        </div>
        
        <div className="form-actions">
          <button className="form-button">Salvar</button>
          <button className="form-button">Cancelar</button>
        </div>
      </div>
    </div>
  );
}
```

### CSS mínimo necessário:

```css
/* Apenas estilos específicos do componente */
.card {
    background-color: var(--bg-primary);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    box-shadow: var(--shadow-lg);
}

@media (min-width: 768px) {
    .card {
        padding: var(--spacing-xl);
    }
}

/* O resto usa classes globais! */
```

---

## ⚡ DICAS RÁPIDAS

### 1. Padding Responsivo sem Media Queries
```css
.padding-auto {
    padding: calc(10px + 1vw); /* Aumenta gradualmente */
}
```

### 2. Font Size Fluida
```css
.text-fluid {
    font-size: clamp(14px, 1vw + 12px, 18px);
}
```

### 3. Grid Inteligente
```css
.grid-smart {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--spacing-md);
}
```

### 4. Esconder Elementos
```jsx
<span className="hide-mobile">Texto só desktop</span>
<span className="hide-desktop">Texto só mobile</span>
```

---

## 🐛 PROBLEMAS COMUNS E SOLUÇÕES

### Problema: Scroll horizontal aparecendo
**Solução:**
```css
body {
    overflow-x: hidden;
}

* {
    max-width: 100%;
}
```

### Problema: Input com zoom no iPhone
**Solução:**
```css
input, select, textarea {
    font-size: 16px; /* Mínimo para prevenir zoom */
}
```

### Problema: Botões muito pequenos para tocar
**Solução:**
```css
button {
    min-height: 48px;
    min-width: 48px;
}
```

### Problema: Texto muito pequeno no mobile
**Solução:**
```css
body {
    font-size: 16px; /* Base maior */
}

p {
    font-size: 1rem; /* Relativo ao base */
}
```

---

## 🧪 COMO TESTAR

### 1. Chrome DevTools
```
F12 → Toggle Device Toolbar (Ctrl+Shift+M)
Selecionar dispositivos:
- iPhone SE (375x667)
- iPad (768x1024)
- Desktop (1920x1080)
```

### 2. Testes Reais
- Abrir no celular
- Verificar touch targets (fácil de clicar?)
- Verificar legibilidade (texto legível?)
- Verificar scroll horizontal (não deve existir!)

### 3. Checklist Visual
- [ ] Layout não quebra em nenhuma tela
- [ ] Todos botões clicáveis
- [ ] Textos legíveis sem zoom
- [ ] Imagens proporcionais
- [ ] Formulários preenchíveis
- [ ] Menu navegável

---

## 📚 REFERÊNCIA RÁPIDA DE CLASSES

| Classe | Uso | Breakpoint |
|--------|-----|------------|
| `.container-responsive` | Container principal | Auto |
| `.form-grid` | Grid de campos | 1→2→3→4 cols |
| `.form-input` | Input/select/textarea | Full-width |
| `.form-button` | Botões | Full→Auto |
| `.btn-responsive` | Botão genérico | Full→Auto |
| `.img-responsive` | Imagens | Max-width 100% |
| `.table-wrapper` | Tabela scroll | Sempre |
| `.hide-mobile` | Esconder mobile | < 768px |
| `.hide-desktop` | Esconder desktop | ≥ 1024px |

---

## ✅ PRONTO!

Agora você sabe como migrar qualquer formulário para responsivo!

**Tempo estimado por formulário:** 15-30 minutos

**Total de formulários:** ~13 formulários principais

**Tempo total estimado:** 3-6 horas

Boa sorte! 🚀
