# 📱 Frontend Responsivo - Projeto Pagamentos

## Visão Geral

Este projeto possui um **sistema completo de responsividade** que garante funcionamento perfeito em todos os dispositivos:

- 📱 **Mobile:** 320px+ (iPhone SE, Android pequenos)
- 📱 **Tablet:** 768px+ (iPad, tablets Android)
- 💻 **Desktop:** 1024px+ (Notebooks, monitores)
- 🖥️ **Wide:** 1440px+ (Monitores grandes, 4K)

---

## 🚀 Começando

### O sistema já está ativo!

As classes CSS globais estão disponíveis automaticamente em todo o projeto através do `global.css`.

**Não precisa instalar nada!** Basta usar as classes nos seus componentes.

---

## 📚 Documentação

### Para Desenvolvedores

1. **[GUIA_MIGRACAO_RESPONSIVA.md](./GUIA_MIGRACAO_RESPONSIVA.md)**
   - Tutorial passo-a-passo para migrar formulários
   - Exemplos práticos antes/depois
   - Checklist de verificação
   - Solução de problemas comuns

2. **[RESPONSIVIDADE_RESUMO.md](./RESPONSIVIDADE_RESUMO.md)**
   - Visão técnica completa
   - Lista de todas classes utilitárias
   - Componentes adaptados
   - Próximos passos

3. **[IMPLEMENTACAO_CONCLUIDA.md](./IMPLEMENTACAO_CONCLUIDA.md)**
   - Relatório executivo
   - Métricas e resultados
   - Garantia de qualidade
   - Melhores práticas

---

## 🎯 Uso Rápido

### Exemplo Básico

```jsx
import React from 'react';

function MeuFormulario() {
  return (
    <div className="container-responsive">
      <h2 className="text-responsive">Meu Formulário</h2>
      
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Nome</label>
          <input className="form-input" type="text" />
        </div>
        
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" />
        </div>
      </div>
      
      <div className="form-actions">
        <button className="form-button">Salvar</button>
      </div>
    </div>
  );
}
```

**Resultado:**
- Mobile: 1 coluna, botões full-width
- Tablet: 2 colunas
- Desktop: 3 colunas
- Wide: 4 colunas

---

## 📋 Classes Principais

### Layout
| Classe | Descrição |
|--------|-----------|
| `.container-responsive` | Container fluido com breakpoints |
| `.form-grid` | Grid automático (1→2→3→4 cols) |
| `.flex-responsive` | Flex column → row |

### Componentes
| Classe | Descrição |
|--------|-----------|
| `.form-input` | Input/select/textarea responsivo |
| `.form-button` | Botão full-width mobile |
| `.img-responsive` | Imagem proporcional |
| `.table-wrapper` | Tabela com scroll horizontal |

### Utilitários
| Classe | Descrição |
|--------|-----------|
| `.hide-mobile` | Esconde em mobile (< 768px) |
| `.hide-desktop` | Esconde em desktop (≥ 1024px) |
| `.text-responsive` | Fonte adaptativa |
| `.btn-responsive` | Botão responsivo genérico |

---

## 🎨 Menu Hambúrguer

O menu lateral agora é **totalmente responsivo**:

### Desktop (≥ 768px)
- Sidebar sempre visível
- Largura: 280px
- Pode ser expandida/colapsada

### Mobile (< 768px)
- Sidebar escondida por padrão
- Botão hambúrguer ☰ no canto superior esquerdo
- Abre ao clicar no botão
- Fecha ao:
  - Selecionar um item
  - Clicar no overlay escuro
  - Clicar no botão novamente

---

## 🧪 Testando

### Chrome DevTools

1. Abra DevTools: **F12** ou **Ctrl+Shift+I**
2. Toggle Device Toolbar: **Ctrl+Shift+M**
3. Selecione um dispositivo:
   - iPhone SE (375x667)
   - iPad (768x1024)
   - Responsive (arraste para testar tamanhos)

### Teste Real

Abra no seu celular:
```
http://SEU_IP:5173
```

Verifique:
- ✅ Menu abre/fecha corretamente
- ✅ Botões fáceis de tocar
- ✅ Texto legível sem zoom
- ✅ Sem scroll horizontal
- ✅ Forms preenchíveis

---

## ⚡ Performance

O sistema foi otimizado para:
- ✅ **CSS puro** - Sem JavaScript para responsividade
- ✅ **Código mínimo** - Classes reutilizáveis
- ✅ **Transições suaves** - Hardware accelerated
- ✅ **Zero layout thrashing** - Reflows mínimos

---

## 🐛 Problemas Comuns

### Scroll horizontal aparecendo

**Solução:**
```css
/* Já aplicado globalmente */
* {
    max-width: 100%;
}
```

### Input com zoom no iPhone

**Causa:** Font-size menor que 16px

**Solução:**
```css
/* Já aplicado em .form-input */
input {
    font-size: 16px;
}
```

### Botão difícil de tocar

**Causa:** Área de toque muito pequena

**Solução:**
```css
/* Já aplicado em .form-button */
button {
    min-height: 48px;
    min-width: 48px;
}
```

---

## 📖 Arquivos CSS

### Globais (src/styles/)
- **variables.css** - Variáveis de cores, espaçamentos, etc.
- **responsive.css** - Sistema de breakpoints e classes utilitárias
- **forms.css** - Padrões para formulários responsivos
- **global.css** - Importa todos os acima + configurações globais

### Componentes (src/components/)
Cada componente tem seu próprio `.module.css` com:
- Estilos específicos do componente
- Media queries personalizadas (se necessário)
- Acesso às variáveis globais via `var(--nome)`

---

## 🎯 Breakpoints

```css
320px   /* Mobile pequeno */
480px   /* Mobile grande */
768px   /* Tablet */
1024px  /* Desktop */
1440px  /* Wide screen */
```

### Estratégia: Mobile First

```css
/* Base: mobile (default) */
.element {
    padding: 10px;
}

/* Tablet */
@media (min-width: 768px) {
    .element {
        padding: 20px;
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .element {
        padding: 30px;
    }
}
```

---

## 🔧 Personalização

### Alterar Breakpoints

Edite `src/styles/responsive.css`:

```css
:root {
    --breakpoint-xs: 320px;   /* Mude aqui */
    --breakpoint-sm: 480px;   /* Mude aqui */
    --breakpoint-md: 768px;   /* Mude aqui */
    --breakpoint-lg: 1024px;  /* Mude aqui */
    --breakpoint-xl: 1440px;  /* Mude aqui */
}
```

### Adicionar Novas Classes

Adicione em `src/styles/responsive.css` ou `src/styles/forms.css`:

```css
.minha-classe-custom {
    /* Seu CSS aqui */
}

@media (min-width: 768px) {
    .minha-classe-custom {
        /* Ajustes para tablet */
    }
}
```

---

## 📊 Status Atual

### Completamente Responsivos
- ✅ Layout principal (MainPage)
- ✅ Sidebar com menu hambúrguer
- ✅ Tela de Login
- ✅ Sistema de grid
- ✅ Classes utilitárias

### Prontos para Migração
- 🔄 EmpresaCadastro
- 🔄 PrestadorCadastro
- 🔄 OrcamentoCadastro
- 🔄 DadosBancariosCadastro
- 🔄 ItemCadastro
- 🔄 GrupoItemCadastro
- 🔄 UserCadastro
- 🔄 EnderecoCadastro (parcialmente pronto)
- 🔄 AprovacaoCadastro
- 🔄 SolicitacaoAprovacaoCadastro

---

## 🚀 Deploy

O sistema responsivo funciona automaticamente após build:

```bash
cd frontend
npm run build
```

Os arquivos CSS serão minificados e otimizados automaticamente pelo Vite.

---

## 🤝 Contribuindo

Ao criar novos componentes:

1. **Use as classes globais** quando possível
2. **Siga Mobile First** - comece pelo mobile
3. **Teste em múltiplos dispositivos**
4. **Mantenha consistência** com o design system
5. **Documente** classes customizadas criadas

---

## 📞 Suporte

- 📖 Leia a documentação em `frontend/*.md`
- 🔍 Examine os exemplos em componentes existentes
- 🧪 Teste em Chrome DevTools (F12)
- 💬 Consulte a equipe de desenvolvimento

---

## 🏆 Referências

Este sistema segue as melhores práticas de:
- [Google Material Design](https://material.io/design)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [WCAG 2.1 Accessibility](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)

---

**Desenvolvido com ❤️ para melhor experiência do usuário**

*Última atualização: 27 de Abril de 2026*
