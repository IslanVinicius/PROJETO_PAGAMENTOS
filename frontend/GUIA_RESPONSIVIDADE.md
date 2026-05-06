# 📱 GUIA DE RESPONSIVIDADE - FORMULÁRIOS

## ✅ PADRÕES APLICADOS

Todos os formulários do sistema agora seguem padrões responsivos consistentes.

---

## 🎯 CLASSES CSS DISPONÍVEIS

### **Container Principal**
```jsx
<div className="form-container">
    {/* Conteúdo do formulário */}
</div>
```
- Max-width: 1200px
- Padding automático por breakpoint
- Centralizado com margin auto

---

### **Grid Responsivo Automático**
```jsx
<div className="form-grid">
    <div className="form-group">Campo 1</div>
    <div className="form-group">Campo 2</div>
    <div className="form-group">Campo 3</div>
</div>
```

**Comportamento:**
- **Mobile (<480px):** 1 coluna
- **Tablet (480-767px):** 2 colunas
- **Desktop (768px+):** Auto-fit (250px mínimo)
- **Wide (1024px+):** Auto-fit (280px mínimo)

---

### **Grupo de Campos**
```jsx
<div className="form-group">
    <label className="form-label">Nome</label>
    <input className="form-input" type="text" />
</div>
```

**Campo largura total:**
```jsx
<div className="form-group form-group-full">
    <label className="form-label">Descrição</label>
    <textarea className="form-textarea" />
</div>
```

---

### **Botões e Ações**

#### **Grupo de Botões (NUNCA quebra layout)**
```jsx
<div className="button-group">
    <button className="form-button">Salvar</button>
    <button className="form-button">Cancelar</button>
    <button className="form-button">Exportar</button>
</div>
```

**Comportamento:**
- Mobile: Botões empilham verticalmente (100% width)
- Desktop: Botões lado a lado com wrap automático

---

#### **Header Responsivo**
```jsx
<div className="header-responsive">
    <h2>Título do Formulário</h2>
    <div className="header-actions">
        <button>Novo</button>
        <button>Editar</button>
        <button>Excluir</button>
    </div>
</div>
```

**Comportamento:**
- Mobile: Stack vertical, botões ocupam 100%
- Desktop: Header horizontal, botões à direita

---

## 📏 BREAKPOINTS

| Dispositivo | Largura | Colunas |
|-------------|---------|---------|
| iPhone SE | 375px | 1 coluna |
| iPhone 12/13 | 390px | 1 coluna |
| iPad Mini | 768px | 2 colunas |
| iPad Pro | 1024px | 3 colunas |
| Notebook | 1366px | 3-4 colunas |
| Desktop | 1920px | 4 colunas |

---

## 🎨 EXEMPLO COMPLETO

```jsx
import styles from './MeuFormulario.module.css';

function MeuFormulario() {
    return (
        <div className="form-container">
            {/* Header Responsivo */}
            <div className="header-responsive">
                <h2>Cadastro de Cliente</h2>
                <div className="header-actions">
                    <button>Novo</button>
                    <button>Salvar</button>
                </div>
            </div>

            {/* Grid de Campos */}
            <div className="form-grid">
                <div className="form-group">
                    <label className="form-label">Nome</label>
                    <input className="form-input" type="text" />
                </div>

                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" />
                </div>

                <div className="form-group">
                    <label className="form-label">Telefone</label>
                    <input className="form-input" type="tel" />
                </div>

                {/* Campo full width */}
                <div className="form-group form-group-full">
                    <label className="form-label">Endereço</label>
                    <input className="form-input" type="text" />
                </div>
            </div>

            {/* Botões de Ação */}
            <div className="form-actions">
                <div className="button-group">
                    <button className="form-button">Salvar</button>
                    <button className="form-button">Cancelar</button>
                </div>
            </div>
        </div>
    );
}
```

---

## ⚠️ REGRAS IMPORTANTES

### ✅ FAÇA:
- Use `form-grid` para layouts de campos
- Use `button-group` para grupos de botões
- Use `header-responsive` para headers com ações
- Use `form-group-full` para campos que precisam de largura total
- Sempre use classes utilitárias do forms.css

### ❌ NÃO FAÇA:
- NÃO use larguras fixas em pixels (ex: `width: 300px`)
- NÃO use `position: absolute` para layout principal
- NÃO crie media queries específicas nos componentes
- NÃO use `flex-direction: row` sem `flex-wrap: wrap`
- NÃO esqueça de testar em mobile (375px)

---

## 🧪 TESTE OBRIGATÓRIO

Teste seu formulário nestes tamanhos:

1. **375px** - iPhone SE
2. **480px** - iPhone 12/13
3. **768px** - iPad
4. **1024px** - iPad Pro / Notebook pequeno
5. **1366px** - Notebook padrão
6. **1920px** - Desktop Full HD

**Checklist:**
- [ ] Nenhum botão sai do container
- [ ] Inputs não quebram layout
- [ ] Scroll horizontal não aparece
- [ ] Botões são clicáveis em mobile
- [ ] Texto é legível sem zoom
- [ ] Espaçamento é adequado

---

## 🚀 MIGRAÇÃO RÁPIDA

Se você tem um formulário antigo, substitua:

```css
/* ANTES (RUIM) */
.meuForm {
    display: flex;
    flex-direction: row;
    gap: 10px;
}

/* DEPOIS (BOM) */
<form className="form-grid">
    {/* Campos automáticos */}
</form>
```

```css
/* ANTES (QUEBRA EM MOBILE) */
.botoes {
    display: flex;
    gap: 10px;
}

/* DEPOIS (RESPONSIVO) */
<div className="button-group">
    <button>Salvar</button>
    <button>Cancelar</button>
</div>
```

---

## 📞 SUPORTE

Dúvidas? Consulte:
- `frontend/src/styles/forms.css` - Classes disponíveis
- `frontend/src/styles/global.css` - Estilos globais
- `frontend/src/styles/responsive.css` - Breakpoints

---

**Última atualização:** Maio 2026  
**Versão:** 2.0 (Responsividade Total)
